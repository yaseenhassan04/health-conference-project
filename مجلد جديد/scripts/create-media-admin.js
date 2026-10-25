// scripts/create-media-admin.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createMediaAdmin() {
  try {
    // كلمة المرور الأصلية
    const plainPassword = 'Media@2026';
    
    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // التحقق من عدم وجود الحساب مسبقاً
    const existing = await prisma.admin.findUnique({
      where: { username: 'media_admin' }
    });

    if (existing) {
      console.log('❌ الحساب موجود بالفعل!');
      console.log('البيانات الحالية:');
      console.log(`   Username: ${existing.username}`);
      console.log(`   Created: ${existing.createdAt}`);
      return;
    }

    // إنشاء الحساب الجديد
    const newAdmin = await prisma.admin.create({
      data: {
        username: 'media_admin',
        password: hashedPassword
      }
    });

    console.log('✅ تم إنشاء حساب مسؤول الإعلام بنجاح!');
    console.log('\n📋 بيانات الدخول:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🆔 ID: ${newAdmin.id}`);
    console.log(`👤 Username: media_admin`);
    console.log(`🔐 Password: Media@2026`);
    console.log(`📅 Created: ${newAdmin.createdAt}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🌐 رابط الدخول: http://localhost:3000/login');
    console.log('\n✨ يمكن لهذا الحساب الآن:');
    console.log('   ✅ الدخول لوحة التحكم');
    console.log('   ✅ إدارة الأخبار (إضافة، تعديل، حذف)');
    console.log('   ✅ إدارة معرض الصور');

  } catch (error) {
    console.error('❌ حدث خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createMediaAdmin();
