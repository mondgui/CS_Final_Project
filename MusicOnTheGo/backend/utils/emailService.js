// Email service via Resend (password reset + support ticket reply)
//
// Env vars (local .env and Render):
//   RESEND_API_KEY  - from https://resend.com/api-keys (required)
//   EMAIL_FROM      - e.g. "MusicOnTheGo <noreply@musiconthegoapp.org>" (verify domain at https://resend.com/domains)
// If EMAIL_FROM is unset, Resend's test sender (onboarding@resend.dev) is used for development only.
import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const resend = new Resend(RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || 'MusicOnTheGo <onboarding@resend.dev>';

function logEmailError(context, err) {
  const msg = err?.message ?? err?.toString?.() ?? JSON.stringify(err);
  console.error(`[Email] ${context}:`, msg);
  if (err?.response?.body) console.error('[Email] Response:', err.response.body);
}

export async function sendPasswordResetEmail(email, resetToken) {
  const base = process.env.FRONTEND_URL || 'musiconthego://';
  const prefix = base.endsWith('://') ? base : `${base.replace(/\/+$/, '')}/`;
  const resetUrl = `${prefix}reset-password?token=${encodeURIComponent(resetToken)}&email=${encodeURIComponent(email)}`;

  const html = `
    <h2>Password Reset Request</h2>
    <p>You requested a password reset. Open this link on a phone where the MusicOnTheGo app is installed:</p>
    <p><a href="${resetUrl}">${resetUrl}</a></p>
    <p>This link will expire in 1 hour.</p>
    <p>If you didn't request this, please ignore this email.</p>
  `;

  if (!RESEND_API_KEY) {
    console.error('[Email] RESEND_API_KEY is not set. Set it in Render Environment.');
    return false;
  }
  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: email,
      subject: 'Password Reset Request - MusicOnTheGo',
      html,
    });
    if (error) {
      logEmailError('Password reset send failed', error);
      return false;
    }
    return true;
  } catch (err) {
    logEmailError('Password reset send exception', err);
    return false;
  }
}

export async function sendSupportTicketReplyEmail(ticketEmail, ticketSubject, adminReply, ticketId) {
  const html = `
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
  `;

  if (!RESEND_API_KEY) {
    console.error('[Email] RESEND_API_KEY is not set. Set it in Render Environment.');
    return false;
  }
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: ticketEmail,
      subject: `Re: ${ticketSubject}`,
      html,
    });
    if (error) {
      logEmailError('Support reply send failed', error);
      return false;
    }
    return true;
  } catch (err) {
    logEmailError('Support reply send exception', err);
    return false;
  }
}

