import { NextRequest, NextResponse } from 'next/server';
import { loadMembers } from '@/lib/members';
import {
  haversineMiles,
  memberMatchesNameQuery,
  memberMatchesZipInAddress,
  memberWithinRadiusMiles,
} from '@/lib/member-utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const q = sp.get('q') ?? '';
  const zip = sp.get('zip') ?? '';
  const radiusRaw = sp.get('radius');
  const latRaw = sp.get('lat');
  const lngRaw = sp.get('lng');
  const sort = sp.get('sort') ?? 'name-asc';

  const radius = radiusRaw ? Number(radiusRaw) : null;
  const lat = latRaw ? parseFloat(latRaw) : null;
  const lng = lngRaw ? parseFloat(lngRaw) : null;
  const center =
    lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng)
      ? { lat, lng }
      : null;

  const all = loadMembers();
  let results = all.filter((m) => memberMatchesNameQuery(m, q));

  const z = zip.trim();
  if (/^\d{5}$/.test(z)) {
    if (radius != null && center) {
      results = results.filter((m) => memberWithinRadiusMiles(m, center, radius));
    } else {
      results = results.filter((m) => memberMatchesZipInAddress(m, z));
    }
  } else if (radius != null && center) {
    results = results.filter((m) => memberWithinRadiusMiles(m, center, radius));
  }

  if (sort === 'name-asc') {
    results.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === 'name-desc') {
    results.sort((a, b) => b.name.localeCompare(a.name));
  } else if (sort === 'distance' && center) {
    results.sort(
      (a, b) =>
        haversineMiles(center, { lat: a.lat, lng: a.lng }) -
        haversineMiles(center, { lat: b.lat, lng: b.lng }),
    );
  }

  return NextResponse.json({
    results,
    total: all.length,
    count: results.length,
  });
}
