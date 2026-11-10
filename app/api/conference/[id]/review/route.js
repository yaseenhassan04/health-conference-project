import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendConferenceStatusEmail } from '@/server/services/sendEmail.service';

export async function POST(req, { params }) {
  try {
    const id = parseInt(params.id);
    const { decision, adminNote, reviewedBy } = await req.json();

    if (!['APPROVED', 'REJECTED'].includes(decision)) {
      return NextResponse.json({ error: 'قرار غير صالح' }, { status: 400 });
    }

    const registration = await prisma.conferenceRegistration.findUnique({
      where: { id },
    });

    if (!registration) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 });
    }

    // إرسال الإيميل أولاً
    let emailSent = false;
    let emailError = null;

    try {
      await sendConferenceStatusEmail({
        to: registration.email,
        fullName: registration.fullName,
        regNumber: registration.regNumber,
        decision,
        adminNote: adminNote || '',
      });
      emailSent = true;
    } catch (err) {
      emailError = err.message;
      console.error('Email send failed:', err);
    }

    // حفظ القرار بغض النظر عن الإيميل، مع تسجيل حالة الإرسال
    const updated = await prisma.conferenceRegistration.update({
      where: { id },
      data: {
        status: decision,
        adminNote: adminNote || '',
        reviewedBy: reviewedBy || 'Admin',
        reviewedAt: new Date(),
        emailSent,
        emailSentAt: emailSent ? new Date() : null,
      },
    });

    return NextResponse.json({
      success: true,
      registration: updated,
      emailSent,
      emailError: emailError || null,
      warning: !emailSent
        ? 'تم حفظ القرار لكن فشل إرسال البريد الإلكتروني — يمكنك إعادة الإرسال'
        : null,
    });

  } catch (error) {
    console.error('Review error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}