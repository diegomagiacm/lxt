# Guía de Configuración de Supabase

Para conectar tu aplicación a una base de datos real en Supabase y persistir usuarios y productos, sigue estos pasos.

## 1. Crear Proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com) y crea una cuenta.
2. Crea un nuevo proyecto.
3. Una vez creado, ve a **Settings** > **API**.
4. Copia la **Project URL**, la **anon public key** y la **service_role secret**.

## 2. Configurar Variables de Entorno
En tu plataforma de despliegue (Vercel, Netlify, etc.) o en tu archivo `.env` local, configura las siguientes variables:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anonima
SUPABASE_SERVICE_ROLE_KEY=tu-clave-service-role
```

> **IMPORTANTE:** 
> - `VITE_SUPABASE_ANON_KEY` debe ser la clave **anon/public**. Es segura para usar en el navegador.
> - `SUPABASE_SERVICE_ROLE_KEY` debe ser la clave **service_role**. **NUNCA** la pongas en una variable que empiece con `VITE_` ni la uses en el código del cliente/navegador. Esta clave tiene acceso total a tu base de datos.

## 3. Crear las Tablas (SQL)
Ve al **SQL Editor** en tu dashboard de Supabase y ejecuta el siguiente script para crear las tablas necesarias:

```sql
-- Habilitar extensión para UUIDs
create extension if not exists "uuid-ossp";

-- 1. Tabla de Usuarios
create table users (
  id uuid default uuid_generate_v4() primary key,
  username text unique not null,
  code text not null, -- Contraseña
  role text check (role in ('admin', 'seller')) not null,
  sales_count int default 0,
  extra_hours int default 0,
  created_at timestamp with time zone default now()
);

-- 2. Tabla de Productos
create table products (
  id text primary key, -- Usamos IDs personalizados como 'ip15-128'
  name text not null,
  price numeric not null,
  category text,
  description text,
  image_url text,
  stock boolean default true,
  quantity int default 0, -- Stock numérico para productos simples
  colors text[],
  variants jsonb, -- Stores array of {color: string, stock: number}
  location text
);

-- 3. Tabla de Ventas
create table sales (
  id uuid default uuid_generate_v4() primary key,
  user_id text, -- Guardamos el username para simplificar
  product_details jsonb, -- Guardamos el array de productos vendidos
  total_amount numeric,
  created_at timestamp with time zone default now()
);

-- 4. Configurar Políticas de Seguridad (RLS)
alter table users enable row level security;
create policy "Service role has full access users" on users for all using (true);
create policy "Public read access users" on users for select using (true);

alter table products enable row level security;
create policy "Public read access products" on products for select using (true);
create policy "Service role has full access products" on products for all using (true);

alter table sales enable row level security;
create policy "Service role has full access sales" on sales for all using (true);
create policy "Users can see their own sales" on sales for select using (user_id = auth.uid()::text); -- Ajustar según auth real si se usa
```

## 4. Insertar Datos Iniciales (Seed)
Para poblar la base de datos con los usuarios y productos iniciales, copia el contenido del archivo `seed_data.sql` y ejecútalo en el **SQL Editor** de Supabase.

El archivo `seed_data.sql` contiene todos los `INSERT` necesarios.

## 5. Verificar
Una vez configurado todo, recarga tu aplicación. Ahora usará Supabase para autenticación y datos.
