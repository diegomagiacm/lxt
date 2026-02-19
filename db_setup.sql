-- Create Table for Users
create table users (
  id uuid default uuid_generate_v4() primary key,
  username text unique not null,
  code text not null, -- Plain text for this simplified demo requirement
  role text check (role in ('admin', 'seller')) not null,
  sales_count int default 0,
  extra_hours int default 0
);

-- Insert Initial Users
insert into users (username, code, role) values
('aracelit', 'A955118', 'admin'),
('diegou', 'D1455', 'admin'),
('joacor', 'J955602', 'seller');

-- Create Table for Products
create table products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  price numeric not null,
  category text,
  description text,
  image_url text,
  stock boolean default true,
  colors text[]
);

-- Create Table for Sales/Events (Optional for logging)
create table sales (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id),
  product_details jsonb,
  total_amount numeric,
  created_at timestamp with time zone default now()
);