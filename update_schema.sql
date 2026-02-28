-- Change products.id to text to support custom IDs like 'ip14-128'
alter table products alter column id type text;

-- Change users.id to text if needed (optional, but consistent)
alter table users alter column id type text;

-- Change sales.id to text if needed
alter table sales alter column id type text;
alter table sales alter column user_id type text;
