import bcrypt from 'bcryptjs';
import prisma from '@/server/db/prisma';
import { ApiError } from '@/server/lib/apiError';

export async function listAdmins() {
  const admins = await prisma.admin.findMany({
    select: {
      id: true,
      username: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  return { admins };
}

export async function createAdmin({ username, password }) {
  if (!username?.trim() || !password) {
    throw new ApiError(400, { error: 'يجب تقديم اسم المستخدم وكلمة المرور' });
  }

  if (password.length < 6) {
    throw new ApiError(400, { error: 'كلمة المرور يجب أن تكون على الأقل 6 أحرف' });
  }

  const normalizedUsername = username.trim().toLowerCase();

  const existingAdmin = await prisma.admin.findUnique({
    where: { username: normalizedUsername },
  });

  if (existingAdmin) {
    throw new ApiError(400, { error: 'اسم المستخدم موجود بالفعل' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newAdmin = await prisma.admin.create({
    data: {
      username: normalizedUsername,
      password: hashedPassword,
    },
  });

  return {
    status: 201,
    body: {
      message: 'تم إنشاء حساب الإدارة بنجاح',
      admin: { id: newAdmin.id, username: newAdmin.username },
    },
  };
}

export async function updateAdmin({ id, username, password }) {
  if (!id) {
    throw new ApiError(400, { error: 'معرف الإدارة مطلوب' });
  }

  const updateData = {};
  if (username) updateData.username = username.trim().toLowerCase();

  if (password) {
    if (password.length < 6) {
      throw new ApiError(400, { error: 'كلمة المرور يجب أن تكون على الأقل 6 أحرف' });
    }
    updateData.password = await bcrypt.hash(password, 10);
  }

  const targetId = isNaN(id) ? id : parseInt(id);

  const updatedAdmin = await prisma.admin.update({
    where: { id: targetId },
    data: updateData,
    select: { id: true, username: true },
  });

  return {
    message: 'تم تحديث حساب الإدارة بنجاح',
    admin: updatedAdmin,
  };
}

export async function deleteAdmin({ id }) {
  if (!id) {
    throw new ApiError(400, { error: 'معرف الإدارة مطلوب' });
  }

  const adminCount = await prisma.admin.count();
  if (adminCount <= 1) {
    throw new ApiError(400, { error: 'حماية النظام: لا يمكن حذف آخر حساب إدارة متبقي' });
  }

  const targetId = isNaN(id) ? id : parseInt(id);

  await prisma.admin.delete({
    where: { id: targetId },
  });

  return { message: 'تم حذف حساب الإدارة بنجاح' };
}
