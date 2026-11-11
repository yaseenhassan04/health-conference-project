import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function generateRegNumber() {
  const timestamp = Date.now().toString().slice(-6);
  return `REG-${timestamp}`;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      fullName,
      email,
      phone,
      workplace,
      specialty,
      subSpecialty,
      invitedCategory,
      notes,
      nationalId,
    } = body;

    // Validation
    if (!fullName || !email || !phone || !workplace || !specialty || !nationalId) {
      return NextResponse.json(
        { error: 'جميع الحقول الأساسية مطلوبة' },
        { status: 400 }
      );
    }

    // منع التكرار بالإيميل أو رقم الهوية
    const existing = await prisma.conferenceRegistration.findFirst({
      where: {
        OR: [{ email }, { nationalId }],
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          error:
            existing.email === email
              ? 'هذا البريد الإلكتروني مسجّل مسبقاً'
              : 'رقم الهوية الوطنية مسجّل مسبقاً',
        },
        { status: 409 }
      );
    }

    // توليد رقم تسجيل فريد
    let regNumber;
    let isUnique = false;
    while (!isUnique) {
      regNumber = generateRegNumber();
      const exists = await prisma.conferenceRegistration.findUnique({
        where: { regNumber },
      });
      if (!exists) isUnique = true;
    }

    const registration = await prisma.conferenceRegistration.create({
      data: {
        regNumber,
        fullName,
        nationalId,
        email,
        phone,
        workplace,
        specialty,
        subSpecialty: subSpecialty || '',
        invitedCategory: invitedCategory || '',
        notes: notes || '',
      },
    });

    return NextResponse.json({
      success: true,
      regNumber: registration.regNumber,
      message: 'تم استلام طلبك بنجاح، سيتم مراجعته من قِبل اللجنة التحضيرية',
    });

  } catch (error) {
    console.error('Conference registration error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء التسجيل، يرجى المحاولة مرة أخرى' },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status'); // ALL | PENDING | APPROVED | REJECTED

    const where = status && status !== 'ALL' ? { status } : {};

    const registrations = await prisma.conferenceRegistration.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(registrations);
  } catch (error) {
    console.error('Get all registrations error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}