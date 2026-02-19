# Database Migration Deployment Guide

## Foreign Key Migration: id_proof_type & guardian_relation

This guide walks you through deploying the database migration that converts `id_proof_type` and `guardian_relation` from VARCHAR (text) to INT (foreign keys).

---

## ⏱️ Timeline

- **Total Time:** ~30 minutes
- **Downtime:** ~5 minutes (during migration)
- **Risk Level:** Low (backup included)

---

## 🔍 What This Migration Does

### Before Migration
```sql
students.id_proof_type = "Aadhar"      -- TEXT
students.guardian_relation = "Father"  -- TEXT
```

### After Migration
```sql
students.id_proof_type = 1              -- INTEGER (FK to id_proof_types.id)
students.guardian_relation = 1          -- INTEGER (FK to relations_master.relation_id)
```

---

## ✅ Pre-Migration Checklist

- [ ] Backup your database
- [ ] Read this entire guide
- [ ] Backup is verified
- [ ] Schedule deployment during low traffic
- [ ] Notify team of brief downtime (~5 min)
- [ ] Have rollback plan ready
- [ ] Test migration on staging (optional but recommended)

---

## 📋 Step-by-Step Deployment

### Step 1: Backup Your Database

**CRITICAL: Always backup before migrations!**

#### Option A: MySQL Dump (Recommended)
```bash
# On your server (AWS EC2)
cd /home/ubuntu/backups
mysqldump -h your-rds-endpoint.rds.amazonaws.com \
  -u dbadmin -p Hostel > hostel_backup_$(date +%Y%m%d_%H%M%S).sql

# Or use AWS RDS snapshot:
# AWS Console → RDS → Databases → Select hostel-db → Take Snapshot
```

#### Option B: AWS RDS Automated Backup
```
AWS Console:
1. Go to RDS → Databases
2. Select your database
3. Click "Snapshots" tab
4. Click "Create snapshot"
5. Wait for snapshot to complete
```

**Verify backup:**
```bash
# Check backup file size
ls -lh hostel_backup_*.sql

# Should be several MB
```

---

### Step 2: Connect to Your Database

```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# OR connect directly to RDS
mysql -h your-rds-endpoint.c9akciq32.us-east-1.rds.amazonaws.com \
  -u dbadmin -p Hostel
```

---

### Step 3: Run the Migration Script

**Location:** `backend/migrations/convert_proof_type_and_relation_to_foreign_keys.sql`

#### Option A: Execute from EC2

```bash
# SSH into EC2
ssh -i key.pem ubuntu@your-ec2-ip

# Navigate to migrations folder
cd /home/ubuntu/your-repo/backend/migrations

# Run migration
mysql -h your-rds-endpoint.c9akciq32.us-east-1.rds.amazonaws.com \
  -u dbadmin -p Hostel < convert_proof_type_and_relation_to_foreign_keys.sql
```

#### Option B: Execute Directly from MySQL Client

```bash
# Connect to database
mysql -h your-rds-endpoint.c9akciq32.us-east-1.rds.amazonaws.com \
  -u dbadmin -p Hostel

# Paste the migration SQL script:
-- Copy entire content of convert_proof_type_and_relation_to_foreign_keys.sql
-- Paste into MySQL client
-- Press Enter
```

#### Option C: Execute Line by Line (Safest)

If you want maximum visibility:

```sql
-- Start migration
USE Hostel;

-- Step 1: Backup
CREATE TABLE IF NOT EXISTS students_backup_before_foreign_keys AS
SELECT * FROM students;

-- Step 2: Convert id_proof_type
UPDATE students s
SET s.id_proof_type = (
    SELECT p.id FROM id_proof_types p
    WHERE (p.name = s.id_proof_type OR p.code = s.id_proof_type)
    LIMIT 1
)
WHERE s.id_proof_type IS NOT NULL AND s.id_proof_type != ''
  AND EXISTS (
    SELECT 1 FROM id_proof_types p
    WHERE (p.name = s.id_proof_type OR p.code = s.id_proof_type)
  );

-- Step 3: Handle unmapped values
UPDATE students
SET id_proof_type = NULL
WHERE id_proof_type IS NOT NULL AND id_proof_type != ''
  AND NOT EXISTS (
    SELECT 1 FROM id_proof_types p
    WHERE (p.name = students.id_proof_type OR p.code = students.id_proof_type)
  );

-- Continue with remaining steps...
```

---

### Step 4: Monitor Migration Progress

The migration typically completes in seconds to minutes depending on data volume.

**Monitor in MySQL:**
```sql
-- Check progress
SHOW PROCESSLIST;

-- See student records with FK values
SELECT
    student_id,
    first_name,
    id_proof_type,
    guardian_relation
FROM students
LIMIT 10;

-- Verify conversion
SELECT
    COUNT(*) as total,
    SUM(CASE WHEN id_proof_type IS NOT NULL THEN 1 ELSE 0 END) as with_proof_type,
    SUM(CASE WHEN guardian_relation IS NOT NULL THEN 1 ELSE 0 END) as with_relation
FROM students;
```

---

### Step 5: Verify Migration Success

```sql
-- Test 1: Check data types
DESCRIBE students;
-- Should show: id_proof_type INT, guardian_relation INT

-- Test 2: Check foreign key constraints
SELECT CONSTRAINT_NAME, TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 'students'
  AND COLUMN_NAME IN ('id_proof_type', 'guardian_relation');

-- Should show:
-- fk_id_proof_type, students, id_proof_type, id_proof_types
-- fk_guardian_relation, students, guardian_relation, relations_master

-- Test 3: Verify data integrity
SELECT s.student_id, s.first_name, p.name as proof_type, r.relation_name
FROM students s
LEFT JOIN id_proof_types p ON s.id_proof_type = p.id
LEFT JOIN relations_master r ON s.guardian_relation = r.relation_id
LIMIT 5;

-- Test 4: Try to insert invalid data (should FAIL)
INSERT INTO students
(hostel_id, first_name, phone, guardian_phone, admission_date, id_proof_type, guardian_relation)
VALUES (1, 'Test', '9999999999', '8888888888', NOW(), 999, 999);
-- ERROR! Foreign key constraint violation (expected)

-- Clean up test data
DELETE FROM students WHERE first_name = 'Test' AND hostel_id = 1;
```

---

### Step 6: Restart Backend Server

After migration, restart your backend to ensure it uses the new schema:

```bash
# SSH into EC2
ssh -i key.pem ubuntu@your-ec2-ip

# Restart backend
pm2 restart hostel-backend

# Verify it's running
pm2 status
pm2 logs hostel-backend
```

---

## 🔙 Rollback Plan (If Needed)

If something goes wrong, you can rollback quickly:

```sql
-- Option 1: Restore from backup table (Fastest)
DELETE FROM students;
INSERT INTO students SELECT * FROM students_backup_before_foreign_keys;

-- Option 2: Drop foreign keys
ALTER TABLE students DROP FOREIGN KEY fk_id_proof_type;
ALTER TABLE students DROP FOREIGN KEY fk_guardian_relation;

-- Option 3: Restore data type to VARCHAR
ALTER TABLE students MODIFY COLUMN id_proof_type VARCHAR(50);
ALTER TABLE students MODIFY COLUMN guardian_relation VARCHAR(50);

-- Option 4: Restore from complete backup
-- MySQL:
mysql -h endpoint -u user -p database < backup_file.sql

-- AWS RDS Snapshot:
-- AWS Console → RDS → Snapshots → Restore to new instance
```

---

## 🐛 Troubleshooting

### Issue: Migration Fails with "Foreign Key Constraint Error"

**Cause:** Existing foreign key already present

**Solution:**
```sql
-- Check existing constraints
SELECT CONSTRAINT_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 'students';

-- Drop if exists
ALTER TABLE students DROP FOREIGN KEY IF EXISTS fk_id_proof_type;
ALTER TABLE students DROP FOREIGN KEY IF EXISTS fk_guardian_relation;

-- Retry migration
```

---

### Issue: "Cannot Add or Update Child Row - Foreign Key Constraint Fails"

**Cause:** Student records have invalid IDs that don't exist in master table

**Solution:**
```sql
-- Find problematic records
SELECT student_id, id_proof_type, guardian_relation
FROM students
WHERE id_proof_type IS NOT NULL
  AND id_proof_type NOT IN (SELECT id FROM id_proof_types)
LIMIT 10;

-- Check what values are there
SELECT DISTINCT id_proof_type FROM students;
SELECT DISTINCT guardian_relation FROM students;

-- Manual mapping if needed
UPDATE students
SET id_proof_type = 1
WHERE id_proof_type = 'unknown_value';
```

---

### Issue: Migration Takes Too Long

**Cause:** Large student table with millions of records

**Solution:**
```sql
-- Run in batches
UPDATE students
SET id_proof_type = (SELECT id FROM id_proof_types WHERE name = students.id_proof_type)
WHERE id_proof_type IS NOT NULL
  AND student_id BETWEEN 1 AND 1000;

UPDATE students
SET id_proof_type = (SELECT id FROM id_proof_types WHERE name = students.id_proof_type)
WHERE id_proof_type IS NOT NULL
  AND student_id BETWEEN 1001 AND 2000;
-- Continue in 1000-record batches...
```

---

## 📊 Post-Migration Verification

### Test API Endpoints

```bash
# Test ID Proof Types endpoint
curl http://your-backend-url:8081/api/id-proof-types
# Should return: [{ id: 1, name: "Aadhar Card" }, { id: 2, name: "PAN Card" }, ...]

# Test Relations endpoint
curl http://your-backend-url:8081/api/relations
# Should return: [{ relation_id: 1, relation_name: "Father" }, ...]
```

---

### Test Student Creation

```bash
# Create new student with ID instead of name
curl -X POST http://your-backend-url:8081/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "phone": "9999999999",
    "guardian_phone": "8888888888",
    "admission_date": "2026-01-31",
    "id_proof_type": 1,
    "guardian_relation": 1
  }'

# Should succeed with foreign key values
```

---

### Test Frontend Forms

1. Open frontend application
2. Go to "Add Student" form
3. Check that dropdowns populate from API:
   - ID Proof Type dropdown
   - Guardian Relation dropdown
4. Create a new student
5. Verify data saves correctly

---

## 📝 Documentation Updates Needed

After migration, update your code documentation:

### Backend Student Controller

Change:
```typescript
// OLD
const student = {
  id_proof_type: "Aadhar",
  guardian_relation: "Father"
}
```

To:
```typescript
// NEW
const student = {
  id_proof_type: 1,        // ID from id_proof_types table
  guardian_relation: 1     // ID from relations_master table
}
```

---

### Frontend Student Form

Change:
```jsx
// OLD
<input name="id_proof_type" placeholder="Enter proof type (e.g., Aadhar)" />
```

To:
```jsx
// NEW
<select name="id_proof_type">
  {proofTypes.map(p => (
    <option key={p.id} value={p.id}>{p.name}</option>
  ))}
</select>
```

---

## ✅ Migration Success Checklist

After completing migration, verify:

- [ ] Database backup created
- [ ] Migration script executed successfully
- [ ] No errors in MySQL logs
- [ ] Data converted to integers (id_proof_type, guardian_relation)
- [ ] Foreign key constraints added
- [ ] Backend server restarted
- [ ] API endpoints return valid data
- [ ] Student creation works with IDs
- [ ] Frontend dropdowns populate correctly
- [ ] Existing student records still display correctly
- [ ] New students can be created
- [ ] Invalid ID insertion prevented (FK constraint works)

---

## 📞 Support & Troubleshooting

If issues occur:

1. **Check MySQL Logs:**
   ```bash
   # SSH into server
   mysql -h endpoint -u user -p
   SHOW ENGINE INNODB STATUS;
   SHOW WARNINGS;
   ```

2. **Verify Constraints:**
   ```sql
   SHOW CREATE TABLE students;
   ```

3. **Check Data:**
   ```sql
   SELECT * FROM students_backup_before_foreign_keys LIMIT 1;
   ```

4. **Rollback if needed:**
   ```sql
   -- Restore from backup
   TRUNCATE TABLE students;
   INSERT INTO students SELECT * FROM students_backup_before_foreign_keys;
   ```

---

## 📌 Key Points to Remember

✅ Always backup before migrating
✅ Migration is reversible
✅ Downtime is minimal (~5 minutes)
✅ Data is preserved during migration
✅ Foreign keys ensure data integrity
✅ API endpoints already support new structure
✅ Frontend needs dropdown updates (optional but recommended)

---

## Next Steps

1. ✅ Schedule migration time
2. ✅ Create database backup
3. ✅ Run migration script
4. ✅ Verify success
5. ✅ Update frontend code (optional)
6. ✅ Test thoroughly
7. ✅ Deploy to production

---

**Migration Ready! Execute when you're ready.** 🚀

