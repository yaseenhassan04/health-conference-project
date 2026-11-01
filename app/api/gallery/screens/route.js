/**
 * app/api/gallery/screens/route.js
 * شاشات التفاعل - مؤمن ومربوط بـ Prisma بالكامل للإنتاج
 * GET    → جلب كل الشاشات مرتبة حسب أولوية العرض (order)
 * POST   → إضافة شاشة تفاعلية جديدة (مؤمن)
 * PATCH  → تعديل بيانات الشاشة وتحديثها (مؤمن)
 * DELETE → حذف الشاشة نهائياً من النظام (مؤمن)
 */

import { NextResponse } from 'next/server';
import { isAdminAuthorized } from '@/server/lib/adminAuth';
import { ApiError } from '@/server/lib/apiError';
import {
  listGalleryScreens,
  createGalleryScreen,
  updateGalleryScreen,
  deleteGalleryScreen,
} from '@/server/services/gallery/screens.service';

// منع الـ Caching لضمان مرونة التحديث الفوري لترتيب وعرض الشاشات
export const dynamic = 'force-dynamic';

// ─── GET: جلب شاشات التفاعل ───
export async function GET() {
  try {
    const result = await listGalleryScreens();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to fetch gallery screens:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب شاشات التفاعل' }, { status: 500 });
  }
}

// ─── POST: إضافة شاشة تفاعلية جديدة (مؤمن) ───
export async function POST(req) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { status, body: resBody } = await createGalleryScreen(body);
    return NextResponse.json(resBody, { status });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.body, { status: error.status });
    }
    console.error('Failed to create gallery screen:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم أثناء إضافة الشاشة التفاعلية' }, { status: 500 });
  }
}

// ─── PATCH: تعديل بيانات شاشة (مؤمن) ───
export async function PATCH(req) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = await updateGalleryScreen(body);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.body, { status: error.status });
    }
    console.error('Failed to update gallery screen:', error);
    return NextResponse.json({ error: 'الشاشة غير موجودة أو حدث خطأ في التحديث' }, { status: 500 });
  }
}

// ─── DELETE: حذف شاشة تفاعلية (مؤمن) ───
export async function DELETE(req) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const id = new URL(req.url).searchParams.get('id');
    const result = await deleteGalleryScreen({ id });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.body, { status: error.status });
    }
    console.error('Failed to delete gallery screen:', error);
    return NextResponse.json({ error: 'العنصر غير موجود أو حدث خطأ داخلي أثناء الحذف' }, { status: 500 });
  }
}
