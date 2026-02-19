-- ============================================
-- DATABASE FIXES FOR HOSTEL MANAGEMENT SYSTEM
-- Adding missing columns to existing tables
-- ============================================

-- Fix 1: Add missing columns to room_allocations table
ALTER TABLE room_allocations
ADD COLUMN monthly_rent DECIMAL(10, 2) DEFAULT 0 AFTER bed_number,
ADD COLUMN hostel_id INT AFTER student_id,
ADD COLUMN check_in_date DATE AFTER allocation_date,
ADD COLUMN check_out_date DATE NULL AFTER vacate_date,
ADD COLUMN is_active BOOLEAN DEFAULT TRUE AFTER is_current;

-- Add foreign key for hostel_id in room_allocations
ALTER TABLE room_allocations
ADD FOREIGN KEY (hostel_id) REFERENCES hostel_master(hostel_id) ON DELETE CASCADE;

-- Fix 2: Update payment_modes table column name (if needed)
-- Check if mode_name exists, if not, we need to ensure payment_mode_name exists
-- Commenting out as we'll just reference the correct column name
-- ALTER TABLE payment_modes CHANGE COLUMN payment_mode_name payment_mode_name VARCHAR(50);

-- Fix 3: Update room_types table column name (if needed)
-- Check if type_name exists, if not, we need to ensure room_type_name exists
-- Commenting out as we'll just reference the correct column name
-- ALTER TABLE room_types CHANGE COLUMN room_type_name room_type_name VARCHAR(50);

-- ============================================
-- VERIFICATION QUERIES
-- Run these to verify the changes
-- ============================================

-- Check room_allocations structure
-- DESCRIBE room_allocations;

-- Check payment_modes structure
-- DESCRIBE payment_modes;

-- Check room_types structure
-- DESCRIBE room_types;

-- Check student_dues structure
-- DESCRIBE student_dues;

-- ============================================
-- DATA INTEGRITY UPDATES
-- ============================================

-- Update existing room_allocations records
-- Set monthly_rent from rooms table for existing allocations
UPDATE room_allocations ra
INNER JOIN rooms r ON ra.room_id = r.room_id
SET ra.monthly_rent = r.rent_per_bed
WHERE ra.monthly_rent = 0 OR ra.monthly_rent IS NULL;

-- Set hostel_id from students table for existing allocations
UPDATE room_allocations ra
INNER JOIN students s ON ra.student_id = s.student_id
SET ra.hostel_id = s.hostel_id
WHERE ra.hostel_id IS NULL;

-- Set check_in_date to allocation_date for existing records
UPDATE room_allocations
SET check_in_date = allocation_date
WHERE check_in_date IS NULL;

-- Set is_active based on is_current for consistency
UPDATE room_allocations
SET is_active = is_current
WHERE is_active IS NULL;

-- ============================================
-- NOTES
-- ============================================
-- After running this script:
-- 1. room_allocations will have all necessary columns for tracking rentals
-- 2. Historical data will be preserved and updated with calculated values
-- 3. Both is_current and is_active columns will exist for backward compatibility
-- 4. Use is_current for room allocation status (TRUE if currently allocated)
-- 5. Use is_active for soft deletes (FALSE if allocation is deleted)
