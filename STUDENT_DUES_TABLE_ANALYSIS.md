# Student Dues Table - Complete Structure Analysis

## Table: `student_dues`

### Purpose
Tracks outstanding dues (unpaid fees) for each student by month and fee category.

---

## Complete Column Structure (15 Columns)

### 1. Primary Key
| Column | Type | Null | Default | Description |
|--------|------|------|---------|-------------|
| `due_id` | INT | NO | AUTO_INCREMENT | Primary key, unique identifier |

### 2. Foreign Keys
| Column | Type | Null | Description |
|--------|------|------|-------------|
| `student_id` | INT | NO | Foreign key to `students.student_id` |
| `hostel_id` | INT | NO | Foreign key to `hostel_master.hostel_id` |
| `fee_category_id` | INT | YES | Foreign key to `fee_structure.fee_structure_id` (nullable) |

### 3. Month & Category
| Column | Type | Null | Description |
|--------|------|------|-------------|
| `due_month` | VARCHAR(20) | NO | Month identifier (format: "YYYY-MM", e.g., "2024-01") |

### 4. Amount Tracking
| Column | Type | Null | Default | Description |
|--------|------|------|---------|-------------|
| `due_amount` | DECIMAL(10,2) | NO | - | Original amount due (e.g., ₹5000) |
| `paid_amount` | DECIMAL(10,2) | YES | 0.00 | Amount paid so far (e.g., ₹2000) |
| `balance_amount` | DECIMAL(10,2) | NO | - | Remaining balance (due_amount - paid_amount) |

**Formula**: `balance_amount = due_amount - paid_amount`

### 5. Carry Forward Tracking
| Column | Type | Null | Default | Description |
|--------|------|------|---------|-------------|
| `is_carried_forward` | BOOLEAN/TINYINT(1) | YES | 0 | Whether this due was carried from previous month |
| `carried_from_month` | VARCHAR(20) | YES | NULL | Which month it was carried from (e.g., "2024-01") |

### 6. Payment Status
| Column | Type | Null | Default | Description |
|--------|------|------|---------|-------------|
| `is_paid` | BOOLEAN/TINYINT(1) | YES | 0 | Payment status: 0 = unpaid, 1 = fully paid |
| `paid_date` | DATE | YES | NULL | Date when fully paid (NULL if not paid) |
| `due_date` | DATE | NO | - | Last date to pay (e.g., 2024-01-15) |

### 7. Audit Columns
| Column | Type | Null | Default | Description |
|--------|------|------|---------|-------------|
| `created_at` | TIMESTAMP | YES | CURRENT_TIMESTAMP | Record creation time |
| `updated_at` | TIMESTAMP | YES | CURRENT_TIMESTAMP ON UPDATE | Last update time |

---

## Indexes

### Primary Key
- `due_id` (PRI) - Unique identifier

### Foreign Key Indexes
- `student_id` (MUL) - Links to `students` table
- `hostel_id` (MUL) - Links to `hostel_master` table
- `fee_category_id` (MUL) - Links to `fee_structure` table

### Additional Indexes
- `idx_student_dues_category` - On `fee_category_id`
- `idx_student_dues_month` - On `due_month`
- `idx_student_dues_student_month` - Composite on `(student_id, due_month)`

---

## Data Flow Examples

### Example 1: New Monthly Due Created
```sql
INSERT INTO student_dues (
  student_id, hostel_id, fee_category_id, due_month,
  due_amount, paid_amount, balance_amount,
  is_carried_forward, carried_from_month,
  due_date, is_paid, paid_date
) VALUES (
  101,                    -- student_id
  5,                      -- hostel_id
  1,                      -- fee_category_id (Monthly Rent)
  '2024-01',              -- due_month
  5000.00,                -- due_amount
  0.00,                   -- paid_amount
  5000.00,                -- balance_amount
  0,                      -- is_carried_forward (new, not carried)
  NULL,                   -- carried_from_month
  '2024-01-15',           -- due_date
  0,                      -- is_paid (unpaid)
  NULL                    -- paid_date
);
```

### Example 2: Partial Payment Made
```sql
UPDATE student_dues
SET paid_amount = 2000.00,
    balance_amount = 3000.00,  -- 5000 - 2000
    is_paid = 0,               -- Still not fully paid
    updated_at = NOW()
WHERE due_id = 1;
```

### Example 3: Full Payment Made
```sql
UPDATE student_dues
SET paid_amount = 5000.00,
    balance_amount = 0.00,
    is_paid = 1,               -- Fully paid
    paid_date = '2024-01-20',
    updated_at = NOW()
WHERE due_id = 1;
```

### Example 4: Carry Forward from Previous Month
```sql
-- When generating dues for February, carry forward unpaid January dues
INSERT INTO student_dues (
  student_id, hostel_id, fee_category_id, due_month,
  due_amount, paid_amount, balance_amount,
  is_carried_forward, carried_from_month,
  due_date, is_paid, paid_date
) VALUES (
  101,                    -- student_id
  5,                      -- hostel_id
  1,                      -- fee_category_id
  '2024-02',              -- due_month (new month)
  3000.00,                -- due_amount (unpaid balance from Jan)
  0.00,                   -- paid_amount
  3000.00,                -- balance_amount
  1,                      -- is_carried_forward (YES)
  '2024-01',              -- carried_from_month
  '2024-02-15',           -- due_date
  0,                      -- is_paid
  NULL                    -- paid_date
);
```

---

## Common Queries

### Get All Unpaid Dues
```sql
SELECT * FROM student_dues
WHERE is_paid = 0;
```

### Get Dues for Specific Month
```sql
SELECT * FROM student_dues
WHERE due_month = '2024-01';
```

### Get Overdue Payments
```sql
SELECT * FROM student_dues
WHERE is_paid = 0
AND due_date < CURDATE();
```

### Get Carried Forward Dues
```sql
SELECT * FROM student_dues
WHERE is_carried_forward = 1;
```

### Get Student's Total Unpaid Dues
```sql
SELECT 
  student_id,
  SUM(balance_amount) as total_unpaid
FROM student_dues
WHERE is_paid = 0
GROUP BY student_id;
```

### Get Dues by Fee Category
```sql
SELECT 
  sd.*,
  fs.fee_type
FROM student_dues sd
LEFT JOIN fee_structure fs ON sd.fee_category_id = fs.fee_structure_id
WHERE sd.student_id = 101;
```

---

## Relationships

```
┌─────────────────┐
│   students      │
│  student_id PK  │────┐
└─────────────────┘    │
                       │
┌─────────────────┐    │    ┌─────────────────┐
│ hostel_master   │    │    │ fee_structure   │
│  hostel_id PK   │────┼────│fee_structure_id │
└─────────────────┘    │    └─────────────────┘
                       │             │
                       ▼             ▼
              ┌─────────────────────────┐
              │    student_dues         │
              │  due_id PK              │
              │  student_id FK          │
              │  hostel_id FK           │
              │  fee_category_id FK      │
              │  due_month              │
              │  due_amount             │
              │  paid_amount            │
              │  balance_amount         │
              │  is_paid                │
              │  is_carried_forward     │
              └─────────────────────────┘
```

---

## Key Points

1. **One record per student per month per fee category**
   - A student can have multiple dues in the same month (e.g., Rent, Electricity, Maintenance)

2. **Carry Forward Logic**
   - Unpaid dues from previous months are carried forward to the next month
   - `is_carried_forward = 1` indicates a carried forward due
   - `carried_from_month` tracks the original month

3. **Payment Tracking**
   - `paid_amount` can be partial (e.g., ₹2000 out of ₹5000)
   - `is_paid = 1` only when `balance_amount = 0`
   - `paid_date` is set when fully paid

4. **Status Calculation**
   - **Unpaid**: `is_paid = 0` AND `balance_amount > 0`
   - **Partially Paid**: `is_paid = 0` AND `paid_amount > 0` AND `balance_amount > 0`
   - **Fully Paid**: `is_paid = 1` AND `balance_amount = 0`

5. **Month Format**
   - Always use "YYYY-MM" format (e.g., "2024-01", "2024-12")
   - Used for filtering and grouping dues by month

---

## Migration History

### Original Schema (Basic)
- `due_id`, `student_id`, `hostel_id`, `due_month`
- `due_amount`, `paid_amount`, `balance_amount`
- `due_date`, `is_paid`
- `created_at`, `updated_at`

### Added in Migration (`add_fee_categories_support.sql`)
- `fee_category_id` - Links to fee categories
- `is_carried_forward` - Tracks carried forward dues
- `carried_from_month` - Original month for carried dues
- `paid_date` - Date when fully paid

---

## Current Usage in Codebase

### Controllers Using `student_dues`:
1. **feeController.ts**
   - `getStudentDues()` - Get unpaid dues
   - `generateMonthlyDues()` - Create monthly dues
   - `recordPayment()` - Update paid amounts

2. **studentController.ts**
   - `getStudentById()` - Get student's pending dues
   - `deleteStudent()` - Delete student's dues

3. **reportController.ts**
   - Dashboard statistics
   - Pending dues calculations

### Jobs Using `student_dues`:
- `monthlyDuesGeneration.ts` - Auto-generate monthly dues

---

## Notes

- The table supports **multiple fee categories** per student per month
- **Carry forward** ensures unpaid dues are not lost
- **Partial payments** are supported (paid_amount can be less than due_amount)
- All amounts are stored as `DECIMAL(10,2)` for precision







