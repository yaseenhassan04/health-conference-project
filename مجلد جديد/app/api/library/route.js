/**
 * app/api/library/route.js (Next.js App Router — GET / POST / PATCH / DELETE)
 * ──────────────────────────────────────────────────────────────────────────────
 * إدارة مراجع المكتبة العلمية - مربوط بالكامل بقاعدة البيانات السحابية وبريسما
 * الرفع السحابي مصاحب عبر: app/api/library/upload/route.js
 * ──────────────────────────────────────────────────────────────────────────────
 */

import { NextResponse } from 'next/server';
import { isAdminAuthorized } from '@/server/lib/adminAuth';
import { ApiError } from '@/server/lib/apiError';
import { listLibraryItems, createLibraryItem, updateLibraryItem, deleteLibraryItem } from '@/server/services/library.service';

// منع الـ Caching لضمان قراءة وتحديث فوري للمراجع والكتب العلمية
export const dynamic = 'force-dynamic';

/* ─── GET: قائمة المراجع (ذكية: تظهر كلها للمشرف، والمنشورة فقط للزوار) ─── */
export async function GET(req) {
  try {
    const result = await listLibraryItems({ isAdmin: isAdminAuthorized(req) });
    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ [library_fetch_error]', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب مراجع المكتبة العلمية' }, { status: 500 });
  }
}

/* ─── POST: إضافة مرجع علمي جديد ─── */
export async function POST(req) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const { status, body } = await createLibraryItem({
      title: formData.get('title'),
      author: formData.get('author'),
      file: formData.get('file'),
    });
    return NextResponse.json(body, { status });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json(err.body, { status: err.status });
    }
    console.error('❌ [library_create_error]', err);
    return NextResponse.json({ error: 'حدث خطأ في الخادم', details: err.message }, { status: 500 });
  }
}

/* ─── PATCH: تعديل مرجع علمي ─── */
export async function PATCH(req) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = await updateLibraryItem(body);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json(err.body, { status: err.status });
    }
    console.error('❌ [library_update_error]', err);
    return NextResponse.json({ error: 'العنصر غير موجود أو البيانات المرسلة غير صالحة' }, { status: 500 });
  }
}

/* ─── DELETE: حذف مرجع (+ تنظيف الملف من السحابة فوراً) ─── */
export async function DELETE(req) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const result = await deleteLibraryItem({ id });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.body, { status: error.status });
    }
    console.error('❌ [library_delete_error]', error);
    return NextResponse.json({ error: 'حدث خطأ داخلي في الخادم أثناء تنفيذ عملية الحذف' }, { status: 500 });
  }
}
