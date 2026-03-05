-- Add is_active column to products table for soft delete
ALTER TABLE products ADD COLUMN is_active TINYINT(1) DEFAULT 1 AFTER image_path;

-- Update existing products to be active
UPDATE products SET is_active = 1 WHERE is_active IS NULL;

-- Add index for better performance
CREATE INDEX idx_is_active ON products(is_active);
