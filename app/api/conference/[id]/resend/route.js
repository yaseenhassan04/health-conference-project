import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendConferenceStatusEmail } from '@/server/services/sendEmail.service';

export async function POST(req, { params }) {
  try {
    const { id: rawId } = await params; // Next.js 15: params يجب انتظاره
    const id = parseInt(rawId);

    const registration = await prisma.conferenceRegistration.findUnique({
      where: { id },
    });

    if (!registration) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 });
    }

    if (registration.status === 'PENDING') {
      return NextResponse.json(
        { error: 'لا يمكن إعادة الإرسال لطلب قيد المراجعة' },
        { status: 400 }
      );
    }

    await sendConferenceStatusEmail({
      to: registration.email,
      fullName: registration.fullName,
      regNumber: registration.regNumber,
      decision: registration.status,
      adminNote: registration.adminNote || '',
    });

    await prisma.conferenceRegistration.update({
      where: { id },
      data: { emailSent: true, emailSentAt: new Date() },
    });

    return NextResponse.json({ success: true, message: 'تم إعادة إرسال الرسالة بنجاح' });
  } catch (error) {
    console.error('Resend error:', error);
    return NextResponse.json(
      { error: 'فشل إرسال البريد الإلكتروني', details: error.message },
      { status: 500 }
    );
  }
}