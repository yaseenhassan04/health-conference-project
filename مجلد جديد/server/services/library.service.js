import { put, del } from '@vercel/blob';
import prisma from '@/server/db/prisma';
import { ApiError } from '@/server/lib/apiError';

/* ─── قائمة المراجع (ذكية: تظهر كلها للمشرف، والمنشورة فقط للزوار) ─── */
export async function listLibraryItems({ isAdmin }) {
  const items = isAdmin
    ? await prisma.library.findMany({ orderBy: { createdAt: 'desc' } })
    : await prisma.library.findMany({
        where: { published: true },
        orderBy: { createdAt: 'desc' },
      });

  return { items };
}

/* ─── إضافة مرجع علمي جديد ─── */
export async function createLibraryItem({ title, author, file }) {
  if (!title?.trim()) {
    throw new ApiError(400, { error: 'العنوان مطلوب' });
  }
  if (!file) {
    throw new ApiError(400, { error: 'الملف مطلوب' });
  }

  const finalAuthor = author || 'اللجنة العلمية';
  const bytes = await file.arrayBuffer();
  const fileBuffer = Buffer.from(bytes);
  const filename = `${Date.now()}-${finalAuthor.replace(/\s+/g, '-')}.pdf`;

  const blob = await put(`library/${filename}`, fileBuffer, {
    access: 'public',
    token: process.env.PUBLIC_BLOB_READ_WRITE_TOKEN,
  });

  const newItem = await prisma.library.create({
    data: {
      title: title.trim(),
      author: finalAuthor.trim(),
      category: 'General',
      type: 'book',
      fileUrl: blob.url,
      description: '',
      year: new Date().getFullYear(),
      published: true,
    },
  });

  return { status: 201, body: { success: true, data: newItem } };
}

/* ─── تعديل مرجع علمي ─── */
export async function updateLibraryItem({ id, ...updates }) {
  if (!id) {
    throw new ApiError(400, { error: 'معرف العنصر (id) مطلوب' });
  }

  const targetId = isNaN(id) ? id : parseInt(id);

  delete updates.id;
  delete updates.createdAt;

  if (updates.year) updates.year = parseInt(updates.year);
  if (updates.published !== undefined) updates.published = Boolean(updates.published);

  const updatedItem = await prisma.library.update({
    where: { id: targetId },
    data: updates,
  });

  return { success: true, item: updatedItem };
}

/* ─── حذف مرجع (+ تنظيف الملف من السحابة فوراً) ─── */
export async function deleteLibraryItem({ id }) {
  if (!id) {
    throw new ApiError(400, { error: 'معرف العنصر (id) مطلوب كـ Parameter' });
  }

  const targetId = isNaN(id) ? id : parseInt(id);

  const targetItem = await prisma.library.findUnique({
    where: { id: targetId },
  });

  if (!targetItem) {
    throw new ApiError(404, { error: 'العنصر غير موجود بالفعل' });
  }

  if (targetItem.fileUrl && targetItem.fileUrl.includes('public.blob.vercel-storage.com')) {
    try {
      await del(targetItem.fileUrl);
    } catch (blobErr) {
      console.error('تنبيـه: فشل حذف الملف من السحابة، سنستمر بحذف البيانات الوصفية:', blobErr.message);
    }
  }

  await prisma.library.delete({
    where: { id: targetId },
  });

  return { success: true, message: 'تم حذف المرجع العلمي والملف التابع له بنجاح' };
}
