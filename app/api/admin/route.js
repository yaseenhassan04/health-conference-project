/**
 * API: إدارة حسابات الإدارة
 * المسار: /api/admin
 * الوصف: إنشاء وتعديل وحذف حسابات المسؤولين (مؤمن بالكامل)
 */

import { NextResponse } from 'next/server';
import { isAdminAuthorized } from '@/server/lib/adminAuth';
import { ApiError } from '@/server/lib/apiError';
import { listAdmins, createAdmin, updateAdmin, deleteAdmin } from '@/server/services/admin.service';

// منع الـ Caching لضمان قراءة فورية ومحدثة دائماً للحسابات
export const dynamic = 'force-dynamic';

// ─── GET: الحصول على قائمة المسؤولين ───
export async function GET(req) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await listAdmins();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to fetch admins:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// ─── POST: إنشاء حساب إدارة جديد وتشفيره ───
export async function POST(req) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { username, password } = await req.json();
    const { status, body } = await createAdmin({ username, password });
    return NextResponse.json(body, { status });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.body, { status: error.status });
    }
    console.error('Failed to create admin:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// ─── PUT: تعديل حساب إدارة ───
export async function PUT(req) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, username, password } = await req.json();
    const result = await updateAdmin({ id, username, password });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.body, { status: error.status });
    }
    console.error('Failed to update admin:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

// ─── DELETE: حذف حساب إدارة ───
export async function DELETE(req) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const result = await deleteAdmin({ id });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.body, { status: error.status });
    }
    console.error('Failed to delete admin:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
