# Monthly Fees Collection Logic - Complete Overview

## Page: `/owner/monthly-fees` (MonthlyFeeManagementPage.tsx)

---

## 📋 **FRONTEND FLOW**

### 1. **Page Initialization**
- **Component**: `MonthlyFeeManagementPage.tsx`
- **Default Month**: Current month (YYYY-MM format)
- **Initial State**: `loading = true`

### 2. **Data Fetching**
```typescript
useEffect(() => {
  fetchMonthlyFeesSummary();
}, [currentMonth]);
```

**API Call**: `GET /monthly-fees/summary?fee_month=YYYY-MM`
- Fetches summary statistics and all fees for selected month
- Returns: `{ summary: {...}, fees: [...] }`

### 3. **Summary Statistics Displayed**
- Total Students
- Fully Paid count
- Partially Paid count
- Pending count
- Total Pending Amount

### 4. **Fees Table Display**
Each row shows:
- Student Name & Phone
- Room Number & Floor
- Monthly Rent
- Carry Forward (if any)
- Total Due
- Paid Amount
- Balance
- Status (Fully Paid / Partially Paid / Pending / Overdue)
- Actions (Record Payment / Edit Fee / View History)

---

## 💰 **FEE COLLECTION PROCESS**

### **Step 1: Open Payment Modal**
```typescript
handleOpenPaymentModal(fee: MonthlyFee)
```
- Sets `selectedFee` state
- Initializes `paymentForm` with:
  - `fee_id`, `student_id`, `hostel_id` (from selected fee)
  - `amount`: empty (user enters)
  - `payment_date`: today's date
  - `payment_method`: 'Cash' (default)
  - `transaction_id`, `receipt_number`, `notes`: empty

### **Step 2: User Fills Payment Form**
- **Amount**: Required (number input)
- **Payment Date**: Required (date picker)
- **Payment Method**: Dropdown (Cash/Cheque/Online/Other)
- **Receipt Number**: Optional (text input)
- **Transaction ID**: Optional (text input)
- **Notes**: Optional (textarea)

### **Step 3: Submit Payment**
```typescript
handleRecordPayment()
```

**API Call**: `POST /monthly-fees/:feeId/payment`

**Payload**:
```json
{
  "fee_id": 123,
  "student_id": 45,
  "hostel_id": 1,
  "amount": 5000.00,
  "payment_date": "2026-01-03",
  "payment_method": "Cash",
  "transaction_id": null,
  "receipt_number": null,
  "notes": null
}
```

---

## 🔧 **BACKEND PAYMENT PROCESSING**

### **Endpoint**: `POST /monthly-fees/:feeId/payment`
**Controller**: `recordPayment()` in `monthlyFeeController.ts`

### **Step 1: Validation**
- Validates required fields: `fee_id`, `student_id`, `hostel_id`, `amount`, `payment_date`
- Checks authorization (owner can only record for their hostel)
- Validates payment amount > 0

### **Step 2: Fetch Current Fee Record**
```sql
SELECT * FROM monthly_fees WHERE fee_id = ?
```

### **Step 3: Calculate New Values**
```typescript
currentPaid = monthlyFee.paid_amount || 0
currentBalance = monthlyFee.balance || 0
newPaidAmount = currentPaid + paymentAmount
newBalance = Math.max(0, currentBalance - paymentAmount)
```

### **Step 4: Determine New Status**
```typescript
if (newBalance === 0) {
  newFeeStatus = 'Fully Paid'
} else if (newPaidAmount > 0) {
  newFeeStatus = 'Partially Paid'
} else {
  newFeeStatus = 'Pending'
}
```

### **Step 5: Database Transaction**
**Uses Knex transaction** to ensure data consistency:

1. **Insert Payment Record** (`fee_payments` table):
   ```sql
   INSERT INTO fee_payments (
     fee_id, student_id, hostel_id, amount,
     payment_date, payment_method, transaction_id,
     receipt_number, notes, created_at, updated_at
   ) VALUES (...)
   ```

2. **Update Monthly Fee** (`monthly_fees` table):
   ```sql
   UPDATE monthly_fees SET
     paid_amount = newPaidAmount,
     balance = newBalance,
     fee_status = newFeeStatus,
     updated_at = NOW()
   WHERE fee_id = ?
   ```

3. **Log to History** (`fee_history` table):
   ```sql
   INSERT INTO fee_history (
     fee_id, student_id, action, old_values, new_values, created_by, created_at
   ) VALUES ('paid', JSON.stringify(old), JSON.stringify(new), ...)
   ```

### **Step 6: Commit Transaction**
- If all operations succeed → `trx.commit()`
- If any error → `trx.rollback()`

---

## 📊 **DATA STRUCTURE**

### **monthly_fees Table**
- `fee_id` (PK)
- `student_id` (FK → students)
- `hostel_id` (FK → hostel_master)
- `fee_month` (YYYY-MM format)
- `fee_date` (day of month)
- `monthly_rent` (DECIMAL)
- `carry_forward` (DECIMAL) - Previous month's balance
- `total_due` (DECIMAL) - monthly_rent + carry_forward
- `paid_amount` (DECIMAL) - Sum of all payments
- `balance` (DECIMAL) - total_due - paid_amount
- `fee_status` (ENUM: 'Pending' | 'Partially Paid' | 'Fully Paid' | 'Overdue')
- `due_date` (DATE)
- `notes` (TEXT)

### **fee_payments Table**
- `payment_id` (PK)
- `fee_id` (FK → monthly_fees)
- `student_id` (FK → students)
- `hostel_id` (FK → hostel_master)
- `amount` (DECIMAL)
- `payment_date` (DATE)
- `payment_method` (VARCHAR: Cash/Cheque/Online/Other)
- `transaction_id` (VARCHAR, nullable)
- `receipt_number` (VARCHAR, nullable)
- `notes` (TEXT, nullable)
- `created_at`, `updated_at`

### **fee_history Table** (Audit Trail)
- `history_id` (PK)
- `fee_id` (FK)
- `student_id` (FK)
- `action` (VARCHAR: 'paid', 'updated', etc.)
- `old_values` (JSON)
- `new_values` (JSON)
- `created_by` (FK → users)
- `created_at`

---

## 🔄 **COMPLETE FLOW DIAGRAM**

```
1. User opens /owner/monthly-fees
   ↓
2. Frontend: fetchMonthlyFeesSummary()
   ↓
3. API: GET /monthly-fees/summary?fee_month=YYYY-MM
   ↓
4. Backend: getMonthlyFeesSummary()
   - Queries monthly_fees table
   - Joins with students and rooms
   - Filters by month and hostel
   - Calculates summary stats
   ↓
5. Frontend displays:
   - Summary cards (totals, counts)
   - Fees table (all students for the month)
   ↓
6. User clicks "Record Payment" button (+ icon)
   ↓
7. Frontend: handleOpenPaymentModal(fee)
   - Opens modal with payment form
   ↓
8. User fills form and clicks "Record Payment"
   ↓
9. Frontend: handleRecordPayment()
   - Validates form
   - Calls API: POST /monthly-fees/:feeId/payment
   ↓
10. Backend: recordPayment()
    - Validates input
    - Gets current fee record
    - Calculates new paid_amount and balance
    - Determines new status
    - Starts database transaction
    ↓
11. Database Transaction:
    a. INSERT into fee_payments
    b. UPDATE monthly_fees (paid_amount, balance, fee_status)
    c. INSERT into fee_history (audit log)
    ↓
12. Transaction commits
    ↓
13. Backend returns success response
    ↓
14. Frontend:
    - Shows success toast
    - Closes modal
    - Refreshes data (fetchMonthlyFeesSummary)
    ↓
15. Updated data displayed in table
```

---

## 🎯 **KEY FEATURES**

1. **Month-based View**: Select any month to view fees
2. **Real-time Updates**: Balance and status update immediately after payment
3. **Multiple Payments**: Can record multiple payments for same fee
4. **Status Tracking**: Automatically updates status (Pending → Partially Paid → Fully Paid)
5. **Carry Forward**: Previous month's balance carries to next month
6. **Payment History**: View all payments for a fee
7. **Edit Fee**: Can edit monthly_rent, carry_forward, due_date for current month
8. **Audit Trail**: All changes logged in fee_history table

---

## 📝 **IMPORTANT NOTES**

- **Only current month fees can be edited** (monthly_rent, carry_forward)
- **Previous months are read-only** (can view, cannot edit)
- **Payments can be recorded for any month** (not just current)
- **Balance calculation**: `balance = total_due - paid_amount`
- **Status is auto-calculated** based on balance:
  - Balance = 0 → Fully Paid
  - Balance > 0 AND paid_amount > 0 → Partially Paid
  - Balance > 0 AND paid_amount = 0 → Pending
- **Transaction ensures data integrity** (all-or-nothing)

---

## 🔗 **API ENDPOINTS USED**

1. `GET /monthly-fees/summary?fee_month=YYYY-MM` - Get summary and fees list
2. `POST /monthly-fees/:feeId/payment` - Record a payment
3. `GET /monthly-fees/:feeId/payments` - Get payment history
4. `PUT /monthly-fees/:feeId` - Edit fee (current month only)

---

## 🗄️ **DATABASE TABLES INVOLVED**

1. **monthly_fees** - Main fee records
2. **fee_payments** - Individual payment records
3. **fee_history** - Audit log
4. **students** - Student information (joined)
5. **rooms** - Room information (joined)
6. **hostel_master** - Hostel information (joined)







