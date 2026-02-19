# Dynamic Amenities Feature Setup Guide

## Overview
The amenities feature has been updated to fetch amenities dynamically from the database instead of using hardcoded values. This allows admins to manage amenities centrally and makes them available across the application.

## Database Setup

### Step 1: Create Amenities Master Table

Run the SQL script to create the amenities master table and populate it with default amenities:

```bash
mysql -u root -p hostel_management < create_amenities_master_table.sql
```

Or manually execute the SQL file: `D:\Hostel\create_amenities_master_table.sql`

This will:
- Create the `amenities_master` table
- Insert 12 default amenities (WiFi, Laundry, Meals, AC, Hot Water, Gym, Parking, Security, Study Room, TV Room, Power Backup, Water Purifier)
- Set up proper indexing and constraints

### Step 2: Verify Table Creation

Run this query to verify the amenities were created successfully:

```sql
SELECT * FROM amenities_master ORDER BY display_order;
```

You should see 12 amenities with their IDs, names, and display orders.

## Backend Implementation

### Files Created/Modified:

1. **`backend/src/controllers/amenitiesController.ts`** (NEW)
   - `getAmenities()` - Fetch all active amenities
   - `createAmenity()` - Create new amenity (Admin only)
   - `updateAmenity()` - Update existing amenity (Admin only)
   - `deleteAmenity()` - Soft delete amenity (Admin only)

2. **`backend/src/routes/amenities.routes.ts`** (NEW)
   - GET `/api/amenities` - Get all active amenities (Protected)
   - POST `/api/amenities` - Create amenity (Admin only)
   - PUT `/api/amenities/:amenityId` - Update amenity (Admin only)
   - DELETE `/api/amenities/:amenityId` - Delete amenity (Admin only)

3. **`backend/src/server.ts`** (MODIFIED)
   - Added amenities routes: `app.use('/api/amenities', amenitiesRoutes)`

### Step 3: Restart Backend Server

After setting up the database, restart your backend server:

```bash
cd backend
npm run dev
```

## Frontend Implementation

### Files Modified:

1. **`frontend/src/components/modals/AddHostelModal.tsx`**
   - Added `Amenity` interface
   - Changed `amenitiesList` from hardcoded array to state: `useState<Amenity[]>([])`
   - Added `fetchAmenities()` function to fetch from API
   - Updated amenities rendering to use `amenity.amenity_id` and `amenity.amenity_name`

2. **`frontend/src/components/modals/EditHostelModal.tsx`**
   - Added `Amenity` interface
   - Changed `amenitiesList` from hardcoded array to state: `useState<Amenity[]>([])`
   - Added `fetchAmenities()` function to fetch from API
   - Updated amenities rendering to use `amenity.amenity_id` and `amenity.amenity_name`

### Step 4: Test Frontend

1. Start the frontend development server:
```bash
cd frontend
npm run dev
```

2. Login as Admin or Owner
3. Try to Add/Edit a hostel
4. You should see the amenities fetched dynamically from the database

## API Endpoints

### Get All Active Amenities
```
GET /api/amenities
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "amenity_id": 1,
      "amenity_name": "WiFi",
      "amenity_icon": "wifi",
      "description": "High-speed wireless internet connectivity",
      "display_order": 1
    },
    ...
  ]
}
```

### Create New Amenity (Admin Only)
```
POST /api/amenities
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "amenity_name": "Swimming Pool",
  "amenity_icon": "pool",
  "description": "Indoor swimming pool facility"
}

Response:
{
  "success": true,
  "message": "Amenity created successfully",
  "data": {
    "amenity_id": 13,
    "amenity_name": "Swimming Pool",
    "amenity_icon": "pool",
    "description": "Indoor swimming pool facility",
    "display_order": 13
  }
}
```

### Update Amenity (Admin Only)
```
PUT /api/amenities/:amenityId
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "amenity_name": "High-Speed WiFi",
  "is_active": true
}

Response:
{
  "success": true,
  "message": "Amenity updated successfully",
  "data": { ... }
}
```

### Delete Amenity (Admin Only)
```
DELETE /api/amenities/:amenityId
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Amenity deleted successfully"
}
```

## Database Schema

```sql
CREATE TABLE amenities_master (
    amenity_id INT AUTO_INCREMENT PRIMARY KEY,
    amenity_name VARCHAR(100) NOT NULL UNIQUE,
    amenity_icon VARCHAR(50),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Benefits of Dynamic Amenities

1. **Centralized Management**: Amenities can be managed from a single location in the database
2. **No Code Changes**: Adding new amenities doesn't require code changes or deployments
3. **Consistency**: Same amenities are available across all forms (Add Hostel, Edit Hostel)
4. **Future Enhancement**: Easy to add an admin panel to manage amenities via UI
5. **Scalability**: Can easily add/remove amenities as needed

## Future Enhancements

1. **Admin Panel for Amenities Management**
   - Create a dedicated page in admin dashboard
   - CRUD operations for amenities
   - Drag-and-drop reordering (display_order)

2. **Icons Integration**
   - Use the `amenity_icon` field to show icons in the UI
   - Integrate with Lucide React or similar icon library

3. **Amenity Categories**
   - Group amenities (Basic, Premium, Safety, Entertainment)
   - Filter amenities by category

4. **Usage Analytics**
   - Track which amenities are most popular
   - Show amenities usage statistics in reports

## Troubleshooting

### Issue: Amenities not loading in modal
**Solution**:
1. Check browser console for API errors
2. Verify backend server is running
3. Check if amenities table exists: `SHOW TABLES LIKE 'amenities_master';`
4. Check if amenities exist: `SELECT COUNT(*) FROM amenities_master WHERE is_active = 1;`

### Issue: "Failed to fetch amenities" error
**Solution**:
1. Check backend logs for errors
2. Verify database connection is working
3. Check if the amenities route is registered in server.ts
4. Verify authentication token is valid

### Issue: Duplicate amenities showing
**Solution**:
1. Check for duplicate entries: `SELECT amenity_name, COUNT(*) FROM amenities_master GROUP BY amenity_name HAVING COUNT(*) > 1;`
2. Remove duplicates manually or run: `DELETE FROM amenities_master WHERE amenity_id NOT IN (SELECT MIN(amenity_id) FROM amenities_master GROUP BY amenity_name);`

## Testing Checklist

- [ ] Database table created successfully
- [ ] Default amenities inserted (12 amenities)
- [ ] Backend server starts without errors
- [ ] GET /api/amenities returns amenities list
- [ ] Add Hostel modal shows dynamic amenities
- [ ] Edit Hostel modal shows dynamic amenities
- [ ] Selected amenities are saved correctly
- [ ] Amenities display correctly after hostel is created/updated
- [ ] Fallback amenities work when API fails

## Notes

- The frontend has fallback amenities in case the API fails
- Amenities are stored as comma-separated strings in the `hostel_master.amenities` column
- Soft delete is implemented (is_active = 0) to preserve historical data
- The `display_order` field controls the order in which amenities appear in the UI
