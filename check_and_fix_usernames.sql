-- Step 1: Check current usernames for all owners
SELECT user_id, full_name, username, email, phone
FROM users
WHERE role_id = 2;

-- Step 2: Update usernames for owners that have NULL or empty username
-- This will set username based on the email (part before @)
UPDATE users
SET username = SUBSTRING_INDEX(email, '@', 1),
    updated_at = CURRENT_TIMESTAMP
WHERE role_id = 2
  AND (username IS NULL OR username = '' OR TRIM(username) = '');

-- Step 3: If you want specific usernames, uncomment and modify these:
-- UPDATE users SET username = 'mahendra_reddy' WHERE user_id = 2;
-- UPDATE users SET username = 'priya_sharma' WHERE user_id = 3;

-- Step 4: Verify the update
SELECT user_id, full_name, username, email, phone
FROM users
WHERE role_id = 2
ORDER BY user_id;
