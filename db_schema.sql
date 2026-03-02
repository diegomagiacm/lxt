-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Drop existing tables to start fresh
drop table if exists sales;
drop table if exists products;
drop table if exists users;

-- Create Table for Users
create table users (
  id uuid default uuid_generate_v4() primary key,
  username text unique not null,
  code text not null,
  role text check (role in ('admin', 'seller')) not null,
  sales_count int default 0,
  extra_hours int default 0,
  created_at timestamp with time zone default now()
);

-- Create Table for Products
create table products (
  id text primary key, -- Changed from UUID to Text to support custom IDs like 'ip14-128'
  name text not null,
  price numeric not null,
  category text,
  description text,
  image_url text,
  stock boolean default true,
  colors text[],
  variants jsonb,
  location text,
  created_at timestamp with time zone default now()
);

-- Create Table for Sales
create table sales (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id), -- Optional: link to user if logged in
  product_details jsonb, -- Stores snapshot of products sold
  total_amount numeric,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security (RLS)
alter table users enable row level security;
alter table products enable row level security;
alter table sales enable row level security;

-- Create Policies (Simplified for demo)
-- Allow public read access to products
create policy "Public products are viewable by everyone"
on products for select using (true);

-- Allow authenticated (service role) full access
-- Note: Service Role bypasses RLS, but we add this for completeness if using authenticated client
create policy "Service role has full access"
on products for all using (true);

create policy "Service role has full access users"
on users for all using (true);

create policy "Service role has full access sales"
on sales for all using (true);
