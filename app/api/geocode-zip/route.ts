import { NextRequest, NextResponse } from 'next/server';

/**
 * Geocode a US ZIP for "surrounding area" radius filter (server-side Nominatim).
 */
export async function GET(request: NextRequest) {
  const zip = request.nextUrl.searchParams.get('zip')?.trim() ?? '';
  if (!/^\d{5}$/.test(zip)) {
    return NextResponse.json({ error: 'invalid_zip' }, { status: 400 });
  }

  const url = `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(zip)}&country=us&format=json&limit=1`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'RHBA-Microsite/1.0 (info@RaleighHillsBusinessAssn.org)',
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'upstream' }, { status: 502 });
  }

  const data = (await res.json()) as { lat?: string; lon?: string }[];
  if (!data?.length) {
    return NextResponse.json({ lat: null, lng: null });
  }

  return NextResponse.json({
    lat: parseFloat(data[0].lat!),
    lng: parseFloat(data[0].lon!),
  });
}
