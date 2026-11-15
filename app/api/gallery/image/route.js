import { NextResponse } from 'next/server';
import { proxyBlobImage } from '@/server/services/gallery/blob.service';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const rawUrl = searchParams.get('url');

  if (!rawUrl) {
    return new NextResponse('url مطلوب', { status: 400 });
  }

  // ✅ إصلاح double encoding
  let blobUrl = rawUrl;
  try {
    const decoded = decodeURIComponent(rawUrl);
    // لو بعد الـ decode لسا فيها %XX يعني كانت single encoded فقط
    // لو ما فيها يعني كانت plain text
    // لو فيها %25 يعني double encoded — نعمل decode مرة ثانية
    blobUrl = decoded.includes('%') ? decoded : decoded;
    
    // فحص إضافي: لو اللي طلع من decode الأول لسا فيه %25
    if (blobUrl.includes('%25')) {
      blobUrl = decodeURIComponent(blobUrl);
    }
  } catch {
    blobUrl = rawUrl;
  }

  try {
    const { buffer, contentType } = await proxyBlobImage({ blobUrl });

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
      },
    });
  } catch (err) {
    console.error('❌ [image proxy]', err.message, '\nURL tried:', blobUrl);
    return new NextResponse(null, { status: 404 });
  }
}