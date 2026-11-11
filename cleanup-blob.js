require('dotenv').config({ path: '.env.local' });
const { list, del } = require('@vercel/blob');

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

// ✅ الملفات اللي نحافظ عليها دائماً (لا تُحذف أبداً)
const KEEP_PATTERNS = [
  'gallery/db',       // db.json
  'gallery/',         // كل صور المعرض
];

// ❌ الملفات اللي نحذفها (قديمة أو غير مستخدمة)
const DELETE_PATTERNS = [
  'abstracts/',       // ملخصات الأبحاث القديمة
  'library/',         // مكتبة قديمة
];

// الامتدادات المسموحة للمعرض
const GALLERY_EXTS = ['jpg','jpeg','png','webp','gif','mp4','webm','mov'];

function shouldDelete(blob) {
  const path = blob.pathname.toLowerCase();
  const ext = path.split('.').pop();

  // احذف دائماً لو في قائمة الحذف
  if (DELETE_PATTERNS.some(p => path.includes(p))) return true;

  // لا تحذف لو في قائمة الحفاظ
  if (KEEP_PATTERNS.some(p => path.startsWith(p))) return false;

  // احذف لو ملف غير صورة/فيديو (PDF، ZIP، إلخ)
  if (!GALLERY_EXTS.includes(ext)) return true;

  // احذف لو قديم جداً (أكثر من 6 أشهر) وليس في المعرض
  const uploadedAt = new Date(blob.uploadedAt);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  if (uploadedAt < sixMonthsAgo) return true;

  return false;
}

function formatSize(bytes) {
  if (bytes >= 1024 * 1024 * 1024) return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  if (bytes >= 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return bytes + ' B';
}

async function main() {
  const DRY_RUN = process.argv.includes('--dry-run');

  console.log('='.repeat(50));
  console.log(DRY_RUN ? '🔍 وضع المعاينة (لن يُحذف شيء)' : '🗑️  وضع الحذف الفعلي');
  console.log('='.repeat(50));

  // جلب كل الملفات
  console.log('\n📦 جاري جلب كل الملفات...');
  let allBlobs = [], cursor;
  do {
    const result = await list({ token: TOKEN, cursor, limit: 1000 });
    allBlobs = allBlobs.concat(result.blobs);
    cursor = result.cursor;
  } while (cursor);

  console.log(`📊 إجمالي الملفات: ${allBlobs.length}`);

  // تصنيف الملفات
  const toDelete = allBlobs.filter(b => shouldDelete(b));
  const toKeep   = allBlobs.filter(b => !shouldDelete(b));

  const deleteSize = toDelete.reduce((s, b) => s + (b.size || 0), 0);
  const keepSize   = toKeep.reduce((s, b) => s + (b.size || 0), 0);

  console.log('\n📋 التقرير:');
  console.log(`  ✅ يُحفظ:  ${toKeep.length} ملف (${formatSize(keepSize)})`);
  console.log(`  🗑️  يُحذف: ${toDelete.length} ملف (${formatSize(deleteSize)})`);

  if (toDelete.length === 0) {
    console.log('\n✨ لا يوجد شيء للحذف!');
    return;
  }

  // عرض ما سيُحذف
  console.log('\n🗑️  الملفات التي ستُحذف:');
  toDelete.forEach(b => {
    const date = new Date(b.uploadedAt).toLocaleDateString('ar-EG');
    console.log(`  - ${date} | ${formatSize(b.size || 0)} | ${b.pathname}`);
  });

  if (DRY_RUN) {
    console.log('\n⚠️  هذا وضع المعاينة فقط.');
    console.log('▶️  لتنفيذ الحذف الفعلي شغّل: node cleanup-blob.js --confirm');
    return;
  }

  if (!process.argv.includes('--confirm')) {
    console.log('\n⚠️  للتأكيد والحذف الفعلي شغّل:');
    console.log('    node cleanup-blob.js --confirm');
    console.log('\n💡 للمعاينة فقط بدون حذف:');
    console.log('    node cleanup-blob.js --dry-run');
    return;
  }

  // الحذف الفعلي
  console.log('\n🗑️  جاري الحذف...');
  let deleted = 0, failed = 0, freedBytes = 0;
  const BATCH = 20; // حذف 20 في المرة

  for (let i = 0; i < toDelete.length; i += BATCH) {
    const batch = toDelete.slice(i, i + BATCH);
    await Promise.all(
      batch.map(async (b) => {
        try {
          await del(b.url, { token: TOKEN });
          deleted++;
          freedBytes += (b.size || 0);
          process.stdout.write(`\r  ✅ ${deleted}/${toDelete.length} محذوف...`);
        } catch (e) {
          failed++;
          console.error(`\n  ❌ فشل حذف: ${b.pathname} — ${e.message}`);
        }
      })
    );
    // استراحة بين الـ batches
    if (i + BATCH < toDelete.length) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  console.log('\n\n' + '='.repeat(50));
  console.log('✅ اكتمل التنظيف!');
  console.log(`  🗑️  محذوف: ${deleted} ملف`);
  console.log(`  💾 مساحة محررة: ${formatSize(freedBytes)}`);
  if (failed) console.log(`  ❌ فشل: ${failed} ملف`);
  console.log(`  📦 متبقي: ${toKeep.length} ملف (${formatSize(keepSize)})`);
  console.log('='.repeat(50));
  console.log('\n🔄 الآن شغّل: node sync-gallery.js');
}

main().catch(console.error);