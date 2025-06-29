/*
  # Добавление поддержки онбординга и клиентов

  1. Новые поля
    - `has_completed_onboarding` в таблице `factories`
    - `base_rate` в таблице `equipment_types`
    - `factory_id` в таблице `product_models` (если отсутствует)

  2. Новые таблицы
    - `customers` - клиенты фабрики

  3. Безопасность
    - RLS политики для новых таблиц
    - Обновление существующих политик

  4. Функции
    - `complete_onboarding` для завершения процесса онбординга
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

-- Политики для customers (с проверкой существования)
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

-- Обновляем RLS и политики для product_models
DO $$
BEGIN
  -- Включаем RLS если еще не включен
  ALTER TABLE product_models ENABLE ROW LEVEL SECURITY;

  -- Удаляем существующие политики если есть
  DROP POLICY IF EXISTS "Users can view factory product models" ON product_models;
  DROP POLICY IF EXISTS "Users can manage factory product models" ON product_models;
  DROP POLICY IF EXISTS "Superadmins can view all product models" ON product_models;

  -- Создаем новые политики
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

-- Функция для создания клиента
CREATE OR REPLACE FUNCTION create_customer(
  customer_name text,
  customer_email text DEFAULT NULL,
  customer_phone text DEFAULT NULL,
  customer_address text DEFAULT NULL,
  customer_contact_person text DEFAULT NULL,
  customer_notes text DEFAULT NULL,
  user_factory_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_customer_id uuid;
  target_factory_id uuid;
BEGIN
  -- Получаем factory_id пользователя если не передан
  IF user_factory_id IS NULL THEN
    target_factory_id := get_user_factory_id();
  ELSE
    target_factory_id := user_factory_id;
  END IF;

  -- Проверяем права доступа
  IF target_factory_id IS NULL THEN
    RAISE EXCEPTION 'User does not belong to any factory';
  END IF;

  -- Создаем клиента
  INSERT INTO customers (
    name,
    email,
    phone,
    address,
    contact_person,
    notes,
    factory_id
  ) VALUES (
    customer_name,
    customer_email,
    customer_phone,
    customer_address,
    customer_contact_person,
    customer_notes,
    target_factory_id
  ) RETURNING id INTO new_customer_id;

  RETURN new_customer_id;
END;
$$;