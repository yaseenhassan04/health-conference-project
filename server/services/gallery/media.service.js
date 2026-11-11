import { put, list, del } from '@vercel/blob';
import { ApiError } from '@/server/lib/apiError';

const DB_BLOB_PATH = 'gallery/db.json';

async function readDb() {
  try {
    const { blobs } = await list({ prefix: DB_BLOB_PATH });
    if (!blobs.length) return { items: [], etag: null };

    const res = await fetch(blobs[0].url, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache, no-store' },
    });

    const etag = res.headers.get('etag') || blobs[0].uploadedAt;
    const data = await res.json();
    let items = Array.isArray(data?.items) ? data.items
              : Array.isArray(data) ? data : [];

    items = items.filter(item =>
      item?.src &&
      typeof item.src === 'string' &&
      !item.src.startsWith('undefined') &&
      item.src.trim() !== ''
    );

    return { items, etag };
  } catch {
    return { items: [], etag: null };
  }
}

async function writeDb(items) {
  try {
    const { blobs } = await list({ prefix: DB_BLOB_PATH });
    if (blobs.length > 0) {
      await Promise.all(blobs.map(b => del(b.url)));
    }

    // انتظر قليلاً بعد الحذف
    await new Promise(r => setTimeout(r, 800));

    const result = await put(DB_BLOB_PATH, JSON.stringify({ items }, null, 2), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
    });

    if (!result?.url) throw new Error('فشل رفع db.json');
    return result;
  } catch (err) {
    console.error('❌ فشل writeDb:', err.message);
    throw err;
  }
}

export async function getGalleryMedia() {
  const { items } = await readDb();
  return { items };
}

export async function addGalleryMedia(body) {
  const finalUrl = body.url || body.imageUrl || body.image || body.link || body.src;

  if (!finalUrl || typeof finalUrl !== 'string' || finalUrl.trim() === '' || finalUrl.startsWith('undefined')) {
    throw new ApiError(400, { error: 'فشل الرفع السحابي: الرابط المستلم غير صالح أو فارغ' });
  }

  const { items } = await readDb();
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
    order: typeof body.order === 'number' ? body.order : items.length,
  };

  items.unshift(newItem);
  await writeDb(items);
  return { items };
}

export async function deleteGalleryMedia({ id }) {
  // إعادة القراءة قبل الحذف مباشرة لضمان أحدث نسخة
  const { items } = await readDb();
  const before = items.length;

  const updated = items.filter(item => String(item.id) !== String(id));

  if (updated.length === before) {
    console.warn(`⚠️ لم يتم العثور على عنصر: ${id}`);
  }

  await writeDb(updated);
  return { items: updated };
}

export async function updateGalleryMedia({ id, patch }) {
  const { items } = await readDb();
  const index = items.findIndex(item => String(item.id) === String(id));

  if (index === -1) {
    throw new ApiError(404, { error: 'العنصر المراد تعديله غير موجود' });
  }

  items[index] = { ...items[index], ...patch };
  await writeDb(items);
  return { item: items[index], items };
}

export async function saveGalleryScreenshot({ url, captionAr, captionEn, tag, tagEn }) {
  const { items } = await readDb();
  items.unshift({
    id: Date.now(),
    src: url,
    captionAr,
    captionEn,
    tag,
    tagEn,
    category: 1,
    published: true,
  });
  await writeDb(items);
  return { success: true };
}