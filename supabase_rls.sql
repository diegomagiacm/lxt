-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Enable RLS on tables
alter table products enable row level security;
alter table sales enable row level security;
alter table users enable row level security;

-- Create policies for public access (since auth is handled in app logic)
-- Products
create policy "Public Read Products" on products for select using (true);
create policy "Public Insert Products" on products for insert with check (true);
create policy "Public Update Products" on products for update using (true);
create policy "Public Delete Products" on products for delete using (true);

-- Sales
create policy "Public Read Sales" on sales for select using (true);
create policy "Public Insert Sales" on sales for insert with check (true);

-- Users
create policy "Public Read Users" on users for select using (true);
create policy "Public Insert Users" on users for insert with check (true);
create policy "Public Update Users" on users for update using (true);
