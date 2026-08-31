import { NextResponse } from 'next/server';
import { ApiError } from '@/server/lib/apiError';
import { createSignedUrl } from '@/server/services/gallery/blob.service';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const blobUrl = searchParams.get('url');

  try {
    const result = await createSignedUrl({ blobUrl });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json(err.body, { status: err.status });
    }
    console.error('❌ [signed-url]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
