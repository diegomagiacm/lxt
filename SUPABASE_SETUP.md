# Guía de Configuración de Supabase

Para conectar tu aplicación a una base de datos real en Supabase y persistir usuarios y productos, sigue estos pasos:

## 1. Crear Proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com) y crea una cuenta.
2. Crea un nuevo proyecto.
3. Una vez creado, ve a **Settings** > **API**.
4. Copia la **Project URL** y la **anon public key**.

## 2. Configurar Variables de Entorno
En AI Studio, debes configurar las siguientes variables de entorno (o en tu archivo `.env` local si descargas el código):

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anonima
```

> **Nota:** En este entorno de demostración, la aplicación detecta automáticamente si estas variables faltan y usa una base de datos local (localStorage) para que puedas probar todo sin configurar nada.

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
  colors text[],
  variants jsonb -- Stores array of {color: string, stock: number}
);

-- 3. Tabla de Ventas
create table sales (
  id uuid default uuid_generate_v4() primary key,
  user_id text, -- Guardamos el username para simplificar
  product_details jsonb, -- Guardamos el array de productos vendidos
  total_amount numeric,
  created_at timestamp with time zone default now()
);

-- 4. Insertar Usuarios Iniciales
insert into users (username, code, role) values
('aracelit', 'A955118', 'admin'),
('diegou', 'D1455', 'admin'),
('joacor', '955118', 'admin'),
('gastonv', '955602', 'admin'),
('ignaciop', '605955', 'admin');

-- 5. Configurar Políticas de Seguridad (RLS) - Opcional pero recomendado
-- Permitir lectura/escritura pública para este demo (en prod usar auth real)
alter table users enable row level security;
create policy "Public Access" on users for all using (true);

alter table products enable row level security;
create policy "Public Access" on products for all using (true);

alter table sales enable row level security;
create policy "Public Access" on sales for all using (true);
```

## 4. Verificar Conexión
Una vez configuradas las variables de entorno y ejecutado el SQL, recarga la página. La aplicación detectará las credenciales y comenzará a leer/escribir en Supabase en lugar de localStorage.
