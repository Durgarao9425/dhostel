-- Update owner usernames if they are NULL or empty
-- This script generates usernames based on email addresses or full names

-- For user_id = 2 (Mahendra Reddy)
UPDATE users
SET username = 'mahendra_reddy',
    updated_at = CURRENT_TIMESTAMP
WHERE user_id = 2 AND (username IS NULL OR username = '');

-- For user_id = 3 (if exists)
UPDATE users
SET username = CONCAT(LOWER(REPLACE(full_name, ' ', '_')), '_owner'),
    updated_at = CURRENT_TIMESTAMP
WHERE role_id = 2
  AND (username IS NULL OR username = '')
  AND user_id != 2;

-- Verify the update
SELECT user_id, full_name, username, email
FROM users
WHERE role_id = 2
ORDER BY user_id;
