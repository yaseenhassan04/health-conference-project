import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const registrations = await prisma.conferenceRegistration.findMany({
      where: { status: 'APPROVED' },
      orderBy: { createdAt: 'asc' },
    });

    // CSV Export
    const headers = [
      'رقم التسجيل', 'الاسم الكامل', 'البريد الإلكتروني',
      'الهاتف', 'مكان العمل', 'التخصص', 'التخصص الفرعي',
      'الفئة', 'تاريخ التسجيل',
    ];

    const rows = registrations.map(r => [
      r.regNumber,
      r.fullName,
      r.email,
      r.phone,
      r.workplace,
      r.specialty,
      r.subSpecialty,
      r.invitedCategory,
      new Date(r.createdAt).toLocaleDateString('ar-EG'),
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const BOM = '\uFEFF'; // دعم العربية في Excel
    return new NextResponse(BOM + csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="conference-registrations.csv"',
      },
    });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}