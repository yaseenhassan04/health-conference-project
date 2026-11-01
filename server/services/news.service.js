import prisma from '@/server/db/prisma';
import { ApiError } from '@/server/lib/apiError';

export async function listNews() {
  const items = await prisma.news.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return { items };
}

export async function createNews({ title, date, icon = '📰', content, published = true }) {
  if (!title?.trim() || !content?.trim()) {
    throw new ApiError(400, { error: 'العنوان والمحتوى حقول مطلوبة لإتمام النشر' });
  }

  const finalDate = date || new Date().toLocaleDateString('ar-EG');

  const newItem = await prisma.news.create({
    data: {
      title: title.trim(),
      date: finalDate,
      icon: icon.trim(),
      content: content.trim(),
      published: Boolean(published),
    },
  });

  return { status: 201, body: { item: newItem } };
}

export async function updateNews({ id, ...updates }) {
  if (!id) {
    throw new ApiError(400, { error: 'معرف الخبر (id) مطلوب' });
  }

  const targetId = isNaN(id) ? id : parseInt(id);

  delete updates.id;
  delete updates.createdAt;
  if (updates.published !== undefined) updates.published = Boolean(updates.published);

  const updatedItem = await prisma.news.update({
    where: { id: targetId },
    data: updates,
  });

  return { item: updatedItem };
}

export async function deleteNews({ id }) {
  if (!id) {
    throw new ApiError(400, { error: 'معرف الخبر (id) مطلوب كـ Parameter' });
  }

  const targetId = isNaN(id) ? id : parseInt(id);

  await prisma.news.delete({
    where: { id: targetId },
  });

  return { success: true, message: 'تم حذف الخبر بنجاح من شريط المستجدات' };
}
