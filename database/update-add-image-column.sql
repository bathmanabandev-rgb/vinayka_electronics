-- Fix: Add image_path column to products table if it doesn't exist
USE billing_app;

ALTER TABLE products ADD COLUMN image_path VARCHAR(255) AFTER barcode;

-- Verify the column was added
DESCRIBE products;
