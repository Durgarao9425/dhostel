-- Update passwords for all users with bcrypt hash for "password123"
USE Hostel;

UPDATE users
SET password_hash = '$2a$10$xK9EYCN95EkDSw0iLkIa6OGishBjJB7Iyr90f5vMNEzA8l9AfiDjS'
WHERE user_id IN (1, 2, 3);

-- Verify the update
SELECT user_id, username, email, SUBSTRING(password_hash, 1, 20) as hash_preview
FROM users;
