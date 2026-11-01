import { NextResponse } from 'next/server';
import { proxyBlobImage } from '@/server/services/gallery/blob.service';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const blobUrl = searchParams.get('url');

  if (!blobUrl) {
    return new NextResponse('url مطلوب', { status: 400 });
  }

  try {
    const { buffer, contentType } = await proxyBlobImage({ blobUrl });

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err) {
    console.error('❌ [image proxy]', err.message);
    return new NextResponse(err.message, { status: 500 });
  }
}
