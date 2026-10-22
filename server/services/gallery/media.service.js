import fs from 'fs';
import path from 'path';
import { ApiError } from '@/server/lib/apiError';

const DB_PATH = path.join(process.cwd(), 'gallery-db.json');

// دالة قراءة قاعدة البيانات وتنظيفها من الملفات التالفة الناتجة عن المحاولات السابقة
function readDb() {
  try {
    if (!fs.existsSync(DB_PATH)) return { items: [] };
    const fileContent = fs.readFileSync(DB_PATH, 'utf8');
    const data = JSON.parse(fileContent);

    let items = [];
    if (data && Array.isArray(data.items)) {
      items = data.items;
    } else if (Array.isArray(data)) {
      items = data;
    }

    // 🛡️ تنظيف تلقائي: حذف أي عنصر تالف لا يحتوي على رابط (src) صالح لمنع الشاشة البيضاء
    const cleanItems = items.filter(
      (item) => item && item.src && typeof item.src === 'string' && !item.src.startsWith('undefined') && item.src.trim() !== ''
    );

    return { items: cleanItems };
  } catch {
    return { items: [] };
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('❌ فشل كتابة البيانات:', err.message);
  }
}

export function getGalleryMedia() {
  return readDb();
}

export function addGalleryMedia(body) {
  const finalUrl = body.url || body.imageUrl || body.image || body.link || body.src;

  // 🛑 جدار حماية لمنع حفظ الروابط الفارغة أو التالفة التي تسبب شاشات بيضاء
  if (!finalUrl || typeof finalUrl !== 'string' || finalUrl.trim() === '' || finalUrl.startsWith('undefined')) {
    throw new ApiError(400, { error: 'فشل الرفع السحابي: الرابط المستلم غير صالح أو فارغ' });
  }

  const db = readDb();
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
  writeDb(db);
  return db;
}

// 💡 تعديل دالة الحذف: تحويل الطرفين إلى String للمقارنة الآمنة وحذف العنصر نهائياً
export function deleteGalleryMedia({ id }) {
  const db = readDb();
  const initialCount = db.items.length;
  
  db.items = db.items.filter((item) => String(item.id) !== String(id));
  
  if (db.items.length === initialCount) {
    console.warn(`⚠️ لم يتم العثور على عنصر بالمُعرّف: ${id} للحذف`);
  }

  writeDb(db);
  return db;
}

// 💡 إضافة دالة التعديل والترتيب (PATCH) لضمان توافقها مع Route.js
export function updateGalleryMedia({ id, patch }) {
  const db = readDb();
  const index = db.items.findIndex((item) => String(item.id) === String(id));

  if (index === -1) {
    throw new ApiError(404, { error: 'العنصر المراد تعديله غير موجود' });
  }

  // دمج البيانات التحديثية مع العنصر القديم
  db.items[index] = {
    ...db.items[index],
    ...patch,
  };

  writeDb(db);
  return { item: db.items[index], items: db.items };
}

export function saveGalleryScreenshot({ url, captionAr, captionEn, tag, tagEn }) {
  const db = readDb();
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
  writeDb(db);
  return { success: true };
}