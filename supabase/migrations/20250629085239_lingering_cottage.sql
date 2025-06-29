/*
  # Создание суперадмина

  1. Создание пользователя суперадмина
    - Email: superadmin@kemsel.systems
    - Пароль: superadmin123
    - Роль: superadmin

  2. Безопасность
    - Пользователь создается только если не существует
    - Профиль автоматически привязывается к auth.users
*/

-- Создаем суперадмина только если его еще нет
DO $$
DECLARE
  superadmin_user_id uuid;
  existing_user_id uuid;
BEGIN
  -- Проверяем, есть ли уже суперадмин
  SELECT id INTO existing_user_id 
  FROM auth.users 
  WHERE email = 'superadmin@kemsel.systems';

  -- Если суперадмина нет, создаем его
  IF existing_user_id IS NULL THEN
    -- Создаем пользователя в auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'superadmin@kemsel.systems',
      crypt('superadmin123', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      now(),
      now(),
      '',
      '',
      '',
      ''
    ) RETURNING id INTO superadmin_user_id;

    -- Создаем профиль суперадмина
    INSERT INTO public.profiles (
      id,
      role,
      first_name,
      last_name,
      email,
      factory_id,
      is_active,
      created_at,
      updated_at
    ) VALUES (
      superadmin_user_id,
      'superadmin',
      'Super',
      'Admin',
      'superadmin@kemsel.systems',
      NULL,
      true,
      now(),
      now()
    );

    RAISE NOTICE 'Суперадмин создан с email: superadmin@kemsel.systems и паролем: superadmin123';
  ELSE
    -- Обновляем существующий профиль до суперадмина если нужно
    UPDATE public.profiles 
    SET role = 'superadmin'
    WHERE id = existing_user_id AND role != 'superadmin';
    
    RAISE NOTICE 'Суперадмин уже существует с email: superadmin@kemsel.systems';
  END IF;
END $$;

-- Создаем демо владельца фабрики для тестирования
DO $$
DECLARE
  demo_user_id uuid;
  demo_factory_id uuid;
  existing_demo_user_id uuid;
BEGIN
  -- Проверяем, есть ли уже демо пользователь
  SELECT id INTO existing_demo_user_id 
  FROM auth.users 
  WHERE email = 'owner@factory1.com';

  -- Если демо пользователя нет, создаем его
  IF existing_demo_user_id IS NULL THEN
    -- Создаем демо пользователя
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'owner@factory1.com',
      crypt('password123', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      now(),
      now(),
      '',
      '',
      '',
      ''
    ) RETURNING id INTO demo_user_id;

    -- Создаем демо фабрику
    INSERT INTO public.factories (
      id,
      name,
      owner_id,
      subscription_plan,
      is_active,
      has_completed_onboarding,
      settings,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      'Демо Фабрика №1',
      demo_user_id,
      'basic',
      true,
      true,
      '{}',
      now(),
      now()
    ) RETURNING id INTO demo_factory_id;

    -- Создаем профиль владельца демо фабрики
    INSERT INTO public.profiles (
      id,
      role,
      first_name,
      last_name,
      email,
      factory_id,
      position,
      is_active,
      created_at,
      updated_at
    ) VALUES (
      demo_user_id,
      'factory_owner',
      'Владелец',
      'Демо',
      'owner@factory1.com',
      demo_factory_id,
      'Владелец фабрики',
      true,
      now(),
      now()
    );

    RAISE NOTICE 'Демо владелец фабрики создан с email: owner@factory1.com и паролем: password123';
  ELSE
    RAISE NOTICE 'Демо владелец фабрики уже существует с email: owner@factory1.com';
  END IF;
END $$;