# Monthly Fee System - Quick Reference Guide

## What Was Built

A complete monthly hostel fee management system for tracking and managing student fees with the following capabilities:

✅ Monthly fee generation (automated on 1st of month)
✅ Carry-forward accounting (unpaid balances roll forward)
✅ Payment recording and tracking
✅ Current month fee editing (with protection from editing past months)
✅ Payment history view
✅ Summary statistics and reports
✅ Audit logging of all transactions

---

## Key Concepts

### Monthly Fee Record
Each student has ONE monthly fee record per month containing:
- **Monthly Rent**: The basic monthly room rent
- **Carry Forward**: Unpaid balance from previous months
- **Total Due**: Monthly Rent + Carry Forward
- **Paid Amount**: Amount already paid this month
- **Balance**: Total Due - Paid Amount
- **Fee Status**: Pending / Partially Paid / Fully Paid / Overdue

### Payment Recording
When a payment is made:
1. Select the fee and amount
2. Record payment details (method, date, etc.)
3. System updates: Paid Amount and Balance
4. Fee Status automatically updates
5. Payment is logged to history

### Fee Editing
Only current month fees can be edited:
- Monthly Rent (if it changed)
- Carry Forward (adjust from previous months)
- Due Date
- Notes

Past months are read-only and cannot be modified.

### Carry-Forward Logic
When generating fees for a new month:
1. Check all unpaid fees from previous months
2. Sum up unpaid balances
3. Add to current month's total due
4. This is the "Carry Forward" amount

Example:
- November unpaid: ₹2,000
- December rent: ₹5,000
- December total due: ₹7,000 (5,000 + 2,000 carry)

---

## File Structure

### Backend
```
src/
├── controllers/
│   └── monthlyFeeController.ts (NEW) - Fee logic
├── routes/
│   └── monthlyFeeRoutes.ts (NEW) - API endpoints
├── jobs/
│   └── monthlyFeesGeneration.ts (NEW) - Cron scheduler
└── server.ts (MODIFIED) - Register routes & jobs
```

### Frontend
```
src/
├── pages/
│   └── MonthlyFeeManagementPage.tsx (NEW) - Main UI
├── App.tsx (MODIFIED) - Add routes
├── components/
│   └── layout/
│       └── MainLayout.tsx (MODIFIED) - Navigation
```

### Database
```
migrations/
├── add_monthly_fee_columns.sql (NEW) - Student table updates
└── create_monthly_fees_tables.sql (NEW) - Fee tables
```

---

## API Endpoints

### Get Fees
```
GET /api/monthly-fees/student/:studentId
GET /api/monthly-fees/summary?fee_month=2025-12
GET /api/monthly-fees/:feeId/payments
GET /api/monthly-fees/student/:studentId/previous
GET /api/monthly-fees/student/:studentId/months
```

### Record Payment
```
POST /api/monthly-fees/:feeId/payment
Body: {
  amount: 1000,
  payment_date: "2025-12-07",
  payment_method: "Cash",
  receipt_number: "RCP001",
  transaction_id: null,
  notes: "Full payment"
}
```

### Edit Fee
```
PUT /api/monthly-fees/:feeId
Body: {
  monthly_rent: 5000,
  carry_forward: 2000,
  due_date: "2025-12-15",
  notes: "Updated rent"
}
```

---

## Frontend Usage

### Access the Page
Navigate to: **http://localhost:5173/monthly-fees**
(Or click "Monthly Fees" in sidebar)

### Main Features

#### 1. Month Selection
- Input at top right: month/year
- Changes data to selected month
- Format: YYYY-MM

#### 2. Summary Cards
- Total Students: Number of students with fees
- Fully Paid: Students who paid full amount
- Partially Paid: Students with partial payments
- Pending: Students with no payments
- Pending Amount: Total money still due

#### 3. Fees Table
Shows all students with their fee details:
- Student name & phone
- Room number & floor
- Monthly rent amount
- Carry forward from last month
- Total due
- Amount paid so far
- Remaining balance
- Current status (color-coded)

#### 4. Action Buttons
Per student fee:
- **+ Record Payment** - Add a payment
- **✎ Edit Fee** - Modify fee details
- **👁 View Payments** - See all payments made

---

## Step-by-Step Workflows

### Recording a Payment

```
1. Find student in table
2. Click "+ Record Payment" button
3. Modal opens with fields:
   - Amount (required)
   - Payment Date (required)
   - Payment Method (Cash/Cheque/Online/Other)
   - Receipt Number (optional)
   - Transaction ID (optional)
   - Notes (optional)
4. Click "Record Payment"
5. Success! Fee status updates automatically
6. Check View Payments to see it listed
```

### Editing a Fee (Current Month Only)

```
1. Find student in table
2. Click "✎ Edit Fee" button
3. Modal opens with editable fields:
   - Monthly Rent
   - Carry Forward
   - Due Date
   - Notes
4. Make changes
5. Click "Update Fee"
6. Success! Fee recalculated
```

### Viewing Payment History

```
1. Find student in table
2. Click "👁 View Payments" button
3. Modal shows all payments:
   - Amount & date
   - Payment method
   - Receipt number
   - Notes
4. Click to close
```

### Switching Months

```
1. Click month selector (top right)
2. Select desired month/year
3. Table automatically updates
4. Summary cards recalculate
```

---

## Automated Processes

### Monthly Fee Generation
**When:** 1st of month at 12:05 AM IST
**What happens:**
1. System gets all active students
2. For each student:
   - Calculates unpaid balance from last month (carry-forward)
   - Gets current monthly rent
   - Calculates: total_due = rent + carry_forward
   - Creates monthly_fees record
3. Sets initial status: "Pending"

**To manually trigger** (for testing):
- Call API or check cron logs for status

---

## Data Flow

### Payment Recording Flow
```
User Records Payment
         ↓
Validate amount > 0
         ↓
Get fee record
         ↓
START TRANSACTION
         ↓
Insert payment record
         ↓
Update fee (paid_amount, balance)
         ↓
Calculate new fee_status
         ↓
Log to fee_history
         ↓
COMMIT TRANSACTION
         ↓
Return updated fee
         ↓
Refresh UI
         ↓
Show success toast
```

### Monthly Generation Flow
```
Cron triggered on 1st of month
         ↓
Get all active hostels
         ↓
For each hostel:
  Get all active students
         ↓
  For each student:
    Calculate carry_forward (sum of unpaid)
    Get monthly_rent
    total_due = rent + carry_forward
    Create monthly_fees record
         ↓
Log completion status
         ↓
Alert admin if failures
```

---

## Database Tables Reference

### monthly_fees
- fee_id (PK)
- student_id, hostel_id (FK)
- fee_month, fee_date
- monthly_rent, carry_forward
- total_due, paid_amount, balance
- fee_status, due_date
- notes, created_at, updated_at

### fee_payments
- payment_id (PK)
- fee_id (FK)
- student_id, hostel_id
- amount, payment_date
- payment_method
- transaction_id, receipt_number
- notes, created_at, updated_at

### fee_history (Audit)
- history_id (PK)
- fee_id, student_id
- action, old_values (JSON), new_values (JSON)
- created_by, created_at

---

## Status Indicators & Meanings

| Status | Color | Meaning | Action |
|--------|-------|---------|--------|
| **Fully Paid** | 🟢 Green | Balance = 0 | Done, no action |
| **Partially Paid** | 🟡 Yellow | Balance > 0, paid > 0 | More payment needed |
| **Pending** | 🔴 Red | Balance = total_due, paid = 0 | Payment needed |
| **Overdue** | 🟠 Orange | Past due_date, unpaid | Urgent attention |

---

## Authorization & Security

### Who Can See What
- **Admin**: All hostels and students
- **Hostel Owner**: Only their own hostel's students

### Who Can Do What
- **Record Payment**: Authorized users
- **Edit Fee**: Authorized users (current month only)
- **View History**: Authorized users
- **Edit Past Month**: ❌ NOT ALLOWED (API enforces)

### Protection Mechanisms
- Hostel_id check on all operations
- Current month validation before edits
- Transaction rollback on errors
- Audit logging of all changes

---

## Common Scenarios

### Scenario 1: Student Pays Full Amount
```
Initial state:
  Monthly Rent: ₹5,000
  Carry Forward: ₹0
  Total Due: ₹5,000
  Paid: ₹0
  Balance: ₹5,000
  Status: Pending

Action: Record payment of ₹5,000

Final state:
  Paid: ₹5,000
  Balance: ₹0
  Status: Fully Paid ✓
```

### Scenario 2: Student Has Previous Due
```
Initial state:
  Monthly Rent: ₹5,000
  Carry Forward: ₹2,000 (from Nov)
  Total Due: ₹7,000
  Paid: ₹0
  Balance: ₹7,000
  Status: Pending

Action: Record payment of ₹5,000

Intermediate state:
  Paid: ₹5,000
  Balance: ₹2,000
  Status: Partially Paid

Next month automatically carries ₹2,000 forward
```

### Scenario 3: Rent Increased Mid-Month
```
Original state:
  Monthly Rent: ₹5,000
  Total Due: ₹5,000

Action: Edit fee, change rent to ₹5,500

Updated state:
  Monthly Rent: ₹5,500
  Total Due: ₹5,500 (recalculated)
  Balance: ₹5,500 (if no payments yet)
```

---

## Troubleshooting

### No fees showing for current month
**Cause:** Fees not generated yet
**Solution:**
- Wait for 1st of month 12:05 AM, or
- Contact admin to manually trigger generation

### Can't edit past month
**Cause:** Intentional system protection
**Solution:**
- Only current month can be edited
- Use "Notes" field to document changes
- Contact admin if adjustment needed

### Payment not showing
**Cause:** Page not refreshed
**Solution:**
- Refresh page (F5)
- Check "View Payments" modal
- Check fee_history in database

### Wrong fee amount
**Cause:** Rent was updated but fee exists
**Solution:**
- Click "Edit Fee" for current month
- Update monthly_rent field
- Click "Update Fee"
- Balance recalculates automatically

---

## Performance Tips

### For Large Hostels (100+ students)
- Load times may be slower for summary
- Use month selector efficiently
- Consider batch payment recording

### For Optimized Performance
- Indexes are in place for common queries
- UI loads asynchronously
- No full-page reloads needed
- Data caching in component state

---

## Support Contact

For issues or questions:
1. Check this guide first
2. Review error messages in toast notifications
3. Check browser console for errors
4. Review server logs
5. Contact system administrator

---

## Implementation Checklist

- [x] Database migrations created
- [x] Backend APIs implemented
- [x] Cron job configured
- [x] Frontend UI created
- [x] Navigation integrated
- [x] Authorization added
- [x] Error handling included
- [x] Audit logging enabled
- [x] Ready for production use

---

**System Status: ✅ READY FOR DEPLOYMENT**

All components tested and integrated. Ready for real-world use.
