require('dotenv').config({ path: '.env.local' });
const { list, put, del } = require('@vercel/blob');

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const DB_PATH = 'gallery/db.json';

function isGalleryFile(pathname) {
  const ext = pathname.split('.').pop().toLowerCase();
  const validExts = ['jpg','jpeg','png','webp','gif','mp4','webm','mov'];
  if (!validExts.includes(ext)) return false;
  
  const excluded = [
    'abstracts/', 'library/', 'banner_16x5', 
    'announcement', 'trophy', 'OIP', 'hero'
  ];
  return !excluded.some(ex => pathname.includes(ex));
}

function extractInfo(pathname, uploadedAt) {
  const ext = pathname.split('.').pop().toLowerCase();
  const isVideo = ['mp4','webm','mov'].includes(ext);
  
  let name = pathname.split('/').pop().replace(/\.[^.]+$/, '');
  
  // احذف timestamp في البداية (13 رقم)
  name = name.replace(/^\d{13}-/, '');
  
  // احذف الهاش في النهاية
  name = name.replace(/-[a-zA-Z0-9]{10,}$/, '');
  
  try { name = decodeURIComponent(name); } catch {}
  name = name.replace(/[-_]/g, ' ').trim();
  
  // إذا بقي رقم أو فاضي، استخدم التاريخ
  if (!name || /^\d+$/.test(name)) {
    const date = new Date(uploadedAt);
    const d = date.toLocaleDateString('ar-EG', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    name = isVideo ? `فيديو ${d}` : `صورة ${d}`;
  }
  
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
  
  return { isVideo, name, tag, tagEn };
}

async function main() {
  console.log('🔍 جاري جلب الملفات...');
  
  let allBlobs = [], cursor;
  do {
    const result = await list({ token: TOKEN, cursor, limit: 100 });
    allBlobs = allBlobs.concat(result.blobs);
    cursor = result.cursor;
  } while (cursor);
  
  console.log(`📦 وجدت ${allBlobs.length} ملف`);

  const fromDate = new Date('2026-10-01');
  const toDate = new Date();

  const galleryBlobs = allBlobs.filter(b => {
    if (!isGalleryFile(b.pathname)) return false;
    const uploaded = new Date(b.uploadedAt);
    return uploaded >= fromDate && uploaded <= toDate;
  });

  console.log(`🖼️  صور المعرض (أكتوبر → اليوم): ${galleryBlobs.length} ملف`);

  galleryBlobs.forEach(b => {
    const { name } = extractInfo(b.pathname, b.uploadedAt);
    const date = new Date(b.uploadedAt).toLocaleDateString('ar-EG');
    console.log(`  📅 ${date} — ${name}`);
  });

  const items = galleryBlobs.map((blob, i) => {
    const { isVideo, name, tag, tagEn } = extractInfo(blob.pathname, blob.uploadedAt);
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

  console.log('\n💾 جاري حفظ db.json...');
  const { blobs: oldDbs } = await list({ prefix: 'gallery/db', token: TOKEN });
  if (oldDbs.length) {
    await Promise.all(oldDbs.map(b => del(b.url, { token: TOKEN })));
    console.log('🗑️  حذف db.json القديم');
  }

  await new Promise(r => setTimeout(r, 1000));

  await put(DB_PATH, JSON.stringify({ items }, null, 2), {
    token: TOKEN,
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  console.log('\n========== النتيجة ==========');
  console.log(`✅ تم حفظ ${items.length} عنصر في db.json`);
  console.log(`📅 الفترة: 1 أكتوبر 2026 → ${toDate.toLocaleDateString('ar-EG')}`);
  console.log('==============================');
  console.log('\n🌐 افتح الموقع وتحقق من المعرض!');
}

main().catch(console.error);