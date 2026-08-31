/**
 * app/api/auth/login/route.js
 * POST /api/auth/login
 * Body: { username, password }
 * Returns: { token } — JWT يحتوي على { id, name, role }
 */

import { NextResponse } from 'next/server';
import { ApiError } from '@/server/lib/apiError';
import { login } from '@/server/services/auth.service';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    const result = await login({ username, password });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json(err.body, { status: err.status });
    }
    console.error('[login_error]', err);
    return NextResponse.json({ error: 'حدث خطأ داخلي في الخادم أثناء تسجيل الدخول' }, { status: 500 });
  }
}
