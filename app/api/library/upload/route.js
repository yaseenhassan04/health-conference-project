/**
 * app/api/library/upload/route.js (Next.js App Router)
 * ──────────────────────────────────────────────────────────────────────────────
 * يستقبل ملفاً واحداً عبر FormData، يرفعه سحابياً إلى Vercel Blob
 * ويرجع المسار السحابي الآمن والمستقر { url: 'https://xxx.public.blob.vercel-storage.com/...' }
 * ──────────────────────────────────────────────────────────────────────────────
 */

import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import path from 'path';

// إجبار الـ Route على العمل بشكل ديناميكي ومنع التخزين المؤقت للطلبات
export const dynamic = 'force-dynamic';

const MAX_SIZE = 20 * 1024 * 1024; // 20 MB

const ALLOWED_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
  'application/x-zip-compressed',
]);

/* تنظيف اسم الملف وجعله متوافقاً مع الروابط السحابية دون مشاكل ترميز */
function safeFilename(original) {
  const ext  = path.extname(original).toLowerCase();
  const base = path.basename(original, ext).replace(/[^a-zA-Z0-9\u0600-\u06FF._-]/g, '_');
  const stamp = Date.now();
  const rand  = Math.random().toString(36).slice(2, 7);
  return `library/${stamp}-${rand}-${base}${ext}`;
}

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

    const file = formData.get('file');
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    /* 3️⃣ التحقق من نوع الملف (الميم-تايب) */
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: `نوع الملف غير مسموح به في المكتبة: ${file.type}` },
        { status: 415 },
      );
    }

    /* 4️⃣ التحقق من حجم الملف */
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `حجم الملف يتجاوز الحد المسموح به (20 MB)` },
        { status: 413 },
      );
    }

    // توليد مسار واسم ملف فريد وآمن داخل مجلد library في السحابة
    const blobPath = safeFilename(file.name);

    /* 5️⃣ تحويل الملف إلى Buffer والرفع المباشر إلى السحابة */
    const buffer = Buffer.from(await file.arrayBuffer());
    
    const blob = await put(blobPath, buffer, {
      access: 'public', // لكي يتمكن الأطباء والباحثون من تحميل الملف وقراءته
    });

    /* 6️⃣ إرجاع الرابط السحابي الدائم المستقر المتوافق مع بريسما وقاعدة البيانات */
    return NextResponse.json({ 
      success: true, 
      url: blob.url // سيعيد رابطاً يبدأ بـ https://...vercel-storage.com
    }, { status: 201 });

  } catch (err) {
    console.error("❌ [library/upload_cloud_error]", err);
    return NextResponse.json(
      { error: "حدث خطأ داخلي في الخادم أثناء معالجة الرفع السحابي" }, 
      { status: 500 }
    );
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