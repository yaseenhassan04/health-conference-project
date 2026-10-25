import { NextResponse } from 'next/server';
import { ApiError } from '@/server/lib/apiError';
import { submitAbstract, listAbstracts, updateAbstractStatus } from '@/server/services/abstracts.service';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const result = await submitAbstract({
      title: formData.get('title'),
      authorName: formData.get('authorName'),
      email: formData.get('email'),
      category: formData.get('category') || 'General',
      file: formData.get('file'),
    });
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.body, { status: error.status });
    }
    console.error('❌ Error:', error);
    return NextResponse.json({ success: false, error: 'حدث خطأ في الخادم', details: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const result = await listAbstracts();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'حدث خطأ في جلب البيانات', abstracts: [] }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    // note = الرسالة المخصّصة القادمة من الكارد (اختيارية)
    const { id, status, note } = await request.json();
    const result = await updateAbstractStatus({ id, status, note });
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.body, { status: error.status });
    }
    return NextResponse.json({ success: false, error: 'حدث خطأ في التحديث', details: error.message }, { status: 500 });
  }
}