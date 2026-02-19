# Student Registration System - Complete Implementation Guide

## 📋 **Overview**

Complete student registration system with:
- All required student fields
- Guardian information
- ID proof tracking
- Automatic room allocation with occupied beds management
- Monthly fee due date tracking
- Hostel-based filtering (single hostel per user model)

---

## ✅ **What's Been Implemented**

### **1. Database Changes**

#### **New Columns Added to `students` Table:**
```sql
admission_fee          DECIMAL(10,2)  DEFAULT 0.00
admission_status       ENUM('Paid', 'Unpaid')  DEFAULT 'Unpaid'
due_date              DATE NULL
status                ENUM('Active', 'Inactive')  DEFAULT 'Active'
id_proof_status       ENUM('Submitted', 'Not Submitted')  DEFAULT 'Not Submitted'
present_working_address TEXT  (renamed from persent_working_address)
```

#### **room_allocations Table Changes:**
- **REMOVED:** `bed_number` column (no longer needed)
- **USES:** `floor_number` from rooms table instead
- **FIELD:** `is_current` (1 = active allocation, 0 = past allocation)
- **FIELD:** `allocation_date` (replaces check_in_date)
- **FIELD:** `vacate_date` (replaces check_out_date)

---

### **2. Backend API Changes**

**File:** `backend/src/controllers/studentController.ts`

#### **A. GET /api/students**
- ✅ Auto-filters by user's hostel_id from JWT token
- ✅ Returns floor_number from rooms table
- ✅ Returns current room allocation (is_current = 1)
- ✅ Calculates pending dues

**Response includes:**
```json
{
  "student_id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "phone": "1234567890",
  "admission_fee": 5000.00,
  "admission_status": "Paid",
  "due_date": "2025-12-01",
  "status": "Active",
  "id_proof_status": "Submitted",
  "room_id": 101,
  "room_number": "101",
  "floor_number": 2,
  "monthly_rent": 3000.00,
  // ... all other fields
}
```

---

#### **B. POST /api/students (Create)**

**Auto-handles:**
- ✅ Hostel ID from JWT token (owners can't specify)
- ✅ Room allocation if room_id provided
- ✅ Auto-increment occupied_beds in rooms table
- ✅ Fetches floor_number from room
- ✅ Sets monthly_rent from room's rent_per_bed

**Request Body:**
```json
{
  "first_name": "John",         // REQUIRED
  "last_name": "Doe",
  "date_of_birth": "2000-01-01",
  "gender": "Male",             // REQUIRED
  "phone": "1234567890",        // REQUIRED
  "email": "john@example.com",
  "guardian_name": "Jane Doe",  // REQUIRED
  "guardian_phone": "9876543210", // REQUIRED
  "guardian_relation": "Mother",
  "permanent_address": "123 Main St",
  "present_working_address": "456 Work St",
  "id_proof_type": "Aadhar",
  "id_proof_number": "1234-5678-9012",
  "id_proof_document_url": "/uploads/aadhar.pdf",
  "id_proof_status": "Submitted",  // "Submitted" or "Not Submitted"
  "admission_date": "2025-11-01",  // REQUIRED
  "admission_fee": 5000.00,        // REQUIRED
  "admission_status": "Paid",      // REQUIRED: "Paid" or "Unpaid"
  "due_date": "2025-12-01",        // Monthly fee due date
  "status": "Active",              // "Active" or "Inactive"
  "room_id": 101                   // OPTIONAL - for room allocation
}
```

**Logic Flow:**
1. Extract hostel_id from JWT token (owners) or request body (admin)
2. Validate required fields
3. Check if phone already exists
4. If room_id provided:
   - Fetch room details
   - Verify room belongs to same hostel
   - Check if room has capacity
   - Get floor_number and rent_per_bed from room
5. Insert student record
6. If room selected:
   - Create room allocation (is_current = 1)
   - Increment rooms.occupied_beds by 1

---

#### **C. PUT /api/students/:id (Update)**

**Handles:**
- ✅ Update all student fields
- ✅ Change room allocation
- ✅ Remove room allocation
- ✅ Auto-manage occupied_beds

**Request Body:**
```json
{
  "first_name": "Updated Name",
  "admission_status": "Paid",
  "due_date": "2025-12-15",
  "room_id": 102  // Change room, or null to remove allocation
}
```

**Room Allocation Logic:**
```
If room_id = null:
  - Deactivate current allocation (is_current = 0)
  - Set vacate_date = NOW()
  - Decrement old room occupied_beds

If room_id = new room:
  - Deactivate old allocation
  - Decrement old room occupied_beds
  - Create new allocation
  - Increment new room occupied_beds

If room_id = same room:
  - No change needed
```

---

#### **D. DELETE /api/students/:id (Soft Delete)**

**Logic:**
1. Check for unpaid dues (blocks deletion if dues exist)
2. Set student.is_active = 0
3. Deactivate room allocation (is_current = 0)
4. Decrement room.occupied_beds

---

### **3. Automatic Hostel Filtering**

**How it works:**
```
User logs in → JWT contains hostel_id
↓
Frontend calls GET /api/students
↓
Backend extracts req.user.hostel_id from JWT
↓
Query filters: WHERE hostel_id = req.user.hostel_id
↓
Returns ONLY that hostel's students
```

**No need to:**
- ❌ Send hostel_id from frontend
- ❌ Manually filter data
- ❌ Use owner_id (hostel_id is enough)

---

## 🎯 **Frontend Implementation**

### **Required Changes to Student Form**

#### **1. New Form Fields to Add:**

```jsx
// Admission Section
<input type="number" name="admission_fee" required />
<select name="admission_status" required>
  <option value="Paid">Paid</option>
  <option value="Unpaid">Unpaid</option>
</select>
<input type="date" name="due_date" required />

// Student Status
<select name="status" required>
  <option value="Active">Active</option>
  <option value="Inactive">Inactive</option>
</select>

// ID Proof Status
<div>
  <label>
    <input type="radio" name="id_proof_status" value="Submitted" />
    Submitted
  </label>
  <label>
    <input type="radio" name="id_proof_status" value="Not Submitted" />
    Not Submitted
  </label>
</div>

// Room Allocation (OPTIONAL)
<select name="room_id">
  <option value="">No Room</option>
  {rooms.map(room => (
    <option key={room.room_id} value={room.room_id}>
      Room {room.room_number} - Floor {room.floor_number}
      ({room.capacity - room.occupied_beds} beds available)
    </option>
  ))}
</select>

// Auto-filled fields (read-only)
<input type="number" value={selectedRoom?.floor_number || ""} disabled />
<input type="number" value={selectedRoom?.rent_per_bed || ""} disabled />
```

---

#### **2. Fetch Rooms on Component Mount:**

```jsx
useEffect(() => {
  const fetchRooms = async () => {
    try {
      const response = await api.get('/rooms');
      setRooms(response.data.data);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    }
  };

  fetchRooms();
}, []);
```

**Note:** Rooms API automatically filters by user's hostel_id!

---

#### **3. Auto-fill Floor and Rent:**

```jsx
const handleRoomChange = (e) => {
  const roomId = e.target.value;
  const room = rooms.find(r => r.room_id === parseInt(roomId));

  if (room) {
    setFormData(prev => ({
      ...prev,
      room_id: roomId,
      floor_number: room.floor_number,  // Auto-filled
      monthly_rent: room.rent_per_bed   // Auto-filled
    }));

    // Show warning if room is full
    if (room.occupied_beds >= room.capacity) {
      toast.warning('This room is full!');
    }
  }
};
```

---

#### **4. Form Submission:**

```jsx
const handleSubmit = async (e) => {
  e.preventDefault();

  const payload = {
    first_name: formData.first_name,
    last_name: formData.last_name,
    date_of_birth: formData.date_of_birth,
    gender: formData.gender,
    phone: formData.phone,
    email: formData.email,
    guardian_name: formData.guardian_name,
    guardian_phone: formData.guardian_phone,
    guardian_relation: formData.guardian_relation,
    permanent_address: formData.permanent_address,
    present_working_address: formData.present_working_address,
    id_proof_type: formData.id_proof_type,
    id_proof_number: formData.id_proof_number,
    id_proof_document_url: formData.id_proof_document_url,
    id_proof_status: formData.id_proof_status,
    admission_date: formData.admission_date,
    admission_fee: parseFloat(formData.admission_fee),
    admission_status: formData.admission_status,
    due_date: formData.due_date,
    status: formData.status,
    room_id: formData.room_id || null  // Optional
  };

  try {
    if (editingStudent) {
      await api.put(`/students/${editingStudent.student_id}`, payload);
      toast.success('Student updated successfully');
    } else {
      await api.post('/students', payload);
      toast.success('Student registered successfully');
    }

    fetchStudents();  // Refresh list
    handleCloseModal();
  } catch (error) {
    toast.error(error.response?.data?.error || 'Failed to save student');
  }
};
```

---

## 🧪 **Testing Guide**

### **Test Case 1: Create Student Without Room**
```bash
POST /api/students
{
  "first_name": "Test",
  "gender": "Male",
  "phone": "1111111111",
  "guardian_name": "Guardian",
  "guardian_phone": "2222222222",
  "admission_date": "2025-11-01",
  "admission_fee": 5000,
  "admission_status": "Paid"
}

Expected: ✅ Student created, no room allocation
```

---

### **Test Case 2: Create Student With Room**
```bash
POST /api/students
{
  ...same as above...,
  "room_id": 101
}

Expected:
✅ Student created
✅ Room allocation created (is_current = 1)
✅ rooms.occupied_beds incremented by 1
```

---

### **Test Case 3: Update Student - Change Room**
```bash
PUT /api/students/1
{
  "room_id": 102
}

Expected:
✅ Old allocation deactivated (is_current = 0)
✅ Old room occupied_beds decremented
✅ New allocation created
✅ New room occupied_beds incremented
```

---

### **Test Case 4: Room Full Error**
```bash
# If room capacity = 4, occupied_beds = 4
POST /api/students
{
  ...,
  "room_id": 101  // Full room
}

Expected: ❌ 400 Error "Room is full. Please select another room."
```

---

### **Test Case 5: Cross-Hostel Room**
```bash
# User hostel_id = 5, room hostel_id = 1
POST /api/students
{
  ...,
  "room_id": 999  // Different hostel
}

Expected: ❌ 400 Error "Room does not belong to the selected hostel"
```

---

## 📊 **Database Verification**

After creating student with room:

```sql
-- Check student record
SELECT * FROM students WHERE student_id = 1;

-- Check room allocation
SELECT * FROM room_allocations
WHERE student_id = 1 AND is_current = 1;

-- Check occupied beds updated
SELECT room_id, room_number, capacity, occupied_beds
FROM rooms WHERE room_id = 101;
```

---

## 🔐 **Security Features**

✅ **Hostel isolation** - Owners can only create students in their hostel
✅ **JWT-based filtering** - hostel_id from token, not request
✅ **Room validation** - Can't assign room from different hostel
✅ **Capacity checking** - Prevents overbooking
✅ **Phone uniqueness** - Prevents duplicate students
✅ **Admin privileges** - Admin can create in any hostel

---

## 📝 **Summary**

### **Database Changes:**
- ✅ Added 5 new columns to students table
- ✅ Fixed typo in present_working_address
- ✅ Removed bed_number from room_allocations

### **Backend:**
- ✅ Auto hostel_id filtering from JWT
- ✅ Room allocation during student creation
- ✅ Auto occupied_beds management
- ✅ Support for room changes
- ✅ Floor number from rooms table

### **Frontend (To Be Done):**
- Add 5 new form fields
- Add room dropdown (auto-filtered by hostel)
- Auto-fill floor and rent on room selection
- Update form submission payload

---

**Implementation Complete!** ✅
**Next Step:** Run the SQL migration and update frontend form.
