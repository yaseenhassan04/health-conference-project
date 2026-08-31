/**
 * app/api/library/upload/route.js (Next.js App Router)
 * ──────────────────────────────────────────────────────────────────────────────
 * يستقبل ملفاً واحداً عبر FormData، يرفعه سحابياً إلى Vercel Blob
 * ويرجع المسار السحابي الآمن والمستقر { url: 'https://xxx.public.blob.vercel-storage.com/...' }
 * ──────────────────────────────────────────────────────────────────────────────
 */

import { NextResponse } from 'next/server';
import { ApiError } from '@/server/lib/apiError';
import { uploadLibraryFile } from '@/server/services/libraryUpload.service';

// إجبار الـ Route على العمل بشكل ديناميكي ومنع التخزين المؤقت للطلبات
export const dynamic = 'force-dynamic';

/* ─── POST: رفع الملف سحابياً ─── */
export async function POST(req) {
  /* 1️⃣ التحقق من صلاحية المسؤول */
  if (req.headers.get('x-admin-token') !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    /* 2️⃣ استقبال البيانات */
    let formData;
    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
    }

    const { status, body } = await uploadLibraryFile({ file: formData.get('file') });
    return NextResponse.json(body, { status });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json(err.body, { status: err.status });
    }
    console.error('❌ [library/upload_cloud_error]', err);
    return NextResponse.json({ error: 'حدث خطأ داخلي في الخادم أثناء معالجة الرفع السحابي' }, { status: 500 });
  }
}

/* ─── OPTIONS: للـ CORS preflight ─── */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-admin-token',
    },
  });
}
