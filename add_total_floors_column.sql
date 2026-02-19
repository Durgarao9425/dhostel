-- Add total_floors column to hostel_master table
-- This allows hostel owners to specify the number of floors in their hostel

ALTER TABLE hostel_master
ADD COLUMN total_floors INT DEFAULT NULL AFTER total_rooms;

-- Add comment to the column
ALTER TABLE hostel_master
MODIFY COLUMN total_floors INT DEFAULT NULL COMMENT 'Total number of floors in the hostel';
