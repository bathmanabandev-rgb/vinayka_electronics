-- Add optional fields to bills table for invoice customization
ALTER TABLE bills 
  ADD COLUMN to_address TEXT AFTER invoice_no,
  ADD COLUMN invoice_date DATE AFTER to_address,
  ADD COLUMN order_no VARCHAR(255) AFTER invoice_date,
  ADD COLUMN vehicle_no VARCHAR(255) AFTER order_no;

-- Create indexes for faster lookups
CREATE INDEX idx_invoice_date ON bills(invoice_date);
CREATE INDEX idx_order_no ON bills(order_no);
