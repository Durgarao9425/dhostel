-- ============================================
-- CREATE AMENITIES MASTER TABLE
-- ============================================
-- Description: Master table to store hostel amenities
-- This will be used in dropdowns throughout the application

CREATE TABLE IF NOT EXISTS amenities_master (
    amenity_id INT AUTO_INCREMENT PRIMARY KEY,
    amenity_name VARCHAR(100) NOT NULL UNIQUE,
    amenity_icon VARCHAR(50),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default amenities
INSERT INTO amenities_master (amenity_name, amenity_icon, description, display_order) VALUES
('WiFi', 'wifi', 'High-speed wireless internet connectivity', 1),
('Laundry', 'shirt', 'Washing and ironing services', 2),
('Meals', 'utensils', 'Daily meal provision (breakfast, lunch, dinner)', 3),
('AC', 'snowflake', 'Air conditioning in rooms', 4),
('Hot Water', 'droplet', '24/7 hot water supply', 5),
('Gym', 'dumbbell', 'Fitness center and gym facilities', 6),
('Parking', 'car', 'Vehicle parking space', 7),
('Security', 'shield', '24/7 security and CCTV surveillance', 8),
('Study Room', 'book', 'Dedicated study rooms', 9),
('TV Room', 'tv', 'Common TV and entertainment area', 10),
('Power Backup', 'battery', 'Generator backup for power cuts', 11),
('Water Purifier', 'filter', 'RO water purification system', 12);

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Run this to verify the table was created successfully
SELECT * FROM amenities_master ORDER BY display_order;
