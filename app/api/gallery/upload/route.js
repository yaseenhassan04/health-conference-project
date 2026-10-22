import { NextResponse } from 'next/server';
import { isAdminAuthorized } from '@/server/lib/adminAuth';
import { ApiError } from '@/server/lib/apiError';
import { uploadGalleryImage } from '@/server/services/gallery/blob.service';

export const dynamic = 'force-dynamic';

// 💡 رفع حد حجم الملفات المسموح بها في Next.js للرفع المباشر حتى 100 ميجابايت
export const maxDuration = 60; // زيادة وقت تنفيذ الدالة للملفات الكبيرة (60 ثانية)

export async function POST(req) {
  // التحقق من صلاحيات الأدمن
  if (!isAdminAuthorized(req, 'samoud2025')) {
    return NextResponse.json({ error: 'غير مصرح للوصول' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'لم يتم إرفاق أي ملف للرفع' }, { status: 400 });
    }

    // 💡 رفع الملف سواء كان فيديو (.mov, .mp4) أو صورة
    const result = await uploadGalleryImage({ file });
    
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json(err.body, { status: err.status });
    }
    console.error('❌ [Upload API Error]:', err.message);
    return NextResponse.json(
      { error: err.message || 'حدث خطأ أثناء رفع الفيديو أو الصورة' },
      { status: 500 }
    );
  }
}