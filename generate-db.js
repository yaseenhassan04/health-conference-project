require('dotenv').config({ path: '.env.local' });
const { list } = require('@vercel/blob');
const fs = require('fs');

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

// ✅ ID ثابت مبني على الـ URL
function stableId(src) {
  let h = 0;
  for (let i = 0; i < src.length; i++) {
    h = Math.imul(31, h) + src.charCodeAt(i) | 0;
  }
  return Math.abs(h);
}

function isGalleryFile(pathname) {
  const ext = pathname.split('.').pop().toLowerCase();
  const validExts = ['jpg','jpeg','png','webp','gif','mp4','webm','mov'];
  if (!validExts.includes(ext)) return false;
  const excluded = ['abstracts/', 'library/', 'banner_16x5', 'announcement', 'trophy', 'OIP', 'hero'];
  return !excluded.some(ex => pathname.includes(ex));
}

function extractInfo(pathname, uploadedAt) {
  const ext = pathname.split('.').pop().toLowerCase();
  const isVideo = ['mp4','webm','mov'].includes(ext);

  let name = pathname.split('/').pop().replace(/\.[^.]+$/, '');
  name = name.replace(/^\d{13}-/, '');
  name = name.replace(/-[a-zA-Z0-9]{10,}$/, '');
  try { name = decodeURIComponent(name); } catch {}
  name = name.replace(/[-_]/g, ' ').trim();

  if (!name || /^\d+$/.test(name)) {
    const d = new Date(uploadedAt).toLocaleDateString('ar-EG', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    name = isVideo ? `فيديو ${d}` : `صورة ${d}`;
  }

  let tag = 'فعاليات', tagEn = 'Events';
  const lower = pathname.toLowerCase();
  if (lower.includes('ورشة') || lower.includes('workshop') || lower.includes('تنظير')) {
    tag = 'ورش'; tagEn = 'Workshops';
  } else if (lower.includes('مؤتمر') || lower.includes('conference')) {
    tag = 'متحدثون'; tagEn = 'Conference';
  } else if (lower.includes('تكريم')) {
    tag = 'جلسات'; tagEn = 'Awards';
  } else if (isVideo || lower.includes('video') || lower.includes('promo')) {
    tag = 'فعاليات'; tagEn = 'Videos';
  }

  return { isVideo, name, tag, tagEn };
}

async function main() {
  console.log('🔍 جاري جلب الملفات من Blob...');

  // جلب كل الملفات (قراءة فقط — لا تحتاج store شغّال للكتابة)
  let allBlobs = [], cursor;
  do {
    const result = await list({ token: TOKEN, cursor, limit: 1000 });
    allBlobs = allBlobs.concat(result.blobs);
    cursor = result.cursor;
  } while (cursor);

  console.log(`📦 إجمالي الملفات: ${allBlobs.length}`);

  // فلترة صور المعرض فقط (بدون تقييد تاريخ)
  const galleryBlobs = allBlobs.filter(b => isGalleryFile(b.pathname));
  console.log(`🖼️  صور المعرض: ${galleryBlobs.length} ملف`);

  // إزالة التكرار بناءً على الـ URL
  const seen = new Set();
  const unique = galleryBlobs.filter(b => {
    if (seen.has(b.url)) return false;
    seen.add(b.url);
    return true;
  });
  console.log(`✨ بعد إزالة التكرار: ${unique.length} ملف`);

  // بناء الـ items
  const items = unique.map((blob, i) => {
    const { isVideo, name, tag, tagEn } = extractInfo(blob.pathname, blob.uploadedAt);
    return {
      id: stableId(blob.url),
      src: blob.url,
      thumbnail: '',
      type: isVideo ? 'video' : 'image',
      captionAr: name,
      captionEn: name,
      tag,
      tagEn,
      category: 1,
      published: true,
      order: i,
    };
  });

  // حفظ محلياً
  const output = JSON.stringify({ items }, null, 2);
  fs.writeFileSync('gallery-db.json', output);

  console.log('\n========== النتيجة ==========');
  console.log(`✅ تم توليد gallery-db.json`);
  console.log(`📊 العناصر: ${items.length}`);
  console.log('==============================');
  console.log('\n📋 الخطوة التالية:');
  console.log('  ارفع gallery-db.json يدوياً على Vercel Blob كـ: gallery/db.json');
  console.log('  Storage → db_health_public → Manage Blobs → Upload');
}

main().catch(console.error);