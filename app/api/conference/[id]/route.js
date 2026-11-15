import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req, { params }) {
  try {
    // 1. يجب انتظار الـ params أولاً (مطلوب في Next.js 15+)
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    const registration = await prisma.conferenceRegistration.findUnique({
      where: { id },
    });

    if (!registration) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 });
    }

    return NextResponse.json(registration);

  } catch (error) {
    console.error('Get registration error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}