require('dotenv').config({ path: '.env.local' });
const { list, put, del } = require('@vercel/blob');
const readline = require('readline');

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const DB_PATH = 'gallery/db.json';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(resolve => rl.question(q, resolve));

async function main() {
  // جلب db.json الحالي
  const { blobs: dbBlobs } = await list({ prefix: 'gallery/db', token: TOKEN });
  if (!dbBlobs.length) { console.log('❌ db.json مش موجود'); process.exit(1); }
  
  const latest = dbBlobs.sort((a,b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))[0];
  const res = await fetch(latest.url, { cache: 'no-store' });
  const data = await res.json();
  const items = Array.isArray(data?.items) ? data.items : [];
  
  console.log(`\n📦 عدد الصور: ${items.length}\n`);
  console.log('لكل صورة: اضغط Enter للاحتفاظ، أو اكتب d للحذف، أو q للخروج وحفظ\n');

  const kept = [];
  const deleted = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const name = item.captionAr || item.captionEn || 'بدون اسم';
    console.log(`\n[${i+1}/${items.length}] ${name}`);
    console.log(`🔗 ${item.src}`);
    
    const answer = await ask('احتفظ (Enter) / احذف (d) / خروج (q): ');
    
    if (answer.toLowerCase() === 'q') {
      // احفظ ما تبقى وأضف الباقي
      kept.push(...items.slice(i));
      break;
    } else if (answer.toLowerCase() === 'd') {
      deleted.push(name);
      console.log(`🗑️ تم حذف: ${name}`);
    } else {
      kept.push(item);
    }
  }

  console.log(`\n========== ملخص ==========`);
  console.log(`✅ محتفظ بـ: ${kept.length} صورة`);
  console.log(`🗑️ محذوف: ${deleted.length} صورة`);
  
  const confirm = await ask('\nهل تريد حفظ التغييرات؟ (y/n): ');
  
  if (confirm.toLowerCase() === 'y') {
    // احذف القديم
    await Promise.all(dbBlobs.map(b => del(b.url, { token: TOKEN })));
    await new Promise(r => setTimeout(r, 1000));
    
    // ارفع الجديد
    await put(DB_PATH, JSON.stringify({ items: kept }, null, 2), {
      token: TOKEN,
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    console.log('✅ تم الحفظ!');
  } else {
    console.log('❌ تم الإلغاء');
  }

  rl.close();
}

main().catch(console.error);