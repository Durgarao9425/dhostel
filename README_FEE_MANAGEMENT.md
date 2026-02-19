# Fee Management System - Complete Documentation

## 📚 Documentation Index

This hostel management system now includes a comprehensive fee management module. Use the guides below based on your needs:

---

## 🚀 Quick Start (Start Here!)

**[RUN_THIS_NOW.md](./RUN_THIS_NOW.md)**
- **Use this if:** You're seeing the error `Unknown column 'sd.is_carried_forward'`
- Step-by-step instructions to fix the current error
- Run the migration script
- Verify everything works
- **Reading time:** 3 minutes

---

## 📖 Complete Setup Guide

**[COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md)**
- **Use this if:** You want detailed explanations
- Complete migration instructions
- Troubleshooting for all common issues
- Manual migration options
- Testing workflows
- **Reading time:** 10 minutes

---

## ⚡ Quick Reference

**[QUICK_START.md](./QUICK_START.md)**
- **Use this if:** You just need the commands
- One-page command reference
- All 4 migration methods
- Quick troubleshooting
- **Reading time:** 2 minutes

---

## 🔍 Database Status Check

**[CHECK_DATABASE_STATUS.md](./CHECK_DATABASE_STATUS.md)**
- **Use this if:** You want to see what's in your database
- SQL queries to check students, categories, dues
- Verification queries
- Setup commands
- **Reading time:** 5 minutes

---

## 🛠️ Helper Scripts

Located in `backend/scripts/`:

### 1. **apply-migration.js**
**Automatically applies the database migration**
```bash
cd backend
node scripts/apply-migration.js
```
- Reads migration SQL file
- Executes all changes
- Verifies columns were added
- Shows fee categories created

### 2. **check-database-status.js**
**Checks if your database is ready**
```bash
cd backend
node scripts/check-database-status.js
```
- Verifies migration applied
- Counts students, categories, dues
- Shows payment modes
- Provides recommendations

---

## 📁 Key Files

### Backend

**Controllers:**
- `backend/src/controllers/feeController.ts` - Fee/payment business logic
- `backend/src/controllers/feeCategoryController.ts` - Fee category management

**Routes:**
- `backend/src/routes/feeRoutes.ts` - Fee/payment endpoints
- `backend/src/routes/feeCategoryRoutes.ts` - Category endpoints

**Jobs:**
- `backend/src/jobs/monthlyDuesGeneration.ts` - Auto dues generation cron

**Migrations:**
- `backend/migrations/add_fee_categories_support.sql` - Database schema changes

### Frontend

**Pages:**
- `frontend/src/pages/EnhancedFeesPage.tsx` - Main fees management page
- `frontend/src/pages/FeesDebugPage.tsx` - Debug/testing page

**Configuration:**
- `frontend/src/App.tsx` - Routes configuration

---

## ✨ Features

### 1. Multi-Category Fee Tracking
- Monthly Rent
- Electricity
- Maintenance
- Mess Fee
- Water Charges
- Custom categories can be added via API

### 2. Automatic Dues Generation
- Runs on 1st of each month at 12:01 AM
- Creates dues for all active students
- Generates separate dues for each fee category

### 3. Carry-Forward System
- Unpaid dues automatically roll to next month
- Tracks which month dues originated from
- Shows "Carried from: [month]" in UI

### 4. Partial Payments
- Pay any amount
- System allocates to oldest dues first
- Tracks remaining balance
- Shows payment history

### 5. Complete Student View
- Shows ALL registered students
- Not just those with pending dues
- Payment status badges (Paid/Pending/No Dues)
- Search by name, phone, email, room

### 6. Dashboard Summary
- Total Students count
- Pending Dues count
- Fully Paid count
- Total Pending Amount
- Total Collected This Month

### 7. Smart Tabs
- **All Students:** Everyone registered
- **Pending Dues:** Students with unpaid balance
- **Fully Paid:** Students with no pending dues
- **Payment History:** Complete transaction log

### 8. Search & Filter
- Search by student name
- Search by phone number
- Search by email
- Search by room number

---

## 🔌 API Endpoints

### Fee Management

```
GET    /api/fees/all-students       - Get all students with dues info
GET    /api/fees/dues                - Get students with unpaid dues only
GET    /api/fees/payments            - Get all payment records
POST   /api/fees/payments            - Record a new payment
GET    /api/fees/payment-modes       - Get available payment modes
POST   /api/fees/generate-dues       - Manually generate monthly dues
GET    /api/fees/receipts/:paymentId - Get payment receipt
```

### Fee Categories

```
GET    /api/fee-categories           - Get all fee categories
POST   /api/fee-categories           - Create new category
PUT    /api/fee-categories/:id       - Update category
DELETE /api/fee-categories/:id       - Delete category
GET    /api/fee-categories/:id       - Get single category
```

---

## 🗃️ Database Schema Changes

### student_dues table - New Columns:
- `fee_category_id` (INT) - Links to fee_structure table
- `is_carried_forward` (BOOLEAN) - Tracks if dues were carried from previous month
- `carried_from_month` (VARCHAR) - Original month of unpaid dues
- `paid_date` (DATE) - When payment was made

### New Indexes:
- `idx_student_dues_category` - Faster category lookups
- `idx_student_dues_month` - Faster month-based queries
- `idx_student_dues_student_month` - Faster student+month queries

---

## 🔄 Workflow

### Monthly Dues Generation (Automatic)
1. Cron job runs on 1st of month at 12:01 AM
2. For each hostel:
   - Check all active students
   - Check all active fee categories
   - Generate dues for each student × category
   - Carry forward any unpaid dues from previous month
3. Log results

### Payment Recording
1. Admin opens student details
2. Clicks "Collect Payment"
3. Enters amount and selects mode (Cash/UPI/Card/etc.)
4. System allocates payment:
   - Finds oldest unpaid dues first
   - Allocates amount to that due
   - If amount exceeds due, move to next oldest
   - Repeat until amount exhausted
5. Updates `paid_amount`, `balance_amount`, `is_paid` flags
6. Records transaction in payment history
7. Shows success message

### Carry-Forward Logic
1. When generating dues for new month:
2. Check previous month for unpaid dues
3. For each unpaid due:
   - Create new due record for current month
   - Copy `fee_category_id`, `due_amount`
   - Set `is_carried_forward = TRUE`
   - Set `carried_from_month = "January 2025"` (example)
   - Preserve original `due_amount`
4. UI shows carried forward dues with special indicator

---

## 🎨 UI Components

### Summary Cards
```
┌────────────────────────────────────────────────────────┐
│  Total Students    Pending Dues   Fully Paid           │
│      25                12             13                │
│                                                         │
│  Pending Amount         Collected This Month           │
│    ₹45,000                   ₹32,000                   │
└────────────────────────────────────────────────────────┘
```

### Student Table
```
┌──────────────────────────────────────────────────────────────┐
│ Name        Room    Phone        Total Dues   Status         │
├──────────────────────────────────────────────────────────────┤
│ John Doe    101     9876543210   ₹8,500       Pending  [Btn]│
│ Jane Smith  102     9876543211   ₹0           Paid     [Btn]│
│ Mike Brown  103     9876543212   ₹0           No Dues  [Btn]│
└──────────────────────────────────────────────────────────────┘
```

### Dues Breakdown (in modal)
```
┌────────────────────────────────────────────────┐
│  Monthly Rent                        ₹5,000    │
│  Electricity                         ₹500      │
│  Maintenance (Carried from Jan 2025) ₹300  🔄  │
│  ──────────────────────────────────────────    │
│  Total Dues:                         ₹5,800    │
└────────────────────────────────────────────────┘
```

---

## 🧪 Testing Workflow

### 1. Initial Setup Test
```bash
# Check database status
node scripts/check-database-status.js

# Apply migration if needed
node scripts/apply-migration.js

# Restart backend
npm run dev
```

### 2. Frontend Test
- Open browser → Login
- Navigate to Fees Management
- Verify all students visible
- Verify summary cards show numbers
- Test search functionality

### 3. Payment Test
- Click "View Details" on a student with dues
- Click "Collect Payment"
- Enter amount (try partial payment)
- Select payment mode
- Submit
- Verify:
  - Balance updated
  - Payment appears in history
  - Status badge changed if fully paid

### 4. Dues Generation Test
```bash
# Generate dues for current month
curl -X POST http://localhost:8081/api/fees/generate-dues \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"hostel_id": 1, "month_year": "2025-11"}'
```

---

## 🐛 Troubleshooting

### Error: "Unknown column 'is_carried_forward'"
**Solution:** Run migration script
```bash
node scripts/apply-migration.js
```

### Error: "Cannot find module"
**Solution:** Install dependencies
```bash
cd backend
npm install
```

### No students showing
**Solution:**
1. Check if students exist: `SELECT COUNT(*) FROM students WHERE status='Active'`
2. Check browser console (F12) for API errors
3. Run: `node scripts/check-database-status.js`

### Payment not recording
**Solution:**
1. Check payment modes exist: `SELECT * FROM payment_modes`
2. Verify JWT token is valid
3. Check backend logs for errors

---

## 📞 Support

If you encounter issues:

1. **Check documentation** (this file and linked guides)
2. **Run diagnostic script:** `node scripts/check-database-status.js`
3. **Check browser console** (F12 → Console tab)
4. **Check backend logs** (terminal where `npm run dev` is running)
5. **Share error messages** (exact error text helps debug faster)

---

## 🎯 Next Steps

After successful setup:

1. **Customize fee categories** for your hostels
2. **Generate current month dues** if needed
3. **Train staff** on payment recording process
4. **Set up database backups** (daily recommended)
5. **Monitor cron job logs** to ensure automatic generation works

---

## 📊 Performance Notes

- Database indexes added for optimal query speed
- API responses cached where appropriate
- Frontend uses lazy loading for large lists
- Payments allocated efficiently (oldest dues first)

---

## 🔒 Security Considerations

- All routes protected by JWT authentication
- Role-based access control (Admin/Owner)
- SQL injection prevention via Knex.js
- Input validation on all endpoints
- Proper error handling (no sensitive data leaked)

---

## 🚀 Future Enhancements (Optional)

Potential features to add:
- Email/SMS notifications for due dates
- Bulk payment import from CSV
- Receipt PDF generation
- Payment reminders automation
- Analytics dashboard
- Export reports to Excel
- Multi-currency support
- Discount/waiver management

---

**Version:** 1.0
**Last Updated:** November 2025
**System:** Hostel Management - Fee Management Module
