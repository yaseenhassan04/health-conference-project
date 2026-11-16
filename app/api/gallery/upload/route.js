import { NextResponse } from 'next/server';
import { isAdminAuthorized } from '@/server/lib/adminAuth';
import { ApiError } from '@/server/lib/apiError';
import { put } from '@vercel/blob';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export const config = {
  api: { bodyParser: false },
};

// ✅ تحويل اسم الملف لاسم آمن بدون مسافات أو أحرف خاصة
function safeName(originalName) {
  const ext = originalName.includes('.')
    ? '.' + originalName.split('.').pop().toLowerCase()
    : '';
  // نولّد اسم عشوائي آمن تماماً + timestamp لضمان عدم التكرار
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  return `media_${timestamp}_${random}${ext}`;
}

export async function POST(req) {
  if (!isAdminAuthorized(req, 'samoud2025')) {
    return NextResponse.json({ error: 'غير مصرح للوصول' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'لم يتم إرفاق أي ملف للرفع' }, { status: 400 });
    }

    // ✅ نستخدم اسم آمن بدل الاسم الأصلي العربي
    const filename = safeName(file.name || 'upload');

    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false, // الـ random موجود في safeName
    });

    return NextResponse.json({ url: blob.url });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json(err.body, { status: err.status });
    }
    console.error('❌ [Upload API Error]:', err.message);
    return NextResponse.json(
      { error: err.message || 'حدث خطأ أثناء رفع الملف' },
      { status: 500 }
    );
  }
}