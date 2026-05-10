// scripts/init-db.js
// سكريبت لتهيئة قاعدة البيانات

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 جاري تهيئة قاعدة البيانات...');

  try {
    // إنشء مسؤول افتراضي
    const admin = await prisma.admin.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        username: 'admin',
        password: 'admin', // ⚠️ غيّر هذا قبل النشر في الإنتاج
      },
    });
    console.log('✅ تم إنشاء حساب المسؤول:', admin.username);

    // إضافة مراجعين نموذجيين
    const reviewers = await Promise.all([
      prisma.reviewer.upsert({
        where: { id: 1 },
        update: {},
        create: {
          name: 'د. أحمد محمد',
          specialty: 'الطب الباطني',
          maxAssignments: 5,
        },
      }),
      prisma.reviewer.upsert({
        where: { id: 2 },
        update: {},
        create: {
          name: 'د. فاطمة علي',
          specialty: 'الصحة العامة',
          maxAssignments: 5,
        },
      }),
    ]);
    console.log(`✅ تم إضافة ${reviewers.length} مراجعين نموذجيين`);

    console.log('🎉 تم تهيئة قاعدة البيانات بنجاح!');
  } catch (error) {
    console.error('❌ خطأ في التهيئة:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
