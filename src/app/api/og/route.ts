import { NextRequest, NextResponse } from 'next/server';

function getMetaContent(html: string, ...selectors: string[]): string | null {
  for (const sel of selectors) {
    const patterns = [
      new RegExp(`<meta[^>]*${sel}[^>]*content=["']([^"']+)["']`, 'i'),
      new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*${sel}`, 'i'),
    ];
    for (const re of patterns) {
      const m = html.match(re);
      if (m?.[1]) return m[1].trim();
    }
  }
  return null;
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 });

  let normalized = url;
  if (!/^https?:\/\//i.test(url)) normalized = 'https://' + url;

  try {
    const res = await fetch(normalized, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SomedayBot/1.0)' },
      signal: AbortSignal.timeout(8000),
    });
    const html = await res.text();

    const title =
      getMetaContent(html, 'property=["\']og:title["\']') ??
      getMetaContent(html, 'name=["\']twitter:title["\']') ??
      html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ??
      null;

    const image =
      getMetaContent(html, 'property=["\']og:image["\']') ??
      getMetaContent(html, 'name=["\']twitter:image["\']') ??
      null;

    const description =
      getMetaContent(html, 'property=["\']og:description["\']') ??
      getMetaContent(html, 'name=["\']description["\']') ??
      null;

    return NextResponse.json({ title, image, description, url: normalized });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch URL' }, { status: 500 });
  }
}
