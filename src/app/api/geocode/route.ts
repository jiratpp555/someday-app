import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q');
  if (!q) return NextResponse.json({ error: 'Missing q' }, { status: 400 });

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'SomedayApp/1.0 (personal wishlist)' },
      signal: AbortSignal.timeout(6000),
    });
    const data = await res.json();
    if (!data?.[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
  } catch {
    return NextResponse.json({ error: 'Geocode failed' }, { status: 500 });
  }
}
