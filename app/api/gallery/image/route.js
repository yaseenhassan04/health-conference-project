import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// ✅ تحويل أي URL لصيغة آمنة للـ fetch
function buildFetchUrl(rawUrl) {
  try {
    // decode كل شي حتى نوصل للنص الخام
    let plain = rawUrl;
    let prev = '';
    while (prev !== plain) {
      prev = plain;
      try { plain = decodeURIComponent(plain); } catch { break; }
    }
    // plain = https://...blob.../اسم الملف.jpg

    // نفصل الـ origin عن الـ path يدوياً
    const thirdSlash = plain.indexOf('/', 8);
    if (thirdSlash === -1) return rawUrl;

    const origin = plain.substring(0, thirdSlash);
    const pathRaw = plain.substring(thirdSlash);

    // نشفّر كل حرف مش ASCII آمن في الـ path
    const pathSafe = pathRaw.replace(/[^A-Za-z0-9\-_.~/]/g, (c) => encodeURIComponent(c));

    return origin + pathSafe;
  } catch {
    return rawUrl;
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const rawUrl = searchParams.get('url');

  if (!rawUrl) {
    return new NextResponse('url مطلوب', { status: 400 });
  }

  const fetchUrl = buildFetchUrl(rawUrl);

  try {
    const res = await fetch(fetchUrl, {
      headers: { 'User-Agent': 'NextJS-Proxy/1.0' },
    });

    if (!res.ok) {
      console.error(`❌ [image proxy] ${res.status} ${res.statusText} \nURL tried: ${fetchUrl}`);
      return new NextResponse(null, { status: res.status });
    }

    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get('content-type') || 'image/jpeg';

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
      },
    });
  } catch (err) {
    console.error('❌ [image proxy]', err.message, '\nURL tried:', fetchUrl);
    return new NextResponse(null, { status: 500 });
  }
}