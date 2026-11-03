import { Resend } from 'resend';
import { env, isTest } from '../config/env';
import { escapeHtml } from '../utils/strings';

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

interface ContactNotice {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/** Email the site owner about a new contact message. Errors are logged, never thrown. */
export async function notifyNewMessage(msg: ContactNotice): Promise<void> {
  if (!env.CONTACT_NOTIFY_EMAIL || isTest) return;

  const subject = `New portfolio message: ${msg.subject}`.slice(0, 150);
  const text = `From: ${msg.name} <${msg.email}>\nSubject: ${msg.subject}\n\n${msg.message}`;
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px">
      <h2 style="margin:0 0 12px">New message from your portfolio</h2>
      <p style="margin:0"><strong>${escapeHtml(msg.name)}</strong> &lt;${escapeHtml(msg.email)}&gt;</p>
      <p style="margin:4px 0 16px;color:#475569">${escapeHtml(msg.subject)}</p>
      <div style="white-space:pre-wrap;border-left:3px solid #4F46E5;padding-left:12px">${escapeHtml(msg.message)}</div>
      <p style="margin-top:24px;font-size:12px;color:#64748b">Reply to this email to answer ${escapeHtml(msg.name)} directly.</p>
    </div>`;

  if (!resend) {
    console.info(`[mail] RESEND_API_KEY not set; would have sent:\n${text}`);
    return;
  }

  try {
    const { error } = await resend.emails.send({
      from: env.MAIL_FROM,
      to: env.CONTACT_NOTIFY_EMAIL,
      replyTo: msg.email,
      subject,
      text,
      html,
    });
    if (error) console.error('[mail] Resend rejected the message:', error.message);
  } catch (err) {
    console.error('[mail] Failed to send notification:', (err as Error).message);
  }
}
