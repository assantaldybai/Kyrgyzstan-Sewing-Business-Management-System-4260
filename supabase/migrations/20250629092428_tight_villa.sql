/*
  # Функции для автоматизации производственного цикла

  1. Функции генерации номеров
    - `generate_order_number()` - генерация номеров заказов
    - `generate_lot_number()` - генерация номеров партий

  2. Функции управления клиентами
    - `get_or_create_customer()` - получение или создание клиента

  3. Основная бизнес-логика
    - `create_order_and_initiate_production()` - создание заказа и запуск производства
*/

-- Функция генерации номера заказа
CREATE OR REPLACE FUNCTION generate_order_number(factory_uuid uuid)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  order_count integer;
  year_suffix text;
BEGIN
  -- Получаем количество заказов в этом году для фабрики
  SELECT COUNT(*) INTO order_count
  FROM orders 
  WHERE factory_id = factory_uuid 
    AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
  
  -- Формируем суффикс года
  year_suffix := EXTRACT(YEAR FROM NOW())::text;
  
  -- Возвращаем номер в формате ORD-2024-001
  RETURN 'ORD-' || year_suffix || '-' || LPAD((order_count + 1)::text, 3, '0');
END;
$$;

-- Функция генерации номера партии
CREATE OR REPLACE FUNCTION generate_lot_number(factory_uuid uuid)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  lot_count integer;
  year_suffix text;
BEGIN
  -- Получаем количество партий в этом году для фабрики
  SELECT COUNT(*) INTO lot_count
  FROM production_lots 
  WHERE factory_id = factory_uuid 
    AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
  
  -- Формируем суффикс года
  year_suffix := EXTRACT(YEAR FROM NOW())::text;
  
  -- Возвращаем номер в формате LOT-2024-001
  RETURN 'LOT-' || year_suffix || '-' || LPAD((lot_count + 1)::text, 3, '0');
END;
$$;

-- Функция получения или создания клиента
CREATE OR REPLACE FUNCTION get_or_create_customer(
  factory_uuid uuid,
  customer_name text,
  customer_email text DEFAULT NULL,
  customer_phone text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  customer_id uuid;
BEGIN
  -- Пытаемся найти существующего клиента
  SELECT id INTO customer_id
  FROM customers
  WHERE factory_id = factory_uuid 
    AND name = customer_name
  LIMIT 1;
  
  -- Если не найден, создаем нового
  IF customer_id IS NULL THEN
    INSERT INTO customers (factory_id, name, email, phone)
    VALUES (factory_uuid, customer_name, customer_email, customer_phone)
    RETURNING id INTO customer_id;
  END IF;
  
  RETURN customer_id;
END;
$$;

-- Основная функция создания заказа и запуска производства
CREATE OR REPLACE FUNCTION create_order_and_initiate_production(
  p_factory_id uuid,
  p_customer_name text,
  p_product_model_id uuid,
  p_quantity integer,
  p_price_per_unit numeric,
  p_delivery_date date,
  p_customer_email text DEFAULT NULL,
  p_customer_phone text DEFAULT NULL,
  p_advance_payment numeric DEFAULT 0,
  p_color text DEFAULT NULL,
  p_size text DEFAULT NULL,
  p_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_customer_id uuid;
  v_order_id uuid;
  v_order_number text;
  v_lot_id uuid;
  v_lot_number text;
  v_template_id uuid;
  v_operations_created integer := 0;
  v_materials_reserved integer := 0;
  v_total_amount numeric;
  template_operation RECORD;
BEGIN
  -- 1. Получаем или создаем клиента
  v_customer_id := get_or_create_customer(p_factory_id, p_customer_name, p_customer_email, p_customer_phone);
  
  -- 2. Генерируем номер заказа
  v_order_number := generate_order_number(p_factory_id);
  
  -- 3. Создаем заказ
  v_total_amount := p_quantity * p_price_per_unit;
  
  INSERT INTO orders (
    factory_id, customer_id, order_number, status, total_price, 
    advance_payment, delivery_date, notes
  )
  VALUES (
    p_factory_id, v_customer_id, v_order_number, 'new', v_total_amount,
    COALESCE(p_advance_payment, 0), p_delivery_date, p_notes
  )
  RETURNING id INTO v_order_id;
  
  -- 4. Создаем позицию заказа
  INSERT INTO order_items (
    order_id, product_model_id, quantity, price_per_unit, color, size
  )
  VALUES (
    v_order_id, p_product_model_id, p_quantity, p_price_per_unit, p_color, p_size
  );
  
  -- 5. Создаем производственную партию
  v_lot_number := generate_lot_number(p_factory_id);
  
  INSERT INTO production_lots (
    lot_number, order_id, model_id, quantity, status, factory_id
  )
  VALUES (
    v_lot_number, v_order_id, p_product_model_id, p_quantity, 'planning', p_factory_id
  )
  RETURNING id INTO v_lot_id;
  
  -- 6. Ищем активный шаблон технологической карты для этой модели
  SELECT id INTO v_template_id
  FROM tech_map_templates
  WHERE model_id = p_product_model_id 
    AND factory_id = p_factory_id
    AND is_active = true
  LIMIT 1;
  
  -- 7. Если найден шаблон, применяем его
  IF v_template_id IS NOT NULL THEN
    -- Копируем операции из шаблона
    FOR template_operation IN
      SELECT * FROM tech_map_template_operations
      WHERE template_id = v_template_id
      ORDER BY sequence_order
    LOOP
      INSERT INTO sew_flow (
        lot_id, operation_name, sequence_order, equipment_type_id,
        rate, estimated_time_minutes, status, notes
      )
      VALUES (
        v_lot_id, template_operation.operation_name, template_operation.sequence_order,
        template_operation.equipment_type_id, COALESCE(template_operation.base_rate, 0),
        COALESCE(template_operation.estimated_time_minutes, 0), 'pending', template_operation.description
      );
      
      v_operations_created := v_operations_created + 1;
    END LOOP;
    
    -- Обновляем статус партии
    UPDATE production_lots 
    SET tech_map_applied = true, 
        applied_template_id = v_template_id,
        status = 'ready_for_production'
    WHERE id = v_lot_id;
  END IF;
  
  -- 8. Резервируем базовые материалы (ткань и фурнитура)
  -- Ткань (1.2 метра на единицу по умолчанию)
  INSERT INTO material_transactions (
    factory_id, material_id, order_id, lot_id, quantity, type, status, cost_per_unit, notes
  )
  SELECT 
    p_factory_id, m.id, v_order_id, v_lot_id, -(p_quantity * 1.2), 'reserved', 'pending', 
    COALESCE(m.cost_per_unit, 0),
    'Резерв ткани для заказа ' || v_order_number
  FROM materials m
  WHERE m.factory_id = p_factory_id AND m.category = 'fabric'
  LIMIT 1;
  
  -- Фурнитура (1 комплект на единицу)
  INSERT INTO material_transactions (
    factory_id, material_id, order_id, lot_id, quantity, type, status, cost_per_unit, notes
  )
  SELECT 
    p_factory_id, m.id, v_order_id, v_lot_id, -p_quantity, 'reserved', 'pending', 
    COALESCE(m.cost_per_unit, 0),
    'Резерв фурнитуры для заказа ' || v_order_number
  FROM materials m
  WHERE m.factory_id = p_factory_id AND m.category = 'accessories'
  LIMIT 1;
  
  GET DIAGNOSTICS v_materials_reserved = ROW_COUNT;
  
  -- 9. Создаем финансовую транзакцию для дохода
  INSERT INTO financial_transactions (
    factory_id, amount, currency, type, status, order_id, description
  )
  VALUES (
    p_factory_id, v_total_amount, 'KGS', 'income', 'pending', v_order_id,
    'Доход от заказа ' || v_order_number || ' (' || p_quantity || ' шт.)'
  );
  
  -- 10. Если есть предоплата, создаем отдельную транзакцию
  IF COALESCE(p_advance_payment, 0) > 0 THEN
    INSERT INTO financial_transactions (
      factory_id, amount, currency, type, status, order_id, description
    )
    VALUES (
      p_factory_id, p_advance_payment, 'KGS', 'income', 'confirmed', v_order_id,
      'Предоплата по заказу ' || v_order_number
    );
  END IF;
  
  -- Возвращаем результат
  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'order_number', v_order_number,
    'lot_id', v_lot_id,
    'lot_number', v_lot_number,
    'operations_created', v_operations_created,
    'materials_reserved', v_materials_reserved,
    'template_applied', v_template_id IS NOT NULL
  );
END;
$$;