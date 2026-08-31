import { NextResponse } from 'next/server';
import { isAdminAuthorized } from '@/server/lib/adminAuth';
import { ApiError } from '@/server/lib/apiError';
import { uploadGalleryImage } from '@/server/services/gallery/blob.service';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  if (!isAdminAuthorized(req, 'samoud2025')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const result = await uploadGalleryImage({ file: formData.get('file') });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json(err.body, { status: err.status });
    }
    console.error('❌ [Vercel Blob Upload Error]:', err.message);
    return NextResponse.json({ error: err.message || 'خطأ أثناء الرفع' }, { status: 500 });
  }
}
