# Hard Delete Implementation for Rooms

## Overview

The room deletion feature has been updated to implement proper **hard delete** (permanent removal) with **student allocation checking**.

---

## How It Works Now

### When User Clicks Delete Button:

1. **Step 1: Ownership Check**
   - Verifies the room belongs to the logged-in user's hostel
   - Returns 403 error if trying to delete another hostel's room

2. **Step 2: Student Allocation Check**
   - Queries `room_allocations` table for current students
   - Checks `WHERE room_id = ? AND is_current = 1`

3. **Step 3: Decision**
   - **If students exist:**
     - ❌ Deletion blocked
     - Returns: `"Cannot delete. Students are currently assigned to this room."`
     - Room remains unchanged

   - **If no students:**
     - ✅ Hard delete performed
     - Permanently removes row from database
     - Returns: `"Room deleted successfully"`
     - Frontend refreshes and removes row from list

---

## Database Changes

### What Happens in Database:

**Before deletion attempt:**
```sql
SELECT room_id, room_number, is_available FROM rooms WHERE room_id = 123;
-- Result: room_id=123, room_number='101', is_available=1
```

**After successful hard delete:**
```sql
SELECT room_id, room_number, is_available FROM rooms WHERE room_id = 123;
-- Result: No rows found (row permanently deleted)
```

**The row is completely removed** from the database.

---

## Code Implementation

### Backend Controller
**File:** `backend/src/controllers/roomController.ts` (lines 290-354)

```typescript
export const deleteRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { roomId } = req.params;
    const user = req.user;

    // 1. Fetch room to verify it exists
    const room = await db('rooms')
      .where({ room_id: roomId })
      .first();

    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Room not found'
      });
    }

    // 2. Ownership verification (for hostel owners)
    if (user?.role_id === 2) {
      if (!user.hostel_id) {
        return res.status(403).json({
          success: false,
          error: 'Your account is not linked to any hostel'
        });
      }

      if (room.hostel_id !== user.hostel_id) {
        return res.status(403).json({
          success: false,
          error: 'You can only delete rooms from your own hostel'
        });
      }
    }

    // 3. Check for active students
    const allocations = await db('room_allocations')
      .where({ room_id: roomId, is_current: 1 })
      .count('* as count')
      .first();

    const count = allocations?.count ? Number(allocations.count) : 0;
    if (count > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete. Students are currently assigned to this room.'
      });
    }

    // 4. Hard delete - permanently remove from database
    await db('rooms')
      .where({ room_id: roomId })
      .delete();

    res.json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete room'
    });
  }
};
```

### Frontend Handler
**File:** `frontend/src/pages/RoomsPage.tsx` (lines 235-246)

```typescript
const handleDelete = async (roomId: number) => {
  if (!window.confirm("Are you sure you want to delete this room?")) return;

  try {
    await api.delete(`/rooms/${roomId}`);
    toast.success("Room deleted successfully"); // Shows backend message
    fetchRooms(); // Refresh the list
  } catch (error: any) {
    toast.error(error.response?.data?.error || "Failed to delete room");
    console.error("Delete room error:", error);
  }
};
```

---

## User Experience

### Scenario 1: Room with Students

**User Action:** Click delete on Room 101

**Backend Response:**
```json
{
  "success": false,
  "error": "Cannot delete. Students are currently assigned to this room."
}
```

**Frontend Display:**
- 🔴 Red error toast appears
- Message: "Cannot delete. Students are currently assigned to this room."
- Room remains visible in the table
- No changes to database

---

### Scenario 2: Empty Room

**User Action:** Click delete on Room 102 (no students)

**Backend Response:**
```json
{
  "success": true,
  "message": "Room marked as inactive successfully"
}
```

**Frontend Display:**
- 🟢 Green success toast appears
- Message: "Room deleted successfully"
- Room list refreshes
- Room 102 disappears from the list (permanently removed)

**Database:**
```sql
-- Room 102 permanently deleted from database
DELETE FROM rooms WHERE room_id = 102;
```

---

## Important Notes

### Database Field: `is_current` vs `is_active`

The schema uses **`is_current`** for `room_allocations` table:

```sql
CREATE TABLE room_allocations (
    allocation_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    room_id INT NOT NULL,
    bed_number VARCHAR(10),
    allocation_date DATE NOT NULL,
    vacate_date DATE NULL,
    is_current BOOLEAN DEFAULT TRUE,  -- ← This field
    remarks TEXT,
    ...
);
```

**Updated code to use `is_current`** (line 327 in roomController.ts):
```typescript
.where({ room_id: roomId, is_current: 1 })
```

**Note:** Some other controllers still use `is_active`. This should be standardized across the codebase.

---

## Benefits of Hard Delete

1. **Data Cleanup** - Permanently removes unwanted room records
2. **Database Efficiency** - Keeps database lean and performant
3. **Clear Intent** - Room is truly gone, not just hidden
4. **Student Protection** - Cannot delete rooms with active students
5. **No Orphaned Data** - Clean removal when students don't exist

---

## Testing

### Test Case 1: Delete Room with Students

**Setup:**
```sql
-- Ensure room 123 has a student
INSERT INTO room_allocations (student_id, room_id, bed_number, allocation_date, is_current)
VALUES (5, 123, 'A1', '2025-01-01', 1);
```

**API Request:**
```bash
DELETE /api/rooms/123
Authorization: Bearer <token>
```

**Expected Result:**
```json
{
  "success": false,
  "error": "Cannot delete. Students are currently assigned to this room."
}
```

**Verification:**
```sql
SELECT * FROM rooms WHERE room_id = 123;
-- Should still return the room (unchanged)
```

---

### Test Case 2: Delete Empty Room

**Setup:**
```sql
-- Ensure room 124 has no current students
DELETE FROM room_allocations WHERE room_id = 124 AND is_current = 1;
```

**API Request:**
```bash
DELETE /api/rooms/124
Authorization: Bearer <token>
```

**Expected Result:**
```json
{
  "success": true,
  "message": "Room marked as inactive successfully"
}
```

**Verification:**
```sql
SELECT * FROM rooms WHERE room_id = 124;
-- Should return 0 rows (permanently deleted)
```

---

### Test Case 3: Cross-Hostel Delete (Security)

**Setup:**
- User logged in with hostel_id = 5
- Room 456 belongs to hostel_id = 1

**API Request:**
```bash
DELETE /api/rooms/456
Authorization: Bearer <token_hostel5>
```

**Expected Result:**
```json
{
  "success": false,
  "error": "You can only delete rooms from your own hostel"
}
```

---

## Important Warning

⚠️ **Hard Delete is Permanent** - Once deleted, the room data **cannot be recovered**. Make sure:
1. The room has no students (the system checks this automatically)
2. You don't need the room for historical reports
3. You've confirmed deletion with the user

If you need to keep room history, consider implementing soft delete instead (see commented code in controller).

---

## Summary

✅ **Implemented:**
- Student allocation check before deletion
- Hard delete (permanently removes row from database)
- Custom error message for rooms with students
- Custom success message for deletion
- Ownership verification for security
- Frontend toast notifications
- Automatic list refresh

✅ **User Messages:**
- Error: "Cannot delete. Students are currently assigned to this room."
- Success: "Room deleted successfully"

✅ **Database:**
- Room rows **permanently deleted** from database
- Uses `DELETE FROM rooms WHERE room_id = ?`
- Uses `is_current` field for student allocation check

✅ **Frontend:**
- Shows backend success/error messages
- Auto-refreshes room list after deletion
- Deleted room disappears immediately

---

**Last Updated:** 2025-11-08
**Files Modified:**
- `backend/src/controllers/roomController.ts` (lines 290-355) - Changed to hard delete
- `frontend/src/pages/RoomsPage.tsx` (lines 235-246) - Shows backend messages
