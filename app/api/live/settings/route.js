/**
 * app/api/live/settings/route.js
 * إعدادات البث المباشر (رابط Google Meet + حالة التفعيل)
 * GET   → جلب الإعدادات (مفتوح للعامة كي تقرأها صفحة /live)
 * PATCH → تعديل الإعدادات (مؤمن)
 */
import { NextResponse } from 'next/server';
import { isAdminAuthorized } from '@/server/lib/adminAuth';
import { ApiError } from '@/server/lib/apiError';
import { getLiveSettings, updateLiveSettings } from '@/server/services/live.service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await getLiveSettings();
    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ [live_settings_fetch_error]', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب إعدادات البث' }, { status: 500 });
  }
}

export async function PATCH(req) {
  if (!isAdminAuthorized(req, 'samoud2025')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = await updateLiveSettings(body);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.body, { status: error.status });
    }
    console.error('❌ [live_settings_update_error]', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء تحديث إعدادات البث' }, { status: 500 });
  }
}
