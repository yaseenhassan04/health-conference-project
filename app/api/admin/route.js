/**
 * API: إدارة حسابات الإدارة
 * المسار: /api/admin
 * الوصف: إنشاء وتعديل وحذف حسابات المسؤولين
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// الحصول على قائمة المسؤولين
export async function GET() {
  try {
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        username: true,
        createdAt: true
      }
    });
    return Response.json({ admins });
  } catch (error) {
    console.error('Failed to fetch admins:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// إنشاء حساب إدارة جديد
export async function POST(req) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return Response.json(
        { error: 'يجب تقديم اسم المستخدم وكلمة المرور' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return Response.json(
        { error: 'كلمة المرور يجب أن تكون على الأقل 6 أحرف' },
        { status: 400 }
      );
    }

    const existingAdmin = await prisma.admin.findUnique({
      where: { username }
    });

    if (existingAdmin) {
      return Response.json(
        { error: 'اسم المستخدم موجود بالفعل' },
        { status: 400 }
      );
    }

    // ملاحظة: في الإنتاج، استخدم bcrypt لتجزئة كلمات المرور
    // const hashedPassword = await bcrypt.hash(password, 10);
    
    const newAdmin = await prisma.admin.create({
      data: { username, password }
    });

    return Response.json({
      message: 'تم إنشاء حساب الإدارة بنجاح',
      admin: { id: newAdmin.id, username: newAdmin.username }
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to create admin:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// تعديل حساب إدارة
export async function PUT(req) {
  try {
    const { id, username, password } = await req.json();

    if (!id) {
      return Response.json({ error: 'معرف الإدارة مطلوب' }, { status: 400 });
    }

    const updateData = {};
    if (username) updateData.username = username;
    if (password) {
      if (password.length < 6) {
        return Response.json(
          { error: 'كلمة المرور يجب أن تكون على الأقل 6 أحرف' },
          { status: 400 }
        );
      }
      updateData.password = password;
    }

    const updatedAdmin = await prisma.admin.update({
      where: { id: parseInt(id) },
      data: updateData,
      select: { id: true, username: true }
    });

    return Response.json({
      message: 'تم تحديث حساب الإدارة',
      admin: updatedAdmin
    });
  } catch (error) {
    console.error('Failed to update admin:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// حذف حساب إدارة
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return Response.json({ error: 'معرف الإدارة مطلوب' }, { status: 400 });
    }

    // منع حذف آخر مسؤول
    const adminCount = await prisma.admin.count();
    if (adminCount <= 1) {
      return Response.json(
        { error: 'لا يمكن حذف آخر حساب إدارة' },
        { status: 400 }
      );
    }

    await prisma.admin.delete({
      where: { id: parseInt(id) }
    });

    return Response.json({ message: 'تم حذف حساب الإدارة' });
  } catch (error) {
    console.error('Failed to delete admin:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
