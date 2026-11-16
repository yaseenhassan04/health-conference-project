// scripts/restore-gallery.js
// شغّله: node scripts/restore-gallery.js

const { list, put } = require('@vercel/blob');

async function restore() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    console.error('❌ BLOB_READ_WRITE_TOKEN غير موجود');
    process.exit(1);
  }

  console.log('🔍 جاري البحث عن الصور في Blob...');

  // جلب كل الملفات من Blob
  let cursor;
  const allBlobs = [];
  do {
    const result = await list({ token, cursor, limit: 1000 });
    allBlobs.push(...result.blobs);
    cursor = result.cursor;
  } while (cursor);

  console.log(`📦 وجدت ${allBlobs.length} ملف في Blob`);

  // فلترة الصور والفيديوهات فقط (مش db.json)
  const mediaBlobs = allBlobs.filter(b => {
    const url = b.url.toLowerCase();
    return (
      !b.url.includes('db.json') &&
      !b.url.includes('gallery/db') &&
      (url.endsWith('.jpg') || url.endsWith('.jpeg') ||
       url.endsWith('.png') || url.endsWith('.webp') ||
       url.endsWith('.gif') || url.endsWith('.mp4') ||
       url.endsWith('.webm'))
    );
  });

  console.log(`🖼️ وجدت ${mediaBlobs.length} صورة/فيديو للاسترجاع`);

  if (mediaBlobs.length === 0) {
    console.log('⚠️ لا توجد صور للاسترجاع');
    return;
  }

  // بناء قائمة العناصر
  function stableId(src) {
    let h = 0;
    for (let i = 0; i < src.length; i++) {
      h = Math.imul(31, h) + src.charCodeAt(i) | 0;
    }
    return Math.abs(h);
  }

  const items = mediaBlobs.map((blob, index) => {
    const isVideo = blob.url.match(/\.(mp4|webm|mov)$/i);
    return {
      id: stableId(blob.url),
      src: blob.url,
      thumbnail: '',
      type: isVideo ? 'video' : 'image',
      captionAr: '',
      captionEn: '',
      tag: 'المؤتمرات السابقة',
      tagEn: 'Previous Conferences',
      category: 1,
      published: true,
      order: index,
    };
  });

  console.log(`✍️ جاري كتابة db.json بـ ${items.length} عنصر...`);

  // حذف db.json القديم
  const dbBlobs = allBlobs.filter(b => b.url.includes('gallery/db'));
  if (dbBlobs.length > 0) {
    const { del } = require('@vercel/blob');
    await Promise.all(dbBlobs.map(b => del(b.url, { token })));
    console.log('🗑️ تم حذف db.json القديم');
    await new Promise(r => setTimeout(r, 1000));
  }

  // كتابة db.json الجديد
  const result = await put('gallery/db.json', JSON.stringify({ items }, null, 2), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
    token,
  });

  console.log(`✅ تم الاسترجاع! db.json محفوظ على: ${result.url}`);
  console.log(`📊 عدد الصور المسترجعة: ${items.length}`);
}

restore().catch(console.error);