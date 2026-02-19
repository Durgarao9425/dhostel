# Simple Frontend Hostel Filter - No Additional API Calls Needed!

## Current Situation ✅

The API `/api/fees/all-students` **already returns** `hostel_id` in the response:

```json
{
  "student_id": 16,
  "first_name": "Jakkireddy",
  "last_name": "Mahendrareddy",
  "hostel_id": 5,        ← Already included!
  "hostel_name": "Risheek Boys Hostel",
  "room_number": "101",
  "phone": "7569850712"
}
```

**Solution**: Filter on the frontend using existing data!

---

## Frontend Code Changes

### File: `frontend/src/pages/EnhancedFeesPage.tsx`

### Step 1: Add State for Hostel Selection

Add after line 72 (after `searchTerm` state):

```typescript
// Add hostel filter state
const [selectedHostelId, setSelectedHostelId] = useState<number | null>(null);
const [availableHostels, setAvailableHostels] = useState<Array<{hostel_id: number, hostel_name: string}>>([]);
```

### Step 2: Extract Hostels from Students Data

Update the `fetchAllData` function (around line 103), add this AFTER setting students:

```typescript
const fetchAllData = async () => {
  try {
    setLoading(true);
    const [studentsRes, paymentsRes] = await Promise.all([
      api.get('/fees/all-students'),
      api.get('/fees/payments')
    ]);

    const students = studentsRes.data.data;
    setAllStudents(students);
    setPayments(paymentsRes.data.data);

    // ✅ EXTRACT UNIQUE HOSTELS FROM STUDENT DATA
    const hostelsMap = new Map();
    students.forEach((s: StudentWithDues) => {
      if (s.hostel_id && !hostelsMap.has(s.hostel_id)) {
        hostelsMap.set(s.hostel_id, s.hostel_name);
      }
    });

    const hostels = Array.from(hostelsMap.entries()).map(([id, name]) => ({
      hostel_id: id,
      hostel_name: name
    }));

    setAvailableHostels(hostels);

    // Auto-select first hostel if none selected
    if (!selectedHostelId && hostels.length > 0) {
      setSelectedHostelId(hostels[0].hostel_id);
    }

    // ... rest of stats calculation
  }
};
```

### Step 3: Update filterStudents Function

Modify the `filterStudents` function (around line 146) to include hostel filter:

```typescript
const filterStudents = () => {
  let filtered = [...allStudents];

  // ✅ FILTER BY SELECTED HOSTEL
  if (selectedHostelId) {
    filtered = filtered.filter(s => s.hostel_id === selectedHostelId);
  }

  // Filter by tab
  switch (activeTab) {
    case 'pending':
      filtered = filtered.filter(s => s.total_dues > 0);
      break;
    case 'paid':
      filtered = filtered.filter(s => s.payment_status === 'Paid');
      break;
    case 'payments':
      return; // No filtering for payments tab
    case 'all':
    default:
      break;
  }

  // Search filter
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(s =>
      s.student_name.toLowerCase().includes(term) ||
      s.phone?.includes(term) ||
      s.room_number?.toLowerCase().includes(term) ||
      s.email?.toLowerCase().includes(term)
    );
  }

  setFilteredStudents(filtered);
};
```

### Step 4: Update useEffect Dependencies

Update the useEffect (around line 99) to refetch when hostel changes:

```typescript
useEffect(() => {
  filterStudents();
}, [activeTab, searchTerm, allStudents, selectedHostelId]); // ← Add selectedHostelId
```

### Step 5: Add Hostel Selector Dropdown in UI

Add this AFTER the header (around line 288) and BEFORE the summary cards:

```typescript
{/* Hostel Selector Dropdown */}
{availableHostels.length > 1 && (
  <div className="mb-6 bg-white p-4 rounded-lg shadow">
    <div className="flex items-center space-x-4">
      <label className="text-sm font-semibold text-gray-700">
        Select Hostel:
      </label>
      <select
        value={selectedHostelId || ''}
        onChange={(e) => setSelectedHostelId(Number(e.target.value))}
        className="flex-1 max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
      >
        {availableHostels.map((hostel) => (
          <option key={hostel.hostel_id} value={hostel.hostel_id}>
            {hostel.hostel_name}
          </option>
        ))}
      </select>
      <span className="text-sm text-gray-500">
        ({filteredStudents.length} students)
      </span>
    </div>
  </div>
)}
```

---

## Complete Code Snippet

Here's the complete modified section:

```typescript
// State (add to existing states around line 72)
const [selectedHostelId, setSelectedHostelId] = useState<number | null>(null);
const [availableHostels, setAvailableHostels] = useState<Array<{hostel_id: number, hostel_name: string}>>([]);

// Update fetchAllData function
const fetchAllData = async () => {
  try {
    setLoading(true);
    const [studentsRes, paymentsRes] = await Promise.all([
      api.get('/fees/all-students'),
      api.get('/fees/payments')
    ]);

    const students = studentsRes.data.data;
    setAllStudents(students);
    setPayments(paymentsRes.data.data);

    // Extract unique hostels from student data
    const hostelsMap = new Map();
    students.forEach((s: StudentWithDues) => {
      if (s.hostel_id && !hostelsMap.has(s.hostel_id)) {
        hostelsMap.set(s.hostel_id, s.hostel_name);
      }
    });

    const hostels = Array.from(hostelsMap.entries()).map(([id, name]) => ({
      hostel_id: id,
      hostel_name: name
    }));

    setAvailableHostels(hostels);

    // Auto-select first hostel if none selected
    if (!selectedHostelId && hostels.length > 0) {
      setSelectedHostelId(hostels[0].hostel_id);
    }

    // Calculate stats for FILTERED students
    const filteredByHostel = selectedHostelId
      ? students.filter((s: StudentWithDues) => s.hostel_id === selectedHostelId)
      : students;

    const totalStudents = filteredByHostel.length;
    const studentsWithDues = filteredByHostel.filter((s: StudentWithDues) => s.total_dues > 0).length;
    const fullyPaidStudents = filteredByHostel.filter((s: StudentWithDues) => s.payment_status === 'Paid').length;
    const totalPendingAmount = filteredByHostel.reduce((sum: number, s: StudentWithDues) => sum + s.total_dues, 0);
    const totalCollected = filteredByHostel.reduce((sum: number, s: StudentWithDues) => sum + s.total_paid, 0);

    setStats({
      totalStudents,
      studentsWithDues,
      fullyPaidStudents,
      totalPendingAmount,
      totalCollected
    });
  } catch (error) {
    toast.error('Failed to fetch data');
    console.error('Fetch data error:', error);
  } finally {
    setLoading(false);
  }
};

// Update filterStudents
const filterStudents = () => {
  let filtered = [...allStudents];

  // Filter by selected hostel FIRST
  if (selectedHostelId) {
    filtered = filtered.filter(s => s.hostel_id === selectedHostelId);
  }

  // Filter by tab
  switch (activeTab) {
    case 'pending':
      filtered = filtered.filter(s => s.total_dues > 0);
      break;
    case 'paid':
      filtered = filtered.filter(s => s.payment_status === 'Paid');
      break;
    case 'payments':
      return;
    case 'all':
    default:
      break;
  }

  // Search filter
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(s =>
      s.student_name.toLowerCase().includes(term) ||
      s.phone?.includes(term) ||
      s.room_number?.toLowerCase().includes(term) ||
      s.email?.toLowerCase().includes(term)
    );
  }

  setFilteredStudents(filtered);
};

// Update useEffect
useEffect(() => {
  filterStudents();
}, [activeTab, searchTerm, allStudents, selectedHostelId]);

// Update useEffect for initial fetch
useEffect(() => {
  fetchAllData();
  fetchPaymentModes();
}, []);

// Refetch when hostel changes
useEffect(() => {
  if (selectedHostelId && allStudents.length > 0) {
    filterStudents();
  }
}, [selectedHostelId]);
```

---

## How It Works

1. **Fetch all students** from API (includes `hostel_id`)
2. **Extract unique hostels** from student data (no extra API call!)
3. **Show dropdown** with available hostels
4. **Filter students** on frontend when user selects hostel
5. **Update stats** for selected hostel only

---

## Expected Behavior

### Before Selection:
- Shows all 15 students (from Hostels 1, 3, 5)
- Or auto-selects first hostel

### After Selecting "Hostel 5":
- ✅ Shows only 3 students from Hostel 5
- ✅ Dashboard stats update (3 students total)
- ✅ No additional API call needed!

### After Selecting "Hostel 1":
- ✅ Shows only 10 students from Hostel 1
- ✅ Dashboard stats update (10 students total)

---

## Advantages

✅ **No backend changes** - uses existing API
✅ **No extra API calls** - filters existing data
✅ **Fast filtering** - happens on frontend
✅ **Simple implementation** - just filter arrays
✅ **Works with existing code** - minimal changes

---

## Testing

1. Save changes to `EnhancedFeesPage.tsx`
2. Refresh browser
3. You should see dropdown with:
   - Sunrise Boys Hostel
   - TechPark Co-Ed Hostel
   - Risheek Boys Hostel
4. Select "Risheek Boys Hostel"
5. Should show only 3 students!

---

**No additional backend API needed!**
**Just filter on frontend using existing `hostel_id` field!**
