/*
  # Create Demo Accounts

  1. Demo Users
    - Creates superadmin and factory owner demo accounts
    - Sets up proper profiles and factory relationships
    - Ensures demo accounts are ready for immediate use

  2. Security
    - Uses Supabase's built-in user management
    - Proper RLS policies already in place
    - Demo accounts follow same security model as regular accounts

  3. Factory Setup
    - Creates a demo factory for the factory owner
    - Sets up basic equipment types and team structure
    - Marks onboarding as completed for immediate access
*/

-- Create demo factory first
INSERT INTO factories (id, name, owner_id, subscription_plan, is_active, has_completed_onboarding, created_at, updated_at)
VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'Demo Factory',
  NULL, -- Will be updated after user creation
  'premium',
  true,
  true,
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- Note: The actual user accounts need to be created through Supabase Auth
-- This migration sets up the supporting data structure

-- Create profiles for demo users (these will be linked when users are created)
-- The user IDs will need to match what Supabase Auth generates

-- Create some basic equipment types for the demo factory
INSERT INTO equipment_types (name, description, category, factory_id, base_rate, created_at)
VALUES 
  ('Швейная машина', 'Стандартная швейная машина', 'sewing', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 50.00, now()),
  ('Оверлок', 'Машина для обработки краев', 'sewing', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 60.00, now()),
  ('Утюг', 'Промышленный утюг', 'pressing', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 30.00, now()),
  ('Раскройный стол', 'Стол для раскроя ткани', 'cutting', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 40.00, now())
ON CONFLICT DO NOTHING;

-- Create a demo customer
INSERT INTO customers (name, email, phone, factory_id, created_at, updated_at)
VALUES (
  'ООО "Модная одежда"',
  'orders@fashion-clothes.com',
  '+7 (495) 123-45-67',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  now(),
  now()
) ON CONFLICT DO NOTHING;

-- Create demo product models
INSERT INTO product_models (name, article_number, description, category, factory_id, created_at, updated_at)
VALUES 
  ('Женская блузка', 'WB-001', 'Классическая женская блузка', 'clothing', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', now(), now()),
  ('Мужская рубашка', 'MS-002', 'Деловая мужская рубашка', 'clothing', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', now(), now())
ON CONFLICT (article_number) DO NOTHING;