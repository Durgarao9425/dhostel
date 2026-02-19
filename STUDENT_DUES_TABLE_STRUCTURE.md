# Student Dues Table Structure

## Database Table: `student_dues`

**Total Columns**: 15
**Total Rows**: 0 (No data currently)

---

## Column Details

| # | Column Name | Type | Null | Key | Default | Extra | Description |
|---|-------------|------|------|-----|---------|-------|-------------|
| 1 | **due_id** | int | NO | PRI | NULL | auto_increment | Primary key, unique identifier for each due record |
| 2 | **student_id** | int | NO | MUL | NULL | - | Foreign key to students table |
| 3 | **hostel_id** | int | NO | MUL | NULL | - | Foreign key to hostel_master table |
| 4 | **fee_category_id** | int | YES | MUL | NULL | - | Foreign key to fee_structure table (rent, electricity, etc.) |
| 5 | **due_month** | varchar(20) | NO | MUL | NULL | - | Month for which fee is due (format: YYYY-MM) |
| 6 | **due_amount** | decimal(10,2) | NO | - | NULL | - | Original amount due |
| 7 | **paid_amount** | decimal(10,2) | YES | - | 0.00 | - | Amount paid so far |
| 8 | **balance_amount** | decimal(10,2) | NO | - | NULL | - | Remaining balance (due_amount - paid_amount) |
| 9 | **is_carried_forward** | tinyint(1) | YES | - | 0 | - | Whether this due was carried from previous month |
| 10 | **carried_from_month** | varchar(20) | YES | - | NULL | - | Which month it was carried from |
| 11 | **due_date** | date | NO | - | NULL | - | Date by which payment is due |
| 12 | **is_paid** | tinyint(1) | YES | - | 0 | - | Whether fully paid (1) or not (0) |
| 13 | **paid_date** | date | YES | - | NULL | - | Date when fully paid |
| 14 | **created_at** | timestamp | YES | - | CURRENT_TIMESTAMP | DEFAULT_GENERATED | Record creation timestamp |
| 15 | **updated_at** | timestamp | YES | - | CURRENT_TIMESTAMP | on update | Last update timestamp |

---

## Key Columns Explained

### 1. **Identification Columns**
- `due_id` - Unique ID for each due record
- `student_id` - Which student owes this amount
- `hostel_id` - Which hostel this due belongs to
- `fee_category_id` - What type of fee (Monthly Rent, Electricity, etc.)

### 2. **Amount Tracking Columns**
- `due_amount` - Original amount (e.g., ₹5000)
- `paid_amount` - How much paid (e.g., ₹2000)
- `balance_amount` - How much remaining (e.g., ₹3000)
- **Formula**: `balance_amount = due_amount - paid_amount`

### 3. **Date Columns**
- `due_month` - Month identifier (e.g., "2024-01", "2024-02")
- `due_date` - Last date to pay (e.g., 2024-01-15)
- `paid_date` - Date when fully paid (NULL if not paid)

### 4. **Status Columns**
- `is_paid` - Boolean (0 = unpaid, 1 = fully paid)
- `is_carried_forward` - Was this due carried from previous month?
- `carried_from_month` - If carried, from which month?

### 5. **Audit Columns**
- `created_at` - When record was created
- `updated_at` - Last modification time

---

## Indexes (Keys)

### Primary Key
- `due_id` (PRI) - Unique identifier

### Foreign Keys (MUL)
- `student_id` - Links to `students` table
- `hostel_id` - Links to `hostel_master` table
- `fee_category_id` - Links to `fee_structure` table

### Composite Index
- `(student_id, hostel_id, due_month)` - For efficient queries

---

## Data Flow Example

### Month 1: January 2024
```sql
INSERT INTO student_dues VALUES (
  1,                      -- due_id (auto)
  101,                    -- student_id
  5,                      -- hostel_id
  1,                      -- fee_category_id (Monthly Rent)
  '2024-01',              -- due_month
  5000.00,                -- due_amount
  0.00,                   -- paid_amount
  5000.00,                -- balance_amount
  0,                      -- is_carried_forward
  NULL,                   -- carried_from_month
  '2024-01-15',           -- due_date
  0,                      -- is_paid
  NULL,                   -- paid_date
  NOW(),                  -- created_at
  NOW()                   -- updated_at
);
```

### Partial Payment
```sql
UPDATE student_dues
SET paid_amount = 2000.00,
    balance_amount = 3000.00,
    updated_at = NOW()
WHERE due_id = 1;
```

### Month 2: Carry Forward
Since ₹3000 balance remained from January, system creates:
```sql
INSERT INTO student_dues VALUES (
  2,                      -- due_id
  101,                    -- student_id
  5,                      -- hostel_id
  1,                      -- fee_category_id
  '2024-02',              -- due_month
  3000.00,                -- due_amount (carried balance)
  0.00,                   -- paid_amount
  3000.00,                -- balance_amount
  1,                      -- is_carried_forward (YES)
  '2024-01',              -- carried_from_month
  '2024-02-15',           -- due_date
  0,                      -- is_paid
  NULL,                   -- paid_date
  NOW(),
  NOW()
);
```

### Full Payment
```sql
UPDATE student_dues
SET paid_amount = 3000.00,
    balance_amount = 0.00,
    is_paid = 1,
    paid_date = CURDATE(),
    updated_at = NOW()
WHERE due_id = 2;
```

---

## Important Notes

### 1. **No Data Currently**
- Table has 0 rows
- Structure is ready but no dues have been generated
- Need to run monthly dues generation

### 2. **Multiple Fee Categories**
- One student can have multiple dues per month
- Example: Monthly Rent + Electricity + Water charges
- Each fee type creates a separate row

### 3. **Carry Forward System**
- Unpaid dues automatically roll to next month
- Tracked via `is_carried_forward` and `carried_from_month`
- Original month information preserved

### 4. **Partial Payments**
- System supports partial payments
- `paid_amount` can be less than `due_amount`
- `is_paid = 1` only when `balance_amount = 0`

---

## Queries You Can Run

### Get All Unpaid Dues
```sql
SELECT * FROM student_dues
WHERE is_paid = 0
ORDER BY due_date ASC;
```

### Get Student's Total Pending Amount
```sql
SELECT
  student_id,
  SUM(balance_amount) as total_pending
FROM student_dues
WHERE is_paid = 0
GROUP BY student_id;
```

### Get Overdue Payments
```sql
SELECT * FROM student_dues
WHERE is_paid = 0
AND due_date < CURDATE();
```

### Get Dues for Specific Month
```sql
SELECT * FROM student_dues
WHERE due_month = '2024-01';
```

### Get Carried Forward Dues
```sql
SELECT * FROM student_dues
WHERE is_carried_forward = 1;
```

---

## Relationship Diagram

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
              │  fee_category_id FK     │
              │  due_month              │
              │  due_amount             │
              │  paid_amount            │
              │  balance_amount         │
              │  is_paid                │
              └─────────────────────────┘
```

---

## Status

✅ **Table Structure: CORRECT (15 columns)**
⚠️ **Data: EMPTY (0 rows)**

**To populate data**: Run monthly dues generation from Fee Management page or cron job.

---

**Checked By**: Claude (AI Assistant)
**Date**: 2025-11-16
**Database**: Hostel
**Table**: student_dues
