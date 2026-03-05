-- Add invoice_no column to bills table
ALTER TABLE bills ADD COLUMN invoice_no VARCHAR(50) UNIQUE AFTER id;

-- Create index for faster lookups
CREATE INDEX idx_invoice_no ON bills(invoice_no);
