// Email service for password reset and notifications
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || 'apikey',
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendPasswordResetEmail(email, resetToken) {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:8081'}/reset-password?token=${resetToken}&email=${email}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'musiconthego.app@gmail.com',
    to: email,
    subject: 'Password Reset Request - MusicOnTheGo',
    html: `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}

export async function sendSupportTicketReplyEmail(ticketEmail, ticketSubject, adminReply, ticketId) {
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'musiconthego.app@gmail.com',
    to: ticketEmail,
    subject: `Re: ${ticketSubject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Support Ticket Reply - MusicOnTheGo</h2>
        <p>Hello,</p>
        <p>Thank you for contacting us. We've received your support request and here's our reply:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #1976d2; margin: 20px 0;">
          <p style="margin: 0; white-space: pre-wrap;">${adminReply}</p>
        </div>
        <p>If you have any further questions, please don't hesitate to reply to this email or contact us through the app.</p>
        <p>Best regards,<br>The MusicOnTheGo Team</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          This is an automated message. Please do not reply directly to this email.<br>
          Ticket ID: ${ticketId}
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Support ticket reply email send error:', error);
    return false;
  }
}

export default transporter;
