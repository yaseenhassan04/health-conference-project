import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req, { params }) {
  try {
    const id = parseInt(params.id);

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