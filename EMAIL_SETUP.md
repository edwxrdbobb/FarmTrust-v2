# Email Setup Guide for FarmTrust

## Overview
FarmTrust uses Nodemailer to send verification emails to vendors during registration. This guide will help you set up email functionality.

## Environment Variables

Add these variables to your `.env.local` file:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
NEXT_PUBLIC_APP_URL=http://localhost:3006
```

## Gmail Setup (Recommended for Development)

### 1. Enable 2-Factor Authentication
- Go to your Google Account settings
- Enable 2-Factor Authentication

### 2. Generate App Password
- Go to Google Account → Security → 2-Step Verification
- Click "App passwords"
- Generate a new app password for "Mail"
- Use this password in `EMAIL_PASSWORD`

### 3. Update Environment Variables
```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-16-digit-app-password
```

## Alternative Email Services

### Outlook/Hotmail
```env
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

### Yahoo
```env
EMAIL_USER=your-email@yahoo.com
EMAIL_PASSWORD=your-app-password
```

## Production Setup

For production, consider using:
- **SendGrid** - Professional email service
- **Mailgun** - Reliable email delivery
- **AWS SES** - Cost-effective for high volume

## Testing Email Functionality

1. Start the development server: `npm run dev`
2. Register a new vendor account
3. Check the console for verification URL (development mode)
4. Check your email inbox for the verification email

## Troubleshooting

### Common Issues

1. **"Invalid login" error**
   - Ensure you're using an app password, not your regular password
   - Check that 2FA is enabled

2. **"Less secure app access" error**
   - Use app passwords instead of regular passwords
   - Enable 2FA on your Google account

3. **Email not received**
   - Check spam folder
   - Verify email address is correct
   - Check console logs for errors

### Development Mode
In development, verification URLs are logged to the console for testing purposes.

## Security Notes

- Never commit email credentials to version control
- Use environment variables for all sensitive data
- Consider using email service providers for production
- Implement rate limiting for email sending
