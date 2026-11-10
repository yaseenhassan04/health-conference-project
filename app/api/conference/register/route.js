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
    } = body;

    // Validation
    if (!fullName || !email || !phone || !workplace || !specialty) {
      return NextResponse.json(
        { error: 'جميع الحقول الأساسية مطلوبة' },
        { status: 400 }
      );
    }

    // منع التكرار
    const existing = await prisma.conferenceRegistration.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'هذا البريد الإلكتروني مسجّل مسبقاً' },
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
/**
 * أضف هذا الـ handler إلى:
 *   app/api/conference/register/route.js
 *
 * الملف الحالي عنده POST فقط — أضف هذه الدالة بعده مباشرة.
 */

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // ALL | PENDING | APPROVED | REJECTED

    const where = status && status !== "ALL"
      ? { status }
      : {};

    const registrations = await prisma.conferenceRegistration.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(registrations);
  } catch (error) {
    console.error("Get all registrations error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}