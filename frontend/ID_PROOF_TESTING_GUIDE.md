# ID Proof Validation - Quick Testing Guide

## Quick Start: How to Test

### 1. Start the Application
```bash
# Backend (in backend folder)
npm run dev

# Frontend (in frontend folder)
npm run dev
```

### 2. Navigate to Students Page
- Click on "Students" in the left menu
- Click "Add Student" button

### 3. Test Each ID Proof Type

---

## Test Cases by Type

### Test 1: Aadhar Card (12 digits exactly)

#### Test 1a: Invalid Characters Are Removed
```
1. Select ID Proof Type: "Aadhar Card"
2. Type: "123-456-AB789CD"
3. Expected: Only "123456" appears
4. Result: ✅ Pass if only digits are entered
```

#### Test 1b: Cannot Type More Than 12 Digits
```
1. ID Proof Type: "Aadhar Card"
2. Try to type: "1234567890123" (13 digits)
3. Expected: Only "123456789012" (12 digits) is entered
4. Result: ✅ Pass if input stops at 12 digits
```

#### Test 1c: Error on Submit (< 12 digits)
```
1. ID Proof Type: "Aadhar Card"
2. Enter: "12345" (5 digits)
3. Click Register
4. Expected: Red border + "Aadhar Card must be 12-12 characters"
5. Result: ✅ Pass if error appears
```

#### Test 1d: Error Clears When Corrected
```
1. Enter "12345" (shows error)
2. Type more digits: "1234567890" (becomes 15 digits total)
3. Only "123456789012" should remain (capped at 12)
4. Expected: Error should disappear
5. Result: ✅ Pass if error clears
```

#### Test 1e: Successful Submission
```
1. Enter: "123456789012" (exactly 12 digits)
2. Click Register
3. Expected: Form submits (no error, no red border)
4. Result: ✅ Pass if form submits
```

---

### Test 2: PAN Card (5L+4D+1L = 10 chars)

#### Test 2a: Lowercase Converted to Uppercase
```
1. Select ID Proof Type: "PAN Card"
2. Type: "abcde1234f"
3. Expected: "ABCDE1234F" appears
4. Result: ✅ Pass if auto-converted to uppercase
```

#### Test 2b: Special Characters Removed
```
1. ID Proof Type: "PAN Card"
2. Type: "ABC!DE@1234#F"
3. Expected: "ABCDE1234F" appears
4. Result: ✅ Pass if only alphanumeric remains
```

#### Test 2c: Cannot Type More Than 10 Characters
```
1. ID Proof Type: "PAN Card"
2. Try to type: "ABCDE12345F" (11 chars)
3. Expected: Only "ABCDE1234F" (10 chars) is entered
4. Result: ✅ Pass if input stops at 10
```

#### Test 2d: Error on Wrong Format
```
1. ID Proof Type: "PAN Card"
2. Enter: "ABC1234DEF5" (wrong format)
3. Click Register
4. Expected: Red border + "Invalid format for PAN Card"
5. Result: ✅ Pass if error appears
```

#### Test 2e: Successful Submission
```
1. Enter: "ABCDE1234F" (correct format)
2. Click Register
3. Expected: Form submits
4. Result: ✅ Pass if form submits
```

---

### Test 3: Voter ID (10 alphanumeric)

#### Test 3a: Accepts Letters and Digits
```
1. Select ID Proof Type: "Voter ID"
2. Type: "ABC1234DEF5"
3. Expected: All characters accepted
4. Result: ✅ Pass if 10 characters entered
```

#### Test 3b: Lowercase Converted to Uppercase
```
1. ID Proof Type: "Voter ID"
2. Type: "abc1234def5"
3. Expected: "ABC1234DEF5" appears
4. Result: ✅ Pass if auto-converted
```

#### Test 3c: Cannot Type More Than 10
```
1. ID Proof Type: "Voter ID"
2. Try to type: "ABC1234DEF5X" (11 chars)
3. Expected: Only "ABC1234DEF5" is entered
4. Result: ✅ Pass if input stops at 10
```

#### Test 3d: Error on Submit (< 10)
```
1. ID Proof Type: "Voter ID"
2. Enter: "ABC123" (6 chars)
3. Click Register
4. Expected: Red border + "Voter ID must be 10-10 characters"
5. Result: ✅ Pass if error appears
```

#### Test 3e: Successful Submission
```
1. Enter: "ABC1234DEF5"
2. Click Register
3. Expected: Form submits
4. Result: ✅ Pass if form submits
```

---

### Test 4: Driving License (13-16 alphanumeric)

#### Test 4a: Accepts Range 13-16 Characters
```
1. Select ID Proof Type: "Driving License"
2. Enter: "DL12345678901" (13 chars) - Valid
3. Enter: "DL123456789012345" (16 chars) - Valid
4. Expected: Both accepted
5. Result: ✅ Pass if both entries work
```

#### Test 4b: Cannot Type More Than 16
```
1. ID Proof Type: "Driving License"
2. Try to type: "DL123456789012345X" (17 chars)
3. Expected: Only 16 characters entered
4. Result: ✅ Pass if input stops at 16
```

#### Test 4c: Error on Too Short (< 13)
```
1. ID Proof Type: "Driving License"
2. Enter: "DL123456789" (11 chars)
3. Click Register
4. Expected: Red border + "Driving License must be 13-16 characters"
5. Result: ✅ Pass if error appears
```

#### Test 4d: Error on Too Long (> 16)
```
1. ID Proof Type: "Driving License"
2. Try to type: "DL123456789012345X" (17 chars)
3. Expected: Input stops at 16, no error yet
4. If you had a 16-char value and submit: ✅ Pass
5. Result: ✅ Pass if validation correct
```

#### Test 4e: Successful Submission
```
1. Enter: "DL123456789012" (14 chars)
2. Click Register
3. Expected: Form submits
4. Result: ✅ Pass if form submits
```

---

### Test 5: Passport (1L+7D = 8 chars)

#### Test 5a: Accepts 1 Letter + 7 Digits
```
1. Select ID Proof Type: "Passport"
2. Type: "A1234567"
3. Expected: All characters accepted (8 chars)
4. Result: ✅ Pass if accepted
```

#### Test 5b: Cannot Type More Than 8
```
1. ID Proof Type: "Passport"
2. Try to type: "A12345678" (9 chars)
3. Expected: Only "A1234567" is entered
4. Result: ✅ Pass if input stops at 8
```

#### Test 5c: Error on Wrong Format
```
1. ID Proof Type: "Passport"
2. Enter: "12345678" (all digits, no letter)
3. Click Register
4. Expected: Red border + "Invalid format for Passport"
5. Result: ✅ Pass if error appears
```

#### Test 5d: Error on Wrong Format (all letters)
```
1. ID Proof Type: "Passport"
2. Type: "ABCDEFGH"
3. Click Register
4. Expected: Red border + "Invalid format for Passport"
5. Result: ✅ Pass if error appears
```

#### Test 5e: Successful Submission
```
1. Enter: "A1234567"
2. Click Register
3. Expected: Form submits
4. Result: ✅ Pass if form submits
```

---

## Additional Tests

### Test 6: No Type Selected
```
1. Do NOT select an ID Proof Type
2. Try to type anything: "abc!@#123xyz"
3. Expected: Everything accepted (no filtering)
4. Click Register
5. Expected: Error "ID Proof Type is required" or similar
6. Result: ✅ Pass if validation requires type selection
```

### Test 7: Type Change (Important!)
```
1. Select "Aadhar Card", type: "123456789012"
2. Change to "PAN Card"
3. Previous digits should now show as invalid
4. Clear field and type: "ABCDE1234F"
5. Click Register
6. Expected: PAN format validation applies
7. Result: ✅ Pass if validation switches with type
```

### Test 8: Mobile vs Desktop
```
1. Open form on mobile view (resize browser or use mobile device)
2. Test Aadhar Card: Type "123-456-AB789CD"
3. Expected: Only "123456" appears
4. Resize to desktop view
5. Test PAN Card: Type "abcde1234f"
6. Expected: "ABCDE1234F" appears
7. Result: ✅ Pass if both views work
```

### Test 9: Copy/Paste
```
1. Select "Aadhar Card"
2. Copy "123-456-AB789CD" from somewhere
3. Paste into field
4. Expected: "123456" appears (filtering applies)
5. Result: ✅ Pass if paste is filtered
```

### Test 10: Placeholder Text Updates
```
1. No type selected: Placeholder shows "Enter ID proof number"
2. Select "Aadhar Card": Placeholder shows "12-12 characters"
3. Select "PAN Card": Placeholder shows "10-10 characters"
4. Select "Driving License": Placeholder shows "13-16 characters"
5. Result: ✅ Pass if placeholders update dynamically
```

---

## Visual Checklist

### Field States to Verify

#### ✅ Valid State (Correct Input)
- [ ] No red border
- [ ] No error message
- [ ] Format hint visible below field
- [ ] Placeholder shows expected length

#### ✅ Invalid State (Wrong Input)
- [ ] Red border around field
- [ ] Red error message below field
- [ ] Format hint hidden
- [ ] Error message is specific (not generic)

#### ✅ Empty State
- [ ] No error initially
- [ ] Only shows error on submit

#### ✅ Typing State
- [ ] Characters filter in real-time
- [ ] No lag or delay
- [ ] Error clears as user corrects

---

## Debugging Tips

### If Validation Not Working
1. Open Developer Tools (F12)
2. Check Console tab for errors
3. Look for messages like:
   - "❌ Length validation FAILED"
   - "❌ Regex validation FAILED"
   - "⚠️ ID Proof Type NOT found"

### If Dropdown Empty
1. Backend running? (`npm run dev`)
2. ID proof types table initialized? (`npm run init:id-proof-types`)
3. Check Network tab for `/api/id-proof-types` request

### If Filtering Not Working
1. Check if correct type is selected
2. Verify `idProofTypes` state is populated
3. Check console for `getIdProofTypeRules()` output

---

## Success Criteria

✅ All 5 ID proof types validate correctly
✅ Real-time character filtering works
✅ Maximum length enforcement works
✅ Form submission validation works
✅ Error messages display correctly
✅ Mobile and desktop both work
✅ Type switching changes validation rules
✅ Placeholder text updates dynamically

---

**Test Date**: _____________
**Tester Name**: _____________
**Status**: [ ] All Pass [ ] Some Fail [ ] Issues Found

**Notes**:
