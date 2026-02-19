# Monthly Fee Management System - Architecture & Data Flow

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + TypeScript)             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  MonthlyFeeManagementPage.tsx                                    │
│  ├── Month Selector                                              │
│  ├── Summary Cards (5 KPIs)                                      │
│  ├── Fees Table                                                  │
│  │   ├── + Record Payment Modal                                  │
│  │   ├── ✎ Edit Fee Modal                                        │
│  │   └── 👁 View Payments Modal                                  │
│  └── API Integration via axios                                   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓↑
                    HTTP/REST API (Port 8081)
                              ↓↑
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND (Express.js + Node.js)                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  API Routes (/api/monthly-fees/*)                                │
│  ├── GET /student/:id          → getMonthlyFees()               │
│  ├── GET /summary              → getMonthlyFeesSummary()        │
│  ├── GET /:id/payments         → getFeePayments()               │
│  ├── POST /:id/payment         → recordPayment()                │
│  ├── PUT /:id                  → editCurrentMonthFee()          │
│  ├── GET /student/:id/previous → getPreviousMonthsFees()       │
│  └── GET /student/:id/months   → getAvailableMonths()          │
│                                                                   │
│  Middleware                                                       │
│  └── authMiddleware (JWT verification)                           │
│                                                                   │
│  Controllers                                                      │
│  └── monthlyFeeController.ts (business logic)                    │
│                                                                   │
│  Cron Jobs                                                        │
│  ├── startMonthlyDuesGenerationJob()     (12:01 AM)             │
│  └── startMonthlyFeesGenerationJob()     (12:05 AM)             │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓↑
                    MySQL Database (Port 3306)
                              ↓↑
┌─────────────────────────────────────────────────────────────────┐
│                         DATABASE SCHEMA                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  monthly_fees                          fee_payments              │
│  ├── fee_id (PK)                      ├── payment_id (PK)       │
│  ├── student_id (FK)                  ├── fee_id (FK)           │
│  ├── hostel_id (FK)                   ├── student_id            │
│  ├── fee_month                        ├── hostel_id             │
│  ├── fee_date                         ├── amount                │
│  ├── monthly_rent                     ├── payment_date          │
│  ├── carry_forward                    ├── payment_method        │
│  ├── total_due                        ├── transaction_id        │
│  ├── paid_amount                      ├── receipt_number        │
│  ├── balance                          ├── notes                 │
│  ├── fee_status                       └── timestamps            │
│  ├── due_date                                                    │
│  ├── notes                             fee_history              │
│  └── timestamps                        ├── history_id (PK)     │
│                                        ├── fee_id (FK)         │
│  students (updated)                    ├── student_id          │
│  ├── due_date_day                      ├── action              │
│  └── fee_status                        ├── old_values (JSON)   │
│                                        ├── new_values (JSON)   │
│                                        ├── created_by          │
│                                        └── created_at          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### 1. Monthly Fee Generation Flow (Automated)

```
Scheduled Trigger (1st of Month, 12:05 AM)
         ↓
startMonthlyFeesGenerationJob()
         ↓
Get all active hostels
         ↓
For each hostel:
  ├─ Get all active students
  │  ├─ For each student:
  │  │  ├─ Query previous unpaid fees
  │  │  ├─ Calculate carry_forward (sum of balance)
  │  │  ├─ Get current monthly_rent
  │  │  ├─ Calculate total_due = rent + carry_forward
  │  │  └─ Create monthly_fees record
  │  └─ Log: "Generated fees for X students"
  └─ Move to next hostel
         ↓
Log completion status
         ↓
Alert if any failures
```

### 2. Payment Recording Flow

```
User clicks "Record Payment"
         ↓
Modal opens with form:
  ├─ Amount (required)
  ├─ Payment Date (required)
  ├─ Payment Method
  ├─ Receipt Number
  ├─ Transaction ID
  └─ Notes
         ↓
User submits form
         ↓
Frontend validates: amount > 0
         ↓
POST /api/monthly-fees/:feeId/payment
         ↓
Backend validates input
         ↓
Get monthly_fees record
         ↓
BEGIN TRANSACTION
  │
  ├─ INSERT INTO fee_payments (...)
  │
  ├─ Calculate:
  │  ├─ new_paid = old_paid + amount
  │  ├─ new_balance = total_due - new_paid
  │  └─ new_status = determine from balance
  │
  ├─ UPDATE monthly_fees:
  │  ├─ paid_amount = new_paid
  │  ├─ balance = new_balance
  │  └─ fee_status = new_status
  │
  └─ INSERT INTO fee_history (...)
         ↓
COMMIT TRANSACTION
         ↓
Return updated fee to frontend
         ↓
Show success toast
         ↓
Refresh data table
```

### 3. Fee Editing Flow

```
User clicks "Edit" button
         ↓
Check if current month ✓
         ↓
Modal opens with editable fields:
  ├─ Monthly Rent
  ├─ Carry Forward
  ├─ Due Date
  └─ Notes
         ↓
User modifies and submits
         ↓
PUT /api/monthly-fees/:feeId
         ↓
Backend validates: current month only
         ↓
Get current fee record
         ↓
BEGIN TRANSACTION
  │
  ├─ Store old_values JSON
  │
  ├─ Calculate:
  │  ├─ new_total_due = rent + carry_forward
  │  ├─ new_balance = total_due - paid_amount
  │  └─ new_status = determine from balance
  │
  ├─ UPDATE monthly_fees (...)
  │
  └─ INSERT INTO fee_history (...)
         ↓
COMMIT TRANSACTION
         ↓
Return updated fee to frontend
         ↓
Show success message
         ↓
Refresh data table
```

### 4. Data Retrieval Flow (Summary View)

```
User navigates to /monthly-fees
         ↓
Component mounts
         ↓
Get current month (YYYY-MM)
         ↓
GET /api/monthly-fees/summary?fee_month=YYYY-MM
         ↓
Backend:
  ├─ Query monthly_fees WHERE fee_month = YYYY-MM
  ├─ LEFT JOIN students
  ├─ LEFT JOIN room_allocations
  │
  ├─ Calculate Summary:
  │  ├─ total_students = COUNT(DISTINCT student_id)
  │  ├─ fully_paid = COUNT(WHERE fee_status = 'Fully Paid')
  │  ├─ partially_paid = COUNT(WHERE fee_status = 'Partially Paid')
  │  ├─ pending = COUNT(WHERE fee_status = 'Pending')
  │  ├─ total_due = SUM(total_due)
  │  ├─ total_paid = SUM(paid_amount)
  │  └─ total_pending = SUM(balance)
  │
  └─ Return { summary, fees }
         ↓
Frontend:
  ├─ Render summary cards
  ├─ Render fees table
  └─ Set up modal handlers
```

---

## Carry-Forward Accounting Logic

```
MONTH 1 (November)
┌────────────────────┐
│ Monthly Rent:  5000│
│ Paid:          0   │
│ Balance:       5000│ ← UNPAID
└────────────────────┘

MONTH 2 (December) - Auto Generated
Query: SELECT SUM(balance) FROM monthly_fees WHERE student_id = 1 AND fee_month < '2025-12'
Result: 5000

┌────────────────────────────────┐
│ Rent:           5000           │
│ + Carry Forward: 5000 ← From Nov│
│ = Total Due:   10000           │
│ - Paid:           0            │
│ = Balance:    10000            │
│ Status: Pending                │
└────────────────────────────────┘

MONTH 3 (January)
Query: SELECT SUM(balance) FROM monthly_fees WHERE student_id = 1 AND fee_month < '2025-01'
Result: 10000 (from December, if still unpaid)

If student paid 6000 in December:
┌────────────────────────────────┐
│ Carry Forward in Jan: 4000     │
│ New Rent:            5000      │
│ Total Due:           9000      │
└────────────────────────────────┘
```

---

## API Endpoint Details

### GET /api/monthly-fees/summary
**Purpose:** Get current month summary and all fees

**Query Params:**
- `fee_month` (optional): YYYY-MM format, defaults to current month
- `hostelId` (optional): Filter by hostel

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_students": 50,
      "fully_paid": 35,
      "partially_paid": 10,
      "pending": 5,
      "total_due": 75000,
      "total_paid": 150000,
      "total_pending": 25000,
      "month": "2025-12"
    },
    "fees": [...]
  }
}
```

### POST /api/monthly-fees/:feeId/payment
**Purpose:** Record a payment

**Body:**
```json
{
  "fee_id": 1,
  "student_id": 101,
  "hostel_id": 1,
  "amount": 5000,
  "payment_date": "2025-12-07",
  "payment_method": "Cash",
  "transaction_id": null,
  "receipt_number": "RCP001",
  "notes": "Full payment"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "payment_id": 1,
    "paid_amount": 5000,
    "balance": 5000,
    "fee_status": "Partially Paid"
  }
}
```

### PUT /api/monthly-fees/:feeId
**Purpose:** Edit current month fee

**Constraints:** Only current month allowed

**Body:**
```json
{
  "monthly_rent": 5000,
  "carry_forward": 1000,
  "due_date": "2025-12-15",
  "notes": "Updated rent"
}
```

---

## State Management (Frontend)

```typescript
// Main state
const [currentMonth, setCurrentMonth] = useState("2025-12")
const [summary, setSummary] = useState<MonthlySummary>()
const [fees, setFees] = useState<MonthlyFee[]>()
const [selectedFee, setSelectedFee] = useState<MonthlyFee | null>()
const [loading, setLoading] = useState(true)

// Modal visibility
const [showPaymentModal, setShowPaymentModal] = useState(false)
const [showEditFeeModal, setShowEditFeeModal] = useState(false)
const [showPaymentHistoryModal, setShowPaymentHistoryModal] = useState(false)

// Form states
const [paymentForm, setPaymentForm] = useState<PaymentFormData>()
const [editFeeForm, setEditFeeForm] = useState<EditFeeFormData>()
const [feePayments, setFeePayments] = useState<FeePayment[]>()
```

---

## Authorization & Security

```
Request Flow:
User makes API request
         ↓
Include JWT token in header
         ↓
authMiddleware
  ├─ Check token exists
  ├─ Verify token signature
  ├─ Decode user info
  └─ Attach user to request
         ↓
Controller function
  ├─ Check user.role
  ├─ If hostel owner:
  │  └─ Verify hostel_id matches user.hostel_id
  ├─ If current month edit:
  │  └─ Verify fee_month = current month
  └─ Proceed with operation
         ↓
Return response
```

---

## Database Relationships

```
students (1) ──────────────── (many) monthly_fees
    ↓                              ↓
  user                        fee_payments (many)
    ↓                              ↓
  role                        fee_history (many)
    ↓
(hostel_id)


monthly_fees (1) ──────────────── (many) fee_payments
    ↓                                   ↓
fee_history                         (payment details)

monthly_fees (1) ──────────────── (many) fee_history
    ↓                                ↓
(audit log)                    (change tracking)
```

---

## Performance Optimizations

### Indexes Created
```sql
-- monthly_fees table
CREATE INDEX idx_student_id ON monthly_fees(student_id);
CREATE INDEX idx_hostel_id ON monthly_fees(hostel_id);
CREATE INDEX idx_fee_month ON monthly_fees(fee_month);
CREATE INDEX idx_fee_status ON monthly_fees(fee_status);
CREATE INDEX idx_due_date ON monthly_fees(due_date);

-- fee_payments table
CREATE INDEX idx_fee_id ON fee_payments(fee_id);
CREATE INDEX idx_student_id ON fee_payments(student_id);
CREATE INDEX idx_payment_date ON fee_payments(payment_date);

-- students table
CREATE INDEX idx_fee_status ON students(fee_status);
```

### Query Optimization
- Indexes on FK and common WHERE/ORDER BY columns
- Aggregations at DB level (SUM, COUNT)
- Single query for summary (no N+1)
- Selective column selection
- Proper JOIN conditions

### Frontend Optimization
- Component-level state caching
- No unnecessary re-renders
- Lazy modal rendering
- Async API calls
- Loading states for UX

---

## Cron Job Execution Timeline

```
    1st of Month
         │
         ├─ 12:01 AM → startMonthlyDuesGenerationJob()
         │   └─ Old system for backwards compatibility
         │
         ├─ 12:05 AM → startMonthlyFeesGenerationJob()
         │   └─ New clean monthly fee records
         │
         └─ 12:30 AM onwards → System is stable
              └─ Ready for user access
```

---

## Error Handling Strategy

```
User Action
    ↓
Try Block
    ├─ Validate input
    ├─ Make API call
    ├─ Process response
    └─ Update UI
         ↓
    Error Occurs
         ↓
Catch Block
    ├─ Log error to console
    ├─ Determine error type:
    │  ├─ 400: Show validation toast
    │  ├─ 401: Redirect to login
    │  ├─ 403: Show permission denied
    │  ├─ 404: Show resource not found
    │  └─ 500: Show server error
    ├─ Show user-friendly toast message
    └─ Allow retry
         ↓
User sees error message
```

---

## Transaction Safety

All critical operations use database transactions:

```sql
START TRANSACTION;

  INSERT INTO fee_payments (...);
  UPDATE monthly_fees SET paid_amount = ..., balance = ...;
  INSERT INTO fee_history (...);

COMMIT;

-- If error occurs: ROLLBACK; (automatic)
```

This ensures:
- Atomicity: All or nothing
- Consistency: No partial updates
- Isolation: No interference
- Durability: Persisted to disk

---

## Deployment Architecture

```
Production Environment
│
├─ Web Server (Frontend)
│  ├─ React SPA
│  ├─ TypeScript compiled
│  ├─ Static files served
│  └─ Port 5173 (or configured)
│
├─ API Server (Backend)
│  ├─ Express.js
│  ├─ Node.js runtime
│  ├─ Cron jobs running
│  └─ Port 8081 (or configured)
│
└─ Database Server (MySQL)
   ├─ monthly_fees table
   ├─ fee_payments table
   ├─ fee_history table
   ├─ Backups running
   └─ Port 3306 (or configured)

All connected via:
├─ REST API (HTTP/HTTPS)
├─ JWT Authentication
└─ Encrypted connections
```

---

## Summary

This system provides a complete monthly fee management solution with:
- ✅ Automated fee generation
- ✅ Carry-forward accounting
- ✅ Payment tracking
- ✅ Audit logging
- ✅ Secure authorization
- ✅ Transaction support
- ✅ Optimized queries
- ✅ Comprehensive error handling

All components are integrated, tested, and ready for production deployment.
