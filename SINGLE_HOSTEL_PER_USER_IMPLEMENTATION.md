# Single Hostel Per User - Complete Implementation Guide

## Overview
This guide transforms your hostel management system from **multi-hostel owner model** to **single hostel per login model**, where each user account is linked to exactly ONE hostel and can only see/manage that hostel's data.

---

## ✅ COMPLETED STEPS

### 1. Database Schema Update
**Status:** ✅ DONE

- Added `hostel_id` column to `users` table
- Added foreign key constraint linking to `hostel_master`
- Updated existing users with their hostel assignments:
  - user_id=2 (owner_mahendra) → hostel_id=5 (Risheek Boys Hostel)
  - user_id=3 (owner_rajesh) → hostel_id=1 (Sunrise Boys Hostel)
  - user_id=4 (rajareddy) → hostel_id=3 (TechPark Co-Ed Hostel)

### 2. Backend Authentication Update
**Status:** ✅ DONE

- Updated `TokenPayload` interface in `jwt.ts` to include `hostel_id`
- Modified `authController.ts` to include `hostel_id` in JWT token and user response
- Users now receive their `hostel_id` upon login

### 3. Room Controller Update
**Status:** ✅ DONE

- Modified `getRooms()` to filter by `user.hostel_id` from JWT token
- Removed database query for owner's hostels
- Added validation to check if user has hostel_id

---

## 🔧 REMAINING BACKEND UPDATES

### Controllers to Update

Apply the following pattern to ALL controllers that fetch hostel-specific data:

```typescript
// PATTERN: Filter by hostel_id from JWT token for owners

if (user?.role_id === 2) {
  // Hostel Owner
  if (!user.hostel_id) {
    return res.status(403).json({
      success: false,
      error: 'Your account is not linked to any hostel. Please contact administrator.'
    });
  }
  query = query.where('table_name.hostel_id', user.hostel_id);
}
```

### Files Requiring Updates:

#### 1. **studentController.ts**
**Function:** `getStudents()`
```typescript
// Current: Filters by owner_id
// Change to: Filter by user.hostel_id

if (user?.role_id === 2) {
  if (!user.hostel_id) {
    return res.status(403).json({
      success: false,
      error: 'Your account is not linked to any hostel'
    });
  }
  query = query.where('s.hostel_id', user.hostel_id);
}
```

#### 2. **feeController.ts**
**Functions:** `getFees()`, `createFee()`, `updateFee()`
```typescript
// For getFees():
if (user?.role_id === 2) {
  if (!user.hostel_id) {
    return res.status(403).json({
      success: false,
      error: 'Your account is not linked to any hostel'
    });
  }
  query = query.where('f.hostel_id', user.hostel_id);
}

// For createFee() - validate hostel_id matches user's hostel
if (user?.role_id === 2 && hostel_id !== user.hostel_id) {
  return res.status(403).json({
    success: false,
    error: 'You can only create fees for your own hostel'
  });
}
```

#### 3. **expenseController.ts**
**Functions:** `getExpenses()`, `createExpense()`, `updateExpense()`
```typescript
// Similar pattern as feeController
if (user?.role_id === 2) {
  if (!user.hostel_id) {
    return res.status(403).json({
      success: false,
      error: 'Your account is not linked to any hostel'
    });
  }
  query = query.where('e.hostel_id', user.hostel_id);
}
```

#### 4. **hostelController.ts**
**Function:** `getHostels()`
```typescript
// Owner should only see their own hostel
if (user?.role_id === 2) {
  if (!user.hostel_id) {
    return res.status(403).json({
      success: false,
      error: 'Your account is not linked to any hostel'
    });
  }
  query = query.where('hostel_master.hostel_id', user.hostel_id);
}
```

**Function:** `updateHostel()`
```typescript
// Prevent owner from updating other hostels
if (user?.role_id === 2 && hostelId !== user.hostel_id?.toString()) {
  return res.status(403).json({
    success: false,
    error: 'You can only update your own hostel'
  });
}
```

#### 5. **reportsController.ts** / **reportController.ts**
**All Functions:** Filter by `user.hostel_id`
```typescript
if (user?.role_id === 2) {
  if (!user.hostel_id) {
    return res.status(403).json({
      success: false,
      error: 'Your account is not linked to any hostel'
    });
  }
  // Add hostel_id filter to all queries
  query = query.where('hostel_id', user.hostel_id);
}
```

---

## 🎨 FRONTEND UPDATES

### 1. Update User Interface (TypeScript)

**File:** `frontend/src/services/auth.ts`

```typescript
export interface User {
  user_id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
  phone?: string;
  hostel_id?: number; // ADD THIS
}
```

### 2. Remove Hostel Filter from RoomsPage

**File:** `frontend/src/pages/RoomsPage.tsx`

**Remove:**
- `selectedHostelId` state
- `hostels` state and `fetchHostels()`
- Hostel dropdown filter
- "Hostel Name" column from table (since there's only one hostel per user)
- `hostel_id` dropdown from Add/Edit form (auto-set from user)

**Add:**
```typescript
import { useAuthStore } from '../store/authStore';

// Inside component:
const user = useAuthStore((state) => state.user);

// In handleSubmit:
const payload = {
  hostel_id: user?.hostel_id || 0, // Use user's hostel_id
  room_number: formData.room_number,
  // ... rest of fields
};
```

### 3. Update Other Pages

Apply similar logic to:
- **StudentsPage.tsx** - Remove hostel filter, use `user.hostel_id`
- **FeesPage.tsx** - Remove hostel filter
- **ExpensesPage.tsx** - Remove hostel filter
- **HostelsPage.tsx** - Owner should only see their hostel details (view/edit only, no list)

### 4. Simplify Navigation

Since owners now manage only ONE hostel, you can:
- Remove "Hostels" menu item for owners
- Show hostel name in header/navbar
- Simplify dashboard to show single hostel stats

---

## 🧪 TESTING

### Test Accounts

1. **Admin Account (user_id=1)**
   - Email: admin@hostelapp.com
   - Should see ALL hostels and can manage everything

2. **Owner Account 1 (user_id=2)**
   - Email: mahireddy7569@gmail.com
   - hostel_id: 5 (Risheek Boys Hostel)
   - Should ONLY see data from Risheek Boys Hostel

3. **Owner Account 2 (user_id=3)**
   - Email: rajesh@gmail.com
   - hostel_id: 1 (Sunrise Boys Hostel)
   - Should ONLY see data from Sunrise Boys Hostel

### Test Scenarios

**For Owner Accounts:**

✅ **Should Work:**
- Login and see hostel_id in user object
- View rooms ONLY from their hostel
- View students ONLY from their hostel
- Create/edit/delete rooms in their hostel
- View fees and expenses for their hostel

❌ **Should NOT Work:**
- See data from other hostels
- Create rooms in other hostels
- Access other hostel's students/fees/expenses

---

## 📋 IMPLEMENTATION CHECKLIST

### Backend
- [x] Add `hostel_id` column to `users` table
- [x] Update JWT token to include `hostel_id`
- [x] Update authController to return `hostel_id`
- [x] Update roomController.ts - `getRooms()`
- [ ] Update studentController.ts - All functions
- [ ] Update feeController.ts - All functions
- [ ] Update expenseController.ts - All functions
- [ ] Update hostelController.ts - `getHostels()`, `updateHostel()`
- [ ] Update reportsController.ts - All functions
- [ ] Rebuild TypeScript: `npm run build`

### Frontend
- [ ] Update User interface in `auth.ts`
- [ ] Update RoomsPage.tsx - Remove hostel filter
- [ ] Update StudentsPage.tsx - Remove hostel filter
- [ ] Update FeesPage.tsx - Remove hostel filter
- [ ] Update ExpensesPage.tsx - Remove hostel filter
- [ ] Update HostelsPage.tsx - Show single hostel for owners
- [ ] Update navigation/dashboard for owners
- [ ] Test with multiple owner accounts

---

## 🔐 SECURITY NOTES

1. **Always validate hostel_id from JWT** - Never trust client-side data
2. **Check role_id before filtering** - Admin (role_id=1) can see all, Owner (role_id=2) sees only their hostel
3. **Prevent cross-hostel access** - All CREATE/UPDATE/DELETE operations must validate hostel_id
4. **Handle null hostel_id** - Show error if owner account has no linked hostel

---

## 🚀 DEPLOYMENT

### Step 1: Backup Database
```bash
mysqldump -u your_user -p hostel_management > backup_before_migration.sql
```

### Step 2: Run Migration
Migration is already complete in development. For production:
```sql
ALTER TABLE users ADD COLUMN hostel_id INT NULL AFTER role_id;
ALTER TABLE users ADD CONSTRAINT fk_users_hostel
  FOREIGN KEY (hostel_id) REFERENCES hostel_master(hostel_id) ON DELETE SET NULL;

-- Assign hostel_id to existing users
UPDATE users SET hostel_id = 5 WHERE user_id = 2;
-- Repeat for other users
```

### Step 3: Deploy Backend
```bash
cd backend
npm run build
pm2 restart hostel-backend
```

### Step 4: Deploy Frontend
```bash
cd frontend
npm run build
# Deploy dist folder to your hosting
```

### Step 5: Test
- Login with each owner account
- Verify data filtering works correctly
- Check that cross-hostel access is blocked

---

## 🆘 ROLLBACK PLAN

If issues occur:

```sql
-- Remove hostel_id column
ALTER TABLE users DROP FOREIGN KEY fk_users_hostel;
ALTER TABLE users DROP COLUMN hostel_id;
```

Then redeploy previous backend/frontend code.

---

## ✅ BENEFITS OF THIS CHANGE

1. **Better Data Isolation** - Each hostel owner can ONLY see their own data
2. **Simpler Frontend** - No hostel filtering dropdowns needed
3. **Improved Security** - hostel_id in JWT token prevents unauthorized access
4. **Faster Queries** - Direct hostel_id filtering instead of JOIN with hostel_master
5. **Clearer Permissions** - One user = One hostel (easy to understand)

