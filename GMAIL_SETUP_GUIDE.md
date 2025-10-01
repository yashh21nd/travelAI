# Gmail Account Setup for Travel Planner Contact Form

## Step 1: Create New Gmail Account
1. Go to https://accounts.google.com/signup
2. Create a new account with a business-appropriate name like:
   - `travelplanner.service@gmail.com`
   - `travelai.notifications@gmail.com` 
   - `contact.travelplanner@gmail.com`
3. Use a strong password and complete the setup

## Step 2: Enable 2-Factor Authentication (Required for App Passwords)
1. Go to https://myaccount.google.com/
2. Click "Security" in the left sidebar
3. Under "Signing in to Google", click "2-Step Verification"
4. Follow the setup process (you can use your phone number)
5. **This step is mandatory** - Gmail requires 2FA to generate app passwords

## Step 3: Generate App Password
1. After enabling 2FA, go back to Security settings
2. Click "App passwords" (you might need to sign in again)
3. Select "Mail" as the app and "Windows Computer" as the device
4. Click "Generate"
5. **Important**: Copy the 16-character password immediately (it won't be shown again)
   - It will look like: `abcd efgh ijkl mnop`

## Step 4: Update Your Environment File
1. Open `server/.env` file
2. Replace the email credentials:

```env
# Email Configuration - Gmail credentials for sending travel itineraries
EMAIL_USER=your-new-gmail@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
```

**Important Notes:**
- Use the NEW Gmail address you just created
- Use the 16-character APP PASSWORD (not your Gmail password)
- Keep the spaces in the app password exactly as shown

## Step 5: Test the Setup
1. Restart the server:
```bash
cd server
node index.js
```

2. Look for these success messages:
```
✅ Email service initialized successfully
✅ Gmail connection verified
```

3. Test the contact form from the website or with:
```bash
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","subject":"Test","message":"Testing email"}'
```

## Troubleshooting Tips

### If you see "Invalid login" error:
- Double-check the app password (copy-paste exactly)
- Make sure 2FA is enabled
- Try generating a new app password

### If 2FA setup fails:
- Use SMS verification instead of authenticator app
- Make sure your phone number is verified

### If app password option doesn't appear:
- Wait 5-10 minutes after enabling 2FA
- Sign out and sign back in
- Make sure you're in the correct Google account

## Alternative: Use a Different Email Service

If Gmail continues to be problematic, consider these alternatives:

### Outlook/Hotmail (Easier Setup)
1. Create account at outlook.com
2. No 2FA required for basic SMTP
3. Update `.env`:
```env
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-regular-password
```

### Professional Email Services (Recommended for Production)
- **SendGrid**: Free tier, 100 emails/day
- **Mailgun**: Free tier, 5,000 emails/month  
- **AWS SES**: Very low cost, high reliability

## Current Status Check
The contact form API is working perfectly - it accepts submissions and returns proper responses. The only issue is the email delivery, which this new Gmail account should resolve.

Once you create the new account and update the credentials, emails should start working immediately!