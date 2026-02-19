# ID Proof Number Validation System

## Overview
The ID Proof Number field now has comprehensive validation based on the selected ID Proof Type. Validation includes:
1. **Required field check** - Can't be empty
2. **Length validation** - Min and max characters based on type
3. **Format validation** - Regex pattern matching based on type
4. **User-friendly hints** - Shows expected format before submission

## Validation Rules by ID Proof Type

### Aadhar Card
- **Code**: AADHAR
- **Format**: 12 digits only
- **Regex**: `^[0-9]{12}$`
- **Length**: Exactly 12 characters
- **Example**: `123456789012`

### PAN Card
- **Code**: PAN
- **Format**: 5 uppercase letters + 4 digits + 1 uppercase letter
- **Regex**: `^[A-Z]{5}[0-9]{4}[A-Z]{1}$`
- **Length**: Exactly 10 characters
- **Example**: `ABCDE1234F`

### Voter ID
- **Code**: VOTER
- **Format**: 10 alphanumeric characters
- **Regex**: `^[A-Z0-9]{10}$`
- **Length**: Exactly 10 characters
- **Example**: `ABC1234DEF5`

### Driving License
- **Code**: DL
- **Format**: 13-16 alphanumeric characters
- **Regex**: `^[A-Z0-9]{13,16}$`
- **Length**: 13-16 characters
- **Example**: `DL1234567890123` (15 chars)

### Passport
- **Code**: PASSPORT
- **Format**: 1 uppercase letter + 7 digits
- **Regex**: `^[A-Z][0-9]{7}$`
- **Length**: Exactly 8 characters
- **Example**: `A12345678`

## Implementation Details

### 1. Helper Function
**Location**: `src/pages/StudentsPage.tsx` (Lines 332-335)

```typescript
const getIdProofTypeRules = () => {
  return idProofTypes.find((type) => type.name === formData.id_proof_type);
};
```

This function finds and returns the validation rules for the currently selected ID proof type.

### 2. Validation Logic
**Location**: `src/pages/StudentsPage.tsx` (Lines 464-486)

```typescript
// ID Proof Number - Required with validation based on selected type
if (!formData.id_proof_number.trim()) {
  errors.id_proof_number = "ID Proof Number is required";
} else {
  // Find the selected ID proof type to get validation rules
  const selectedType = idProofTypes.find(
    (type) => type.name === formData.id_proof_type
  );

  if (selectedType) {
    // Check length
    if (
      formData.id_proof_number.length < selectedType.min_length ||
      formData.id_proof_number.length > selectedType.max_length
    ) {
      errors.id_proof_number = `${selectedType.name} must be ${selectedType.min_length}-${selectedType.max_length} characters`;
    }
    // Check regex pattern
    else if (!new RegExp(selectedType.regex_pattern).test(formData.id_proof_number)) {
      errors.id_proof_number = `Invalid format for ${selectedType.name}`;
    }
  }
}
```

### 3. User Interface Features

#### Placeholder Text
Dynamically shows expected length:
```
"12-12 characters" (for Aadhar)
"10-10 characters" (for PAN)
"13-16 characters" (for Driving License)
```

#### Format Hint
Shows below the input when no error exists:
```
"Format: AADHAR (12-12 characters)"
"Format: PAN (10-10 characters)"
"Format: DL (13-16 characters)"
```

#### Error Messages
Clear, specific error messages:
```
"Aadhar Card must be 12-12 characters"
"Invalid format for PAN Card"
"Driving License must be 13-16 characters"
```

## Validation Flow

```
User selects ID Proof Type
    ↓
Dropdown updates with selected type
    ↓
Placeholder text updates to show expected length
    ↓
Format hint displays below field
    ↓
User enters ID Proof Number
    ↓
onChange event triggered
    ↓
Form validates on Submit:
  - Check if empty
  - Check min/max length against selected type
  - Check regex pattern match
    ↓
If error: Show red border and error message
If success: Allow form submission
```

## User Experience

### Before Selection
```
ID Proof Type: [Select ID Proof Type ▼]
ID Proof Number: [Enter ID proof number]
```

### After Selecting Aadhar Card
```
ID Proof Type: [Aadhar Card ▼]
ID Proof Number: [12-12 characters]
                  Format: AADHAR (12-12 characters)
                  ↑ Hint text appears here
```

### User Enters Wrong Format
```
ID Proof Number: [ABC123456789]  ← Red border
                  Invalid format for Aadhar Card
                  ↑ Error message appears
```

### User Enters Correct Format
```
ID Proof Number: [123456789012]  ← Green/normal border
                  Format: AADHAR (12-12 characters)
                  ↑ Hint text shows
```

## Testing Examples

### Test Case 1: Aadhar Card Validation
1. Select "Aadhar Card"
2. Enter "12345" (too short)
3. Click Register → Error: "Aadhar Card must be 12-12 characters"
4. Change to "123456789012" (correct)
5. Click Register → Passes validation

### Test Case 2: PAN Card Validation
1. Select "PAN Card"
2. Enter "ABCDE1234F" (correct format)
3. Click Register → Passes validation
4. Select and modify to "abcde1234f" (lowercase letters)
5. Click Register → Error: "Invalid format for PAN Card"

### Test Case 3: Driving License Validation
1. Select "Driving License"
2. Placeholder shows "13-16 characters"
3. Enter "DL123" (too short)
4. Error: "Driving License must be 13-16 characters"
5. Enter "DL12345678901" (13 characters, valid)
6. Click Register → Passes validation

### Test Case 4: Passport Validation
1. Select "Passport"
2. Enter "A12345678" (1 letter + 8 digits, too long)
3. Error: "Passport must be 8-8 characters"
4. Change to "A1234567" (correct)
5. Click Register → Passes validation

## Error Messages Reference

| Scenario | Error Message |
|----------|---------------|
| Empty ID Proof Number | "ID Proof Number is required" |
| Wrong length | "{Type} must be {min}-{max} characters" |
| Wrong format | "Invalid format for {Type}" |

## Code Locations

| Component | File | Lines |
|-----------|------|-------|
| State | StudentsPage.tsx | 77 |
| Fetch Function | StudentsPage.tsx | 312-329 |
| useEffect Call | StudentsPage.tsx | 144 |
| Helper Function | StudentsPage.tsx | 332-335 |
| Validation Logic | StudentsPage.tsx | 464-486 |
| Mobile Input Field | StudentsPage.tsx | 1659-1681 |
| Desktop Input Field | StudentsPage.tsx | 2107-2129 |

## Validation Process

### Step 1: Type Selection
- User selects ID Proof Type from dropdown
- Helper function can retrieve rules for selected type

### Step 2: Input Field Display
- Placeholder text updates with expected length
- Format hint shows below field

### Step 3: Form Submission
- validateForm() is called
- Checks if ID Proof Number exists
- Finds selected type's validation rules
- Validates length against min/max
- Tests against regex pattern
- Returns errors object

### Step 4: Error Display
- If errors exist, error message displays in red below field
- Field border turns red
- Form doesn't submit

### Step 5: Success
- If no errors, field remains normal
- Hint text continues to show
- Form submits successfully

## Database Connection

Validation rules come from the `id_proof_types` table:

```sql
SELECT
  id,
  code,
  name,
  regex_pattern,
  min_length,
  max_length
FROM id_proof_types
WHERE is_active = 1
ORDER BY display_order
```

These are fetched via API endpoint: `GET /api/id-proof-types`

## Fallback Behavior

If API fails, uses default validation rules with hardcoded patterns:

```typescript
[
  { id: 1, name: "Aadhar Card", code: "AADHAR", regex_pattern: "^[0-9]{12}$", min_length: 12, max_length: 12 },
  { id: 2, name: "PAN Card", code: "PAN", regex_pattern: "^[A-Z]{5}[0-9]{4}[A-Z]{1}$", min_length: 10, max_length: 10 },
  // ... more types
]
```

## Browser Console Debug

To test validation in browser console:

```javascript
// Get the regex pattern
const proofType = idProofTypes.find(t => t.name === "Aadhar Card");
const regex = new RegExp(proofType.regex_pattern);

// Test a value
const testValue = "123456789012";
console.log(regex.test(testValue)); // true or false
```

## Future Enhancements

1. **Auto-format**: Automatically format input as user types
2. **Real-time feedback**: Validate as user types (not just on submit)
3. **Visual indicators**: Green checkmark when valid format
4. **Copy-paste validation**: Detect and clean pasted values
5. **Country-specific rules**: Different validation for different countries
6. **Barcode scanning**: Validate barcode formats
7. **Database verification**: Cross-check with government databases

## Performance Considerations

- Helper function calls are minimal (only when needed)
- Regex compilation happens on form validation (not on every keystroke)
- ID proof types are fetched once on page load
- No API calls during validation

## Accessibility

- Error messages are semantic HTML
- Red color combined with text for color-blind users
- Placeholder text provides hint without being permanent label
- Tab navigation works normally through all fields

## Browser Support

- Works on all modern browsers
- RegExp is native JavaScript
- No external libraries required
- Fallback works if API is unavailable

---

**Status**: ✅ Complete and Ready for Testing
**Last Updated**: 2025-01-10
