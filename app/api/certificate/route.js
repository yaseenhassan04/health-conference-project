import { NextResponse } from 'next/server';
import { ApiError } from '@/server/lib/apiError';
import { generateCertificate } from '@/server/services/certificate.service';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  try {
    const { pdfBytes, userId } = await generateCertificate({
      email,
      host: req.headers.get('host'),
    });

    // تصدير الملف كاستجابة تحميل مباشرة للمتصفح (Binary Stream)
    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=Certificate_${userId}.pdf`,
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.body, { status: error.status });
    }
    console.error('Certificate Generation Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
