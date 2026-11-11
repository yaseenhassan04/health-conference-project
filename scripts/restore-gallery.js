require('dotenv').config({ path: '.env.local' });
const { list, put, del } = require('@vercel/blob');

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const DB_PATH = 'gallery/db.json';

// فقط صور وفيديوهات المعرض الحقيقية
function isGalleryFile(pathname) {
  const ext = pathname.split('.').pop().toLowerCase();
  const validExts = ['jpg','jpeg','png','webp','gif','mp4','webm','mov'];
  if (!validExts.includes(ext)) return false;
  
  // استثني الملفات غير المرغوبة
  const excluded = [
    'abstracts/', 'library/', 'banner_16x5', 
    'announcement', 'trophy', 'OIP', 'hero'
  ];
  return !excluded.some(ex => pathname.includes(ex));
}

function extractInfo(pathname) {
  const ext = pathname.split('.').pop().toLowerCase();
  const isVideo = ['mp4','webm','mov'].includes(ext);
  
  // استخرج اسم ذكي
  let name = pathname.split('/').pop().replace(/\.[^.]+$/, '');
  name = name.replace(/-[a-zA-Z0-9]{15,}$/, ''); // احذف الهاش
  try { name = decodeURIComponent(name); } catch {}
  name = name.replace(/[-_]/g, ' ').trim();
  
  // حدد التاغ
  let tag = 'فعاليات', tagEn = 'Events';
  const lower = pathname.toLowerCase();
  if (lower.includes('ورشة') || lower.includes('workshop') || lower.includes('تنظير')) {
    tag = 'ورش الطبية'; tagEn = 'Workshops';
  } else if (lower.includes('مؤتمر') || lower.includes('conference')) {
    tag = 'المؤتمر'; tagEn = 'Conference';
  } else if (lower.includes('تكريم')) {
    tag = 'تكريم'; tagEn = 'Awards';
  } else if (isVideo || lower.includes('video') || lower.includes('promo')) {
    tag = 'فيديوهات'; tagEn = 'Videos';
  }
  
  return { isVideo, name: name || 'فعالية', tag, tagEn };
}

async function main() {
  console.log('🔍 جاري جلب الملفات...');
  
  // جلب كل الملفات
  let allBlobs = [], cursor;
  do {
    const result = await list({ token: TOKEN, cursor, limit: 100 });
    allBlobs = allBlobs.concat(result.blobs);
    cursor = result.cursor;
  } while (cursor);
  
  console.log(`📦 وجدت ${allBlobs.length} ملف`);
  
  // فلتر صور المعرض فقط
  const galleryBlobs = allBlobs.filter(b => isGalleryFile(b.pathname));
  console.log(`🖼️  صور المعرض: ${galleryBlobs.length} ملف`);
  
  // بناء قائمة الصور
  const items = galleryBlobs.map((blob, i) => {
    const { isVideo, name, tag, tagEn } = extractInfo(blob.pathname);
    return {
      id: Date.now() + i,
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
  
  // احذف db.json القديم وارفع الجديد
  console.log('💾 جاري حفظ db.json...');
  const { blobs: oldDbs } = await list({ prefix: 'gallery/db.json', token: TOKEN });
  if (oldDbs.length) {
    await Promise.all(oldDbs.map(b => del(b.url, { token: TOKEN })));
    console.log('🗑️  حذف db.json القديم');
  }
  
  const { put } = require('@vercel/blob');
  await put('gallery/db.json', JSON.stringify({ items }, null, 2), {
    token: TOKEN,
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  
  console.log('\n========== النتيجة ==========');
  console.log(`✅ تم حفظ ${items.length} عنصر في db.json`);
  console.log('==============================');
  console.log('\n🌐 افتح الموقع وتحقق من المعرض!');
}

main().catch(console.error);