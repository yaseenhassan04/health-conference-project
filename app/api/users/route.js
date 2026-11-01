import { NextResponse } from 'next/server';
import { listPublicUsers } from '@/server/services/users.service';

// إجبار الـ Route على جلب البيانات الحية فوراً ومنع الكاش
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await listPublicUsers();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('❌ [users_fetch_error]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
