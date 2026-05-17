// app/api/library/upload/route.js  (Next.js App Router)
// ──────────────────────────────────────────────────────────────────────────────
// يستقبل ملفاً واحداً عبر FormData، يحفظه في public/uploads/library/
// ويرجع المسار النسبي { url: '/uploads/library/...' }
//
// الحد الأقصى للحجم: 20 MB  (عدّله في next.config.js إذا احتجت أكثر)
// ──────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import fs   from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'library');
const MAX_SIZE   = 20 * 1024 * 1024; // 20 MB

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

/* أسماء ملفات آمنة وفريدة */
function safeFilename(original) {
  const ext      = path.extname(original).toLowerCase();
  const base     = path.basename(original, ext).replace(/[^a-zA-Z0-9\u0600-\u06FF._-]/g, '_');
  const stamp    = Date.now();
  const rand     = Math.random().toString(36).slice(2, 7);
  return `${stamp}-${rand}-${base}${ext}`;
}

/* ─── POST: رفع الملف ─── */
export async function POST(req) {
  /* التحقق من صلاحية المسؤول */
  if (req.headers.get('x-admin-token') !== process.env.ADMIN_TOKEN)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  /* استقبال FormData */
  let formData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!file || typeof file === 'string')
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  /* التحقق من نوع الملف */
  if (!ALLOWED_TYPES.has(file.type))
    return NextResponse.json(
      { error: `نوع الملف غير مسموح به: ${file.type}` },
      { status: 415 },
    );

  /* التحقق من الحجم */
  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length > MAX_SIZE)
    return NextResponse.json(
      { error: `حجم الملف يتجاوز الحد المسموح (20 MB)` },
      { status: 413 },
    );

  /* إنشاء مجلد الرفع إن لم يكن موجوداً */
  if (!fs.existsSync(UPLOAD_DIR))
    await mkdir(UPLOAD_DIR, { recursive: true });

  /* حفظ الملف */
  const filename = safeFilename(file.name);
  const filePath = path.join(UPLOAD_DIR, filename);
  await writeFile(filePath, buffer);

  /* المسار النسبي الذي سيُخزَّن في قاعدة البيانات */
  const publicUrl = `/uploads/library/${filename}`;

  return NextResponse.json({ success: true, url: publicUrl }, { status: 201 });
}

/* ─── OPTIONS: للـ CORS preflight ─── */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods':  'POST, OPTIONS',
      'Access-Control-Allow-Headers':  'Content-Type, x-admin-token',
    },
  });
}