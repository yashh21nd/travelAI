# Email Setup Guide for Travel Planner Contact Form

## Current Issue
The contact form is working correctly and returning success responses, but emails are not being delivered due to Gmail SMTP authentication failure:

```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```

## Gmail SMTP Setup Instructions

### Step 1: Verify Gmail Account
1. Make sure the email account `travelplanner.ai.service@gmail.com` exists and you have access to it
2. If this account doesn't exist, create it or use a different Gmail account

### Step 2: Enable 2-Factor Authentication
1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to "Security" in the left sidebar
3. Enable "2-Step Verification" if not already enabled
4. This is **required** for app passwords

### Step 3: Generate App Password
1. After enabling 2FA, go back to Security settings
2. Look for "App passwords" (may be under "2-Step Verification")
3. Select "Mail" as the app type
4. Generate a new app password
5. **Important**: Use this 16-character app password (not your regular Gmail password)

### Step 4: Update Environment Variables
1. Open `server/.env` file
2. Update the credentials:
```env
EMAIL_USER=your-actual-gmail@gmail.com
EMAIL_PASSWORD=your-16-character-app-password
```

### Step 5: Alternative Email Services
If Gmail continues to have issues, consider these alternatives:

#### Option 1: Outlook/Hotmail
```env
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```
Update the SMTP configuration in `server/index.js` to use Outlook:
```javascript
host: 'smtp-mail.outlook.com',
port: 587,
```

#### Option 2: Professional Email Service (Recommended)
Consider using a dedicated email service like:
- SendGrid (free tier: 100 emails/day)
- Mailgun (free tier: 5,000 emails/month)
- Amazon SES (very low cost)

## Testing the Fix
After updating the credentials:

1. Restart the server:
```bash
cd server
node index.js
```

2. Test the contact form:
```bash
Invoke-RestMethod -Uri "http://localhost:5000/api/contact" -Method Post -ContentType "application/json" -Body '{"name":"Test User","email":"test@example.com","subject":"Test Subject","message":"Test message"}'
```

3. Check server logs for "✅ Email sent successfully" message

## Current Status
- ✅ Contact form API is working correctly (returns 200 status)
- ✅ Form validation and data processing works
- ❌ Email delivery fails due to Gmail authentication
- ⚠️ Users see success message but emails aren't sent

## Quick Fix for Testing
If you want to test without email, you can temporarily disable email sending by commenting out the email code in the contact endpoint or updating the environment variables to mock values.