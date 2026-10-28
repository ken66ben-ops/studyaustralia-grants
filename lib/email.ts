import "server-only";
import { siteUrl } from "@/lib/supabase";

export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.ALERT_FROM_EMAIL);
}

type Recipient = { email: string; name: string | null; unsubscribe_token: string };

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function linkify(escaped: string): string {
  return escaped.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1">$1</a>');
}

function buildEmail(subject: string, body: string, r: Recipient) {
  const unsub = `${siteUrl()}/unsubscribe?token=${r.unsubscribe_token}`;
  const greeting = r.name ? `Hi ${r.name},` : "Hi,";
  const paragraphs = body.split(/\n{2,}/).map((p) => `<p>${linkify(escapeHtml(p)).replace(/\n/g, "<br>")}</p>`).join("");
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#1d1d1b;max-width:600px">
<p>${escapeHtml(greeting)}</p>${paragraphs}
<p><strong>⚠️ We never charge fees. Apply only on official university websites.</strong></p>
<p style="font-size:12px;color:#6a6a64">You're getting this because you subscribed at ${escapeHtml(siteUrl())}.
<a href="${unsub}">Unsubscribe</a></p></div>`;
  const text = `${greeting}\n\n${body}\n\n⚠️ We never charge fees. Apply only on official university websites.\n\nUnsubscribe: ${unsub}`;
  return {
    from: process.env.ALERT_FROM_EMAIL!, to: [r.email], subject, html, text,
    headers: { "List-Unsubscribe": `<${unsub}>` },
  };
}

/** Sends one personal email per subscriber (100 per request). Returns how many were accepted. */
export async function sendAlert(subject: string, body: string, recipients: Recipient[]): Promise<{ sent: number; error?: string }> {
  if (!emailConfigured()) return { sent: 0, error: "Email sending is not set up yet (RESEND_API_KEY / ALERT_FROM_EMAIL)." };
  let sent = 0;
  for (let i = 0; i < recipients.length; i += 100) {
    const batch = recipients.slice(i, i + 100).map((r) => buildEmail(subject, body, r));
    const res = await fetch("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(batch),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return { sent, error: `Email service refused the request (${res.status}). ${detail.slice(0, 200)}` };
    }
    sent += batch.length;
  }
  return { sent };
}
