require('dotenv').config({ path: '.env.local' });
const { list, put, del } = require('@vercel/blob');
const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

async function main() {
  const { blobs } = await list({ prefix: 'gallery/db', token: TOKEN });
  const res = await fetch(blobs[0].url, { cache: 'no-store' });
  const data = await res.json();
  const items = data.items;
  
  // ابحث عن الفيديو وحطه أول
  const videoIndex = items.findIndex(i => i.type === 'video');
  if (videoIndex === -1) { console.log('❌ ما في فيديو'); return; }
  
  const video = items.splice(videoIndex, 1)[0];
  items.unshift(video);
  items.forEach((item, i) => item.order = i);
  
  await Promise.all(blobs.map(b => del(b.url, { token: TOKEN })));
  await new Promise(r => setTimeout(r, 1000));
  await put('gallery/db.json', JSON.stringify({ items }, null, 2), {
    token: TOKEN, access: 'public', contentType: 'application/json',
    addRandomSuffix: false, allowOverwrite: true
  });
  console.log('✅ تم نقل الفيديو للأول!');
}

main().catch(console.error);