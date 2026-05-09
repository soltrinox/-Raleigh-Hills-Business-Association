import { NextResponse } from 'next/server';

import { JoinSchema } from '@/lib/schemas/join';
import { renderJoinEmail } from '@/lib/server/email-templates';
import { sendAdminEmail } from '@/lib/server/mailer';
import { checkRateLimit, clientKeyFromHeaders } from '@/lib/server/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const ip = clientKeyFromHeaders(req.headers);
  if (!checkRateLimit(`join:${ip}`).ok) {
    return NextResponse.json(
      { ok: false, error: 'Too many requests. Try again in a minute.' },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ ok: false, error: 'Invalid body' }, { status: 400 });
  }

  const raw = body as Record<string, unknown>;
  const honeypot =
    typeof raw.hp_company === 'string'
      ? raw.hp_company.trim()
      : String(raw.hp_company ?? '');
  if (honeypot.length > 0) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const parsed = JoinSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const data = parsed.data;
  const { html, subject } = renderJoinEmail(data);
  const sent = await sendAdminEmail({
    subject,
    html,
    replyTo: data.email,
  });

  if (!sent.ok) {
    return NextResponse.json({ ok: false, error: sent.error }, { status: 502 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
