-- ============================================================
-- Run this on Railway MySQL to fix missing columns
-- These columns were added via migrations but may be absent
-- ============================================================

-- Add missing columns to students table
ALTER TABLE students ADD COLUMN IF NOT EXISTS present_working_address TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS floor_number INT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS monthly_rent DECIMAL(10,2) DEFAULT 0;
ALTER TABLE students ADD COLUMN IF NOT EXISTS inactive_date DATE;

-- Add missing columns to fee_payments table
ALTER TABLE fee_payments ADD COLUMN IF NOT EXISTS reason VARCHAR(255);
ALTER TABLE fee_payments ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(255);
ALTER TABLE fee_payments ADD COLUMN IF NOT EXISTS fee_id INT;
ALTER TABLE fee_payments ADD COLUMN IF NOT EXISTS hostel_id INT;
ALTER TABLE fee_payments ADD COLUMN IF NOT EXISTS due_date DATE;

-- Verify
SELECT 'students columns:' as info;
DESCRIBE students;

SELECT 'fee_payments columns:' as info;
DESCRIBE fee_payments;
