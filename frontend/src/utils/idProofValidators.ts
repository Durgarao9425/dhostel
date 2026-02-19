/**
 * Indian ID Proof Validation Utilities
 * Validates Aadhaar, PAN, Voter ID, and Driving License numbers
 */

// Verhoeff algorithm for Aadhaar checksum validation
const verhoeffTable = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];

const verhoeffPermutation = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

const verhoeffInverse = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];

/**
 * Validates Aadhaar number using Verhoeff algorithm
 */
function verhoeffCheck(aadhaar: string): boolean {
  let check = 0;
  const digits = aadhaar.split('').map(Number).reverse();

  for (let i = 0; i < digits.length; i++) {
    check = verhoeffTable[check][verhoeffPermutation[(i + 1) % 8][digits[i]]];
  }

  return verhoeffInverse[check] === 0;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates Aadhaar Card Number
 * Rules:
 * - Exactly 12 digits
 * - Numeric only
 * - Should not start with 0 or 1
 * - Optional Verhoeff checksum validation
 */
export function validateAadhaar(aadhaar: string, strictChecksum: boolean = false): ValidationResult {
  // Remove spaces and hyphens
  const cleaned = aadhaar.replace(/[\s-]/g, '');

  // Check if empty
  if (!cleaned) {
    return { isValid: false, error: 'Aadhaar number is required' };
  }

  // Check if exactly 12 digits
  if (!/^\d{12}$/.test(cleaned)) {
    return { isValid: false, error: 'Aadhaar number must be exactly 12 digits' };
  }

  // Check if starts with 0 or 1
  if (cleaned.startsWith('0') || cleaned.startsWith('1')) {
    return { isValid: false, error: 'Aadhaar number cannot start with 0 or 1' };
  }

  // Optional Verhoeff checksum validation
  if (strictChecksum && !verhoeffCheck(cleaned)) {
    return { isValid: false, error: 'Invalid Aadhaar number (checksum validation failed)' };
  }

  return { isValid: true };
}

/**
 * Validates PAN Card Number
 * Format: ABCDE1234F (5 uppercase letters + 4 digits + 1 uppercase letter)
 * Case-insensitive input but store as uppercase
 */
export function validatePAN(pan: string): ValidationResult {
  // Remove spaces
  const cleaned = pan.replace(/\s/g, '').toUpperCase();

  // Check if empty
  if (!cleaned) {
    return { isValid: false, error: 'PAN number is required' };
  }

  // Check format: 5 letters + 4 digits + 1 letter
  if (!/^[A-Z]{5}\d{4}[A-Z]{1}$/.test(cleaned)) {
    return { isValid: false, error: 'PAN must be in format: ABCDE1234F (5 letters, 4 digits, 1 letter)' };
  }

  return { isValid: true };
}

/**
 * Validates Voter ID (EPIC) Number
 * Format: ABC1234567 (3 uppercase letters + 7 digits)
 * Case-insensitive
 */
export function validateVoterID(voterId: string): ValidationResult {
  // Remove spaces
  const cleaned = voterId.replace(/\s/g, '').toUpperCase();

  // Check if empty
  if (!cleaned) {
    return { isValid: false, error: 'Voter ID number is required' };
  }

  // Check format: 3 letters + 7 digits
  if (!/^[A-Z]{3}\d{7}$/.test(cleaned)) {
    return { isValid: false, error: 'Voter ID must be in format: ABC1234567 (3 letters, 7 digits)' };
  }

  return { isValid: true };
}

/**
 * Validates Driving License Number (India)
 * Format: TS09 20110012345 or TS0920110012345
 * 2 uppercase state letters + 2 digits + optional space + 4-digit year + 7 digits
 */
export function validateDrivingLicense(dl: string): ValidationResult {
  // Remove spaces for validation but keep original for display
  const cleaned = dl.replace(/\s/g, '').toUpperCase();

  // Check if empty
  if (!cleaned) {
    return { isValid: false, error: 'Driving License number is required' };
  }

  // Check format: 2 state letters + 2 digits + 4-digit year + 7 digits
  // Total: 15 characters
  if (!/^[A-Z]{2}\d{2}\d{4}\d{7}$/.test(cleaned)) {
    return { isValid: false, error: 'Driving License must be in format: TS0920110012345 (2 letters, 2 digits, 4-digit year, 7 digits)' };
  }

  // Validate year (should be reasonable, e.g., 1950-2050)
  const year = parseInt(cleaned.substring(4, 8));
  if (year < 1950 || year > 2050) {
    return { isValid: false, error: 'Invalid year in Driving License number' };
  }

  return { isValid: true };
}

/**
 * Main validation function that routes to appropriate validator based on ID proof type
 */
export function validateIDProof(idProofType: string, idProofNumber: string, strictChecksum: boolean = false): ValidationResult {
  if (!idProofNumber || !idProofNumber.trim()) {
    return { isValid: false, error: 'ID Proof number is required' };
  }

  switch (idProofType) {
    case 'Aadhar':
    case 'Aadhaar':
      return validateAadhaar(idProofNumber, strictChecksum);
    
    case 'PAN':
      return validatePAN(idProofNumber);
    
    case 'Voter ID':
      return validateVoterID(idProofNumber);
    
    case 'Driving License':
      return validateDrivingLicense(idProofNumber);
    
    default:
      return { isValid: true }; // Unknown type, allow it
  }
}

/**
 * Formats ID proof number based on type (for display/storage)
 */
export function formatIDProofNumber(idProofType: string, idProofNumber: string): string {
  if (!idProofNumber) return '';

  const cleaned = idProofNumber.replace(/\s/g, '');

  switch (idProofType) {
    case 'Aadhar':
    case 'Aadhaar':
      // Format as XXXX XXXX XXXX (only if valid 12 digits)
      if (/^\d{12}$/.test(cleaned)) {
        return cleaned.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3');
      }
      return cleaned;
    
    case 'PAN':
      // Convert to uppercase
      return cleaned.toUpperCase();
    
    case 'Voter ID':
      // Convert to uppercase
      return cleaned.toUpperCase();
    
    case 'Driving License':
      // Format as XX## #### ######
      const match = cleaned.toUpperCase().match(/^([A-Z]{2})(\d{2})(\d{4})(\d{7})$/);
      if (match) {
        return `${match[1]}${match[2]} ${match[3]} ${match[4]}`;
      }
      return cleaned.toUpperCase();
    
    default:
      return idProofNumber;
  }
}

