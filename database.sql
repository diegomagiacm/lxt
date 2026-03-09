-- DATABASE SETUP FOR LOCOS X LA TECNOLOGÍA
-- Run these commands in the Supabase SQL Editor

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marca TEXT NOT NULL DEFAULT 'Apple',
  model TEXT NOT NULL,
  categoria TEXT DEFAULT 'iPhone',
  storage INTEGER NOT NULL DEFAULT 128,
  color TEXT NOT NULL,
  price_usd INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  UNIQUE(product_id, warehouse_id)
);

CREATE TABLE IF NOT EXISTS public.agendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_details JSONB NOT NULL,
  payment_method TEXT NOT NULL,
  total_amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  installments INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendas ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Anyone can read their own profile, only admins can read all
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can do everything with profiles" ON public.profiles FOR ALL USING (is_admin());

-- Products: Read for everyone, Write for admins
CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins can manage products" ON public.products FOR ALL USING (is_admin());

-- Warehouses: Read for everyone, Write for admins
CREATE POLICY "Warehouses are viewable by everyone" ON public.warehouses FOR SELECT USING (true);
CREATE POLICY "Admins can manage warehouses" ON public.warehouses FOR ALL USING (is_admin());

-- Stock: Read for everyone, Write for admins
CREATE POLICY "Stock is viewable by everyone" ON public.stock FOR SELECT USING (true);
CREATE POLICY "Admins can manage stock" ON public.stock FOR ALL USING (is_admin());

-- Agendas: Users can read/write their own, Admins can read all
CREATE POLICY "Users can insert their own orders" ON public.agendas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own orders" ON public.agendas FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "Admins can manage agendas" ON public.agendas FOR ALL USING (is_admin());

-- 4. Automatic Profile Creation on Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Seed Initial Data
INSERT INTO public.warehouses (name) VALUES ('Showroom Central'), ('Depósito Norte'), ('Depósito Sur') ON CONFLICT DO NOTHING;

-- IMPORTANT: To make yourself an admin, run this after registering:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your-email@example.com';
