/*
  # Добавление поддержки онбординга

  1. Новые поля и таблицы
    - Добавляем has_completed_onboarding в factories
    - Создаем таблицу customers для клиентов
    - Обновляем существующие таблицы

  2. Безопасность
    - Обновляем RLS политики для новых таблиц
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

-- Политики для customers
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

-- RLS для product_models
ALTER TABLE product_models ENABLE ROW LEVEL SECURITY;

-- Политики для product_models
CREATE POLICY "Users can view factory product models"
  ON product_models
  FOR SELECT
  TO authenticated
  USING (factory_id = get_user_factory_id());

CREATE POLICY "Users can manage factory product models"
  ON product_models
  FOR ALL
  TO authenticated
  USING (factory_id = get_user_factory_id());

CREATE POLICY "Superadmins can view all product models"
  ON product_models
  FOR SELECT
  TO authenticated
  USING (is_superadmin());

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