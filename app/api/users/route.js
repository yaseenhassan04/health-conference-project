import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// إجبار الـ Route على جلب البيانات الحية فوراً ومنع الكاش
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      // 🔥 حماية البيانات: جلب الحقول العامة فقط التي تهم الزوار
      select: {
        id: true,
        fullName: true,
        title: true,       // دكتور، باحث، مهندس... إلخ
        institution: true, // الجامعة أو المستشفى
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error('❌ [users_fetch_error]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}