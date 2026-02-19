-- ============================================
-- HOSTEL MANAGEMENT APPLICATION DATABASE SCHEMA
-- ============================================
-- Author: Mahendhra Reddy
-- Description: Complete database design for multi-hostel management system
-- Roles: Main Admin and Hostel Owner
-- ============================================

-- ============================================
-- 1. USER AUTHENTICATION & ROLES
-- ============================================

-- Table: user_roles
-- Description: Stores user role types (Admin, Hostel Owner)
CREATE TABLE user_roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    role_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default roles
INSERT INTO user_roles (role_name, role_description) VALUES
('Main Admin', 'System administrator with full access'),
('Hostel Owner', 'Manages individual hostel operations');

-- Table: users
-- Description: Stores all user login credentials and basic info
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(15),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES user_roles(role_id)
);

-- ============================================
-- 2. HOSTEL MASTER DATA
-- ============================================

-- Table: hostel_master
-- Description: Stores all hostel details
CREATE TABLE hostel_master (
    hostel_id INT AUTO_INCREMENT PRIMARY KEY,
    hostel_name VARCHAR(150) NOT NULL,
    owner_id INT NOT NULL,
    hostel_type ENUM('Boys', 'Girls', 'Co-ed') NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    total_rooms INT DEFAULT 0,
    contact_number VARCHAR(15),
    email VARCHAR(150),
    registration_number VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(user_id)
);

-- ============================================
-- 3. ROOM MANAGEMENT
-- ============================================

-- Table: room_types
-- Description: Master table for room categories
CREATE TABLE room_types (
    room_type_id INT AUTO_INCREMENT PRIMARY KEY,
    room_type_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default room types
INSERT INTO room_types (room_type_name, description) VALUES
('Single', '1 person per room'),
('Double', '2 persons per room'),
('Triple', '3 persons per room'),
('Four Sharing', '4 persons per room'),
('Dormitory', 'More than 4 persons per room');

-- Table: rooms
-- Description: Stores all room details for each hostel
CREATE TABLE rooms (
    room_id INT AUTO_INCREMENT PRIMARY KEY,
    hostel_id INT NOT NULL,
    room_number VARCHAR(20) NOT NULL,
    room_type_id INT NOT NULL,
    floor_number INT,
    capacity INT NOT NULL,
    occupied_beds INT DEFAULT 0,
    rent_per_bed DECIMAL(10, 2) NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    amenities TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (hostel_id) REFERENCES hostel_master(hostel_id) ON DELETE CASCADE,
    FOREIGN KEY (room_type_id) REFERENCES room_types(room_type_id),
    UNIQUE KEY unique_room (hostel_id, room_number)
);

-- ============================================
-- 4. STUDENT MANAGEMENT
-- ============================================

-- Table: students
-- Description: Stores all student details
CREATE TABLE students (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    hostel_id INT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    date_of_birth DATE,
    gender ENUM('Male', 'Female', 'Other'),
    phone VARCHAR(15) NOT NULL,
    email VARCHAR(150),
    guardian_name VARCHAR(150),
    guardian_phone VARCHAR(15) NOT NULL,
    guardian_relation VARCHAR(50),
    permanent_address TEXT,
    persent_working_address Text,
    id_proof_type VARCHAR(50),
    id_proof_number VARCHAR(100),
    id_proof_document_url TEXT,
    admission_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (hostel_id) REFERENCES hostel_master(hostel_id) ON DELETE CASCADE
);

-- Table: room_allocations
-- Description: Tracks which student is allocated to which room
CREATE TABLE room_allocations (
    allocation_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    room_id INT NOT NULL,
    bed_number VARCHAR(10),
    allocation_date DATE NOT NULL,
    vacate_date DATE NULL,
    is_current BOOLEAN DEFAULT TRUE,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE
);

-- ============================================
-- 5. FEE MANAGEMENT
-- ============================================

-- Table: payment_modes
-- Description: Master table for payment methods
CREATE TABLE payment_modes (
    payment_mode_id INT AUTO_INCREMENT PRIMARY KEY,
    payment_mode_name VARCHAR(50) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default payment modes
INSERT INTO payment_modes (payment_mode_name) VALUES
('Cash'),
('UPI'),
('Bank Transfer'),
('Debit Card'),
('Credit Card'),
('Cheque'),
('Online Payment');

-- Table: fee_structure
-- Description: Defines fee structure for each hostel
CREATE TABLE fee_structure (
    fee_structure_id INT AUTO_INCREMENT PRIMARY KEY,
    hostel_id INT NOT NULL,
    fee_type VARCHAR(100) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    frequency ENUM('Monthly', 'Quarterly', 'Half-Yearly', 'Yearly', 'One-Time') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (hostel_id) REFERENCES hostel_master(hostel_id) ON DELETE CASCADE
);

-- Table: student_fee_payments
-- Description: Records all fee payments made by students
CREATE TABLE student_fee_payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    hostel_id INT NOT NULL,
    payment_date DATE NOT NULL,
    amount_paid DECIMAL(10, 2) NOT NULL,
    payment_mode_id INT NOT NULL,
    payment_for_month VARCHAR(20),
    transaction_reference VARCHAR(100),
    receipt_number VARCHAR(50) UNIQUE,
    receipt_url TEXT,
    remarks TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (hostel_id) REFERENCES hostel_master(hostel_id) ON DELETE CASCADE,
    FOREIGN KEY (payment_mode_id) REFERENCES payment_modes(payment_mode_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- Table: student_dues
-- Description: Tracks outstanding dues for each student
CREATE TABLE student_dues (
    due_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    hostel_id INT NOT NULL,
    due_month VARCHAR(20) NOT NULL,
    due_amount DECIMAL(10, 2) NOT NULL,
    paid_amount DECIMAL(10, 2) DEFAULT 0,
    balance_amount DECIMAL(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    is_paid BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (hostel_id) REFERENCES hostel_master(hostel_id) ON DELETE CASCADE
);

-- ============================================
-- 6. EXPENSE MANAGEMENT
-- ============================================

-- Table: expense_categories
-- Description: Master table for expense types
CREATE TABLE expense_categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default expense categories
INSERT INTO expense_categories (category_name, description) VALUES
('Electricity Bill', 'Monthly electricity charges'),
('Water Bill', 'Monthly water charges'),
('Maintenance', 'Repairs and maintenance'),
('Salary', 'Staff salaries'),
('Groceries', 'Food and provisions'),
('Internet Bill', 'Internet and WiFi charges'),
('Property Tax', 'Government taxes'),
('Rent', 'Building rent if applicable'),
('Miscellaneous', 'Other expenses');

-- Table: expenses
-- Description: Records all hostel expenses
CREATE TABLE expenses (
    expense_id INT AUTO_INCREMENT PRIMARY KEY,
    hostel_id INT NOT NULL,
    category_id INT NOT NULL,
    expense_date DATE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_mode_id INT NOT NULL,
    vendor_name VARCHAR(150),
    description TEXT,
    bill_number VARCHAR(100),
    bill_document_url TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (hostel_id) REFERENCES hostel_master(hostel_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES expense_categories(category_id),
    FOREIGN KEY (payment_mode_id) REFERENCES payment_modes(payment_mode_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- ============================================
-- 7. NOTIFICATIONS & ALERTS
-- ============================================

-- Table: notifications
-- Description: Stores system notifications for users
CREATE TABLE notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    hostel_id INT,
    notification_type ENUM('Payment Due', 'New Admission', 'Expense Alert', 'System Alert', 'General') NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (hostel_id) REFERENCES hostel_master(hostel_id) ON DELETE CASCADE
);

-- ============================================
-- 8. REPORTS & ANALYTICS
-- ============================================

-- Table: monthly_reports
-- Description: Stores pre-calculated monthly financial summaries
CREATE TABLE monthly_reports (
    report_id INT AUTO_INCREMENT PRIMARY KEY,
    hostel_id INT NOT NULL,
    report_month VARCHAR(20) NOT NULL,
    total_income DECIMAL(12, 2) DEFAULT 0,
    total_expenses DECIMAL(12, 2) DEFAULT 0,
    net_profit DECIMAL(12, 2) DEFAULT 0,
    total_students INT DEFAULT 0,
    occupancy_rate DECIMAL(5, 2) DEFAULT 0,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hostel_id) REFERENCES hostel_master(hostel_id) ON DELETE CASCADE,
    UNIQUE KEY unique_report (hostel_id, report_month)
);

-- ============================================
-- 9. AUDIT & LOGS
-- ============================================

-- Table: audit_logs
-- Description: Tracks all important actions for security and auditing
CREATE TABLE audit_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action_type VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id INT,
    old_value TEXT,
    new_value TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ============================================
-- 10. SYSTEM SETTINGS
-- ============================================

-- Table: app_settings
-- Description: Stores application-wide configuration settings
CREATE TABLE app_settings (
    setting_id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT INTO app_settings (setting_key, setting_value, description) VALUES
('app_name', 'Hostel Management System', 'Application name'),
('currency', 'INR', 'Default currency'),
('date_format', 'DD-MM-YYYY', 'Date display format'),
('late_fee_percentage', '5', 'Late payment penalty percentage'),
('payment_due_days', '5', 'Number of days before payment due date to send reminder');

-- ============================================
-- 11. DUMMY DATA FOR TESTING
-- ============================================

-- Insert dummy users (Admin and Hostel Owners)
INSERT INTO users (username, email, password_hash, role_id, full_name, phone, is_active) VALUES
('admin', 'admin@hostelapp.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', 1, 'Main Administrator', '9876543210', TRUE),
('owner_mahendra', 'mahendra@gmail.com', '$2b$10$ownerpasswordhash123456789', 2, 'Mahendhra Reddy', '9876543211', TRUE),
('owner_rajesh', 'rajesh@gmail.com', '$2b$10$ownerpasswordhash987654321', 2, 'Rajesh Kumar', '9876543212', TRUE);

-- Insert dummy hostels
INSERT INTO hostel_master (hostel_name, owner_id, hostel_type, address, city, state, pincode, total_rooms, contact_number, email, registration_number, is_active) VALUES
('Sunrise Boys Hostel', 2, 'Boys', 'Plot No 45, Near Tech Park, Gachibowli', 'Hyderabad', 'Telangana', '500032', 16, '9876543211', 'sunrise@hostel.com', 'REG/HYD/2024/001', TRUE),
('GreenView Girls Hostel', 3, 'Girls', 'House No 12, Kukatpally Main Road', 'Hyderabad', 'Telangana', '500072', 12, '9876543212', 'greenview@hostel.com', 'REG/HYD/2024/002', TRUE),
('TechPark Co-Ed Hostel', 2, 'Co-ed', 'Tower 3, HITEC City', 'Hyderabad', 'Telangana', '500081', 20, '9876543213', 'techpark@hostel.com', 'REG/HYD/2024/003', TRUE);

-- Insert dummy rooms for Sunrise Boys Hostel (4 floors with 4 rooms each)
-- 2nd Floor (201, 202, 203, 204)
INSERT INTO rooms (hostel_id, room_number, room_type_id, floor_number, capacity, occupied_beds, rent_per_bed, is_available, amenities) VALUES
(1, '201', 2, 2, 2, 2, 4500.00, FALSE, 'AC, Attached Bathroom, WiFi'),
(1, '202', 3, 2, 3, 2, 4000.00, TRUE, 'Fan, Common Bathroom, WiFi'),
(1, '203', 1, 2, 1, 1, 6000.00, FALSE, 'AC, Attached Bathroom, WiFi, Study Table'),
(1, '204', 4, 2, 4, 3, 3500.00, TRUE, 'Fan, Common Bathroom, WiFi'),

-- 3rd Floor (301, 302, 303, 304)
(1, '301', 2, 3, 2, 2, 4500.00, FALSE, 'AC, Attached Bathroom, WiFi'),
(1, '302', 3, 3, 3, 3, 4000.00, FALSE, 'Fan, Common Bathroom, WiFi'),
(1, '303', 2, 3, 2, 1, 4500.00, TRUE, 'AC, Attached Bathroom, WiFi'),
(1, '304', 4, 3, 4, 4, 3500.00, FALSE, 'Fan, Common Bathroom, WiFi'),

-- 4th Floor (401, 402, 403, 404)
(1, '401', 2, 4, 2, 0, 4500.00, TRUE, 'AC, Attached Bathroom, WiFi'),
(1, '402', 3, 4, 3, 1, 4000.00, TRUE, 'Fan, Common Bathroom, WiFi'),
(1, '403', 1, 4, 1, 0, 6000.00, TRUE, 'AC, Attached Bathroom, WiFi, Study Table'),
(1, '404', 4, 4, 4, 2, 3500.00, TRUE, 'Fan, Common Bathroom, WiFi'),

-- Pent Floor (501, 502, 503, 504)
(1, '501', 1, 5, 1, 1, 7000.00, FALSE, 'AC, Attached Bathroom, WiFi, Study Table, Balcony'),
(1, '502', 2, 5, 2, 2, 5500.00, FALSE, 'AC, Attached Bathroom, WiFi, Balcony'),
(1, '503', 2, 5, 2, 0, 5500.00, TRUE, 'AC, Attached Bathroom, WiFi, Balcony'),
(1, '504', 3, 5, 3, 1, 5000.00, TRUE, 'AC, Attached Bathroom, WiFi, Balcony');

-- Insert dummy rooms for GreenView Girls Hostel (3 floors with 4 rooms each)
INSERT INTO rooms (hostel_id, room_number, room_type_id, floor_number, capacity, occupied_beds, rent_per_bed, is_available, amenities) VALUES
(2, '101', 2, 1, 2, 2, 4200.00, FALSE, 'AC, Attached Bathroom, WiFi'),
(2, '102', 3, 1, 3, 3, 3800.00, FALSE, 'Fan, Common Bathroom, WiFi'),
(2, '103', 2, 1, 2, 1, 4200.00, TRUE, 'AC, Attached Bathroom, WiFi'),
(2, '104', 4, 1, 4, 2, 3200.00, TRUE, 'Fan, Common Bathroom, WiFi'),
(2, '201', 2, 2, 2, 2, 4200.00, FALSE, 'AC, Attached Bathroom, WiFi'),
(2, '202', 3, 2, 3, 2, 3800.00, TRUE, 'Fan, Common Bathroom, WiFi'),
(2, '203', 1, 2, 1, 1, 5500.00, FALSE, 'AC, Attached Bathroom, WiFi, Study Table'),
(2, '204', 4, 2, 4, 3, 3200.00, TRUE, 'Fan, Common Bathroom, WiFi'),
(2, '301', 2, 3, 2, 0, 4200.00, TRUE, 'AC, Attached Bathroom, WiFi'),
(2, '302', 3, 3, 3, 1, 3800.00, TRUE, 'Fan, Common Bathroom, WiFi'),
(2, '303', 2, 3, 2, 2, 4200.00, FALSE, 'AC, Attached Bathroom, WiFi'),
(2, '304', 1, 3, 1, 1, 5500.00, FALSE, 'AC, Attached Bathroom, WiFi, Study Table');

-- Insert dummy students for Sunrise Boys Hostel
INSERT INTO students (hostel_id, first_name, last_name, date_of_birth, gender, phone, email, guardian_name, guardian_phone, guardian_relation, permanent_address, persent_working_address, id_proof_type, id_proof_number, admission_date, is_active) VALUES
(1, 'Ravi', 'Kumar', '2002-05-15', 'Male', '9876501234', 'ravi.kumar@email.com', 'Ramesh Kumar', '9876001234', 'Father', 'H.No 123, Warangal, Telangana', 'Room 201, Sunrise Hostel, Gachibowli, Hyderabad', 'Aadhar', '1234-5678-9012', '2025-01-10', TRUE),
(1, 'Manish', 'Reddy', '2001-08-22', 'Male', '9876502345', 'manish.r@email.com', 'Venkat Reddy', '9876002345', 'Father', 'Plot 45, Karimnagar, Telangana', 'Room 201, Sunrise Hostel, Gachibowli, Hyderabad', 'Aadhar', '2345-6789-0123', '2025-01-15', TRUE),
(1, 'Ajay', 'Naik', '2003-03-10', 'Male', '9876503456', 'ajay.naik@email.com', 'Suresh Naik', '9876003456', 'Father', 'Street 7, Nizamabad, Telangana', 'Room 202, Sunrise Hostel, Gachibowli, Hyderabad', 'Aadhar', '3456-7890-1234', '2025-02-01', TRUE),
(1, 'Kiran', 'Varma', '2002-11-05', 'Male', '9876504567', 'kiran.v@email.com', 'Krishna Varma', '9876004567', 'Father', 'Door No 89, Khammam, Telangana', 'Room 202, Sunrise Hostel, Gachibowli, Hyderabad', 'Aadhar', '4567-8901-2345', '2025-02-05', TRUE),
(1, 'Vikram', 'Singh', '2001-07-18', 'Male', '9876505678', 'vikram.s@email.com', 'Rajesh Singh', '9876005678', 'Father', 'House 34, Nalgonda, Telangana', 'Room 203, Sunrise Hostel, Gachibowli, Hyderabad', 'Passport', 'P1234567', '2025-01-20', TRUE),
(1, 'Suresh', 'Babu', '2002-09-12', 'Male', '9876506789', 'suresh.b@email.com', 'Ramana Babu', '9876006789', 'Father', 'Flat 12, Mahbubnagar, Telangana', 'Room 204, Sunrise Hostel, Gachibowli, Hyderabad', 'Aadhar', '5678-9012-3456', '2025-02-10', TRUE),
(1, 'Rohit', 'Sharma', '2003-01-25', 'Male', '9876507890', 'rohit.sharma@email.com', 'Mohan Sharma', '9876007890', 'Father', 'Colony 5, Medak, Telangana', 'Room 204, Sunrise Hostel, Gachibowli, Hyderabad', 'Aadhar', '6789-0123-4567', '2025-02-12', TRUE),
(1, 'Arun', 'Prasad', '2002-04-30', 'Male', '9876508901', 'arun.p@email.com', 'Srinivas Prasad', '9876008901', 'Father', 'Street 9, Adilabad, Telangana', 'Room 204, Sunrise Hostel, Gachibowli, Hyderabad', 'Aadhar', '7890-1234-5678', '2025-02-15', TRUE),
(1, 'Deepak', 'Reddy', '2001-12-08', 'Male', '9876509012', 'deepak.r@email.com', 'Sai Reddy', '9876009012', 'Father', 'H.No 67, Sangareddy, Telangana', 'Room 301, Sunrise Hostel, Gachibowli, Hyderabad', 'Aadhar', '9012-3456-7890', '2025-03-01', TRUE),
(1, 'Naveen', 'Kumar', '2003-06-14', 'Male', '9876510123', 'naveen.k@email.com', 'Prakash Kumar', '9876010123', 'Father', 'Plot 23, Siddipet, Telangana', 'Room 301, Sunrise Hostel, Gachibowli, Hyderabad', 'Aadhar', '8901-2345-6789', '2025-03-05', TRUE);

-- Insert dummy students for GreenView Girls Hostel
INSERT INTO students (hostel_id, first_name, last_name, date_of_birth, gender, phone, email, guardian_name, guardian_phone, guardian_relation, permanent_address, persent_working_address, id_proof_type, id_proof_number, admission_date, is_active) VALUES
(2, 'Priya', 'Sharma', '2002-07-20', 'Female', '9876520001', 'priya.sharma@email.com', 'Rajesh Sharma', '9876020001', 'Father', 'House 45, Kukatpally, Hyderabad', 'Room 101, GreenView Hostel, Kukatpally, Hyderabad', 'Aadhar', '1111-2222-3333', '2025-01-08', TRUE),
(2, 'Divya', 'Reddy', '2003-02-15', 'Female', '9876520002', 'divya.reddy@email.com', 'Venkat Reddy', '9876020002', 'Father', 'Plot 78, Miyapur, Hyderabad', 'Room 101, GreenView Hostel, Kukatpally, Hyderabad', 'Aadhar', '2222-3333-4444', '2025-01-10', TRUE),
(2, 'Sneha', 'Patel', '2002-10-05', 'Female', '9876520003', 'sneha.patel@email.com', 'Ramesh Patel', '9876020003', 'Father', 'Street 12, Nizampet, Hyderabad', 'Room 102, GreenView Hostel, Kukatpally, Hyderabad', 'Passport', 'P9876543', '2025-01-12', TRUE),
(2, 'Anjali', 'Verma', '2001-05-18', 'Female', '9876520004', 'anjali.verma@email.com', 'Suresh Verma', '9876020004', 'Father', 'Flat 34, Bachupally, Hyderabad', 'Room 102, GreenView Hostel, Kukatpally, Hyderabad', 'Aadhar', '3333-4444-5555', '2025-01-15', TRUE),
(2, 'Kavya', 'Nair', '2003-09-22', 'Female', '9876520005', 'kavya.nair@email.com', 'Krishna Nair', '9876020005', 'Father', 'Door 56, Kompally, Hyderabad', 'Room 102, GreenView Hostel, Kukatpally, Hyderabad', 'Aadhar', '4444-5555-6666', '2025-01-18', TRUE);

-- Insert room allocations
INSERT INTO room_allocations (student_id, room_id, bed_number, allocation_date, is_current) VALUES
(1, 1, 'B1', '2025-01-10', TRUE),
(2, 1, 'B2', '2025-01-15', TRUE),
(3, 2, 'B1', '2025-02-01', TRUE),
(4, 2, 'B2', '2025-02-05', TRUE),
(5, 3, 'B1', '2025-01-20', TRUE),
(6, 4, 'B1', '2025-02-10', TRUE),
(7, 4, 'B2', '2025-02-12', TRUE),
(8, 4, 'B3', '2025-02-15', TRUE),
(9, 5, 'B1', '2025-03-01', TRUE),
(10, 5, 'B2', '2025-03-05', TRUE),
(11, 17, 'B1', '2025-01-08', TRUE),
(12, 17, 'B2', '2025-01-10', TRUE),
(13, 18, 'B1', '2025-01-12', TRUE),
(14, 18, 'B2', '2025-01-15', TRUE),
(15, 18, 'B3', '2025-01-18', TRUE);

-- Insert fee structure
INSERT INTO fee_structure (hostel_id, fee_type, amount, frequency, is_active) VALUES
(1, 'Room Rent', 4500.00, 'Monthly', TRUE),
(1, 'Electricity Charges', 500.00, 'Monthly', TRUE),
(1, 'Security Deposit', 10000.00, 'One-Time', TRUE),
(2, 'Room Rent', 4200.00, 'Monthly', TRUE),
(2, 'Electricity Charges', 450.00, 'Monthly', TRUE),
(2, 'Security Deposit', 9000.00, 'One-Time', TRUE);

-- Insert student fee payments
INSERT INTO student_fee_payments (student_id, hostel_id, payment_date, amount_paid, payment_mode_id, payment_for_month, transaction_reference, receipt_number, created_by) VALUES
(1, 1, '2025-01-10', 5000.00, 2, 'January 2025', 'UPI/2025/001', 'REC/SUN/001', 2),
(2, 1, '2025-01-15', 5000.00, 1, 'January 2025', NULL, 'REC/SUN/002', 2),
(3, 1, '2025-02-01', 4500.00, 2, 'February 2025', 'UPI/2025/002', 'REC/SUN/003', 2),
(4, 1, '2025-02-05', 4500.00, 3, 'February 2025', 'NEFT/2025/001', 'REC/SUN/004', 2),
(5, 1, '2025-01-20', 6500.00, 2, 'January 2025', 'UPI/2025/003', 'REC/SUN/005', 2),
(11, 2, '2025-01-08', 4650.00, 2, 'January 2025', 'UPI/2025/004', 'REC/GRN/001', 3),
(12, 2, '2025-01-10', 4650.00, 1, 'January 2025', NULL, 'REC/GRN/002', 3),
(13, 2, '2025-01-12', 4200.00, 2, 'January 2025', 'UPI/2025/005', 'REC/GRN/003', 3);

-- Insert expenses
INSERT INTO expenses (hostel_id, category_id, expense_date, amount, payment_mode_id, vendor_name, description, bill_number, created_by) VALUES
(1, 1, '2025-01-05', 3500.00, 1, 'TSSPDCL', 'Electricity bill for December 2024', 'EB/DEC/2024/001', 2),
(1, 2, '2025-01-08', 800.00, 1, 'HMWS&SB', 'Water bill for December 2024', 'WB/DEC/2024/001', 2),
(1, 5, '2025-01-15', 12000.00, 1, 'Local Grocery Store', 'Monthly provisions', 'GRO/JAN/001', 2),
(1, 4, '2025-01-31', 15000.00, 3, 'Staff Salary', 'Cook and helper salary', 'SAL/JAN/2025', 2),
(2, 1, '2025-01-06', 2800.00, 1, 'TSSPDCL', 'Electricity bill for December 2024', 'EB/DEC/2024/002', 3),
(2, 2, '2025-01-09', 650.00, 1, 'HMWS&SB', 'Water bill for December 2024', 'WB/DEC/2024/002', 3),
(2, 5, '2025-01-16', 10000.00, 1, 'Local Grocery Store', 'Monthly provisions', 'GRO/JAN/002', 3);

-- Insert notifications
INSERT INTO notifications (user_id, hostel_id, notification_type, title, message, priority) VALUES
(2, 1, 'Payment Due', 'Pending Fee Collection', 'Student Suresh Babu has pending fees for February 2025', 'High'),
(2, 1, 'Expense Alert', 'High Electricity Bill', 'Electricity bill for this month is 20% higher than average', 'Medium'),
(3, 2, 'New Admission', 'New Student Admission', 'Kavya Nair has been admitted to Room 102', 'Low');

-- ============================================
-- END OF SCHEMA
-- ============================================
