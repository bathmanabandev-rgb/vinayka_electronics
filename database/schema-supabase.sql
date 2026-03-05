-- VINAYAGA ELECTRICALS – PostgreSQL schema for Supabase
-- Run this in Supabase Dashboard → SQL Editor (or use: npm run db:push)

-- Role type for users
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'staff');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role user_role DEFAULT 'staff',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock_quantity INT NOT NULL DEFAULT 0,
  barcode VARCHAR(255) UNIQUE,
  image_path VARCHAR(255),
  is_active SMALLINT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);

-- Bills table (with optional invoice fields from the start)
CREATE TABLE IF NOT EXISTS bills (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invoice_no VARCHAR(50) UNIQUE,
  to_address TEXT,
  invoice_date DATE,
  order_no VARCHAR(255),
  vehicle_no VARCHAR(255),
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) DEFAULT 0,
  grand_total DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'cash',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_bills_user_id ON bills(user_id);
CREATE INDEX IF NOT EXISTS idx_bills_created_at ON bills(created_at);
CREATE INDEX IF NOT EXISTS idx_bills_invoice_no ON bills(invoice_no);

-- Bill items table
CREATE TABLE IF NOT EXISTS bill_items (
  id SERIAL PRIMARY KEY,
  bill_id INT NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  product_id INT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_bill_items_bill_id ON bill_items(bill_id);
CREATE INDEX IF NOT EXISTS idx_bill_items_product_id ON bill_items(product_id);

-- Trigger to update updated_at on users
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_updated_at ON users;
CREATE TRIGGER users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
DROP TRIGGER IF EXISTS products_updated_at ON products;
CREATE TRIGGER products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
DROP TRIGGER IF EXISTS bills_updated_at ON bills;
CREATE TRIGGER bills_updated_at BEFORE UPDATE ON bills FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- Seed users (on conflict do nothing)
INSERT INTO users (username, email, password, role) VALUES
  ('admin', 'admin@billing.com', '$2a$10$qLZfKIz0dkKmKzx0t2V/huqTzCzCd5XqQrqKFjX5fXVKPEKBp.Zw.', 'admin'),
  ('staff1', 'staff1@billing.com', '$2a$10$8/zqQI9xaPOIVwW/xGJzUOHvd2ECLFKwFVL7fGRO8TJ7XCd7Gly3S', 'staff')
ON CONFLICT (username) DO NOTHING;

-- Seed products (on conflict do nothing)
INSERT INTO products (name, category, price, stock_quantity, barcode) VALUES
  ('Laptop', 'Electronics', 45000.00, 10, '1001'),
  ('Mouse', 'Accessories', 500.00, 50, '1002'),
  ('Keyboard', 'Accessories', 1500.00, 30, '1003'),
  ('Monitor', 'Electronics', 15000.00, 5, '1004'),
  ('USB Cable', 'Accessories', 200.00, 100, '1005'),
  ('Headphones', 'Accessories', 2000.00, 25, '1006'),
  ('Printer', 'Electronics', 8000.00, 3, '1007'),
  ('Desk Chair', 'Furniture', 5000.00, 8, '1008')
ON CONFLICT (barcode) DO NOTHING;
