import { put } from '@vercel/blob';
import path from 'path';
import { ApiError } from '@/server/lib/apiError';

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
  const ext = path.extname(original).toLowerCase();
  const base = path.basename(original, ext).replace(/[^a-zA-Z0-9؀-ۿ._-]/g, '_');
  const stamp = Date.now();
  const rand = Math.random().toString(36).slice(2, 7);
  return `library/${stamp}-${rand}-${base}${ext}`;
}

export async function uploadLibraryFile({ file }) {
  if (!file || typeof file === 'string') {
    throw new ApiError(400, { error: 'No file provided' });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    throw new ApiError(415, { error: `نوع الملف غير مسموح به في المكتبة: ${file.type}` });
  }

  if (file.size > MAX_SIZE) {
    throw new ApiError(413, { error: `حجم الملف يتجاوز الحد المسموح به (20 MB)` });
  }

  const blobPath = safeFilename(file.name);
  const buffer = Buffer.from(await file.arrayBuffer());

  const blob = await put(blobPath, buffer, {
    access: 'public',
  });

  return { status: 201, body: { success: true, url: blob.url } };
}
