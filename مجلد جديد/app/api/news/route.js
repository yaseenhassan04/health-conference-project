/**
 * app/api/news/route.js
 * API للأخبار - إدارة الأخبار في الصفحة الرئيسية (مؤمن ومربوط بـ Prisma سحابياً)
 * GET    → جلب كل الأخبار للزوار (مفتوح للجميع - مرتب تلقائياً من الأحدث للأقدم)
 * POST   → إضافة خبر جديد للمؤتمر (مؤمن)
 * PATCH  → تعديل تفاصيل خبر موجود (مؤمن)
 * DELETE → حذف خبر نهائياً (مؤمن)
 */
import { NextResponse } from 'next/server';
import { isAdminAuthorized } from '@/server/lib/adminAuth';
import { ApiError } from '@/server/lib/apiError';
import { listNews, createNews, updateNews, deleteNews } from '@/server/services/news.service';

export const dynamic = 'force-dynamic';

// ─── GET: جلب كل الأخبار (مفتوح للعامة ولا يتطلب توكن) ───
export async function GET() {
  try {
    const result = await listNews();
    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ [news_fetch_error]', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب مستجدات الأخبار' }, { status: 500 });
  }
}

// ─── POST: إضافة خبر جديد (مؤمن) ───
export async function POST(req) {
  if (!isAdminAuthorized(req, 'samoud2025')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { status, body: resBody } = await createNews(body);
    return NextResponse.json(resBody, { status });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.body, { status: error.status });
    }
    console.error('❌ [news_create_error]', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم أثناء إضافة الخبر' }, { status: 500 });
  }
}

// ─── PATCH: تعديل خبر (مؤمن) ───
export async function PATCH(req) {
  if (!isAdminAuthorized(req, 'samoud2025')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = await updateNews(body);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.body, { status: error.status });
    }
    console.error('❌ [news_update_error]', error);
    return NextResponse.json({ error: 'الخبر غير موجود أو البيانات المرسلة غير صالحة' }, { status: 500 });
  }
}

// ─── DELETE: حذف خبر نهائياً (مؤمن) ───
export async function DELETE(req) {
  if (!isAdminAuthorized(req, 'samoud2025')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const id = new URL(req.url).searchParams.get('id');
    const result = await deleteNews({ id });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.body, { status: error.status });
    }
    console.error('❌ [news_delete_error]', error);
    return NextResponse.json({ error: 'الخبر غير موجود بالفعل أو حدث خطأ داخلي' }, { status: 500 });
  }
}
