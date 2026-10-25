/**
 * app/api/live/attendees/route.js
 * مشاهدو البث المباشر (بطاقة البيانات قبل منح صلاحية المشاهدة)
 * GET    → قائمة المشاهدين المسجلين (مؤمن - للوحة التحكم)
 * POST   → تسجيل مشاهد جديد (مفتوح للعامة)
 * DELETE → حذف مشاهد (مؤمن)
 */
import { NextResponse } from 'next/server';
import { isAdminAuthorized } from '@/server/lib/adminAuth';
import { ApiError } from '@/server/lib/apiError';
import { registerAttendee, listAttendees, deleteAttendee } from '@/server/services/live.service';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  if (!isAdminAuthorized(req, 'samoud2025')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await listAttendees();
    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ [live_attendees_fetch_error]', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب قائمة المشاهدين' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { status, body: resBody } = await registerAttendee(body);
    return NextResponse.json(resBody, { status });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.body, { status: error.status });
    }
    console.error('❌ [live_attendee_register_error]', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء التسجيل' }, { status: 500 });
  }
}

export async function DELETE(req) {
  if (!isAdminAuthorized(req, 'samoud2025')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const id = new URL(req.url).searchParams.get('id');
    const result = await deleteAttendee({ id });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.body, { status: error.status });
    }
    console.error('❌ [live_attendee_delete_error]', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء الحذف' }, { status: 500 });
  }
}
