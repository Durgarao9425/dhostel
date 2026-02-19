# Room Allocations Migration Guide

## Overview
This guide documents the migration from `room_allocations` table to storing room allocation data directly in the `students` table.

## Changes Summary

### Database Schema Changes

**Added to `students` table:**
- `room_id` (INT, NULL, FK to rooms) - Current room assignment
- `monthly_rent` (DECIMAL(10,2), NULL) - Current monthly rent

**Using existing columns:**
- `admission_date` - When student was allocated to current room
- `inactive_date` - When student vacated (when status becomes Inactive)

**Removed:**
- `room_allocations` table (dropped after migration)

## Migration Steps

### Step 1: Add Columns to Students Table
```bash
# Run the migration SQL file
mysql -u root -p Hostel < backend/migrations/add_room_fields_to_students.sql
```

Or execute the SQL directly:
```sql
ALTER TABLE students
ADD COLUMN room_id INT NULL AFTER hostel_id,
ADD COLUMN monthly_rent DECIMAL(10, 2) NULL AFTER room_id;

ALTER TABLE students
ADD CONSTRAINT fk_students_room
FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE SET NULL;

CREATE INDEX idx_students_room_id ON students(room_id);
CREATE INDEX idx_students_room_status ON students(room_id, status);
```

### Step 2: Migrate Data
```bash
# Run the data migration script
cd backend
node scripts/migrate-room-allocations-to-students.cjs
```

This script will:
- Copy `room_id` and `monthly_rent` from active allocations to students
- Clear room data for inactive students
- Verify the migration was successful

### Step 3: Update Backend Code
All backend controllers have been updated:
- ✅ `studentController.ts` - Removed all `room_allocations` references
- ✅ `roomController.ts` - Uses `students.room_id` for occupancy
- ✅ `reportController.ts` - Uses `students.room_id` for statistics
- ✅ `feeController.ts` - Uses `students.monthly_rent`
- ✅ `monthlyFeeController.ts` - Uses `students.room_id`
- ✅ `activityController.ts` - Uses `students.room_id`

### Step 4: Test Application
1. Test student creation with room assignment
2. Test student room changes
3. Test student status changes (Active ↔ Inactive)
4. Verify room bed counts are accurate
5. Test all reports and dashboards

### Step 5: Drop Old Table (After Verification)
```bash
# Run the drop script (with confirmation)
cd backend
node scripts/drop-room-allocations-table.cjs
```

## Code Changes Summary

### Before (using room_allocations):
```typescript
// Get student with room
const student = await db('students as s')
  .leftJoin('room_allocations as ra', function() {
    this.on('s.student_id', '=', 'ra.student_id')
      .andOn('ra.is_current', '=', db.raw('1'));
  })
  .leftJoin('rooms as r', 'ra.room_id', 'r.room_id')
  .select('s.*', 'r.room_number', 'ra.monthly_rent')
  .first();
```

### After (using students.room_id):
```typescript
// Get student with room
const student = await db('students as s')
  .leftJoin('rooms as r', 's.room_id', 'r.room_id')
  .select('s.*', 'r.room_number', 's.monthly_rent')
  .first();
```

### Room Occupancy Calculation

**Before:**
```typescript
const count = await db('room_allocations')
  .where({ room_id, is_current: 1 })
  .count('* as count');
```

**After:**
```typescript
const count = await db('students')
  .where({ room_id, status: 'Active' })
  .count('* as count');
```

## Important Notes

1. **Room History**: Room allocation history is not preserved. Only current room assignment is stored.

2. **Admission Date**: When a student's room is changed, `admission_date` is updated to the current date (treating it as re-admission).

3. **Inactive Students**: When a student becomes inactive:
   - `room_id` is set to NULL
   - `monthly_rent` is set to NULL
   - `inactive_date` is set to current date
   - Room bed count is decremented

4. **Active Students**: When a student becomes active:
   - `inactive_date` is cleared
   - `admission_date` is updated to current date
   - Room must be manually assigned (not auto-restored)

5. **Room Bed Counts**: Always calculated from `students` table:
   ```sql
   SELECT COUNT(*) FROM students 
   WHERE room_id = X AND status = 'Active'
   ```

## Rollback Plan

If you need to rollback:
1. Restore `room_allocations` table from backup
2. Revert code changes
3. Run data migration in reverse (copy from students back to allocations)

## Files Created/Modified

### New Files:
- `backend/migrations/add_room_fields_to_students.sql`
- `backend/scripts/migrate-room-allocations-to-students.cjs`
- `backend/scripts/drop-room-allocations-table.cjs`

### Modified Files:
- `backend/src/controllers/studentController.ts`
- `backend/src/controllers/roomController.ts`
- `backend/src/controllers/reportController.ts`
- `backend/src/controllers/feeController.ts`
- `backend/src/controllers/monthlyFeeController.ts`
- `backend/src/controllers/activityController.ts`

## Verification Checklist

- [ ] Migration SQL executed successfully
- [ ] Data migration script completed without errors
- [ ] All students with active allocations have `room_id` set
- [ ] All inactive students have `room_id = NULL`
- [ ] Room bed counts match active student counts
- [ ] Student creation with room works
- [ ] Student room changes work
- [ ] Student status changes update room correctly
- [ ] All API endpoints work correctly
- [ ] Frontend displays room information correctly
- [ ] Reports show correct occupancy data
- [ ] Drop script executed (after verification)







