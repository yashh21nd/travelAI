# Vercel Deployment Fix for Contact Form 405 Error

## 🚨 Issue: 405 Method Not Allowed on Vercel

Your app is deployed on Vercel (`https://travel-ai-yash-dev-2025.vercel.app/`) but the contact form is getting a 405 error because Vercel handles API routes differently than traditional Node.js servers.

## ✅ Solution Implemented

I've created a Vercel-compatible API structure:

### **1. Created Vercel API Function**
- **File:** `client/api/contact.js`
- **Purpose:** Serverless function to handle contact form submissions
- **Features:** Full email functionality with nodemailer

### **2. Updated Vercel Configuration**
- **File:** `client/vercel.json`
- **Added:** Proper API routing that doesn't redirect API calls to index.html
- **Added:** Function timeout settings for email sending

### **3. Added Dependencies**
- **Added:** `nodemailer` to `client/package.json` for API function

## 🔧 **Action Required: Set Environment Variables**

### **In Vercel Dashboard:**

1. **Go to:** https://vercel.com/dashboard
2. **Select:** Your project `travel-ai-yash-dev-2025`
3. **Navigate:** Settings > Environment Variables
4. **Add these variables:**

```
EMAIL_USER = help.travel.ai@gmail.com
EMAIL_PASSWORD = ngpr ubmb fsma nbwo
```

**Important:** 
- Variable names must be EXACT (case-sensitive)
- Values must be exact (no extra spaces)
- Apply to: "All Environments" (Production, Preview, Development)

## 📦 **Deploy Changes**

After setting environment variables:

```bash
# Commit and push changes
git add .
git commit -m "Add Vercel API function for contact form - fixes 405 error"
git push origin main
```

Vercel will auto-deploy from GitHub and the contact form should work!

## 🔍 **Expected Results**

### **Before Fix:**
```
POST /api/contact → 405 Method Not Allowed
Contact form fails
```

### **After Fix:**
```
POST /api/contact → 200 OK  
✅ Admin notification sent
✅ User acknowledgment sent
Contact form works perfectly
```

## 🧪 **Testing Steps**

1. **Wait for deployment** (2-3 minutes after push)
2. **Visit:** https://travel-ai-yash-dev-2025.vercel.app/
3. **Go to Contact page**
4. **Fill out form and submit**
5. **Check Gmail inbox:** help.travel.ai@gmail.com

## 🎯 **Key Changes**

### **API Function Features:**
- ✅ CORS headers for cross-origin requests
- ✅ Method validation (only POST allowed)
- ✅ Input validation and sanitization
- ✅ Gmail SMTP email sending
- ✅ Admin notifications + user confirmations
- ✅ Proper error handling

### **Vercel Configuration:**
- ✅ API routes don't redirect to index.html
- ✅ 30-second timeout for email functions
- ✅ Proper function routing

## 📧 **Email Flow**

1. **User submits form** → Vercel API function
2. **Function validates** → Input + email format
3. **Function sends** → Admin notification to you
4. **Function sends** → Confirmation to user
5. **Function responds** → Success message to frontend

## 🚨 **Common Issues & Solutions**

### **If still getting 405:**
- Check that environment variables are set in Vercel
- Verify deployment completed (check Vercel dashboard)
- Clear browser cache

### **If emails don't send:**
- Verify EMAIL_USER and EMAIL_PASSWORD in Vercel settings
- Check Vercel function logs in dashboard
- Ensure Gmail app password is still valid

### **If function times out:**
- Increase timeout in vercel.json (currently 30s)
- Check Gmail SMTP connectivity

## 🎉 **Success Indicators**

- ✅ Contact form submits without 405 error
- ✅ Success message appears in UI
- ✅ Admin email received at help.travel.ai@gmail.com
- ✅ User receives confirmation email
- ✅ Vercel function logs show success

**After setting environment variables and deploying, your contact form will work perfectly on Vercel!** 🚀