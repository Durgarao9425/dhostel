# Quick Start - Fee Management System

## Problem You're Facing
**Error:** `Unknown column 'sd.is_carried_forward' in 'field list'`

**Cause:** Database migration not applied yet

---

## Solution (Choose ONE method)

### Method 1: Automatic Script (Easiest) ⭐

```bash
cd d:\Hostel\backend
node scripts/apply-migration.js
```

This script will:
- ✅ Read the migration file
- ✅ Apply all SQL changes
- ✅ Verify columns were added
- ✅ Show you the results

### Method 2: Check Status First

```bash
cd d:\Hostel\backend
node scripts/check-database-status.js
```

This shows you what's missing and what needs to be done.

### Method 3: Manual MySQL Command

```bash
cd d:\Hostel\backend\migrations
mysql -u root -p hostel_management < add_fee_categories_support.sql
```

Replace:
- `root` with your MySQL username
- `hostel_management` with your database name

### Method 4: MySQL Workbench

1. Open MySQL Workbench
2. Open file: `d:\Hostel\backend\migrations\add_fee_categories_support.sql`
3. Click Execute (⚡ icon)

---

## After Migration

### 1. Restart Backend
```bash
cd d:\Hostel\backend
npm run dev
```

### 2. Refresh Frontend
- Press `Ctrl + Shift + R` (hard refresh)
- Or `Ctrl + F5`

### 3. Check Fees Page
Navigate to Fees Management - you should see:
- ✅ All registered students
- ✅ Summary cards (Total Students, Pending Dues, etc.)
- ✅ Search bar working
- ✅ 4 tabs (All Students, Pending, Paid, History)

---

## Still Not Working?

Run the database status checker:
```bash
node scripts/check-database-status.js
```

This will tell you exactly what's wrong.

---

## Need to Generate Dues?

The system auto-generates dues on the 1st of each month. To generate manually:

**Option 1: Via API**
```bash
curl -X POST http://localhost:8081/api/fees/generate-dues \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"hostel_id": 1, "month_year": "2025-11"}'
```

**Option 2: Add a button in UI**
Let me know if you want me to add a "Generate Dues" button in the frontend.

---

## Complete Documentation

See [COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md) for detailed troubleshooting.
