/*
  # Система автоматических задач производственного процесса

  1. Таблица задач (tasks)
  2. Функции автоматического создания задач
  3. Триггеры для запуска задач при изменении статусов
  4. RLS политики для задач
*/

-- Создаем таблицу задач
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  factory_id uuid REFERENCES factories(id) ON DELETE CASCADE NOT NULL,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  lot_id uuid REFERENCES production_lots(id) ON DELETE CASCADE,
  
  -- Основная информация о задаче
  title text NOT NULL,
  description text,
  type text NOT NULL, -- 'tech_spec', 'procurement', 'cutting', 'sewing', 'qc', 'packaging', 'rework'
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- Назначение
  assigned_role text, -- 'technologist', 'procurement_manager', 'cutter', 'brigade_leader', 'qc_specialist', 'packer'
  assigned_employee_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Временные рамки
  due_date date,
  estimated_hours numeric DEFAULT 0,
  actual_hours numeric DEFAULT 0,
  
  -- Данные для выполнения
  task_data jsonb DEFAULT '{}', -- Специфичные данные для каждого типа задачи
  
  -- Результат выполнения
  completion_data jsonb DEFAULT '{}',
  completion_notes text,
  
  -- Метаданные
  created_at timestamptz DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

-- Индексы для tasks
CREATE INDEX IF NOT EXISTS idx_tasks_factory_id ON tasks(factory_id);
CREATE INDEX IF NOT EXISTS idx_tasks_order_id ON tasks(order_id);
CREATE INDEX IF NOT EXISTS idx_tasks_lot_id ON tasks(lot_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_role ON tasks(assigned_role);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_employee_id ON tasks(assigned_employee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_type ON tasks(type);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- RLS для tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Политики для tasks
CREATE POLICY "Users can view factory tasks"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (factory_id = get_user_factory_id());

CREATE POLICY "Users can manage factory tasks"
  ON tasks
  FOR ALL
  TO authenticated
  USING (factory_id = get_user_factory_id());

CREATE POLICY "Superadmins can view all tasks"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (is_superadmin());

-- Функция создания задачи для технолога (детализация техпроцесса)
CREATE OR REPLACE FUNCTION create_tech_spec_task(
  p_order_id uuid,
  p_lot_id uuid,
  p_factory_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_task_id uuid;
  v_order_number text;
  v_product_name text;
  v_quantity integer;
  v_technologist_id uuid;
BEGIN
  -- Получаем данные заказа
  SELECT o.order_number, pm.name, oi.quantity
  INTO v_order_number, v_product_name, v_quantity
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.id
  JOIN product_models pm ON pm.id = oi.product_model_id
  WHERE o.id = p_order_id
  LIMIT 1;
  
  -- Ищем технолога на фабрике
  SELECT id INTO v_technologist_id
  FROM profiles
  WHERE factory_id = p_factory_id 
    AND role = 'technologist'
    AND is_active = true
  LIMIT 1;
  
  -- Создаем задачу
  INSERT INTO tasks (
    factory_id, order_id, lot_id, title, description, type, priority,
    assigned_role, assigned_employee_id, due_date, estimated_hours,
    task_data
  )
  VALUES (
    p_factory_id, p_order_id, p_lot_id,
    'Детализация техпроцесса для заказа ' || v_order_number,
    'Определить технологический процесс, нормы расхода материалов и операции для изделия "' || v_product_name || '" (' || v_quantity || ' шт.)',
    'tech_spec', 'high',
    'technologist', v_technologist_id,
    CURRENT_DATE + INTERVAL '1 day', 2,
    jsonb_build_object(
      'product_name', v_product_name,
      'quantity', v_quantity,
      'requires_fabric_consumption', true,
      'requires_operations_list', true
    )
  )
  RETURNING id INTO v_task_id;
  
  RETURN v_task_id;
END;
$$;

-- Функция создания задачи для снабжения (закупка материалов)
CREATE OR REPLACE FUNCTION create_procurement_task(
  p_order_id uuid,
  p_lot_id uuid,
  p_factory_id uuid,
  p_required_materials jsonb
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_task_id uuid;
  v_order_number text;
  v_procurement_manager_id uuid;
  v_total_cost numeric := 0;
BEGIN
  -- Получаем номер заказа
  SELECT order_number INTO v_order_number
  FROM orders WHERE id = p_order_id;
  
  -- Ищем менеджера по закупкам
  SELECT id INTO v_procurement_manager_id
  FROM profiles
  WHERE factory_id = p_factory_id 
    AND role = 'procurement_manager'
    AND is_active = true
  LIMIT 1;
  
  -- Рассчитываем примерную стоимость закупки
  SELECT COALESCE(SUM((item->>'quantity')::numeric * (item->>'estimated_cost')::numeric), 0)
  INTO v_total_cost
  FROM jsonb_array_elements(p_required_materials) AS item;
  
  -- Создаем задачу
  INSERT INTO tasks (
    factory_id, order_id, lot_id, title, description, type, priority,
    assigned_role, assigned_employee_id, due_date, estimated_hours,
    task_data
  )
  VALUES (
    p_factory_id, p_order_id, p_lot_id,
    'Закупка материалов для заказа ' || v_order_number,
    'Закупить необходимые материалы согласно техспецификации. Ориентировочная стоимость: ' || v_total_cost || ' сом',
    'procurement', 'high',
    'procurement_manager', v_procurement_manager_id,
    CURRENT_DATE + INTERVAL '2 days', 4,
    jsonb_build_object(
      'required_materials', p_required_materials,
      'estimated_total_cost', v_total_cost,
      'requires_receipt_confirmation', true
    )
  )
  RETURNING id INTO v_task_id;
  
  RETURN v_task_id;
END;
$$;

-- Функция создания задачи для кройщика
CREATE OR REPLACE FUNCTION create_cutting_task(
  p_order_id uuid,
  p_lot_id uuid,
  p_factory_id uuid,
  p_quantity integer
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_task_id uuid;
  v_order_number text;
  v_product_name text;
  v_cutter_id uuid;
BEGIN
  -- Получаем данные заказа
  SELECT o.order_number, pm.name
  INTO v_order_number, v_product_name
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.id
  JOIN product_models pm ON pm.id = oi.product_model_id
  WHERE o.id = p_order_id
  LIMIT 1;
  
  -- Ищем кройщика
  SELECT id INTO v_cutter_id
  FROM profiles
  WHERE factory_id = p_factory_id 
    AND role = 'cutter'
    AND is_active = true
  LIMIT 1;
  
  -- Создаем задачу
  INSERT INTO tasks (
    factory_id, order_id, lot_id, title, description, type, priority,
    assigned_role, assigned_employee_id, due_date, estimated_hours,
    task_data
  )
  VALUES (
    p_factory_id, p_order_id, p_lot_id,
    'Раскрой для заказа ' || v_order_number,
    'Раскроить ' || p_quantity || ' единиц изделия "' || v_product_name || '" согласно техпроцессу',
    'cutting', 'medium',
    'cutter', v_cutter_id,
    CURRENT_DATE + INTERVAL '3 days', p_quantity * 0.5, -- 30 мин на единицу
    jsonb_build_object(
      'target_quantity', p_quantity,
      'product_name', v_product_name,
      'requires_actual_quantity', true,
      'requires_waste_report', true
    )
  )
  RETURNING id INTO v_task_id;
  
  RETURN v_task_id;
END;
$$;

-- Функция создания задачи для бригадира (пошив)
CREATE OR REPLACE FUNCTION create_sewing_task(
  p_order_id uuid,
  p_lot_id uuid,
  p_factory_id uuid,
  p_quantity integer
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_task_id uuid;
  v_order_number text;
  v_product_name text;
  v_brigade_leader_id uuid;
  v_operations_count integer;
BEGIN
  -- Получаем данные заказа
  SELECT o.order_number, pm.name
  INTO v_order_number, v_product_name
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.id
  JOIN product_models pm ON pm.id = oi.product_model_id
  WHERE o.id = p_order_id
  LIMIT 1;
  
  -- Ищем бригадира
  SELECT id INTO v_brigade_leader_id
  FROM profiles
  WHERE factory_id = p_factory_id 
    AND role = 'brigade_leader'
    AND is_active = true
  LIMIT 1;
  
  -- Считаем количество операций
  SELECT COUNT(*) INTO v_operations_count
  FROM sew_flow
  WHERE lot_id = p_lot_id;
  
  -- Создаем задачу
  INSERT INTO tasks (
    factory_id, order_id, lot_id, title, description, type, priority,
    assigned_role, assigned_employee_id, due_date, estimated_hours,
    task_data
  )
  VALUES (
    p_factory_id, p_order_id, p_lot_id,
    'Пошив для заказа ' || v_order_number,
    'Организовать пошив ' || p_quantity || ' единиц "' || v_product_name || '". Операций: ' || v_operations_count,
    'sewing', 'medium',
    'brigade_leader', v_brigade_leader_id,
    CURRENT_DATE + INTERVAL '7 days', p_quantity * 2, -- 2 часа на единицу
    jsonb_build_object(
      'target_quantity', p_quantity,
      'product_name', v_product_name,
      'operations_count', v_operations_count,
      'requires_employee_assignment', true,
      'requires_progress_tracking', true
    )
  )
  RETURNING id INTO v_task_id;
  
  RETURN v_task_id;
END;
$$;

-- Функция создания задачи для ОТК
CREATE OR REPLACE FUNCTION create_qc_task(
  p_order_id uuid,
  p_lot_id uuid,
  p_factory_id uuid,
  p_quantity integer
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_task_id uuid;
  v_order_number text;
  v_product_name text;
  v_qc_specialist_id uuid;
BEGIN
  -- Получаем данные заказа
  SELECT o.order_number, pm.name
  INTO v_order_number, v_product_name
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.id
  JOIN product_models pm ON pm.id = oi.product_model_id
  WHERE o.id = p_order_id
  LIMIT 1;
  
  -- Ищем специалиста ОТК
  SELECT id INTO v_qc_specialist_id
  FROM profiles
  WHERE factory_id = p_factory_id 
    AND role = 'qc_specialist'
    AND is_active = true
  LIMIT 1;
  
  -- Создаем задачу
  INSERT INTO tasks (
    factory_id, order_id, lot_id, title, description, type, priority,
    assigned_role, assigned_employee_id, due_date, estimated_hours,
    task_data
  )
  VALUES (
    p_factory_id, p_order_id, p_lot_id,
    'Контроль качества для заказа ' || v_order_number,
    'Проверить качество ' || p_quantity || ' единиц "' || v_product_name || '" и выявить брак',
    'qc', 'high',
    'qc_specialist', v_qc_specialist_id,
    CURRENT_DATE + INTERVAL '1 day', p_quantity * 0.25, -- 15 мин на единицу
    jsonb_build_object(
      'target_quantity', p_quantity,
      'product_name', v_product_name,
      'requires_quality_report', true,
      'requires_defect_classification', true
    )
  )
  RETURNING id INTO v_task_id;
  
  RETURN v_task_id;
END;
$$;

-- Функция создания задачи для упаковщика
CREATE OR REPLACE FUNCTION create_packaging_task(
  p_order_id uuid,
  p_lot_id uuid,
  p_factory_id uuid,
  p_quantity integer
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_task_id uuid;
  v_order_number text;
  v_product_name text;
  v_packer_id uuid;
  v_delivery_date date;
BEGIN
  -- Получаем данные заказа
  SELECT o.order_number, pm.name, o.delivery_date
  INTO v_order_number, v_product_name, v_delivery_date
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.id
  JOIN product_models pm ON pm.id = oi.product_model_id
  WHERE o.id = p_order_id
  LIMIT 1;
  
  -- Ищем упаковщика
  SELECT id INTO v_packer_id
  FROM profiles
  WHERE factory_id = p_factory_id 
    AND role = 'packer'
    AND is_active = true
  LIMIT 1;
  
  -- Создаем задачу
  INSERT INTO tasks (
    factory_id, order_id, lot_id, title, description, type, priority,
    assigned_role, assigned_employee_id, due_date, estimated_hours,
    task_data
  )
  VALUES (
    p_factory_id, p_order_id, p_lot_id,
    'Упаковка для заказа ' || v_order_number,
    'Упаковать ' || p_quantity || ' единиц "' || v_product_name || '" для отгрузки до ' || v_delivery_date,
    'packaging', 'medium',
    'packer', v_packer_id,
    COALESCE(v_delivery_date - INTERVAL '1 day', CURRENT_DATE + INTERVAL '1 day'), 
    p_quantity * 0.1, -- 6 мин на единицу
    jsonb_build_object(
      'target_quantity', p_quantity,
      'product_name', v_product_name,
      'delivery_date', v_delivery_date,
      'requires_packaging_confirmation', true
    )
  )
  RETURNING id INTO v_task_id;
  
  RETURN v_task_id;
END;
$$;

-- Функция создания задачи на исправление брака
CREATE OR REPLACE FUNCTION create_rework_task(
  p_order_id uuid,
  p_lot_id uuid,
  p_factory_id uuid,
  p_defect_quantity integer,
  p_defect_description text
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_task_id uuid;
  v_order_number text;
  v_product_name text;
  v_brigade_leader_id uuid;
BEGIN
  -- Получаем данные заказа
  SELECT o.order_number, pm.name
  INTO v_order_number, v_product_name
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.id
  JOIN product_models pm ON pm.id = oi.product_model_id
  WHERE o.id = p_order_id
  LIMIT 1;
  
  -- Ищем бригадира
  SELECT id INTO v_brigade_leader_id
  FROM profiles
  WHERE factory_id = p_factory_id 
    AND role = 'brigade_leader'
    AND is_active = true
  LIMIT 1;
  
  -- Создаем задачу
  INSERT INTO tasks (
    factory_id, order_id, lot_id, title, description, type, priority,
    assigned_role, assigned_employee_id, due_date, estimated_hours,
    task_data
  )
  VALUES (
    p_factory_id, p_order_id, p_lot_id,
    'Исправление брака для заказа ' || v_order_number,
    'Исправить ' || p_defect_quantity || ' бракованных единиц "' || v_product_name || '". Причина: ' || p_defect_description,
    'rework', 'urgent',
    'brigade_leader', v_brigade_leader_id,
    CURRENT_DATE + INTERVAL '2 days', p_defect_quantity * 1, -- 1 час на исправление
    jsonb_build_object(
      'defect_quantity', p_defect_quantity,
      'product_name', v_product_name,
      'defect_description', p_defect_description,
      'requires_rework_confirmation', true
    )
  )
  RETURNING id INTO v_task_id;
  
  RETURN v_task_id;
END;
$$;

-- Функция автоматического создания всех задач для заказа
CREATE OR REPLACE FUNCTION create_order_workflow_tasks(
  p_order_id uuid,
  p_lot_id uuid,
  p_factory_id uuid,
  p_quantity integer
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_tech_task_id uuid;
  v_tasks_created jsonb := '[]'::jsonb;
BEGIN
  -- 1. Создаем задачу для технолога (первая в цепочке)
  v_tech_task_id := create_tech_spec_task(p_order_id, p_lot_id, p_factory_id);
  
  v_tasks_created := v_tasks_created || jsonb_build_object(
    'tech_spec_task_id', v_tech_task_id
  );
  
  -- Остальные задачи будут создаваться автоматически при завершении предыдущих
  
  RETURN jsonb_build_object(
    'success', true,
    'tasks_created', v_tasks_created,
    'workflow_initiated', true
  );
END;
$$;