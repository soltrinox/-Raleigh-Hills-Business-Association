import type { ContactInput } from '@/lib/schemas/contact';
import type { JoinInput } from '@/lib/schemas/join';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderContactEmail(input: ContactInput): { subject: string; html: string } {
  const subject = `[RHBA Contact] ${input.subject}`;
  const rows = [
    ['Name', input.name],
    ['Email', input.email],
    ...(input.phone ? [['Phone', input.phone] as const] : []),
    ['Subject', input.subject],
    ['Message', input.message],
  ];
  const html = `
<!DOCTYPE html>
<html><body style="font-family: system-ui, sans-serif; line-height: 1.5;">
  <p>New message via <strong>raleighhillsbusiness.com/contact</strong></p>
  <table cellpadding="8" cellspacing="0" border="1" style="border-collapse: collapse;">
    ${rows
      .map(
        ([k, v]) =>
          `<tr><td><strong>${escapeHtml(k)}</strong></td><td>${escapeHtml(v).replace(/\n/g, '<br/>')}</td></tr>`,
      )
      .join('')}
  </table>
</body></html>`;
  return { subject, html };
}

function tierLabel(t: JoinInput['membershipTier']): string {
  return t === 'new' ? 'New membership ($100 first year)' : 'Renewal ($75, due June 1st)';
}

function paymentLabel(t: JoinInput['paymentIntent']): string {
  switch (t) {
    case 'check':
      return 'I will pay by check';
    case 'invoice':
      return 'Send an invoice';
    default:
      return 'Contact me about payment';
  }
}

export function renderJoinEmail(input: JoinInput): { subject: string; html: string } {
  const subject = `[RHBA Membership] ${input.businessName}`;
  const pairs: [string, string][] = [
    ['Business name', input.businessName],
    ['Contact name', input.contactName],
    ['Email', input.email],
    ['Phone', input.phone],
    ['Website', input.website || '—'],
    ['Street address', input.address || '—'],
    ['City', input.city || '—'],
    ['ZIP', input.zip || '—'],
    ['Category', input.category || '—'],
    ['Description', input.description || '—'],
    ['Instagram', input.instagram || '—'],
    ['Facebook', input.facebook || '—'],
    ['Membership', tierLabel(input.membershipTier)],
    ['Payment preference', paymentLabel(input.paymentIntent)],
    ['Newsletter opt-in', input.optInNewsletter ? 'Yes' : 'No'],
    ['Notes', input.notes || '—'],
  ];
  const html = `
<!DOCTYPE html>
<html><body style="font-family: system-ui, sans-serif; line-height: 1.5;">
  <p>New membership inquiry via <strong>raleighhillsbusiness.com/join</strong></p>
  <table cellpadding="8" cellspacing="0" border="1" style="border-collapse: collapse;">
    ${pairs
      .map(
        ([k, v]) =>
          `<tr><td><strong>${escapeHtml(k)}</strong></td><td>${escapeHtml(v).replace(/\n/g, '<br/>')}</td></tr>`,
      )
      .join('')}
  </table>
</body></html>`;
  return { subject, html };
}
