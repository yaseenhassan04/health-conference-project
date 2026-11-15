import { put, list, del } from '@vercel/blob';
import { ApiError } from '@/server/lib/apiError';

const DB_PREFIX = 'gallery/db';
const DB_PATH = 'gallery/db.json';

function stableId(src) {
  let h = 0;
  for (let i = 0; i < src.length; i++) {
    h = Math.imul(31, h) + src.charCodeAt(i) | 0;
  }
  return Math.abs(h);
}

async function readDb() {
  // ① الأولوية الأولى دائماً: Vercel Blob — هو المصدر الحقيقي للبيانات
  try {
    const { blobs } = await list({ prefix: DB_PREFIX });
    if (blobs.length) {
      const latest = blobs.sort((a, b) =>
        new Date(b.uploadedAt) - new Date(a.uploadedAt)
      )[0];
      const res = await fetch(latest.url, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        let items = Array.isArray(data?.items) ? data.items : [];
        items = items.filter(item => item?.src && !item.src.startsWith('undefined'));
        // نرجع حتى لو فاضي — لأن Blob هو المصدر الموثوق
        return { items };
      }
    }
  } catch (err) {
    console.warn('⚠️ تعذّر قراءة Blob، سنجرب الملف المحلي:', err.message);
  }

  // ② fallback فقط: الملف المحلي في /public (للتطوير المحلي فقط)
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://health-conference-project.vercel.app';
    const res = await fetch(`${siteUrl}/gallery-db.json`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      const items = Array.isArray(data?.items) ? data.items : [];
      if (items.length > 0) {
        console.log('📂 تم التحميل من الملف المحلي (fallback)');
        return { items };
      }
    }
  } catch {}

  return { items: [] };
}

async function writeDb(items) {
  try {
    // احذف النسخ القديمة أولاً
    const { blobs } = await list({ prefix: DB_PREFIX });
    if (blobs.length > 0) {
      await Promise.all(blobs.map(b => del(b.url)));
    }

    // انتظر لحظة بعد الحذف لضمان الاتساق
    await new Promise(r => setTimeout(r, 1000));

    // ارفع النسخة الجديدة
    const result = await put(DB_PATH, JSON.stringify({ items }, null, 2), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
    });

    if (!result?.url) throw new Error('فشل رفع db.json — الرابط فارغ');
    console.log('✅ تم حفظ قاعدة البيانات في Blob:', result.url);
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

  // تجنّب التكرار
  const existingIndex = items.findIndex(i => i.src === finalUrl);
  if (existingIndex !== -1) {
    return { items };
  }

  const newItem = {
    id: stableId(finalUrl),
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
  const { items } = await readDb();
  const before = items.length;
  const updated = items.filter(item => String(item.id) !== String(id));

  if (updated.length === before) {
    console.warn(`⚠️ لم يتم العثور على عنصر للحذف: ${id}`);
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
    id: stableId(url),
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