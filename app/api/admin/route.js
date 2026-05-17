/**
 * API: إدارة حسابات الإدارة
 * المسار: /api/admin
 * الوصف: إنشاء وتعديل وحذف حسابات المسؤولين (مؤمن بالكامل)
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// منع الـ Caching لضمان قراءة فورية ومحدثة دائماً للحسابات
export const dynamic = 'force-dynamic';

// دالة التحقق من التوكن السري للإدارة
function checkAuth(req) {
  return req.headers.get('x-admin-token') === process.env.ADMIN_TOKEN;
}

// ─── GET: الحصول على قائمة المسؤولين ───
export async function GET(req) {
  // حماية المسار
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        username: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ admins });
  } catch (error) {
    console.error('Failed to fetch admins:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// ─── POST: إنشاء حساب إدارة جديد وتشفيره ───
export async function POST(req) {
  // حماية المسار
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { username, password } = await req.json();

    if (!username?.trim() || !password) {
      return NextResponse.json(
        { error: 'يجب تقديم اسم المستخدم وكلمة المرور' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'كلمة المرور يجب أن تكون على الأقل 6 أحرف' },
        { status: 400 }
      );
    }

    const normalizedUsername = username.trim().toLowerCase();

    // التأكد من عدم تكرار اسم المستخدم
    const existingAdmin = await prisma.admin.findUnique({
      where: { username: normalizedUsername }
    });

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'اسم المستخدم موجود بالفعل' },
        { status: 400 }
      );
    }

    // 🔥 حماية أمنية: تجزئة وتشفير كلمة المرور قبل الحفظ
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newAdmin = await prisma.admin.create({
      data: { 
        username: normalizedUsername, 
        password: hashedPassword 
      }
    });

    return NextResponse.json({
      message: 'تم إنشاء حساب الإدارة بنجاح',
      admin: { id: newAdmin.id, username: newAdmin.username }
    }, { status: 201 });

  } catch (error) {
    console.error('Failed to create admin:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// ─── PUT: تعديل حساب إدارة ───
export async function PUT(req) {
  // حماية المسار
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, username, password } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'معرف الإدارة مطلوب' }, { status: 400 });
    }

    const updateData = {};
    if (username) updateData.username = username.trim().toLowerCase();
    
    if (password) {
      if (password.length < 6) {
        return NextResponse.json(
          { error: 'كلمة المرور يجب أن تكون على الأقل 6 أحرف' },
          { status: 400 }
        );
      }
      // تشفير كلمة المرور الجديدة في حال تعديلها
      updateData.password = await bcrypt.hash(password, 10);
    }

    // فحص ذكي لنوع المعرّف (String أو Int) لتفادي أخطاء الـ Validation في بريسما
    const targetId = isNaN(id) ? id : parseInt(id);

    const updatedAdmin = await prisma.admin.update({
      where: { id: targetId },
      data: updateData,
      select: { id: true, username: true }
    });

    return NextResponse.json({
      message: 'تم تحديث حساب الإدارة بنجاح',
      admin: updatedAdmin
    });

  } catch (error) {
    console.error('Failed to update admin:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

// ─── DELETE: حذف حساب إدارة ───
export async function DELETE(req) {
  // حماية المسار
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'معرف الإدارة مطلوب' }, { status: 400 });
    }

    // منع حذف آخر مسؤول في النظام لحماية لوحة التحكم
    const adminCount = await prisma.admin.count();
    if (adminCount <= 1) {
      return NextResponse.json(
        { error: 'حماية النظام: لا يمكن حذف آخر حساب إدارة متبقي' },
        { status: 400 }
      );
    }

    // فحص ذكي لنوع المعرّف
    const targetId = isNaN(id) ? id : parseInt(id);

    await prisma.admin.delete({
      where: { id: targetId }
    });

    return NextResponse.json({ message: 'تم حذف حساب الإدارة بنجاح' });

  } catch (error) {
    console.error('Failed to delete admin:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

