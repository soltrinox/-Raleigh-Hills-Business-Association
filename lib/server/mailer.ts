import { Resend } from 'resend';

import { RESEND_KEY_PART_A } from '@/lib/server/resend-key-part-a';
import { RESEND_KEY_PART_B } from '@/lib/server/resend-key-part-b';

export type SendAdminEmailParams = {
  subject: string;
  html: string;
  replyTo?: string;
};

let resendClient: Resend | null = null;
let lastResolvedKey: string | null = null;

function resolveApiKey(): string | null {
  const fromEnv = process.env.RESEND_API_KEY?.trim();
  if (fromEnv) return fromEnv;
  /** Embedded fallback split across two server-only modules; env overrides. */
  return `${RESEND_KEY_PART_A}${RESEND_KEY_PART_B}`;
}

function getResend(): Resend | null {
  const key = resolveApiKey();
  if (!key) return null;
  if (key !== lastResolvedKey || !resendClient) {
    lastResolvedKey = key;
    resendClient = new Resend(key);
  }
  return resendClient;
}

/**
 * Sends email to CONTACT_TO_EMAIL from CONTACT_FROM_EMAIL.
 * With no usable API key (empty env and empty fragments), skips Resend— normally never happens.
 */
export async function sendAdminEmail({
  subject,
  html,
  replyTo,
}: SendAdminEmailParams): Promise<{ ok: true; dev?: boolean } | { ok: false; error: string }> {
  const to = process.env.CONTACT_TO_EMAIL ?? 'info@RaleighHillsBusinessAssn.org';
  const from = process.env.CONTACT_FROM_EMAIL ?? 'onboarding@resend.dev';

  const client = getResend();
  if (!client) {
    console.info('[RHBA forms — dev email preview — no Resend key]', {
      to,
      from,
      subject,
      replyTo,
      htmlLength: html.length,
      htmlSnippet: html.slice(0, 600),
    });
    return { ok: true, dev: true };
  }

  try {
    const result = await client.emails.send({
      from,
      to: [to],
      subject,
      html,
      ...(replyTo ? { replyTo } : {}),
    });
    const err = result.error;
    if (err) {
      console.error('[Resend]', err);
      return { ok: false, error: err.message ?? 'Email send failed' };
    }
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    console.error('[Resend]', e);
    return { ok: false, error: message };
  }
}
