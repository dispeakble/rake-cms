/**
 * Rake CMS — Email Infrastructure
 *
 * Sends transactional emails via SMTP or a local sendmail fallback.
 * Configure via .env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 */

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Send an email using configured SMTP or log in dev mode.
 * Returns true if sent successfully, false otherwise.
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || "noreply@alexawebservers.com";

  // Dev mode — log instead of sending
  if (!host || !user || !pass) {
    console.log("[EMAIL DEV MODE]", {
      from,
      to: options.to,
      subject: options.subject,
      text: options.text.substring(0, 200),
    });
    return true;
  }

  try {
    // Use native Node.js SMTP via net/tls
    const { sendSmtpEmail } = await import("./email-smtp");
    await sendSmtpEmail({
      host,
      port,
      user,
      pass,
      from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || options.text,
    });
    return true;
  } catch (error) {
    console.error("[EMAIL ERROR]", error);
    return false;
  }
}

/**
 * Send a password reset email with a reset link.
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string
): Promise<boolean> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const resetUrl = `${siteUrl}/reset-password?token=${resetToken}`;

  return sendEmail({
    to: email,
    subject: "Reset your Rake CMS password",
    text: `You requested a password reset. Click the link below to reset your password:\n\n${resetUrl}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, you can safely ignore this email.`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; padding: 20px; background: #f5f5f5;">
  <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 8px; padding: 32px;">
    <h2 style="margin-top: 0;">Password Reset</h2>
    <p>You requested a password reset. Click the button below to set a new password:</p>
    <a href="${resetUrl}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 16px 0;">
      Reset Password
    </a>
    <p style="color: #666; font-size: 12px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
  </div>
</body>
</html>`,
  });
}

/**
 * HTML template for new comment notification to post author.
 */
export async function sendCommentNotificationEmail(
  authorEmail: string,
  postTitle: string,
  commentAuthor: string,
  commentContent: string,
  postUrl: string
): Promise<boolean> {
  return sendEmail({
    to: authorEmail,
    subject: `New comment on "${postTitle}"`,
    text: `${commentAuthor} left a comment on "${postTitle}":\n\n${commentContent}\n\nView: ${postUrl}`,
  });
}
