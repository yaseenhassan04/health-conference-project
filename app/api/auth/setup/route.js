import { NextResponse } from 'next/server';
import { ApiError } from '@/server/lib/apiError';
import { setupInitialAdmin } from '@/server/services/auth.service';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { setupKey } = await req.json();
    const result = await setupInitialAdmin({ setupKey });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json(err.body, { status: err.status });
    }
    console.error('[setup_error]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
