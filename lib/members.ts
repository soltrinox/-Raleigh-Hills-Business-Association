import type { Member, MembersData } from '@/lib/types';
import membersJson from '@/data/members.json';

function isValidMember(row: unknown): row is Member {
  if (!row || typeof row !== 'object') return false;
  const m = row as Record<string, unknown>;
  return (
    typeof m.id === 'string' &&
    typeof m.name === 'string' &&
    typeof m.lat === 'number' &&
    typeof m.lng === 'number' &&
    Number.isFinite(m.lat) &&
    Number.isFinite(m.lng)
  );
}

function normalizeMember(raw: Record<string, unknown>): Record<string, unknown> {
  if (!raw.category || typeof raw.category !== 'string') {
    raw.category = 'Business';
  }
  if (!raw.address || typeof raw.address !== 'string') {
    raw.address = '';
  }
  return raw;
}

export function loadMembers(): Member[] {
  try {
    const data = membersJson as unknown as MembersData;
    const raw = Array.isArray(data.members) ? data.members : [];
    const normalized = raw.map((r) =>
      normalizeMember(r as unknown as Record<string, unknown>),
    );
    return (normalized as unknown[]).filter(isValidMember);
  } catch {
    return [];
  }
}
