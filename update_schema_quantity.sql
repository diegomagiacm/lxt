-- Add quantity column to products table
alter table products add column if not exists quantity integer default 0;
