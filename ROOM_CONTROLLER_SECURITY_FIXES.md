# Room Controller Security Fixes

## Security Vulnerabilities Found and Fixed

### Issue: Cross-Hostel Access Vulnerability
**Risk Level:** CRITICAL

All three room modification endpoints (CREATE, UPDATE, DELETE) had security vulnerabilities that allowed hostel owners to manipulate rooms from OTHER hostels.

---

## 1. CREATE Room - FIXED ✅

**File:** `backend/src/controllers/roomController.ts` (lines 125-213)

### Vulnerability:
- Function accepted `hostel_id` from request body
- Owner could create rooms in ANY hostel by passing different hostel_id

### Fix Applied:
```typescript
// Determine the hostel_id to use
let finalHostelId: number;

if (user?.role_id === 2) {
  // Owner can only create rooms in their own hostel
  if (!user.hostel_id) {
    return res.status(403).json({
      success: false,
      error: 'Your account is not linked to any hostel. Please contact administrator.'
    });
  }
  finalHostelId = user.hostel_id; // Force use of user's hostel_id
} else if (user?.role_id === 1) {
  // Admin can specify hostel_id
  if (!hostel_id) {
    return res.status(400).json({
      success: false,
      error: 'Admin must specify hostel_id'
    });
  }
  finalHostelId = hostel_id;
} else {
  return res.status(403).json({
    success: false,
    error: 'Unauthorized to create rooms'
  });
}

// Use finalHostelId instead of request body hostel_id
const [room_id] = await db('rooms').insert({
  hostel_id: finalHostelId, // ← Now secure
  room_number,
  // ... rest of fields
});
```

**What Changed:**
- Owners (role_id=2) MUST use their own hostel_id (from JWT token)
- Admins (role_id=1) can specify hostel_id in request
- hostel_id from request body is IGNORED for owners

---

## 2. UPDATE Room - FIXED ✅

**File:** `backend/src/controllers/roomController.ts` (lines 215-259)

### Vulnerability:
- No hostel_id validation before update
- Owner could update ANY room from ANY hostel

### Fix Applied:
```typescript
// First, get the room to check ownership
const room = await db('rooms')
  .where({ room_id: roomId })
  .first();

if (!room) {
  return res.status(404).json({
    success: false,
    error: 'Room not found'
  });
}

// If user is hostel owner, verify they own this room's hostel
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
      error: 'You can only update rooms from your own hostel'
    });
  }
}

// Now proceed with update (only if ownership verified)
await db('rooms')
  .where({ room_id: roomId })
  .update(updateData);
```

**What Changed:**
- Fetch room first to get its hostel_id
- Verify room exists (404 if not)
- Verify owner's hostel_id matches room's hostel_id
- Return 403 if ownership check fails
- Only proceed with update if authorized

---

## 3. DELETE Room - FIXED ✅

**File:** `backend/src/controllers/roomController.ts` (lines 261-325)

### Vulnerability:
- No hostel_id validation before deletion
- Owner could delete ANY room from ANY hostel

### Fix Applied:
```typescript
// First, get the room to check ownership
const room = await db('rooms')
  .where({ room_id: roomId })
  .first();

if (!room) {
  return res.status(404).json({
    success: false,
    error: 'Room not found'
  });
}

// If user is hostel owner, verify they own this room's hostel
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

// Check if room has active students
const allocations = await db('room_allocations')
  .where({ room_id: roomId, is_active: 1 })
  .count('* as count')
  .first();

const count = allocations?.count ? Number(allocations.count) : 0;
if (count > 0) {
  return res.status(400).json({
    success: false,
    error: 'Cannot delete room with active student allocations'
  });
}

// Soft delete
await db('rooms')
  .where({ room_id: roomId })
  .update({ is_available: 0, updated_at: new Date() });
```

**What Changed:**
- Fetch room first to get its hostel_id
- Verify room exists (404 if not)
- Verify owner's hostel_id matches room's hostel_id
- Return 403 if ownership check fails
- Check for active students
- Only proceed with deletion if all checks pass

---

## Testing the Fixes

### Test Scenario 1: Owner Creates Room in Own Hostel ✅
```bash
POST /api/rooms
Authorization: Bearer <token_user2_hostel5>
{
  "room_number": "101",
  "room_type_id": 1,
  "capacity": 4,
  "rent_per_bed": 5000
}

Expected: SUCCESS (room created with hostel_id=5)
```

### Test Scenario 2: Owner Tries to Create Room in Different Hostel ❌
```bash
POST /api/rooms
Authorization: Bearer <token_user2_hostel5>
{
  "hostel_id": 1,  // Trying to create in hostel_id=1
  "room_number": "102",
  "room_type_id": 1,
  "capacity": 4,
  "rent_per_bed": 5000
}

Expected: SUCCESS but room created with hostel_id=5 (not 1)
Reason: hostel_id from body is IGNORED for owners
```

### Test Scenario 3: Owner Updates Room from Own Hostel ✅
```bash
PUT /api/rooms/123
Authorization: Bearer <token_user2_hostel5>
{
  "capacity": 6
}

Expected: SUCCESS (if room 123 belongs to hostel_id=5)
```

### Test Scenario 4: Owner Tries to Update Room from Different Hostel ❌
```bash
PUT /api/rooms/456
Authorization: Bearer <token_user2_hostel5>
{
  "capacity": 6
}

Expected: 403 Forbidden
Error: "You can only update rooms from your own hostel"
Reason: Room 456 belongs to hostel_id=1 (not user's hostel_id=5)
```

### Test Scenario 5: Owner Deletes Room from Own Hostel ✅
```bash
DELETE /api/rooms/123
Authorization: Bearer <token_user2_hostel5>

Expected: SUCCESS (if room 123 belongs to hostel_id=5 and has no active students)
```

### Test Scenario 6: Owner Tries to Delete Room from Different Hostel ❌
```bash
DELETE /api/rooms/456
Authorization: Bearer <token_user2_hostel5>

Expected: 403 Forbidden
Error: "You can only delete rooms from your own hostel"
Reason: Room 456 belongs to hostel_id=1 (not user's hostel_id=5)
```

---

## Admin Privileges

**Note:** Admin users (role_id=1) are NOT affected by these restrictions:
- Admin can create rooms in ANY hostel (by specifying hostel_id)
- Admin can update rooms from ANY hostel
- Admin can delete rooms from ANY hostel

---

## Summary

**Before Fixes:**
- Owner could create rooms in any hostel
- Owner could update any room from any hostel
- Owner could delete any room from any hostel

**After Fixes:**
- Owner can ONLY create rooms in their own hostel (hostel_id from JWT)
- Owner can ONLY update rooms from their own hostel (verified before update)
- Owner can ONLY delete rooms from their own hostel (verified before deletion)
- Admin maintains full access to all hostels

**Security Improvement:** Complete data isolation between hostels for owner accounts.

---

## Status: ALL SECURITY FIXES COMPLETED ✅

**Date:** 2025-11-08
**Files Modified:** `backend/src/controllers/roomController.ts`
**Lines Changed:** 125-325 (CREATE, UPDATE, DELETE functions)
