import { put, list, del } from '@vercel/blob';
import { ApiError } from '@/server/lib/apiError';

const DB_BLOB_PATH = 'gallery/db.json';

async function readDb() {
  try {
    // ابحث عن الملف في الـ Blob
    const { blobs } = await list({ prefix: DB_BLOB_PATH });
    if (!blobs.length) return { items: [] };

    const res = await fetch(blobs[0].url);
    const data = await res.json();

    let items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];

    // تنظيف العناصر التالفة
    items = items.filter(
      (item) =>
        item?.src &&
        typeof item.src === 'string' &&
        !item.src.startsWith('undefined') &&
        item.src.trim() !== ''
    );

    return { items };
  } catch {
    return { items: [] };
  }
}

// media.service.js
async function writeDb(items) {
  try {
    await put(DB_BLOB_PATH, JSON.stringify({ items }, null, 2), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true, // ← أضف هاد السطر
    });
  } catch (err) {
    console.error('❌ فشل كتابة البيانات:', err.message);
    throw err;
  }
}

export async function getGalleryMedia() {
  return readDb();
}

export async function addGalleryMedia(body) {
  const finalUrl = body.url || body.imageUrl || body.image || body.link || body.src;

  if (!finalUrl || typeof finalUrl !== 'string' || finalUrl.trim() === '' || finalUrl.startsWith('undefined')) {
    throw new ApiError(400, { error: 'فشل الرفع السحابي: الرابط المستلم غير صالح أو فارغ' });
  }

  const db = await readDb();
  const newItem = {
    id: Date.now(),
    src: finalUrl,
    thumbnail: body.thumbnail || '',
    type: body.type || 'image',
    captionAr: body.captionAr || body.title || '',
    captionEn: body.captionEn || '',
    tag: body.tag || 'فعاليات',
    tagEn: body.tagEn || 'Events',
    category: body.category ? Number(body.category) : 1,
    published: body.published !== false,
    order: typeof body.order === 'number' ? body.order : db.items.length,
  };

  db.items.unshift(newItem);
  await writeDb(db.items);
  return db;
}

export async function deleteGalleryMedia({ id }) {
  const db = await readDb();
  const before = db.items.length;

  db.items = db.items.filter((item) => String(item.id) !== String(id));

  if (db.items.length === before) {
    console.warn(`⚠️ لم يتم العثور على عنصر: ${id}`);
  }

  await writeDb(db.items);
  return db;
}

export async function updateGalleryMedia({ id, patch }) {
  const db = await readDb();
  const index = db.items.findIndex((item) => String(item.id) === String(id));

  if (index === -1) {
    throw new ApiError(404, { error: 'العنصر المراد تعديله غير موجود' });
  }

  db.items[index] = { ...db.items[index], ...patch };
  await writeDb(db.items);
  return { item: db.items[index], items: db.items };
}

export async function saveGalleryScreenshot({ url, captionAr, captionEn, tag, tagEn }) {
  const db = await readDb();
  db.items.unshift({
    id: Date.now(),
    src: url,
    captionAr,
    captionEn,
    tag,
    tagEn,
    category: 1,
    published: true,
  });
  await writeDb(db.items);
  return { success: true };
}