-- Database Schema for Maintenance System

-- Table for storing maintenance issues/complaints
CREATE TABLE IF NOT EXISTS maintenance_issues (
    issue_id SERIAL PRIMARY KEY,
    room_id INT NOT NULL, -- References room_id(rooms)
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- 'Electrical', 'Plumbing', etc.
    priority VARCHAR(10) DEFAULT 'Medium', -- 'Low', 'Medium', 'High'
    status VARCHAR(20) DEFAULT 'Open', -- 'Open', 'In Progress', 'Resolved'
    reported_date DATE DEFAULT CURRENT_DATE,
    resolved_date DATE,
    estimated_cost DECIMAL(10, 2) DEFAULT 0.00,
    actual_cost DECIMAL(10, 2) DEFAULT 0.00,
    assigned_to VARCHAR(100), -- Staff/Worker name
    images JSONB DEFAULT '[]', -- Array of image URLs
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster filtering
CREATE INDEX idx_maintenance_status ON maintenance_issues(status);
CREATE INDEX idx_maintenance_room ON maintenance_issues(room_id);
