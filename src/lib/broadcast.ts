import "server-only";
import { getConsentingSubscriberEmails } from "./db";
import { sendEmailBatch, renderEmail } from "./email";
import { unsubscribeUrl } from "./unsubscribe";

/* Newsletter broadcast: send one campaign to every consenting, still-subscribed
   address. Each message carries a per-recipient unsubscribe link + header. */

function escapeHtml(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string);
}

/** Split plain text into escaped paragraph HTML (blank line = new paragraph). */
function textToParagraphs(text: string): string[] {
  return text
    .trim()
    .split(/\n\s*\n/)
    .map((block) => escapeHtml(block).replace(/\n/g, "<br>"))
    .filter(Boolean);
}

export interface BroadcastInput {
  subject: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
}

export interface BroadcastResult {
  total: number;
  sent: number;
  failed: number;
}

export async function sendBroadcast(input: BroadcastInput): Promise<BroadcastResult> {
  const emails = await getConsentingSubscriberEmails();
  if (emails.length === 0) return { total: 0, sent: 0, failed: 0 };

  const paragraphs = textToParagraphs(input.body);
  const cta = input.ctaLabel && input.ctaUrl ? { label: input.ctaLabel, url: input.ctaUrl } : undefined;

  const messages = emails.map((email) => {
    const url = unsubscribeUrl(email);
    return {
      to: email,
      subject: input.subject,
      html: renderEmail({
        preheader: input.subject,
        heading: input.subject,
        paragraphs,
        cta,
        unsubscribeUrl: url,
      }),
      headers: { "List-Unsubscribe": `<${url}>` },
    };
  });

  const { sent, failed } = await sendEmailBatch(messages);
  return { total: emails.length, sent, failed };
}
