/*
  # Создание модуля "Библиотека Технологических Карт"

  1. Новые таблицы
    - `product_models` - Модели изделий (Футболка, Худи, Платье и т.д.)
    - `equipment_types` - Справочник типов оборудования
    - `tech_map_templates` - Шаблоны технологических карт
    - `tech_map_template_operations` - Операции в шаблонах
    - `production_lots` - Производственные партии
    - `sew_flow` - Операции для конкретных партий

  2. Безопасность
    - Включение RLS для всех таблиц
    - Политики доступа для аутентифицированных пользователей

  3. Связи
    - Внешние ключи между всеми связанными таблицами
    - Каскадное удаление для зависимых записей
*/

-- Модели изделий (базовый справочник)
CREATE TABLE IF NOT EXISTS product_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  article_number text UNIQUE NOT NULL,
  description text,
  category text DEFAULT 'clothing',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Типы оборудования (справочник)
CREATE TABLE IF NOT EXISTS equipment_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text DEFAULT 'sewing',
  created_at timestamptz DEFAULT now()
);

-- Шаблоны технологических карт
CREATE TABLE IF NOT EXISTS tech_map_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  model_id uuid REFERENCES product_models(id) ON DELETE CASCADE,
  description text,
  is_active boolean DEFAULT true,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Операции в шаблонах
CREATE TABLE IF NOT EXISTS tech_map_template_operations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES tech_map_templates(id) ON DELETE CASCADE,
  operation_name text NOT NULL,
  sequence_order integer NOT NULL,
  equipment_type_id uuid REFERENCES equipment_types(id),
  base_rate numeric DEFAULT 0,
  estimated_time_minutes integer DEFAULT 0,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Производственные партии
CREATE TABLE IF NOT EXISTS production_lots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_number text UNIQUE NOT NULL,
  order_id uuid,
  model_id uuid REFERENCES product_models(id),
  quantity integer NOT NULL,
  status text DEFAULT 'planning',
  tech_map_applied boolean DEFAULT false,
  applied_template_id uuid REFERENCES tech_map_templates(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Операции для конкретных партий (копируются из шаблонов)
CREATE TABLE IF NOT EXISTS sew_flow (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id uuid REFERENCES production_lots(id) ON DELETE CASCADE,
  operation_name text NOT NULL,
  sequence_order integer NOT NULL,
  equipment_type_id uuid REFERENCES equipment_types(id),
  assigned_employee_id uuid,
  rate numeric DEFAULT 0,
  estimated_time_minutes integer DEFAULT 0,
  actual_time_minutes integer DEFAULT 0,
  status text DEFAULT 'pending',
  completed_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Включение RLS
ALTER TABLE product_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE tech_map_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE tech_map_template_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE sew_flow ENABLE ROW LEVEL SECURITY;

-- Политики доступа (для аутентифицированных пользователей)
CREATE POLICY "Users can read product models"
  ON product_models FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage product models"
  ON product_models FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Users can read equipment types"
  ON equipment_types FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage equipment types"
  ON equipment_types FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Users can read tech map templates"
  ON tech_map_templates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage tech map templates"
  ON tech_map_templates FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Users can read template operations"
  ON tech_map_template_operations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage template operations"
  ON tech_map_template_operations FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Users can read production lots"
  ON production_lots FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage production lots"
  ON production_lots FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Users can read sew flow"
  ON sew_flow FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage sew flow"
  ON sew_flow FOR ALL
  TO authenticated
  USING (true);

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_tech_map_templates_model_id ON tech_map_templates(model_id);
CREATE INDEX IF NOT EXISTS idx_template_operations_template_id ON tech_map_template_operations(template_id);
CREATE INDEX IF NOT EXISTS idx_template_operations_sequence ON tech_map_template_operations(template_id, sequence_order);
CREATE INDEX IF NOT EXISTS idx_sew_flow_lot_id ON sew_flow(lot_id);
CREATE INDEX IF NOT EXISTS idx_sew_flow_sequence ON sew_flow(lot_id, sequence_order);
CREATE INDEX IF NOT EXISTS idx_production_lots_order_id ON production_lots(order_id);

-- Вставка базовых данных
INSERT INTO equipment_types (name, description, category) VALUES
  ('Универсальная машина', 'Стандартная швейная машина для основных операций', 'sewing'),
  ('Оверлок', 'Машина для обметки краев', 'sewing'),
  ('Плоскошовная', 'Машина для плоских швов', 'sewing'),
  ('Петельная', 'Машина для выметывания петель', 'sewing'),
  ('Пуговичная', 'Машина для пришивания пуговиц', 'sewing'),
  ('Раскройная машина', 'Оборудование для раскроя ткани', 'cutting'),
  ('Утюжильная станция', 'Оборудование для ВТО', 'pressing'),
  ('Вышивальная машина', 'Машина для декоративной вышивки', 'embroidery')
ON CONFLICT DO NOTHING;

INSERT INTO product_models (name, article_number, description, category) VALUES
  ('Футболка классическая', 'T-001', 'Базовая футболка с коротким рукавом', 'clothing'),
  ('Худи оверсайз', 'H-101', 'Толстовка с капюшоном свободного кроя', 'clothing'),
  ('Платье офисное', 'D-201', 'Деловое платье прямого силуэта', 'clothing'),
  ('Брюки классические', 'P-301', 'Прямые брюки со стрелками', 'clothing'),
  ('Рубашка мужская', 'S-401', 'Классическая мужская рубашка', 'clothing')
ON CONFLICT DO NOTHING;