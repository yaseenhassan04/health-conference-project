#!/usr/bin/env node
/**
 * quick-start.js
 * دليل التشغيل السريع للمشروع
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function main() {
  log('\n========================================', 'bright');
  log('🚀 دليل التشغيل السريع - مشروع الصحة', 'blue');
  log('========================================\n', 'bright');

  // 1. التحقق من Node.js
  log('✓ التحقق من البيئة...', 'yellow');
  try {
    const nodeVersion = execSync('node --version').toString().trim();
    const npmVersion = execSync('npm --version').toString().trim();
    log(`  Node.js: ${nodeVersion}`, 'green');
    log(`  npm: ${npmVersion}\n`, 'green');
  } catch (error) {
    log('  ❌ Node.js غير مثبت!', 'red');
    process.exit(1);
  }

  // 2. التحقق من package.json
  log('✓ التحقق من المشروع...', 'yellow');
  const packagePath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packagePath)) {
    log('  ❌ package.json غير موجود!', 'red');
    process.exit(1);
  }
  log('  ✅ تم العثور على package.json\n', 'green');

  // 3. التحقق من .env
  log('✓ التحقق من ملف البيئة...', 'yellow');
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    log('  ⚠️  ملف .env غير موجود', 'yellow');
    log('  📝 سيتم إنشاء .env من .env.example\n', 'yellow');
    
    const examplePath = path.join(process.cwd(), '.env.example');
    if (fs.existsSync(examplePath)) {
      fs.copyFileSync(examplePath, envPath);
      log('  ✅ تم إنشاء .env بنجاح\n', 'green');
    }
  } else {
    log('  ✅ ملف .env موجود\n', 'green');
  }

  // 4. تثبيت المكتبات
  log('✓ تثبيت المكتبات...', 'yellow');
  try {
    const nodeModulesPath = path.join(process.cwd(), 'node_modules');
    if (!fs.existsSync(nodeModulesPath)) {
      log('  جاري تثبيت npm packages...', 'yellow');
      execSync('npm install', { stdio: 'inherit' });
    }
    log('  ✅ المكتبات جاهزة\n', 'green');
  } catch (error) {
    log('  ❌ فشل تثبيت المكتبات', 'red');
    process.exit(1);
  }

  // 5. إعداد قاعدة البيانات
  log('✓ إعداد قاعدة البيانات...', 'yellow');
  try {
    log('  جاري تشغيل Prisma migrations...', 'yellow');
    execSync('npx prisma migrate dev --name init --skip-generate', { stdio: 'inherit' });
    log('  ✅ قاعدة البيانات جاهزة\n', 'green');
  } catch (error) {
    log('  ⚠️  تحذير: قد حدث خطأ في إعداد قاعدة البيانات', 'yellow');
    log('  جرب تشغيل: npm run db:init\n', 'yellow');
  }

  // 6. عرض المعلومات النهائية
  log('========================================', 'bright');
  log('✅ التثبيت اكتمل بنجاح!', 'green');
  log('========================================\n', 'bright');

  log('📍 الخطوات التالية:', 'bright');
  log('');
  log('1️⃣  لتشغيل المشروع:', 'blue');
  log('   npm run dev', 'green');
  log('');
  
  log('2️⃣  ثم افتح المتصفح على:', 'blue');
  log('   http://localhost:3000', 'green');
  log('');
  
  log('3️⃣  للوصول إلى لوحة التحكم:', 'blue');
  log('   http://localhost:3000/dashboard', 'green');
  log('');
  
  log('4️⃣  بيانات دخول الإدارة:', 'blue');
  log('   المستخدم: admin', 'green');
  log('   كلمة المرور: admin', 'green');
  log('');

  log('📚 أوامر مهمة أخرى:', 'bright');
  log('');
  log('   npm run build          - بناء المشروع للإنتاج', 'yellow');
  log('   npm start              - تشغيل المشروع (الإنتاج)', 'yellow');
  log('   npm run db:studio      - فتح إدارة قاعدة البيانات', 'yellow');
  log('   npm run lint           - فحص الأكواد', 'yellow');
  log('');

  log('⚠️  تنبيهات أمان مهمة:', 'yellow');
  log('');
  log('   • غيّر كلمة المرور الافتراضية قبل النشر في الإنتاج', 'red');
  log('   • أضف بيانات البريد الصحيحة في .env', 'red');
  log('   • استخدم قاعدة بيانات آمنة في الإنتاج', 'red');
  log('');

  log('📖 للمزيد من المعلومات، اقرأ:', 'bright');
  log('   - SETUP_GUIDE_AR.md        (دليل الإعداد)', 'blue');
  log('   - DEPLOYMENT_CHECKLIST.md  (قائمة التحقق)', 'blue');
  log('   - API_DOCUMENTATION.md     (توثيق API)', 'blue');
  log('');
}

main().catch(error => {
  log(`\n❌ حدث خطأ: ${error.message}`, 'red');
  process.exit(1);
});
