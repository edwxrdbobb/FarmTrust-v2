import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Create a transporter for sending emails
const createTransporter = () => {
  // For development, you can use Gmail or other SMTP services
  // You'll need to set up environment variables for production
  
  const transporter = nodemailer.createTransport({
    service: 'gmail', // or 'outlook', 'yahoo', etc.
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASSWORD || 'your-app-password', // Use app password for Gmail
    },
  });

  return transporter;
};

// Generate email verification template
export const generateVerificationEmailTemplate = (verificationUrl: string, userName: string) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your FarmTrust Account</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #227C4F;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .content {
          background-color: #f9f9f9;
          padding: 30px;
          border-radius: 0 0 8px 8px;
        }
        .button {
          display: inline-block;
          background-color: #227C4F;
          color: white;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          color: #666;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>FarmTrust</h1>
        <p>Verify Your Email Address</p>
      </div>
      
      <div class="content">
        <h2>Hello ${userName},</h2>
        
        <p>Thank you for registering with FarmTrust! To complete your registration and verify your email address, please click the button below:</p>
        
        <div style="text-align: center;">
          <a href="${verificationUrl}" class="button">Verify Email Address</a>
        </div>
        
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #227C4F;">${verificationUrl}</p>
        
        <p><strong>Important:</strong> This verification link will expire in 24 hours for security reasons.</p>
        
        <p>If you didn't create an account with FarmTrust, you can safely ignore this email.</p>
        
        <p>Best regards,<br>The FarmTrust Team</p>
      </div>
      
      <div class="footer">
        <p>This email was sent to verify your FarmTrust account registration.</p>
        <p>If you have any questions, please contact our support team.</p>
      </div>
    </body>
    </html>
  `;
};

// Send email function
export const sendEmail = async (options: EmailOptions): Promise<{ success: boolean; error?: string }> => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@farmtrust.com',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    };

    await transporter.sendMail(mailOptions);
    
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send email' 
    };
  }
};

// Send verification email
export const sendVerificationEmail = async (
  email: string, 
  userName: string, 
  verificationUrl: string
): Promise<{ success: boolean; error?: string }> => {
  const subject = 'Verify Your FarmTrust Account';
  const html = generateVerificationEmailTemplate(verificationUrl, userName);
  
  return await sendEmail({
    to: email,
    subject,
    html,
  });
};

// Send welcome email after verification
export const sendWelcomeEmail = async (
  email: string, 
  userName: string
): Promise<{ success: boolean; error?: string }> => {
  const subject = 'Welcome to FarmTrust!';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to FarmTrust</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #227C4F;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .content {
          background-color: #f9f9f9;
          padding: 30px;
          border-radius: 0 0 8px 8px;
        }
        .button {
          display: inline-block;
          background-color: #227C4F;
          color: white;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>FarmTrust</h1>
        <p>Welcome to the Community!</p>
      </div>
      
      <div class="content">
        <h2>Welcome ${userName}!</h2>
        
        <p>Your email has been successfully verified! 🎉</p>
        
        <p>You're now part of the FarmTrust community, connecting farmers and buyers across Sierra Leone.</p>
        
        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3006'}/dashboard" class="button">Go to Dashboard</a>
        </div>
        
        <p><strong>What's next?</strong></p>
        <ul>
          <li>Complete your profile</li>
          <li>Browse products from local farmers</li>
          <li>Start building trust in the community</li>
        </ul>
        
        <p>If you have any questions or need assistance, don't hesitate to reach out to our support team.</p>
        
        <p>Best regards,<br>The FarmTrust Team</p>
      </div>
    </body>
    </html>
  `;
  
  return await sendEmail({
    to: email,
    subject,
    html,
  });
};
