import prisma from '@/server/db/prisma';
import { ApiError } from '@/server/lib/apiError';

export async function listGalleryScreens() {
  const items = await prisma.galleryScreen.findMany({
    orderBy: { order: 'asc' },
  });
  return { items };
}

export async function createGalleryScreen(body) {
  const {
    type = 'link',
    titleAr,
    titleEn = '',
    descAr = '',
    descEn = '',
    icon = '🖥️',
    href = '/media',
    mediaUrl = '',
    embedCode = '',
    published = true,
    order,
  } = body;

  if (!titleAr?.trim()) {
    throw new ApiError(400, { error: 'العنوان العربي (titleAr) مطلوب' });
  }

  // حساب الترتيب التلقائي في حال لم يقم الأدمن بتحديده
  let finalOrder = order;
  if (finalOrder === undefined || finalOrder === null) {
    finalOrder = await prisma.galleryScreen.count();
  }

  const newItem = await prisma.galleryScreen.create({
    data: {
      type: type.trim(),
      titleAr: titleAr.trim(),
      titleEn: titleEn.trim(),
      descAr: descAr.trim(),
      descEn: descEn.trim(),
      icon: icon.trim(),
      href: href.trim(),
      mediaUrl: mediaUrl.trim(),
      embedCode: embedCode.trim(),
      published: Boolean(published),
      order: parseInt(finalOrder),
    },
  });

  return { status: 201, body: { item: newItem } };
}

export async function updateGalleryScreen({ id, ...updates }) {
  if (!id) {
    throw new ApiError(400, { error: 'معرف الشاشة (id) مطلوب' });
  }

  const targetId = isNaN(id) ? id : parseInt(id);

  delete updates.id;
  delete updates.createdAt;

  if (updates.order !== undefined) updates.order = parseInt(updates.order);
  if (updates.published !== undefined) updates.published = Boolean(updates.published);

  const updatedItem = await prisma.galleryScreen.update({
    where: { id: targetId },
    data: updates,
  });

  return { item: updatedItem };
}

export async function deleteGalleryScreen({ id }) {
  if (!id) {
    throw new ApiError(400, { error: 'معرف الشاشة (id) مطلوب' });
  }

  const targetId = isNaN(id) ? id : parseInt(id);

  await prisma.galleryScreen.delete({
    where: { id: targetId },
  });

  return { success: true, message: 'تم حذف شاشة التفاعل بنجاح' };
}
