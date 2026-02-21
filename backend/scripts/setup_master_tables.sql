-- ============================================================
-- Run this on your Railway MySQL database ONCE
-- This creates the master lookup tables needed for student creation
-- ============================================================

-- 1. Create relations_master table
CREATE TABLE IF NOT EXISTS relations_master (
  relation_id INT AUTO_INCREMENT PRIMARY KEY,
  relation_name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255),
  is_active TINYINT DEFAULT 1,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO relations_master (relation_name, display_order, description) VALUES
('Father', 1, 'Student''s father'),
('Mother', 2, 'Student''s mother'),
('Brother', 3, 'Student''s brother'),
('Sister', 4, 'Student''s sister'),
('Uncle', 5, 'Student''s uncle'),
('Aunt', 6, 'Student''s aunt'),
('Grandfather', 7, 'Student''s grandfather'),
('Grandmother', 8, 'Student''s grandmother'),
('Other', 9, 'Other relation')
ON DUPLICATE KEY UPDATE display_order = VALUES(display_order);

-- 2. Create id_proof_types table
CREATE TABLE IF NOT EXISTS id_proof_types (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  regex_pattern VARCHAR(255) NOT NULL,
  min_length INT NOT NULL,
  max_length INT NOT NULL,
  is_active TINYINT(1) DEFAULT 1,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO id_proof_types (code, name, regex_pattern, min_length, max_length, display_order) VALUES
('AADHAR', 'Aadhar Card', '^[0-9]{12}$', 12, 12, 1),
('PAN', 'PAN Card', '^[A-Z]{5}[0-9]{4}[A-Z]{1}$', 10, 10, 2),
('VOTER', 'Voter ID', '^[A-Z0-9]{10}$', 10, 10, 3),
('DL', 'Driving License', '^[A-Z0-9]{13,16}$', 13, 16, 4),
('PASSPORT', 'Passport', '^[A-Z][0-9]{7}$', 8, 8, 5)
ON DUPLICATE KEY UPDATE display_order = VALUES(display_order);

-- 3. Create payment_modes table if missing
CREATE TABLE IF NOT EXISTS payment_modes (
  payment_mode_id INT AUTO_INCREMENT PRIMARY KEY,
  payment_mode_name VARCHAR(100) NOT NULL,
  is_active TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO payment_modes (payment_mode_name) VALUES
('Cash'),
('UPI'),
('Bank Transfer'),
('Cheque'),
('Online')
ON DUPLICATE KEY UPDATE payment_mode_name = VALUES(payment_mode_name);

SELECT 'Setup complete!' as status;
