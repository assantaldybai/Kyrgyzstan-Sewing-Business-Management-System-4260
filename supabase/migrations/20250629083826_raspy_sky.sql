/*
  # Мульти-арендная SaaS архитектура для KEMSEL SYSTEMS

  1. Новые таблицы
    - `factories` - центральная таблица арендаторов (фабрик)
    - Модификация всех существующих таблиц для добавления `factory_id`

  2. Безопасность
    - Строгая изоляция данных через RLS
    - JWT токены с factory_id
    - Исключения для суперадминов

  3. Изменения
    - Добавление factory_id во все операционные таблицы
    - Политики RLS для изоляции данных
    - Функции для управления JWT claims
*/

-- Создание центральной таблицы фабрик (арендаторов)
CREATE TABLE IF NOT EXISTS factories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_plan text DEFAULT 'basic',
  is_active boolean DEFAULT true,
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Создание таблицы профилей пользователей с привязкой к фабрике
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  factory_id uuid REFERENCES factories(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'employee',
  first_name text,
  last_name text,
  email text,
  phone text,
  position text,
  department text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Добавление factory_id к существующим таблицам
ALTER TABLE product_models ADD COLUMN IF NOT EXISTS factory_id uuid REFERENCES factories(id) ON DELETE CASCADE;
ALTER TABLE equipment_types ADD COLUMN IF NOT EXISTS factory_id uuid REFERENCES factories(id) ON DELETE CASCADE;
ALTER TABLE tech_map_templates ADD COLUMN IF NOT EXISTS factory_id uuid REFERENCES factories(id) ON DELETE CASCADE;
ALTER TABLE production_lots ADD COLUMN IF NOT EXISTS factory_id uuid REFERENCES factories(id) ON DELETE CASCADE;

-- Создание индексов для производительности
CREATE INDEX IF NOT EXISTS idx_factories_owner_id ON factories(owner_id);
CREATE INDEX IF NOT EXISTS idx_profiles_factory_id ON profiles(factory_id);
CREATE INDEX IF NOT EXISTS idx_product_models_factory_id ON product_models(factory_id);
CREATE INDEX IF NOT EXISTS idx_equipment_types_factory_id ON equipment_types(factory_id);
CREATE INDEX IF NOT EXISTS idx_tech_map_templates_factory_id ON tech_map_templates(factory_id);
CREATE INDEX IF NOT EXISTS idx_production_lots_factory_id ON production_lots(factory_id);

-- Включение RLS для всех таблиц
ALTER TABLE factories ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Функция для получения factory_id текущего пользователя
CREATE OR REPLACE FUNCTION get_user_factory_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT factory_id FROM profiles WHERE id = auth.uid();
$$;

-- Функция для проверки роли суперадмина
CREATE OR REPLACE FUNCTION is_superadmin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE((auth.jwt() ->> 'role')::text = 'superadmin', false);
$$;

-- Политики RLS для таблицы factories
CREATE POLICY "Superadmins can view all factories"
  ON factories FOR SELECT
  TO authenticated
  USING (is_superadmin());

CREATE POLICY "Factory owners can view their factory"
  ON factories FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Users can view their factory"
  ON factories FOR SELECT
  TO authenticated
  USING (id = get_user_factory_id());

CREATE POLICY "Superadmins can manage all factories"
  ON factories FOR ALL
  TO authenticated
  USING (is_superadmin());

CREATE POLICY "Factory owners can update their factory"
  ON factories FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid());

-- Политики RLS для таблицы profiles
CREATE POLICY "Superadmins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (is_superadmin());

CREATE POLICY "Users can view profiles from their factory"
  ON profiles FOR SELECT
  TO authenticated
  USING (factory_id = get_user_factory_id());

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Factory owners can manage factory profiles"
  ON profiles FOR ALL
  TO authenticated
  USING (
    factory_id = get_user_factory_id() AND 
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'factory_owner'
  );

-- Обновление политик для product_models
DROP POLICY IF EXISTS "Users can read product models" ON product_models;
DROP POLICY IF EXISTS "Users can manage product models" ON product_models;

CREATE POLICY "Superadmins can view all product models"
  ON product_models FOR SELECT
  TO authenticated
  USING (is_superadmin());

CREATE POLICY "Users can view factory product models"
  ON product_models FOR SELECT
  TO authenticated
  USING (factory_id = get_user_factory_id());

CREATE POLICY "Users can manage factory product models"
  ON product_models FOR ALL
  TO authenticated
  USING (factory_id = get_user_factory_id());

-- Обновление политик для equipment_types
DROP POLICY IF EXISTS "Users can read equipment types" ON equipment_types;
DROP POLICY IF EXISTS "Users can manage equipment types" ON equipment_types;

CREATE POLICY "Superadmins can view all equipment types"
  ON equipment_types FOR SELECT
  TO authenticated
  USING (is_superadmin());

CREATE POLICY "Users can view factory equipment types"
  ON equipment_types FOR SELECT
  TO authenticated
  USING (factory_id = get_user_factory_id());

CREATE POLICY "Users can manage factory equipment types"
  ON equipment_types FOR ALL
  TO authenticated
  USING (factory_id = get_user_factory_id());

-- Обновление политик для tech_map_templates
DROP POLICY IF EXISTS "Users can read tech map templates" ON tech_map_templates;
DROP POLICY IF EXISTS "Users can manage tech map templates" ON tech_map_templates;

CREATE POLICY "Superadmins can view all tech map templates"
  ON tech_map_templates FOR SELECT
  TO authenticated
  USING (is_superadmin());

CREATE POLICY "Users can view factory tech map templates"
  ON tech_map_templates FOR SELECT
  TO authenticated
  USING (factory_id = get_user_factory_id());

CREATE POLICY "Users can manage factory tech map templates"
  ON tech_map_templates FOR ALL
  TO authenticated
  USING (factory_id = get_user_factory_id());

-- Обновление политик для production_lots
DROP POLICY IF EXISTS "Users can read production lots" ON production_lots;
DROP POLICY IF EXISTS "Users can manage production lots" ON production_lots;

CREATE POLICY "Superadmins can view all production lots"
  ON production_lots FOR SELECT
  TO authenticated
  USING (is_superadmin());

CREATE POLICY "Users can view factory production lots"
  ON production_lots FOR SELECT
  TO authenticated
  USING (factory_id = get_user_factory_id());

CREATE POLICY "Users can manage factory production lots"
  ON production_lots FOR ALL
  TO authenticated
  USING (factory_id = get_user_factory_id());

-- Функция для создания новой фабрики при регистрации
CREATE OR REPLACE FUNCTION create_factory_for_user(
  user_id uuid,
  factory_name text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_factory_id uuid;
BEGIN
  -- Создаем новую фабрику
  INSERT INTO factories (name, owner_id)
  VALUES (factory_name, user_id)
  RETURNING id INTO new_factory_id;
  
  -- Создаем профиль владельца фабрики
  INSERT INTO profiles (id, factory_id, role, is_active)
  VALUES (user_id, new_factory_id, 'factory_owner', true)
  ON CONFLICT (id) DO UPDATE SET
    factory_id = new_factory_id,
    role = 'factory_owner',
    is_active = true;
  
  -- Создаем базовые типы оборудования для новой фабрики
  INSERT INTO equipment_types (factory_id, name, description, category) VALUES
    (new_factory_id, 'Универсальная машина', 'Стандартная швейная машина для основных операций', 'sewing'),
    (new_factory_id, 'Оверлок', 'Машина для обметки краев', 'sewing'),
    (new_factory_id, 'Плоскошовная', 'Машина для плоских швов', 'sewing'),
    (new_factory_id, 'Петельная', 'Машина для выметывания петель', 'sewing'),
    (new_factory_id, 'Пуговичная', 'Машина для пришивания пуговиц', 'sewing'),
    (new_factory_id, 'Раскройная машина', 'Оборудование для раскроя ткани', 'cutting'),
    (new_factory_id, 'Утюжильная станция', 'Оборудование для ВТО', 'pressing');
  
  -- Создаем базовые модели изделий для новой фабрики
  INSERT INTO product_models (factory_id, name, article_number, description, category) VALUES
    (new_factory_id, 'Футболка классическая', 'T-001', 'Базовая футболка с коротким рукавом', 'clothing'),
    (new_factory_id, 'Худи оверсайз', 'H-101', 'Толстовка с капюшоном свободного кроя', 'clothing'),
    (new_factory_id, 'Платье офисное', 'D-201', 'Деловое платье прямого силуэта', 'clothing');
  
  RETURN new_factory_id;
END;
$$;

-- Функция для обновления JWT claims с factory_id
CREATE OR REPLACE FUNCTION update_user_jwt_claims()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Обновляем метаданные пользователя в auth.users
  UPDATE auth.users
  SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || 
    jsonb_build_object(
      'factory_id', NEW.factory_id,
      'role', NEW.role
    )
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$;

-- Триггер для автоматического обновления JWT claims
CREATE TRIGGER update_jwt_claims_trigger
  AFTER INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_jwt_claims();

-- Создание суперадмина (замените на реальные данные)
DO $$
DECLARE
  superadmin_id uuid;
BEGIN
  -- Проверяем, существует ли уже суперадмин
  SELECT id INTO superadmin_id FROM auth.users WHERE email = 'superadmin@kemsel.systems';
  
  IF superadmin_id IS NULL THEN
    -- Создаем суперадмина (в реальной системе это должно быть сделано через auth)
    INSERT INTO auth.users (
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      'superadmin@kemsel.systems',
      crypt('superadmin123', gen_salt('bf')),
      now(),
      '{"role": "superadmin"}'::jsonb,
      '{"first_name": "Super", "last_name": "Admin"}'::jsonb,
      now(),
      now()
    ) RETURNING id INTO superadmin_id;
  END IF;
  
  -- Создаем профиль суперадмина (без привязки к фабрике)
  INSERT INTO profiles (id, role, first_name, last_name, email)
  VALUES (superadmin_id, 'superadmin', 'Super', 'Admin', 'superadmin@kemsel.systems')
  ON CONFLICT (id) DO UPDATE SET
    role = 'superadmin',
    first_name = 'Super',
    last_name = 'Admin',
    email = 'superadmin@kemsel.systems';
END;
$$;