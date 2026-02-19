# Floor and Total Rooms Feature - Setup Instructions

## Database Migration Required

The "Failed to load hostel" error is occurring because the database doesn't have the `total_floors` column yet.

### **IMPORTANT: Run This SQL First!**

You need to execute the SQL migration file to add the `total_floors` column to the database:

```bash
# Option 1: Using MySQL command line
mysql -u root -p hostel_management < add_total_floors_column.sql

# Option 2: Using MySQL Workbench or phpMyAdmin
# Open the file: add_total_floors_column.sql
# Execute it against your hostel_management database
```

### SQL Migration File Location:
**File**: `D:\Hostel\add_total_floors_column.sql`

### What This SQL Does:
- Adds `total_floors` column to the `hostel_master` table
- Sets it as nullable (INT DEFAULT NULL)
- Positions it after the `total_rooms` column
- Adds a descriptive comment

---

## Features Implemented

### 1. **Owner Hostels Page** ([OwnerHostelsPage.tsx](d:\Hostel\frontend\src\pages\OwnerHostelsPage.tsx))
   - ✅ Displays **Number of Floors** (from hostel data)
   - ✅ Displays **Total Rooms** (dynamic count from `/rooms` API)
   - ✅ Auto-refreshes room count after adding/deleting rooms
   - ✅ Clean card-based UI with statistics

### 2. **Edit Hostel Modal** ([EditHostelModal.tsx](D:\Hostel\frontend\src\components\modals\EditHostelModal.tsx))
   - ✅ Added editable **Number of Floors** input field
   - ✅ Validates and saves `total_floors` to database
   - ✅ Shows success toast on update

### 3. **Backend API** ([hostelController.ts](d:\Hostel\backend\src\controllers\hostelController.ts))
   - ✅ `GET /api/hostels` - Returns `total_floors` in response
   - ✅ `PUT /api/hostels/:id` - Accepts and updates `total_floors`
   - ✅ Owners can edit only their own hostel's floors

---

## Testing Steps

After running the SQL migration:

1. **Login as Hostel Owner**
2. **Navigate to "Hostels" page** (sidebar menu)
3. **Verify Display**:
   - Number of Floors shows 0 (or existing value)
   - Total Rooms shows actual count from database
4. **Click "Edit Details"** button
5. **Update Number of Floors** (e.g., enter 3)
6. **Click "Update Hostel"**
7. **Verify**:
   - Success toast appears
   - Number updates on the page
   - Total Rooms count remains accurate

---

## API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/hostels` | GET | Fetch hostel details with `total_floors` |
| `/api/hostels/:id` | PUT | Update hostel including `total_floors` |
| `/api/rooms?hostel_id=X` | GET | Fetch rooms count for dynamic display |

---

## File Changes Summary

### Frontend:
1. `d:\Hostel\frontend\src\pages\OwnerHostelsPage.tsx`
   - Added `total_floors` to interface
   - Added `totalRooms` state and `fetchTotalRooms()` function
   - Updated UI to display both floors and rooms

2. `D:\Hostel\frontend\src\components\modals\EditHostelModal.tsx`
   - Added `total_floors` to interface and form
   - Added input field in the form
   - Updated API call to include `total_floors`

### Backend:
3. `d:\Hostel\backend\src\controllers\hostelController.ts`
   - Added `total_floors` to `getAllHostels` SELECT
   - Added `total_floors` to `updateHostel` handler

### Database:
4. `D:\Hostel\add_total_floors_column.sql` ⭐ **RUN THIS FIRST**
   - Migration to add `total_floors` column

---

## Troubleshooting

### Error: "Failed to load hostel"
**Cause**: Database doesn't have `total_floors` column
**Fix**: Run the SQL migration file: `add_total_floors_column.sql`

### Error: "Column 'total_floors' not found"
**Cause**: Same as above
**Fix**: Execute the SQL migration

### Total Rooms shows 0
**Cause**: No rooms created yet in the system
**Fix**: Go to Rooms page and add rooms for your hostel

---

## Next Steps

After running the SQL migration, refresh your browser and the error should be resolved. The Hostels page will display:
- ✅ Number of Floors (editable)
- ✅ Total Rooms (read-only, dynamic count)
- ✅ All other hostel information
