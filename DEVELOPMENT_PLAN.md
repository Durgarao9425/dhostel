# Hostel Accounts Management - Complete Development Plan

## 1. Project Summary

A full-stack web application for managing multiple hostels with two roles: Main Admin and Hostel Owners. The system handles student admissions, room allocations, fee payments, expenses, and financial reporting with a clean, mobile-first UI.

### Tech Stack

**Frontend:**
- React 18 with TypeScript
- Tailwind CSS for styling
- React Router v6 for navigation
- Axios for HTTP requests
- React Query (TanStack Query) for data fetching
- Formik + Yup for forms and validation
- Lucide React for icons
- React Hot Toast for notifications
- Zustand for global state management

**Backend:**
- Node.js 18+ with Express
- TypeScript
- MySQL 8.0 with Knex.js query builder
- JWT for authentication
- bcrypt for password hashing
- Multer for file uploads
- express-rate-limit for API protection
- nodemailer for emails
- Twilio/SMS gateway for OTP

**DevOps:**
- dotenv for environment variables
- ESLint + Prettier for code quality
- Docker for containerization (optional)

---

## 2. Project Structure

```
hostel-management/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/              # Reusable UI components
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Table.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Select.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   └── Spinner.tsx
│   │   │   ├── layout/          # Layout components
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── MainLayout.tsx
│   │   │   │   └── AuthLayout.tsx
│   │   │   └── features/        # Feature-specific components
│   │   │       ├── auth/
│   │   │       ├── dashboard/
│   │   │       ├── hostels/
│   │   │       ├── rooms/
│   │   │       ├── students/
│   │   │       ├── fees/
│   │   │       ├── expenses/
│   │   │       └── reports/
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── ForgotPassword.tsx
│   │   │   ├── ResetPassword.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── OwnerDashboard.tsx
│   │   │   ├── HostelList.tsx
│   │   │   ├── HostelDetail.tsx
│   │   │   ├── RoomManagement.tsx
│   │   │   ├── StudentManagement.tsx
│   │   │   ├── FeeManagement.tsx
│   │   │   ├── ExpenseManagement.tsx
│   │   │   └── Reports.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useApi.ts
│   │   │   └── useToast.ts
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   └── auth.ts
│   │   ├── store/
│   │   │   └── authStore.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── formatters.ts
│   │   │   └── validators.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   └── environment.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   ├── errorHandler.ts
│   │   │   ├── rateLimiter.ts
│   │   │   └── validator.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── hostel.routes.ts
│   │   │   ├── room.routes.ts
│   │   │   ├── student.routes.ts
│   │   │   ├── fee.routes.ts
│   │   │   ├── expense.routes.ts
│   │   │   ├── report.routes.ts
│   │   │   └── notification.routes.ts
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── hostelController.ts
│   │   │   ├── roomController.ts
│   │   │   ├── studentController.ts
│   │   │   ├── feeController.ts
│   │   │   ├── expenseController.ts
│   │   │   └── reportController.ts
│   │   ├── models/
│   │   │   └── (Knex query builders)
│   │   ├── services/
│   │   │   ├── authService.ts
│   │   │   ├── emailService.ts
│   │   │   ├── smsService.ts
│   │   │   └── fileService.ts
│   │   ├── utils/
│   │   │   ├── jwt.ts
│   │   │   ├── bcrypt.ts
│   │   │   └── logger.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── server.ts
│   ├── uploads/
│   ├── package.json
│   ├── tsconfig.json
│   └── knexfile.ts
│
├── database/
│   ├── migrations/
│   └── seeds/
│
├── .env.example
├── .gitignore
└── README.md
```

---

## 3. Component List

### UI Components (Reusable)

1. **Button** - Primary, secondary, outline variants with loading state
2. **Input** - Text input with label, error message, prefix/suffix icons
3. **Card** - Container with optional header, body, footer
4. **Table** - Data table with sorting, pagination, and row actions
5. **Modal** - Dialog overlay with backdrop and close button
6. **Select** - Dropdown with search and multi-select support
7. **Badge** - Status indicator (success, warning, error, info)
8. **Spinner** - Loading indicator (inline or full-page)
9. **Toast** - Notification popup (success, error, info, warning)
10. **Tabs** - Tabbed interface for content sections
11. **FileUpload** - Drag-and-drop file input with preview
12. **DatePicker** - Calendar date selection
13. **Pagination** - Page navigation controls
14. **SearchBar** - Search input with filter icon
15. **Avatar** - User profile image or initials

### Layout Components

1. **Header** - Top navigation with user menu and logout
2. **Sidebar** - Navigation menu with icons and active states
3. **MainLayout** - Wrapper with header + sidebar for authenticated pages
4. **AuthLayout** - Centered layout for login/register pages
5. **PageHeader** - Page title with breadcrumbs and actions

### Feature Components

1. **LoginForm** - Email/mobile + password with forgot password link
2. **ForgotPasswordForm** - Request OTP or reset link
3. **ResetPasswordForm** - Enter OTP and new password
4. **ChangePasswordForm** - Current password + new password
5. **HostelCard** - Display hostel info with actions
6. **RoomCard** - Room details with occupancy indicator
7. **StudentCard** - Student profile with quick actions
8. **FeePaymentForm** - Record payment with receipt upload
9. **ExpenseForm** - Record expense with category and bill
10. **DashboardStats** - Card grid showing key metrics
11. **FinancialChart** - Income vs expense line/bar chart
12. **NotificationBell** - Icon with unread count and dropdown
13. **ConfirmDialog** - Confirmation modal for destructive actions
14. **DataExport** - Export button for PDF/Excel reports

---

## 4. UI Wireframe Descriptions

### Login Page
```
┌──────────────────────────────────┐
│     [LOGO] Hostel Management     │
│                                  │
│  ┌────────────────────────────┐ │
│  │  Email or Mobile Number    │ │
│  └────────────────────────────┘ │
│  ┌────────────────────────────┐ │
│  │  Password          [👁]     │ │
│  └────────────────────────────┘ │
│                                  │
│  [  Login  ]                     │
│                                  │
│  Forgot Password? | Change Pass  │
└──────────────────────────────────┘
```

### Admin Dashboard
```
┌─[SIDEBAR]──┬────────────────────────────────────────────┐
│ Dashboard  │  Dashboard > Overview                       │
│ Hostels    │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │
│ Owners     │  │  12  │ │  156 │ │ 3.2L │ │ 2.8L │       │
│ Reports    │  │Hostels│ │Rooms│ │Income│ │Expense│       │
│ Settings   │  └──────┘ └──────┘ └──────┘ └──────┘       │
│            │                                             │
│            │  Recent Hostels                            │
│            │  ┌─────────────────────────────────────┐  │
│            │  │ Sunrise Boys  | Gachibowli | [View]│  │
│            │  │ GreenView     | Kukatpally | [View]│  │
│            │  └─────────────────────────────────────┘  │
│            │                                             │
│            │  [+ Add New Hostel]                        │
└────────────┴────────────────────────────────────────────┘
```

### Owner Dashboard
```
┌─[SIDEBAR]──┬────────────────────────────────────────────┐
│ Dashboard  │  Sunrise Boys Hostel                        │
│ Rooms      │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │
│ Students   │  │  16  │ │  28  │ │ 1.2L │ │ 85K  │       │
│ Fees       │  │Rooms │ │Students│Income│ │Expense│       │
│ Expenses   │  └──────┘ └──────┘ └──────┘ └──────┘       │
│ Reports    │                                             │
│            │  Financial Trend (Last 6 Months)           │
│            │  [Chart: Income vs Expense Line Graph]     │
│            │                                             │
│            │  Pending Payments: 5 students              │
│            │  Available Rooms: 3                        │
└────────────┴────────────────────────────────────────────┘
```

### Room List
```
┌────────────────────────────────────────────────────────┐
│  Rooms > Sunrise Boys Hostel         [+ Add Room]     │
│  ┌──────────────────────────────────────────────────┐ │
│  │ Search rooms...                 [Filter] [Sort]  │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  Floor 2                                               │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                │
│  │ 201  │ │ 202  │ │ 203  │ │ 204  │                │
│  │ 2/2  │ │ 2/3  │ │ 1/1  │ │ 3/4  │                │
│  │ Full │ │ Open │ │ Full │ │ Open │                │
│  └──────┘ └──────┘ └──────┘ └──────┘                │
│                                                        │
│  Floor 3  [Similar layout]                            │
└────────────────────────────────────────────────────────┘
```

### Student Form
```
┌────────────────────────────────────────────────────────┐
│  Add New Student                         [X Close]     │
│  ┌──────────────────────────────────────────────────┐ │
│  │ First Name*          Last Name                   │ │
│  │ [____________]       [____________]               │ │
│  │                                                   │ │
│  │ Date of Birth*       Gender*                     │ │
│  │ [DD/MM/YYYY]        [Male ▾]                     │ │
│  │                                                   │ │
│  │ Phone*               Email                       │ │
│  │ [+91________]       [____________]               │ │
│  │                                                   │ │
│  │ Guardian Name*       Guardian Phone*             │ │
│  │ [____________]       [+91________]               │ │
│  │                                                   │ │
│  │ Permanent Address*                               │ │
│  │ [________________________]                       │ │
│  │                                                   │ │
│  │ ID Proof Type*       ID Number*                  │ │
│  │ [Aadhar ▾]          [____________]               │ │
│  │                                                   │ │
│  │ Upload ID Proof*                                 │ │
│  │ [Drag & Drop or Click]                           │ │
│  │                                                   │ │
│  │         [Cancel]     [Save Student]              │ │
│  └──────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

### Fee Payment Screen
```
┌────────────────────────────────────────────────────────┐
│  Fee Payments > February 2025                          │
│  ┌──────────────────────────────────────────────────┐ │
│  │ Student Name     Room    Due     Paid    Balance │ │
│  │ Ravi Kumar       201    5000    5000       0  ✓│ │
│  │ Manish Reddy     201    5000    5000       0  ✓│ │
│  │ Suresh Babu      204    4500      0     4500  !│ │
│  │   [Record Payment]                               │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  Record Payment Modal:                                 │
│  - Select Student                                      │
│  - Amount Paid                                         │
│  - Payment Mode (Cash/UPI/Bank)                       │
│  - Payment Date                                        │
│  - Upload Receipt                                      │
│  - Remarks                                             │
└────────────────────────────────────────────────────────┘
```

### Expense Screen
```
┌────────────────────────────────────────────────────────┐
│  Expenses > January 2025           [+ Add Expense]     │
│  ┌──────────────────────────────────────────────────┐ │
│  │ Date       Category      Amount    Vendor    Bill │ │
│  │ 05/01     Electricity    3500     TSSPDCL    [📄]│ │
│  │ 08/01     Water           800     HMWS&SB    [📄]│ │
│  │ 15/01     Groceries     12000     Local      [📄]│ │
│  │ 31/01     Salary        15000     Staff      [📄]│ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  Total Expenses: ₹31,300                               │
│                                                        │
│  Add Expense Form:                                     │
│  - Category (dropdown)                                 │
│  - Amount                                              │
│  - Payment Mode                                        │
│  - Vendor Name                                         │
│  - Bill Number                                         │
│  - Upload Bill                                         │
│  - Description                                         │
└────────────────────────────────────────────────────────┘
```

### Reports Page
```
┌────────────────────────────────────────────────────────┐
│  Reports & Analytics                                   │
│  ┌──────────────────────────────────────────────────┐ │
│  │ [Monthly] [Quarterly] [Yearly] [Custom Range]   │ │
│  │                                                   │ │
│  │ Hostel: [All ▾]    Period: [Jan 2025 ▾]         │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  Income vs Expense                                     │
│  [Bar Chart with Income (Green) and Expense (Red)]    │
│                                                        │
│  Summary:                                              │
│  Total Income:    ₹1,20,000                            │
│  Total Expense:   ₹85,000                              │
│  Net Profit:      ₹35,000                              │
│  Occupancy Rate:  87.5%                                │
│                                                        │
│  [Export PDF] [Export Excel]                           │
└────────────────────────────────────────────────────────┘
```

---

## 5. Complete API Specification

### Authentication APIs

#### POST /api/auth/login
Login with email/mobile and password
```json
Request:
{
  "identifier": "admin@hostelapp.com", // email or mobile
  "password": "password123"
}

Response (200):
{
  "success": true,
  "data": {
    "user": {
      "user_id": 1,
      "username": "admin",
      "email": "admin@hostelapp.com",
      "full_name": "Main Administrator",
      "role": "Main Admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}

Response (401):
{
  "success": false,
  "error": "Invalid credentials"
}

Auth Required: No
```

#### POST /api/auth/register-owner
Register new hostel owner (Admin only)
```json
Request:
{
  "username": "owner_john",
  "email": "john@example.com",
  "phone": "9876543221",
  "full_name": "John Smith",
  "password": "password123"
}

Response (201):
{
  "success": true,
  "data": {
    "user_id": 4,
    "username": "owner_john",
    "message": "Owner registered successfully"
  }
}

Auth Required: Yes (Admin only)
```

#### POST /api/auth/forgot-password
Request password reset OTP or link
```json
Request:
{
  "identifier": "9876543211", // mobile or email
  "method": "otp" // or "email"
}

Response (200):
{
  "success": true,
  "message": "OTP sent to +91-9876543211",
  "resetToken": "temp_token_for_verification"
}

Auth Required: No
Rate Limit: 3 per 15 minutes
```

#### POST /api/auth/verify-otp
Verify OTP and reset password
```json
Request:
{
  "resetToken": "temp_token_from_forgot_password",
  "otp": "123456",
  "newPassword": "newpassword123"
}

Response (200):
{
  "success": true,
  "message": "Password reset successfully"
}

Auth Required: No
```

#### POST /api/auth/change-password
Change password for logged-in user
```json
Request:
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}

Response (200):
{
  "success": true,
  "message": "Password changed successfully"
}

Auth Required: Yes
```

#### POST /api/auth/logout
Invalidate token
```json
Response (200):
{
  "success": true,
  "message": "Logged out successfully"
}

Auth Required: Yes
```

#### GET /api/auth/me
Get current user profile
```json
Response (200):
{
  "success": true,
  "data": {
    "user_id": 2,
    "username": "owner_mahendra",
    "email": "mahendra@gmail.com",
    "full_name": "Mahendhra Reddy",
    "phone": "9876543211",
    "role": "Hostel Owner"
  }
}

Auth Required: Yes
```

---

### Hostel APIs

#### GET /api/hostels
Get all hostels (Admin sees all, Owner sees only their hostels)
```json
Query Params:
?page=1&limit=10&search=sunrise

Response (200):
{
  "success": true,
  "data": {
    "hostels": [
      {
        "hostel_id": 1,
        "hostel_name": "Sunrise Boys Hostel",
        "hostel_type": "Boys",
        "city": "Hyderabad",
        "total_rooms": 16,
        "occupied_rooms": 13,
        "owner_name": "Mahendhra Reddy",
        "is_active": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 3,
      "totalPages": 1
    }
  }
}

Auth Required: Yes
```

#### GET /api/hostels/:id
Get hostel details
```json
Response (200):
{
  "success": true,
  "data": {
    "hostel_id": 1,
    "hostel_name": "Sunrise Boys Hostel",
    "owner_id": 2,
    "owner_name": "Mahendhra Reddy",
    "hostel_type": "Boys",
    "address": "Plot No 45, Near Tech Park, Gachibowli",
    "city": "Hyderabad",
    "state": "Telangana",
    "pincode": "500032",
    "total_rooms": 16,
    "contact_number": "9876543211",
    "email": "sunrise@hostel.com",
    "registration_number": "REG/HYD/2024/001"
  }
}

Auth Required: Yes
```

#### POST /api/hostels
Create new hostel (Admin only)
```json
Request:
{
  "hostel_name": "New Hostel",
  "owner_id": 2,
  "hostel_type": "Boys",
  "address": "123 Main Street",
  "city": "Hyderabad",
  "state": "Telangana",
  "pincode": "500001",
  "contact_number": "9876543221",
  "email": "newhostel@example.com",
  "registration_number": "REG/HYD/2025/001"
}

Response (201):
{
  "success": true,
  "data": {
    "hostel_id": 4,
    "message": "Hostel created successfully"
  }
}

Auth Required: Yes (Admin only)
```

#### PUT /api/hostels/:id
Update hostel
```json
Request: Same as POST

Response (200):
{
  "success": true,
  "message": "Hostel updated successfully"
}

Auth Required: Yes (Admin or Owner)
```

#### DELETE /api/hostels/:id
Delete hostel (Admin only)
```json
Response (200):
{
  "success": true,
  "message": "Hostel deleted successfully"
}

Auth Required: Yes (Admin only)
```

---

### Room APIs

#### GET /api/hostels/:hostelId/rooms
Get all rooms for a hostel
```json
Query Params:
?floor=2&available=true

Response (200):
{
  "success": true,
  "data": {
    "rooms": [
      {
        "room_id": 1,
        "room_number": "201",
        "room_type": "Double",
        "floor_number": 2,
        "capacity": 2,
        "occupied_beds": 2,
        "available_beds": 0,
        "rent_per_bed": 4500.00,
        "is_available": false,
        "amenities": "AC, Attached Bathroom, WiFi"
      }
    ]
  }
}

Auth Required: Yes
```

#### POST /api/hostels/:hostelId/rooms
Add new room
```json
Request:
{
  "room_number": "205",
  "room_type_id": 2,
  "floor_number": 2,
  "capacity": 2,
  "rent_per_bed": 4500.00,
  "amenities": "AC, WiFi"
}

Response (201):
{
  "success": true,
  "data": {
    "room_id": 17,
    "message": "Room created successfully"
  }
}

Auth Required: Yes (Owner or Admin)
```

#### PUT /api/rooms/:id
Update room
```json
Request: Same as POST

Response (200):
{
  "success": true,
  "message": "Room updated successfully"
}

Auth Required: Yes
```

#### DELETE /api/rooms/:id
Delete room
```json
Response (200):
{
  "success": true,
  "message": "Room deleted successfully"
}

Auth Required: Yes
```

---

### Student APIs

#### GET /api/hostels/:hostelId/students
Get all students
```json
Query Params:
?page=1&limit=10&search=ravi&active=true

Response (200):
{
  "success": true,
  "data": {
    "students": [
      {
        "student_id": 1,
        "first_name": "Ravi",
        "last_name": "Kumar",
        "phone": "9876501234",
        "email": "ravi.kumar@email.com",
        "room_number": "201",
        "admission_date": "2025-01-10",
        "is_active": true
      }
    ],
    "pagination": { "page": 1, "limit": 10, "total": 10, "totalPages": 1 }
  }
}

Auth Required: Yes
```

#### GET /api/students/:id
Get student details
```json
Response (200):
{
  "success": true,
  "data": {
    "student_id": 1,
    "first_name": "Ravi",
    "last_name": "Kumar",
    "date_of_birth": "2002-05-15",
    "gender": "Male",
    "phone": "9876501234",
    "email": "ravi.kumar@email.com",
    "guardian_name": "Ramesh Kumar",
    "guardian_phone": "9876001234",
    "guardian_relation": "Father",
    "permanent_address": "H.No 123, Warangal, Telangana",
    "persent_working_address": "Room 201, Sunrise Hostel",
    "id_proof_type": "Aadhar",
    "id_proof_number": "1234-5678-9012",
    "id_proof_document_url": "/uploads/aadhar_1.pdf",
    "admission_date": "2025-01-10",
    "room": {
      "room_id": 1,
      "room_number": "201",
      "bed_number": "B1"
    }
  }
}

Auth Required: Yes
```

#### POST /api/hostels/:hostelId/students
Add new student
```json
Request:
{
  "first_name": "John",
  "last_name": "Doe",
  "date_of_birth": "2003-05-15",
  "gender": "Male",
  "phone": "9876543222",
  "email": "john@email.com",
  "guardian_name": "Jane Doe",
  "guardian_phone": "9876543223",
  "guardian_relation": "Mother",
  "permanent_address": "123 Street, City",
  "persent_working_address": "Room 301",
  "id_proof_type": "Aadhar",
  "id_proof_number": "1234-5678-9999",
  "admission_date": "2025-03-01"
}

Response (201):
{
  "success": true,
  "data": {
    "student_id": 16,
    "message": "Student added successfully"
  }
}

Auth Required: Yes
```

#### POST /api/students/:id/upload-document
Upload ID proof document
```json
Request: multipart/form-data
{
  "file": <binary>
}

Response (200):
{
  "success": true,
  "data": {
    "document_url": "/uploads/students/aadhar_16_1234567890.pdf"
  }
}

Auth Required: Yes
```

#### PUT /api/students/:id
Update student
```json
Request: Same as POST

Response (200):
{
  "success": true,
  "message": "Student updated successfully"
}

Auth Required: Yes
```

#### DELETE /api/students/:id
Delete student
```json
Response (200):
{
  "success": true,
  "message": "Student removed successfully"
}

Auth Required: Yes
```

---

### Room Allocation APIs

#### POST /api/students/:studentId/allocate-room
Allocate room to student
```json
Request:
{
  "room_id": 5,
  "bed_number": "B1",
  "allocation_date": "2025-03-01"
}

Response (200):
{
  "success": true,
  "message": "Room allocated successfully"
}

Auth Required: Yes
```

#### POST /api/students/:studentId/vacate-room
Vacate student from room
```json
Request:
{
  "vacate_date": "2025-06-30",
  "remarks": "Course completed"
}

Response (200):
{
  "success": true,
  "message": "Room vacated successfully"
}

Auth Required: Yes
```

---

### Fee Management APIs

#### GET /api/hostels/:hostelId/fees
Get fee records
```json
Query Params:
?month=January 2025&student_id=1

Response (200):
{
  "success": true,
  "data": {
    "payments": [
      {
        "payment_id": 1,
        "student_name": "Ravi Kumar",
        "payment_date": "2025-01-10",
        "amount_paid": 5000.00,
        "payment_mode": "UPI",
        "receipt_number": "REC/SUN/001",
        "receipt_url": "/uploads/receipts/rec_001.pdf"
      }
    ]
  }
}

Auth Required: Yes
```

#### GET /api/hostels/:hostelId/dues
Get outstanding dues
```json
Response (200):
{
  "success": true,
  "data": {
    "dues": [
      {
        "due_id": 1,
        "student_id": 6,
        "student_name": "Suresh Babu",
        "due_month": "February 2025",
        "due_amount": 4500.00,
        "paid_amount": 0,
        "balance_amount": 4500.00,
        "due_date": "2025-02-05"
      }
    ],
    "total_outstanding": 4500.00
  }
}

Auth Required: Yes
```

#### POST /api/students/:studentId/payments
Record fee payment
```json
Request:
{
  "payment_date": "2025-03-05",
  "amount_paid": 5000.00,
  "payment_mode_id": 2,
  "payment_for_month": "March 2025",
  "transaction_reference": "UPI/2025/123",
  "remarks": "On time"
}

Response (201):
{
  "success": true,
  "data": {
    "payment_id": 9,
    "receipt_number": "REC/SUN/009",
    "message": "Payment recorded successfully"
  }
}

Auth Required: Yes
```

#### POST /api/payments/:paymentId/upload-receipt
Upload payment receipt
```json
Request: multipart/form-data
{
  "file": <binary>
}

Response (200):
{
  "success": true,
  "data": {
    "receipt_url": "/uploads/receipts/rec_009.pdf"
  }
}

Auth Required: Yes
```

---

### Expense Management APIs

#### GET /api/hostels/:hostelId/expenses
Get expenses
```json
Query Params:
?month=January 2025&category_id=1

Response (200):
{
  "success": true,
  "data": {
    "expenses": [
      {
        "expense_id": 1,
        "expense_date": "2025-01-05",
        "category": "Electricity Bill",
        "amount": 3500.00,
        "payment_mode": "Cash",
        "vendor_name": "TSSPDCL",
        "bill_number": "EB/DEC/2024/001",
        "bill_document_url": "/uploads/bills/bill_001.pdf"
      }
    ],
    "total_expenses": 31300.00
  }
}

Auth Required: Yes
```

#### POST /api/hostels/:hostelId/expenses
Add expense
```json
Request:
{
  "category_id": 1,
  "expense_date": "2025-03-05",
  "amount": 3600.00,
  "payment_mode_id": 1,
  "vendor_name": "TSSPDCL",
  "description": "Electricity bill",
  "bill_number": "EB/FEB/2025/001"
}

Response (201):
{
  "success": true,
  "data": {
    "expense_id": 8,
    "message": "Expense recorded successfully"
  }
}

Auth Required: Yes
```

#### POST /api/expenses/:expenseId/upload-bill
Upload expense bill
```json
Request: multipart/form-data
{
  "file": <binary>
}

Response (200):
{
  "success": true,
  "data": {
    "bill_url": "/uploads/bills/bill_008.pdf"
  }
}

Auth Required: Yes
```

---

### Reports APIs

#### GET /api/hostels/:hostelId/reports/financial
Get financial report
```json
Query Params:
?start_date=2025-01-01&end_date=2025-01-31

Response (200):
{
  "success": true,
  "data": {
    "period": "January 2025",
    "total_income": 120000.00,
    "total_expenses": 85000.00,
    "net_profit": 35000.00,
    "income_breakdown": {
      "Room Rent": 115000.00,
      "Electricity Charges": 5000.00
    },
    "expense_breakdown": {
      "Electricity Bill": 3500.00,
      "Water Bill": 800.00,
      "Groceries": 12000.00,
      "Salary": 15000.00,
      "Miscellaneous": 53700.00
    }
  }
}

Auth Required: Yes
```

#### GET /api/hostels/:hostelId/reports/occupancy
Get occupancy report
```json
Response (200):
{
  "success": true,
  "data": {
    "total_rooms": 16,
    "occupied_rooms": 13,
    "vacant_rooms": 3,
    "total_beds": 48,
    "occupied_beds": 38,
    "occupancy_rate": 79.17,
    "floor_wise": [
      {
        "floor": 2,
        "total_beds": 12,
        "occupied": 10,
        "rate": 83.33
      }
    ]
  }
}

Auth Required: Yes
```

#### GET /api/reports/dashboard-stats
Get dashboard statistics
```json
Response (200):
{
  "success": true,
  "data": {
    "total_hostels": 3,
    "total_rooms": 56,
    "total_students": 120,
    "monthly_income": 320000.00,
    "monthly_expense": 200000.00,
    "pending_payments": 15,
    "recent_admissions": 5
  }
}

Auth Required: Yes (Admin)
```

---

### Notification APIs

#### GET /api/notifications
Get user notifications
```json
Query Params:
?unread=true&limit=10

Response (200):
{
  "success": true,
  "data": {
    "notifications": [
      {
        "notification_id": 1,
        "notification_type": "Payment Due",
        "title": "Pending Fee Collection",
        "message": "Student Suresh Babu has pending fees for February 2025",
        "priority": "High",
        "is_read": false,
        "created_at": "2025-02-06T10:00:00Z"
      }
    ],
    "unread_count": 3
  }
}

Auth Required: Yes
```

#### PUT /api/notifications/:id/read
Mark notification as read
```json
Response (200):
{
  "success": true,
  "message": "Notification marked as read"
}

Auth Required: Yes
```

#### POST /api/notifications/send
Send notification to user (System/Admin)
```json
Request:
{
  "user_id": 2,
  "hostel_id": 1,
  "notification_type": "System Alert",
  "title": "System Maintenance",
  "message": "System will be under maintenance on...",
  "priority": "Medium"
}

Response (201):
{
  "success": true,
  "message": "Notification sent successfully"
}

Auth Required: Yes (Admin)
```

---

### Master Data APIs

#### GET /api/master/room-types
Get all room types
```json
Response (200):
{
  "success": true,
  "data": [
    { "room_type_id": 1, "room_type_name": "Single", "description": "1 person per room" },
    { "room_type_id": 2, "room_type_name": "Double", "description": "2 persons per room" }
  ]
}

Auth Required: Yes
```

#### GET /api/master/payment-modes
Get payment modes
```json
Response (200):
{
  "success": true,
  "data": [
    { "payment_mode_id": 1, "payment_mode_name": "Cash" },
    { "payment_mode_id": 2, "payment_mode_name": "UPI" }
  ]
}

Auth Required: Yes
```

#### GET /api/master/expense-categories
Get expense categories
```json
Response (200):
{
  "success": true,
  "data": [
    { "category_id": 1, "category_name": "Electricity Bill" },
    { "category_id": 2, "category_name": "Water Bill" }
  ]
}

Auth Required: Yes
```

---

## 6. Database Schema (Already Created)

Your database schema is already complete in `database_schema.sql`. The tables include:

- user_roles
- users
- hostel_master
- room_types
- rooms
- students
- room_allocations
- payment_modes
- fee_structure
- student_fee_payments
- student_dues
- expense_categories
- expenses
- notifications
- monthly_reports
- audit_logs
- app_settings

All tables have proper indexes, foreign keys, and constraints. Dummy data is already seeded.

---

## 7. Environment Variables

Create `.env` files in both frontend and backend:

**Backend `.env`:**
```
NODE_ENV=development
PORT=8081

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=Mahi@0712
DB_NAME=Hostel

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_REFRESH_EXPIRES_IN=30d

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=Hostel Management <noreply@hostelapp.com>

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

**Frontend `.env`:**
```
VITE_API_URL=http://localhost:8081/api
VITE_APP_NAME=Hostel Management System
VITE_ENVIRONMENT=development
```

---

## 8. Testing Acceptance Checklist

### Authentication & Authorization
- [ ] User can login with email and password
- [ ] User can login with mobile number and password
- [ ] Invalid credentials show error toast
- [ ] Forgot password sends OTP to mobile
- [ ] Forgot password sends reset link to email
- [ ] OTP verification works and resets password
- [ ] User can change password from profile
- [ ] Logout clears token and redirects to login
- [ ] Protected routes redirect to login if not authenticated
- [ ] Admin can access all hostels
- [ ] Owner can only access their assigned hostel(s)

### Hostel Management
- [ ] Admin can view all hostels
- [ ] Admin can create new hostel
- [ ] Admin can edit hostel details
- [ ] Admin can delete hostel (with confirmation)
- [ ] Owner can view only their hostel(s)
- [ ] Search and filter hostels works
- [ ] Hostel card shows correct statistics

### Room Management
- [ ] Owner can view all rooms for their hostel
- [ ] Rooms are grouped by floor
- [ ] Room occupancy is displayed correctly
- [ ] Owner can add new room
- [ ] Owner can edit room details
- [ ] Owner can delete room (with confirmation)
- [ ] Available/occupied status updates correctly

### Student Management
- [ ] Owner can view all students
- [ ] Owner can add new student
- [ ] Student form validates all required fields
- [ ] ID proof document can be uploaded
- [ ] Student can be allocated to a room
- [ ] Room occupancy updates when student allocated
- [ ] Student details can be edited
- [ ] Student can be removed (with confirmation)
- [ ] Vacating student frees up room bed

### Fee Management
- [ ] Owner can view all fee payments
- [ ] Owner can filter by month
- [ ] Owner can record new payment
- [ ] Payment receipt can be uploaded
- [ ] Receipt number is auto-generated
- [ ] Outstanding dues are displayed
- [ ] Dues update after payment
- [ ] Toast shows "Payment recorded successfully"

### Expense Management
- [ ] Owner can view all expenses
- [ ] Owner can add new expense
- [ ] Expense categories dropdown works
- [ ] Bill document can be uploaded
- [ ] Expense can be edited
- [ ] Expense can be deleted (with confirmation)
- [ ] Total expenses calculated correctly

### Reports & Analytics
- [ ] Dashboard shows correct statistics
- [ ] Financial report shows income vs expense
- [ ] Charts render correctly
- [ ] Occupancy report shows room utilization
- [ ] Date range filter works
- [ ] Export to PDF works (if implemented)
- [ ] Export to Excel works (if implemented)

### Notifications
- [ ] Bell icon shows unread count
- [ ] Clicking bell shows notification dropdown
- [ ] Notifications are marked as read
- [ ] Toast appears for important actions
- [ ] Payment due notifications appear
- [ ] New admission notifications appear

### UI/UX
- [ ] Mobile responsive on all screens
- [ ] Forms validate before submission
- [ ] Loading spinners show during API calls
- [ ] Error messages are clear and helpful
- [ ] Success toasts appear after actions
- [ ] Confirmation modals for delete actions
- [ ] Sidebar navigation works
- [ ] Active nav item highlighted
- [ ] User menu dropdown works
- [ ] Logout button works

### Security
- [ ] Passwords are not visible in network tab
- [ ] JWT token is stored securely
- [ ] API calls include Authorization header
- [ ] Unauthorized access returns 401
- [ ] Rate limiting prevents brute force
- [ ] File uploads are validated (type, size)
- [ ] XSS protection in place
- [ ] SQL injection prevented (parameterized queries)

---

**Next Steps:**
1. Install dependencies for frontend and backend
2. Set up environment variables
3. Run database migrations
4. Start backend server
5. Start frontend dev server
6. Test authentication flow
7. Test each feature module
8. Deploy to production

---

**End of Development Plan**
