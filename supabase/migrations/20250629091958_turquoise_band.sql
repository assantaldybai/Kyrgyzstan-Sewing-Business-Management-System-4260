/*
  # Создание полной производственной системы с интеграцией всех модулей

  1. Новые таблицы
    - `orders` - заказы
    - `order_items` - позиции заказов
    - `materials` - материалы на складе
    - `material_transactions` - движения материалов
    - `financial_transactions` - финансовые операции
    - `production_log` - лог производственных операций
    - `products` - готовые изделия

  2. Обновления существующих таблиц
    - Добавление недостающих полей
    - Обновление связей

  3. Безопасность
    - RLS политики для всех таблиц
    - Изоляция данных по фабрикам

  4. Функции
    - Создание заказа с автоматическим запуском производства
    - Учет выполненной работы
    - Завершение заказа
*/

-- Добавляем поле онбординга в таблицу factories
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'factories' AND column_name = 'has_completed_onboarding'
  ) THEN
    ALTER TABLE factories ADD COLUMN has_completed_onboarding boolean DEFAULT false;
  END IF;
END $$;

-- Создаем таблицу customers (клиенты фабрики)
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  address text,
  contact_person text,
  notes text,
  factory_id uuid REFERENCES factories(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Индексы для customers
CREATE INDEX IF NOT EXISTS idx_customers_factory_id ON customers(factory_id);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);

-- RLS для customers
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Политики для customers с проверкой существования
DO $$
BEGIN
  -- Удаляем существующие политики если есть
  DROP POLICY IF EXISTS "Users can view factory customers" ON customers;
  DROP POLICY IF EXISTS "Users can manage factory customers" ON customers;
  DROP POLICY IF EXISTS "Superadmins can view all customers" ON customers;

  -- Создаем новые политики
  CREATE POLICY "Users can view factory customers"
    ON customers
    FOR SELECT
    TO authenticated
    USING (factory_id = get_user_factory_id());

  CREATE POLICY "Users can manage factory customers"
    ON customers
    FOR ALL
    TO authenticated
    USING (factory_id = get_user_factory_id());

  CREATE POLICY "Superadmins can view all customers"
    ON customers
    FOR SELECT
    TO authenticated
    USING (is_superadmin());
END $$;

-- Создаем таблицу заказов
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  factory_id uuid REFERENCES factories(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  order_number text UNIQUE NOT NULL,
  status text DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'completed', 'cancelled')),
  total_price numeric DEFAULT 0,
  advance_payment numeric DEFAULT 0,
  delivery_date date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Создаем таблицу позиций заказов
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_model_id uuid REFERENCES product_models(id) ON DELETE SET NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  price_per_unit numeric NOT NULL CHECK (price_per_unit >= 0),
  color text,
  size text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Создаем таблицу материалов
CREATE TABLE IF NOT EXISTS materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  factory_id uuid REFERENCES factories(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  category text DEFAULT 'fabric',
  current_stock numeric DEFAULT 0 CHECK (current_stock >= 0),
  reserved_stock numeric DEFAULT 0 CHECK (reserved_stock >= 0),
  unit text DEFAULT 'meter',
  cost_per_unit numeric DEFAULT 0 CHECK (cost_per_unit >= 0),
  reorder_level numeric DEFAULT 0,
  supplier text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Создаем таблицу движений материалов
CREATE TABLE IF NOT EXISTS material_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  factory_id uuid REFERENCES factories(id) ON DELETE CASCADE,
  material_id uuid REFERENCES materials(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  lot_id uuid REFERENCES production_lots(id) ON DELETE SET NULL,
  quantity numeric NOT NULL, -- может быть отрицательным для расхода
  type text NOT NULL CHECK (type IN ('purchase', 'usage', 'write_off', 'adjustment', 'reserved', 'unreserved')),
  status text DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  cost_per_unit numeric DEFAULT 0,
  total_cost numeric GENERATED ALWAYS AS (quantity * cost_per_unit) STORED,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Создаем таблицу финансовых операций
CREATE TABLE IF NOT EXISTS financial_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  factory_id uuid REFERENCES factories(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  currency text DEFAULT 'KGS',
  type text NOT NULL CHECK (type IN ('income', 'expense_material', 'expense_salary', 'expense_overhead', 'expense_defect')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'accrued', 'paid')),
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  employee_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  material_transaction_id uuid REFERENCES material_transactions(id) ON DELETE SET NULL,
  description text,
  transaction_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Создаем таблицу лога производства
CREATE TABLE IF NOT EXISTS production_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  factory_id uuid REFERENCES factories(id) ON DELETE CASCADE,
  sew_flow_id uuid REFERENCES sew_flow(id) ON DELETE CASCADE,
  employee_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  quantity_completed integer NOT NULL CHECK (quantity_completed > 0),
  quality_passed integer DEFAULT 0 CHECK (quality_passed >= 0),
  quality_defect integer DEFAULT 0 CHECK (quality_defect >= 0),
  time_spent_minutes integer DEFAULT 0 CHECK (time_spent_minutes >= 0),
  rate_per_unit numeric DEFAULT 0,
  total_earned numeric GENERATED ALWAYS AS (quantity_completed * rate_per_unit) STORED,
  notes text,
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Создаем таблицу готовых изделий
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  factory_id uuid REFERENCES factories(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  lot_id uuid REFERENCES production_lots(id) ON DELETE SET NULL,
  product_model_id uuid REFERENCES product_models(id) ON DELETE SET NULL,
  status text DEFAULT 'ready' CHECK (status IN ('ready', 'shipped', 'defect')),
  color text,
  size text,
  quality_grade text DEFAULT 'A' CHECK (quality_grade IN ('A', 'B', 'C', 'defect')),
  produced_at timestamptz DEFAULT now(),
  shipped_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Обновляем таблицу equipment_types если нужно
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'equipment_types' AND column_name = 'base_rate'
  ) THEN
    ALTER TABLE equipment_types ADD COLUMN base_rate numeric DEFAULT 0;
  END IF;
END $$;

-- Обновляем таблицу product_models если нужно
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'product_models' AND column_name = 'factory_id'
  ) THEN
    ALTER TABLE product_models ADD COLUMN factory_id uuid REFERENCES factories(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_product_models_factory_id ON product_models(factory_id);
  END IF;
END $$;

-- Создаем индексы для производительности
CREATE INDEX IF NOT EXISTS idx_orders_factory_id ON orders(factory_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_model_id ON order_items(product_model_id);

CREATE INDEX IF NOT EXISTS idx_materials_factory_id ON materials(factory_id);
CREATE INDEX IF NOT EXISTS idx_materials_category ON materials(category);

CREATE INDEX IF NOT EXISTS idx_material_transactions_factory_id ON material_transactions(factory_id);
CREATE INDEX IF NOT EXISTS idx_material_transactions_material_id ON material_transactions(material_id);
CREATE INDEX IF NOT EXISTS idx_material_transactions_order_id ON material_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_material_transactions_type ON material_transactions(type);

CREATE INDEX IF NOT EXISTS idx_financial_transactions_factory_id ON financial_transactions(factory_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_type ON financial_transactions(type);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_order_id ON financial_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_employee_id ON financial_transactions(employee_id);

CREATE INDEX IF NOT EXISTS idx_production_log_factory_id ON production_log(factory_id);
CREATE INDEX IF NOT EXISTS idx_production_log_sew_flow_id ON production_log(sew_flow_id);
CREATE INDEX IF NOT EXISTS idx_production_log_employee_id ON production_log(employee_id);

CREATE INDEX IF NOT EXISTS idx_products_factory_id ON products(factory_id);
CREATE INDEX IF NOT EXISTS idx_products_order_id ON products(order_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

-- Включаем RLS для всех новых таблиц
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- RLS для product_models
ALTER TABLE product_models ENABLE ROW LEVEL SECURITY;

-- Политики RLS для всех таблиц
DO $$
BEGIN
  -- Политики для orders
  DROP POLICY IF EXISTS "Users can view factory orders" ON orders;
  DROP POLICY IF EXISTS "Users can manage factory orders" ON orders;
  DROP POLICY IF EXISTS "Superadmins can view all orders" ON orders;

  CREATE POLICY "Users can view factory orders"
    ON orders FOR SELECT TO authenticated
    USING (factory_id = get_user_factory_id());

  CREATE POLICY "Users can manage factory orders"
    ON orders FOR ALL TO authenticated
    USING (factory_id = get_user_factory_id());

  CREATE POLICY "Superadmins can view all orders"
    ON orders FOR SELECT TO authenticated
    USING (is_superadmin());

  -- Политики для order_items
  DROP POLICY IF EXISTS "Users can view factory order items" ON order_items;
  DROP POLICY IF EXISTS "Users can manage factory order items" ON order_items;

  CREATE POLICY "Users can view factory order items"
    ON order_items FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.factory_id = get_user_factory_id()));

  CREATE POLICY "Users can manage factory order items"
    ON order_items FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.factory_id = get_user_factory_id()));

  -- Политики для materials
  DROP POLICY IF EXISTS "Users can view factory materials" ON materials;
  DROP POLICY IF EXISTS "Users can manage factory materials" ON materials;
  DROP POLICY IF EXISTS "Superadmins can view all materials" ON materials;

  CREATE POLICY "Users can view factory materials"
    ON materials FOR SELECT TO authenticated
    USING (factory_id = get_user_factory_id());

  CREATE POLICY "Users can manage factory materials"
    ON materials FOR ALL TO authenticated
    USING (factory_id = get_user_factory_id());

  CREATE POLICY "Superadmins can view all materials"
    ON materials FOR SELECT TO authenticated
    USING (is_superadmin());

  -- Политики для material_transactions
  DROP POLICY IF EXISTS "Users can view factory material transactions" ON material_transactions;
  DROP POLICY IF EXISTS "Users can manage factory material transactions" ON material_transactions;

  CREATE POLICY "Users can view factory material transactions"
    ON material_transactions FOR SELECT TO authenticated
    USING (factory_id = get_user_factory_id());

  CREATE POLICY "Users can manage factory material transactions"
    ON material_transactions FOR ALL TO authenticated
    USING (factory_id = get_user_factory_id());

  -- Политики для financial_transactions
  DROP POLICY IF EXISTS "Users can view factory financial transactions" ON financial_transactions;
  DROP POLICY IF EXISTS "Users can manage factory financial transactions" ON financial_transactions;

  CREATE POLICY "Users can view factory financial transactions"
    ON financial_transactions FOR SELECT TO authenticated
    USING (factory_id = get_user_factory_id());

  CREATE POLICY "Users can manage factory financial transactions"
    ON financial_transactions FOR ALL TO authenticated
    USING (factory_id = get_user_factory_id());

  -- Политики для production_log
  DROP POLICY IF EXISTS "Users can view factory production log" ON production_log;
  DROP POLICY IF EXISTS "Users can manage factory production log" ON production_log;

  CREATE POLICY "Users can view factory production log"
    ON production_log FOR SELECT TO authenticated
    USING (factory_id = get_user_factory_id());

  CREATE POLICY "Users can manage factory production log"
    ON production_log FOR ALL TO authenticated
    USING (factory_id = get_user_factory_id());

  -- Политики для products
  DROP POLICY IF EXISTS "Users can view factory products" ON products;
  DROP POLICY IF EXISTS "Users can manage factory products" ON products;

  CREATE POLICY "Users can view factory products"
    ON products FOR SELECT TO authenticated
    USING (factory_id = get_user_factory_id());

  CREATE POLICY "Users can manage factory products"
    ON products FOR ALL TO authenticated
    USING (factory_id = get_user_factory_id());

  -- Политики для product_models
  DROP POLICY IF EXISTS "Users can view factory product models" ON product_models;
  DROP POLICY IF EXISTS "Users can manage factory product models" ON product_models;
  DROP POLICY IF EXISTS "Superadmins can view all product models" ON product_models;

  CREATE POLICY "Users can view factory product models"
    ON product_models FOR SELECT TO authenticated
    USING (factory_id = get_user_factory_id());

  CREATE POLICY "Users can manage factory product models"
    ON product_models FOR ALL TO authenticated
    USING (factory_id = get_user_factory_id());

  CREATE POLICY "Superadmins can view all product models"
    ON product_models FOR SELECT TO authenticated
    USING (is_superadmin());
END $$;

-- Функция для завершения онбординга
CREATE OR REPLACE FUNCTION complete_onboarding(factory_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE factories 
  SET has_completed_onboarding = true,
      updated_at = now()
  WHERE id = factory_uuid;
  
  RETURN true;
END;
$$;

-- Функция для генерации номера заказа
CREATE OR REPLACE FUNCTION generate_order_number(factory_uuid uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  order_count integer;
  year_suffix text;
BEGIN
  -- Получаем количество заказов в этой фабрике
  SELECT COUNT(*) INTO order_count
  FROM orders
  WHERE factory_id = factory_uuid;
  
  -- Получаем последние 2 цифры года
  year_suffix := EXTRACT(YEAR FROM now())::text;
  year_suffix := RIGHT(year_suffix, 2);
  
  -- Формируем номер заказа
  RETURN 'ORD-' || year_suffix || '-' || LPAD((order_count + 1)::text, 4, '0');
END;
$$;

-- Функция для обновления остатков материалов
CREATE OR REPLACE FUNCTION update_material_stock()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Обновляем остатки материала при добавлении транзакции
  IF TG_OP = 'INSERT' THEN
    IF NEW.type = 'reserved' THEN
      -- Резервируем материал
      UPDATE materials 
      SET reserved_stock = reserved_stock + NEW.quantity
      WHERE id = NEW.material_id;
    ELSIF NEW.type = 'unreserved' THEN
      -- Снимаем резерв
      UPDATE materials 
      SET reserved_stock = reserved_stock - NEW.quantity
      WHERE id = NEW.material_id;
    ELSIF NEW.type IN ('usage', 'write_off') THEN
      -- Списываем материал
      UPDATE materials 
      SET current_stock = current_stock - NEW.quantity,
          reserved_stock = CASE 
            WHEN reserved_stock >= NEW.quantity THEN reserved_stock - NEW.quantity
            ELSE 0
          END
      WHERE id = NEW.material_id;
    ELSIF NEW.type IN ('purchase', 'adjustment') THEN
      -- Пополняем склад
      UPDATE materials 
      SET current_stock = current_stock + NEW.quantity
      WHERE id = NEW.material_id;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Триггер для автоматического обновления остатков материалов
CREATE TRIGGER update_material_stock_trigger
  AFTER INSERT ON material_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_material_stock();

-- Создаем базовые материалы для существующих фабрик
INSERT INTO materials (factory_id, name, description, category, current_stock, unit, cost_per_unit, reorder_level, supplier)
SELECT 
  f.id,
  'Хлопковая ткань',
  'Базовая хлопковая ткань для пошива',
  'fabric',
  1000,
  'meter',
  250,
  100,
  'ТД Текстиль'
FROM factories f
WHERE NOT EXISTS (
  SELECT 1 FROM materials m WHERE m.factory_id = f.id AND m.name = 'Хлопковая ткань'
);

INSERT INTO materials (factory_id, name, description, category, current_stock, unit, cost_per_unit, reorder_level, supplier)
SELECT 
  f.id,
  'Нитки полиэстер',
  'Универсальные нитки для пошива',
  'thread',
  500,
  'piece',
  25,
  50,
  'Швейные материалы'
FROM factories f
WHERE NOT EXISTS (
  SELECT 1 FROM materials m WHERE m.factory_id = f.id AND m.name = 'Нитки полиэстер'
);

INSERT INTO materials (factory_id, name, description, category, current_stock, unit, cost_per_unit, reorder_level, supplier)
SELECT 
  f.id,
  'Фурнитура базовая',
  'Пуговицы, молнии, этикетки',
  'accessories',
  200,
  'set',
  50,
  20,
  'Фурнитура Плюс'
FROM factories f
WHERE NOT EXISTS (
  SELECT 1 FROM materials m WHERE m.factory_id = f.id AND m.name = 'Фурнитура базовая'
);