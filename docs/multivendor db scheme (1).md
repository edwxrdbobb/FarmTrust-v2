

-- USERS TABLE (linked to Supabase Auth)
create table users (
  id uuid primary key references auth.users on delete cascade,
  role text not null check (role in ('user', 'vendor', 'admin')),
  full_name text,
  email text,
  phone text,
  created_at timestamp with time zone default current_timestamp
);

-- VENDOR PROFILES (only for users with role = 'vendor')
create table vendor_profiles (
  id uuid primary key references users(id) on delete cascade,
  farm_name text not null,
  location text,
  description text,
  contact_info text,
  logo_url text,
  created_at timestamp with time zone default current_timestamp
);

-- PRODUCTS
create table products (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid references users(id) on delete cascade,
  title text not null,
  description text,
  image_url text,
  price numeric not null,
  quantity int not null,
  available boolean default true,
  created_at timestamp with time zone default current_timestamp
);

-- ORDERS
create table orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid references users(id) on delete set null,
  vendor_id uuid references users(id) on delete set null,
  status text not null check (status in ('pending', 'preparing', 'in_delivery', 'delivered', 'completed', 'disputed')),
  total_amount numeric not null,
  delivery_method text check (delivery_method in ('pickup', 'delivery')),
  delivery_address text,
  placed_at timestamp with time zone default current_timestamp,
  confirmed_at timestamp with time zone
);

-- ORDER ITEMS
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  quantity int not null,
  unit_price numeric not null
);

-- ESCROW TRANSACTIONS
create table escrow (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  status text not null check (status in ('held', 'released', 'refunded')),
  held_at timestamp with time zone default current_timestamp,
  released_at timestamp with time zone
);

-- REVIEWS
create table reviews (
  id uuid primary key default gen_random_uuid(),
  reviewer_id uuid references users(id) on delete set null,
  target_user_id uuid references users(id) on delete set null,
  order_id uuid references orders(id) on delete cascade,
  rating int check (rating between 1 and 5),
  comment text,
  created_at timestamp with time zone default current_timestamp
);

-- DISPUTES
create table disputes (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  raised_by uuid references users(id) on delete set null,
  reason text,
  status text check (status in ('open', 'resolved', 'rejected')) default 'open',
  resolution_notes text,
  created_at timestamp with time zone default current_timestamp,
  resolved_at timestamp with time zone
);
