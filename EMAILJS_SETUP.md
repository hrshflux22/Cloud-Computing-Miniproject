# EmailJS Setup Guide - Simple & Free Email Service

EmailJS is a free service that lets you send emails directly from your JavaScript application without a backend server.

## Step 1: Create EmailJS Account

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Click "Sign Up" (top right)
3. Create a free account using your email or Google/GitHub

**Free Plan Includes:**
- 200 emails per month
- No credit card required
- Perfect for testing and small projects

## Step 2: Add Email Service

Once logged in:

1. Click "**Add New Service**" or go to "Email Services" in the sidebar
2. Choose your email provider:
   - **Gmail** (easiest - recommended)
   - Outlook
   - Yahoo
   - Or any other provider
3. Click "**Connect Account**"
4. For Gmail:
   - Click "Connect Gmail"
   - Sign in with your Google account
   - Allow EmailJS to send emails on your behalf
5. Give your service a name (e.g., "Nimbus HR Emails")
6. Click "**Create Service**"
7. **Copy the Service ID** (you'll need this later)

## Step 3: Create Email Template

1. Go to "**Email Templates**" in the sidebar
2. Click "**Create New Template**"
3. You'll see a template editor with Subject and Content

### Template Configuration:

**Template Name:** `employee_credentials`

**Subject:**
```
Welcome to {{company_name}} - Your Login Credentials
```

**Email Body (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #4F46E5;
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 5px 5px 0 0;
    }
    .content {
      background-color: #f9f9f9;
      padding: 30px;
      border-radius: 0 0 5px 5px;
    }
    .credentials {
      background-color: white;
      padding: 20px;
      border-left: 4px solid #4F46E5;
      margin: 20px 0;
    }
    .button {
      display: inline-block;
      background-color: #4F46E5;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      color: #666;
      font-size: 12px;
      margin-top: 20px;
    }
    code {
      background: #f0f0f0;
      padding: 5px 10px;
      border-radius: 3px;
      font-family: monospace;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to {{company_name}}</h1>
    </div>
    <div class="content">
      <h2>Hello {{employee_name}},</h2>
      
      <p>Your employee account has been created successfully! Below are your login credentials:</p>
      
      <div class="credentials">
        <p><strong>Email:</strong> {{employee_email}}</p>
        <p><strong>Temporary Password:</strong> <code>{{employee_password}}</code></p>
      </div>
      
      <p><strong>⚠️ Important:</strong> Please change your password after your first login for security purposes.</p>
      
      <a href="{{login_url}}" class="button">Login to Your Account</a>
      
      <p>If you have any questions or need assistance, please contact your HR department.</p>
    </div>
    
    <div class="footer">
      <p>This is an automated email. Please do not reply to this message.</p>
      <p>&copy; {{current_year}} {{company_name}}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
```

4. Click "**Save**"
5. **Copy the Template ID** (shown at the top)

## Step 4: Get Your Public Key

1. Go to "**Account**" in the sidebar
2. Find "**API Keys**" section
3. **Copy your Public Key** (it looks like: `user_xxxxxxxxxxxxx`)

## Step 5: Configure Your Application

### A. Create .env File

1. In your project folder, create a file named `.env` (copy from `.env.example`)
2. Add your EmailJS credentials:

```env
VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
```

Replace with your actual values from EmailJS.

### B. Restart Your Dev Server

If your app is running, restart it:

```bash
# Press Ctrl+C to stop
# Then restart:
npm run dev
```

## Step 6: Test Email Sending

1. In your application, click "**Add Employee**"
2. Enter an email address in the popup
3. Click "**Send Credentials & Continue**"
4. Check the email inbox (including spam folder)

## Troubleshooting

### Issue: "Failed to send email"

**Solutions:**
1. Check that all three values in `.env` are correct
2. Make sure you restarted the dev server after creating `.env`
3. Check browser console (F12) for specific error messages

### Issue: Email not received

**Solutions:**
1. Check spam/junk folder
2. Wait a few minutes (sometimes delayed)
3. Verify the email address is correct
4. Check EmailJS dashboard for delivery status

### Issue: "Public key is required"

**Solution:**
- Make sure `.env` file exists in the root folder
- Verify variable names start with `VITE_`
- Restart dev server

### Issue: Daily limit exceeded

**Solution:**
- Free plan: 200 emails/month
- Upgrade to paid plan if needed (starts at $7/month for 1000 emails)

## Email Template Variables

These variables are automatically replaced when sending:

| Variable | Description | Example |
|----------|-------------|---------|
| `{{to_name}}` | Employee name | "John Doe" |
| `{{employee_name}}` | Employee name | "John Doe" |
| `{{employee_email}}` | Employee email | "john@company.com" |
| `{{employee_password}}` | Generated password | "xY9#kL2pQm" |
| `{{company_name}}` | Company name | "Nimbus HR" |
| `{{login_url}}` | Login page URL | "http://localhost:5173" |
| `{{current_year}}` | Current year | "2025" |

## Security & Best Practices

### ✅ Good Practices:

1. **Never commit `.env` to Git**
   - Already in `.gitignore`
   
2. **Use environment variables**
   - Never hardcode API keys in code

3. **Monitor usage**
   - Check EmailJS dashboard regularly
   - Set up usage alerts

4. **Professional emails**
   - Use a professional Gmail account
   - Don't use personal email for production

### ⚠️ Limitations:

1. **Rate Limits:**
   - Free: 200 emails/month
   - Paid: Starting at 1000 emails/month

2. **Email appears from your Gmail:**
   - Recipients see your connected Gmail as sender
   - For production, consider upgrading or using a dedicated email service

3. **No scheduled emails:**
   - Emails sent immediately only

## Upgrading EmailJS (Optional)

If you need more emails:

1. Go to "**Account**" → "**Pricing**"
2. Choose a plan:
   - **Personal:** $7/month - 1,000 emails
   - **Professional:** $15/month - 5,000 emails
   - **Enterprise:** Custom pricing

## Alternative: Production Setup

For production with high volume, consider:

1. **SendGrid** - 100 emails/day free
2. **Mailgun** - 5,000 emails/month free
3. **Resend** - Modern, developer-friendly
4. **AWS SES** - Very cheap ($0.10 per 1000 emails) but requires setup

## Support

- EmailJS Documentation: [https://www.emailjs.com/docs/](https://www.emailjs.com/docs/)
- Email Template Guide: [https://www.emailjs.com/docs/user-guide/creating-email-template/](https://www.emailjs.com/docs/user-guide/creating-email-template/)
- Check your EmailJS dashboard for sent email logs

## Testing Checklist

- [ ] Created EmailJS account
- [ ] Connected Gmail service
- [ ] Created email template with variables
- [ ] Copied Service ID, Template ID, and Public Key
- [ ] Created `.env` file with credentials
- [ ] Restarted dev server
- [ ] Tested sending email
- [ ] Received email in inbox
- [ ] Password displays correctly in email
