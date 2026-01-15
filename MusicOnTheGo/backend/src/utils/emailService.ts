import * as nodemailer from 'nodemailer';

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  // Option 1: Gmail (requires app-specific password)
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD, // App-specific password
      },
    });
  }

  // Option 2: Custom SMTP (works with most email providers)
  if (process.env.SMTP_HOST) {
    const transporterConfig: any = {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    };

    // SendGrid specific configuration
    if (process.env.SMTP_HOST.includes('sendgrid')) {
      transporterConfig.requireTLS = true;
    }
    // Outlook/Hotmail/Office365 specific configuration
    else if (
      process.env.SMTP_HOST.includes('outlook') ||
      process.env.SMTP_HOST.includes('hotmail') ||
      process.env.SMTP_HOST.includes('office365')
    ) {
      transporterConfig.requireTLS = true;
      transporterConfig.tls = {
        ciphers: 'TLSv1.2',
        rejectUnauthorized: true,
      };
    }

    return nodemailer.createTransport(transporterConfig);
  }

  // Option 3: Development - log email instead of sending
  return {
    sendMail: async (options: any) => {
      console.log('📧 EMAIL (Development Mode - not actually sent):');
      console.log('To:', options.to);
      console.log('Subject:', options.subject);
      console.log('Text:', options.text);
      console.log('HTML:', options.html);
      return { messageId: 'dev-mode' };
    },
  };
};

// Create transporter lazily
let transporter: any = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = createTransporter();
    console.log('📧 Email Configuration:');
    console.log('  SMTP_HOST:', process.env.SMTP_HOST || 'Not set');
    console.log('  SMTP_PORT:', process.env.SMTP_PORT || 'Not set');
    console.log('  EMAIL_USER:', process.env.EMAIL_USER || 'Not set');
    console.log('  EMAIL_FROM:', process.env.EMAIL_FROM || 'Not set');
  }
  return transporter;
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string,
  resetUrl: string,
) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@musiconthego.com',
    to: email,
    subject: 'Reset Your Password - MusicOnTheGo',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #FF9076, #FF6A5C); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
            .button { display: inline-block; background: #FF6A5C; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎵 MusicOnTheGo</h1>
            </div>
            <div class="content">
              <h2>Reset Your Password</h2>
              <p>You requested to reset your password. Click the button below to create a new password:</p>
              <a href="${resetUrl}" class="button">Reset Password</a>
              <p>Or copy and paste this link:</p>
              <p style="word-break: break-all; color: #666; font-family: monospace; background: #f5f5f5; padding: 10px; border-radius: 5px;">${resetUrl}</p>
              ${resetUrl.startsWith('exp://') || resetUrl.startsWith('musiconthego://') ? `
              <p style="background: #fff3cd; padding: 10px; border-radius: 5px; border-left: 4px solid #ffc107;">
                <strong>📱 Mobile App Users:</strong> Make sure the MusicOnTheGo app is installed. Tap the link above to open it in the app.
              </p>
              ` : ''}
              <p><strong>This link will expire in 1 hour.</strong></p>
              <p>If you didn't request a password reset, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} MusicOnTheGo. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Reset Your Password - MusicOnTheGo
      
      You requested to reset your password. Click the link below to create a new password:
      
      ${resetUrl}
      
      This link will expire in 1 hour.
      
      If you didn't request a password reset, please ignore this email.
    `,
  };

  try {
    console.log('📤 Attempting to send email...');
    const info = await getTransporter().sendMail(mailOptions);
    console.log('✅ Password reset email sent successfully!');
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('❌ Error sending password reset email:', error);
    throw new Error(`Failed to send password reset email: ${error.message}`);
  }
};

/**
 * Send password reset confirmation email
 */
export const sendPasswordResetConfirmation = async (email: string) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@musiconthego.com',
    to: email,
    subject: 'Password Reset Successful - MusicOnTheGo',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #FF9076, #FF6A5C); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎵 MusicOnTheGo</h1>
            </div>
            <div class="content">
              <h2>Password Reset Successful</h2>
              <p>Your password has been successfully reset.</p>
              <p>If you did not make this change, please contact support immediately.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} MusicOnTheGo. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Password Reset Successful - MusicOnTheGo
      
      Your password has been successfully reset.
      
      If you did not make this change, please contact support immediately.
    `,
  };

  try {
    const info = await getTransporter().sendMail(mailOptions);
    console.log('✅ Password reset confirmation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('❌ Error sending confirmation email:', error);
    return { success: false };
  }
};
