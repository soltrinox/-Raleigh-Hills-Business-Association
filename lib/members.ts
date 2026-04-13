import type { Member, MembersData } from '@/lib/types';
import membersJson from '@/data/members.json';

function isValidMember(row: unknown): row is Member {
  if (!row || typeof row !== 'object') return false;
  const m = row as Record<string, unknown>;
  return (
    typeof m.id === 'string' &&
    typeof m.name === 'string' &&
    typeof m.category === 'string' &&
    typeof m.address === 'string' &&
    typeof m.lat === 'number' &&
    typeof m.lng === 'number' &&
    Number.isFinite(m.lat) &&
    Number.isFinite(m.lng)
  );
}

export function loadMembers(): Member[] {
  try {
    const data = membersJson as MembersData;
    const raw = Array.isArray(data.members) ? data.members : [];
    return raw.filter(isValidMember);
  } catch {
    return [];
  }
}
