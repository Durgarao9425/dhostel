# Testing Guide for Boolean Migration

## Pre-Testing Checks

### 1. Database Verification
```bash
# Connect to database
mysql -h localhost -u root -p Hostel

# Check column types
DESCRIBE students;

# Expected results:
# id_proof_status        | tinyint | YES | MUL | 0
# admission_status       | tinyint | YES | MUL | 0
# status                 | tinyint | YES | MUL | 1
```

### 2. Build Verification
```bash
# Backend
cd backend
npm run build
# Should complete with no errors

# Frontend
cd frontend
npm run build
# Should complete with no errors
```

---

## Backend API Testing

### Test 1: Create Student with Boolean Values

**Request:**
```bash
curl -X POST http://localhost:8081/api/students \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "Student",
    "gender": "Male",
    "phone": "9876543210",
    "guardian_phone": "9876543210",
    "admission_date": "2026-01-31",
    "admission_fee": 5000,
    "status": 1,
    "admission_status": 0,
    "id_proof_status": 0,
    "id_proof_type": 1,
    "guardian_relation": 1
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Student registered successfully",
  "data": {
    "student_id": 999
  }
}
```

### Test 2: Update Student Status

**Request:**
```bash
curl -X PUT http://localhost:8081/api/students/999 \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": 0
  }'
```

**Expected Response:**
- Status should change to 0 (Inactive)
- inactive_date should be set to current date
- Room assignment (if any) should be cleared

### Test 3: Get Student Details

**Request:**
```bash
curl http://localhost:8081/api/students/999
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "student_id": 999,
    "status": 0,
    "admission_status": 0,
    "id_proof_status": 0,
    ...
  }
}
```

### Test 4: List Students with Filter

**Request:**
```bash
curl http://localhost:8081/api/students
```

**Expected Response:**
- All students returned with numeric status values
- status: 0 or 1 (not text)
- admission_status: 0 or 1
- id_proof_status: 0 or 1

---

## Frontend Testing

### Test 1: Create New Student Form

1. Open frontend application
2. Go to "Add Student" modal
3. Fill in form with:
   - Name: "Jane Doe"
   - Phone: "9999999999"
   - Guardian Phone: "8888888888"
   - Gender: "Female"
   - ID Proof Type: Select from dropdown (ID 1, 2, or 3)
   - Guardian Relation: Select from dropdown (ID 1, 2, etc)
   - Status: Should default to "Active"
   - Admission Status: Should default to "Unpaid"
   - ID Proof Status: Should default to "Not Submitted"

4. Click "Add Student"

**Expected Result:**
- Student created successfully
- Modal closes
- New student appears in list with status = "Active"

### Test 2: Status Filter

1. In Students list, find status filter buttons
2. Click on "Active" filter
   - Should show only students with status = 1

3. Click on "Inactive" filter
   - Should show only students with status = 0

4. Click on "All" filter
   - Should show all students regardless of status

**Expected Result:**
- Filtering works correctly
- Count updates properly

### Test 3: Update Student Status

1. Click on a student card/row
2. Open edit modal
3. Change status from "Active" to "Inactive"
4. Change admission_status from "Unpaid" to "Paid"
5. Change id_proof_status from "Not Submitted" to "Submitted"
6. Click "Update"

**Expected Result:**
- Student status updates immediately in list
- Inactive badge shows "Inactive" in red
- Paid badge shows "Paid" in green
- Submitted badge shows "Submitted" in green

### Test 4: View Student Details Modal

1. Click "View" or eye icon on student
2. Check displayed status values:
   - Status: Shows "Active" or "Inactive" (display text, not 0/1)
   - Admission Status: Shows "Paid" or "Unpaid"
   - ID Proof Status: Shows "Submitted" or "Not Submitted"

**Expected Result:**
- All status values display as readable text
- No numeric values (0/1) shown to user
- Badges/colors are correct

### Test 5: Room Assignment

1. Create or edit an active student
2. Assign a room
3. Click Update

**Expected Result:**
- Room is assigned
- occupied_beds incremented for that room

4. Change student status to "Inactive"
5. Click Update

**Expected Result:**
- Room assignment is cleared
- occupied_beds decremented for that room

6. Change student status back to "Active"

**Expected Result:**
- Can reassign room if needed

---

## Edge Cases to Test

### Test 1: Mixed Input Types (Backwards Compatibility)

**Request:**
```bash
curl -X POST http://localhost:8081/api/students \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "gender": "Male",
    "phone": "9876543210",
    "guardian_phone": "9876543210",
    "admission_date": "2026-01-31",
    "admission_fee": 5000,
    "status": "Active",
    "admission_status": "Unpaid",
    "id_proof_status": "Not Submitted",
    "id_proof_type": 1,
    "guardian_relation": 1
  }'
```

**Expected Result:**
- Student created successfully
- Text values converted to numeric (1/0) automatically

### Test 2: Invalid Status Values

**Request:**
```bash
curl -X PUT http://localhost:8081/api/students/999 \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": 2
  }'
```

**Expected Result:**
- Should still work (accepts any numeric value, will be stored as 0 or 1 in comparison)
- Or validation should reject it with error

### Test 3: Null Status Values

**Request:**
```bash
curl -X POST http://localhost:8081/api/students \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "gender": "Male",
    "phone": "9876543210",
    "guardian_phone": "9876543210",
    "admission_date": "2026-01-31",
    "admission_fee": 5000,
    "id_proof_type": 1,
    "guardian_relation": 1
  }'
```

**Expected Result:**
- status defaults to 1 (Active)
- admission_status defaults to 0 (Unpaid)
- id_proof_status defaults to 0 (Not Submitted)

---

## Database Verification Tests

### Test 1: Verify Data Types

```sql
SELECT
  COLUMN_NAME,
  COLUMN_TYPE,
  IS_NULLABLE,
  COLUMN_KEY,
  COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'students'
  AND COLUMN_NAME IN ('status', 'admission_status', 'id_proof_status');
```

**Expected Output:**
- All three columns should be `tinyint(4)`
- IS_NULLABLE: YES
- COLUMN_DEFAULT: 0 for status, 1 for status

### Test 2: Verify Data Values

```sql
SELECT
  DISTINCT status,
  COUNT(*) as count
FROM students
GROUP BY status;
```

**Expected Output:**
```
status | count
0      | X
1      | Y
```

No NULL or other values should appear.

### Test 3: Verify Backup Table

```sql
SELECT COUNT(*) FROM students_backup_before_enum_conversion;
```

**Expected Output:**
- Same number of rows as current students table

---

## Performance Tests

### Test 1: Query Performance

```sql
-- Before running, check the execution plan
EXPLAIN SELECT * FROM students WHERE status = 1;

-- Should use index: idx_students_status
```

### Test 2: Bulk Operations

```sql
-- Update many students
UPDATE students SET status = 0 WHERE created_at < '2024-01-01';

-- Should complete quickly (TINYINT is faster than VARCHAR/ENUM)
```

---

## Troubleshooting

### Issue: Validation Error on Guardian Relation

**Error:** "Guardian Relation is required even though it's selected"

**Cause:** Form data might be sending empty string instead of number

**Solution:** Check that form properly converts select value to number:
```javascript
const relationId = parseInt(formData.guardian_relation);
```

### Issue: Status Shows as 0/1 in UI

**Error:** Student list shows "0" and "1" instead of "Active"/"Inactive"

**Cause:** Display logic not converting numeric values to text

**Solution:** Check that comparisons use `=== 1` not `=== "Active"`

### Issue: Room Occupancy Not Updated

**Error:** occupied_beds not incrementing/decrementing

**Cause:** Status comparison logic might be checking old text values

**Solution:** Verify backend uses `status === 1` for active checks

---

## Sign-Off Checklist

- [ ] Backend builds without errors
- [ ] Frontend builds without errors
- [ ] Create student test passes
- [ ] Update student test passes
- [ ] Status filter works correctly
- [ ] View details shows readable status text
- [ ] Room assignment/removal works
- [ ] Database values are numeric (0/1)
- [ ] Backwards compatibility works (text → numeric)
- [ ] All edge cases handled
- [ ] Performance acceptable

---

## Rollback Plan (if needed)

If issues are critical and need rollback:

```bash
# Database
mysql -h localhost -u root -p Hostel

# Restore from backup
TRUNCATE TABLE students;
INSERT INTO students SELECT * FROM students_backup_before_enum_conversion;

# Change column types back to ENUM
ALTER TABLE students MODIFY COLUMN status ENUM('Active', 'Inactive');
ALTER TABLE students MODIFY COLUMN admission_status ENUM('Paid', 'Unpaid');
ALTER TABLE students MODIFY COLUMN id_proof_status ENUM('Submitted', 'Not Submitted');
```

Then revert code changes in studentController.ts and StudentsPage.tsx.
