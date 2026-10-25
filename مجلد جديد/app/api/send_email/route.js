import { NextResponse } from 'next/server';
import { ApiError } from '@/server/lib/apiError';
import { sendAbstractStatusEmail } from '@/server/services/sendEmail.service';

export async function POST(req) {
  try {
    const data = await req.json();
    const result = await sendAbstractStatusEmail(data);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.body, { status: error.status });
    }
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
