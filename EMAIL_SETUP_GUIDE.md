# Email Configuration Guide

## Current Status

✅ **Development Mode**: Password reset is fully functional in development mode without email service
- The reset link is printed to the console server log
- You can copy the link from the console and paste it in your browser
- No email configuration required for testing

❌ **Production Mode**: Requires email service configuration to send reset emails

---

## For Development (Current)

### How It Works
1. User clicks "Forgot your password?" on login page
2. Enters email address and submits
3. Backend generates reset token and saves to database
4. **Instead of sending email**: Prints reset link to server console
5. Copy the link from console and open in browser
6. User can now reset their password

### Example Console Output
```
================================================================================
🔐 PASSWORD RESET LINK (Development Mode)
================================================================================
User Email: user@example.com
Reset Link: http://localhost:5173/reset-password?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Expires at: 2025-12-07 12:30:00
================================================================================
```

### Test Password Reset Now
```bash
# 1. Click "Forgot your password?" on login page
# 2. Enter a user's email (e.g., mahireddy7569@gmail.com)
# 3. Check the backend server console for the reset link
# 4. Copy the link and paste it in a new browser tab
# 5. Reset your password
```

---

## For Production (Optional Setup)

### Option 1: Gmail (Recommended for Quick Setup)

#### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Sign in with your Gmail account
3. Enable "2-Step Verification"

#### Step 2: Generate App Password
1. Go back to [Google Account Security](https://myaccount.google.com/security)
2. Search for "App passwords" (only appears if 2FA is enabled)
3. Select "Mail" and "Windows Computer" (or your device)
4. Google generates a 16-character password
5. Copy this password (remove spaces)

#### Step 3: Update .env File
```bash
# In d:\Hostel\backend\.env

EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password-without-spaces
EMAIL_FROM=noreply@hostelmanagement.com
PASSWORD_RESET_EXPIRES_IN=1h
FRONTEND_URL=http://localhost:5173
NODE_ENV=production
```

#### Step 4: Restart Backend
```bash
npm run dev
# or
npm start
```

---

### Option 2: SendGrid (Professional Option)

#### Step 1: Create SendGrid Account
1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Verify your email

#### Step 2: Get API Key
1. Go to Settings → API Keys
2. Create a new API Key
3. Copy the key

#### Step 3: Update Email Service (Optional Enhancement)
You would need to modify `d:\Hostel\backend\src\utils\email.ts` to use SendGrid:

```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    await sgMail.send({
      to: options.to,
      from: process.env.EMAIL_FROM,
      subject: options.subject,
      html: options.html,
    });
  } catch (error: any) {
    console.error('SendGrid error:', error.message);
    throw new Error('Failed to send email');
  }
};
```

---

### Option 3: Custom SMTP Server

#### Update .env with SMTP Details
```bash
EMAIL_SERVICE=custom
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASSWORD=your-password
EMAIL_FROM=noreply@hostelmanagement.com
```

#### Update Email Service for Custom SMTP
Modify `d:\Hostel\backend\src\utils\email.ts` to use custom SMTP:

```typescript
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});
```

---

## Testing Email Configuration

### Test 1: Check Email Service Status
```bash
# Look for this message in server console when starting backend:
✅ Email service ready
# OR
⚠️ Email service error: [error details]
```

### Test 2: Send Test Email
1. Click "Forgot your password?" on login page
2. Enter valid email address
3. In production: Check email inbox for reset link
4. In development: Check server console for reset link

### Test 3: Verify Reset Link Works
1. Click or paste the reset link
2. You should see the password reset form
3. Enter new password and confirm
4. Successfully reset password

---

## Troubleshooting

### Error: "Invalid login: 535-5.7.8 Username and Password not accepted"
**Solution for Gmail:**
- Verify you're using an App Password (not your regular password)
- App passwords only work with 2-Factor Authentication enabled
- Remove any spaces from the 16-character password
- Check that EMAIL_USER is your full Gmail address

### Error: "Failed to send email" in Production
**Possible causes:**
- Email credentials are incorrect
- Email service is not configured in `.env`
- SMTP host is unreachable
- Firewall blocking SMTP port

**Solution:**
- Verify all `.env` variables are correct
- Check network connectivity to email service
- In development, reset link is printed to console (no email needed)

### Email Not Received
- Check spam/junk folder
- Verify EMAIL_FROM domain is properly configured
- Check email service logs/dashboard
- Ensure email address is correct

---

## Current Files Modified

### Database
- ✅ `d:\Hostel\backend\migrations\add_password_reset_columns.sql` - Adds password reset columns

### Backend
- ✅ `d:\Hostel\backend\src\utils\email.ts` - Email service with dev mode fallback
- ✅ `d:\Hostel\backend\src\controllers\authController.ts` - Forgot password & reset password handlers
- ✅ `d:\Hostel\backend\src\routes\auth.routes.ts` - Password reset routes
- ✅ `d:\Hostel\backend\.env` - Email configuration variables

### Frontend
- ✅ `d:\Hostel\frontend\src\pages\LandingPage.tsx` - Forgot password modal
- ✅ `d:\Hostel\frontend\src\pages\ResetPasswordPage.tsx` - Password reset page
- ✅ `d:\Hostel\frontend\src\App.tsx` - Reset password route
- ✅ `d:\Hostel\frontend\src\services\api.ts` - Fixed 401 redirect for login

---

## Summary

**Development (Ready to Use):**
- Password reset fully functional
- Reset link printed to server console
- No email configuration needed
- Perfect for testing

**Production (Optional Setup):**
- Choose email service (Gmail, SendGrid, Custom SMTP)
- Update `.env` with credentials
- Email will be sent to user's inbox
- Same reset flow as development

You can now test the forgot password feature immediately without any email configuration!
