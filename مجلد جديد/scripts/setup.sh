#!/bin/bash
# scripts/setup.sh
# سكريبت التثبيت السريع للمشروع

echo "🚀 بدء تثبيت مشروع الصحة..."
echo ""

# تحقق من Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js غير مثبت. يرجى تثبيت Node.js 18 أو أحدث"
    exit 1
fi

echo "✅ Node.js موجود: $(node --version)"
echo "✅ npm موجود: $(npm --version)"
echo ""

# تثبيت المكتبات
echo "📦 جاري تثبيت المكتبات..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ تم تثبيت المكتبات بنجاح"
else
    echo "❌ فشل تثبيت المكتبات"
    exit 1
fi

echo ""

# إعداد قاعدة البيانات
echo "🗄️ جاري إعداد قاعدة البيانات..."
npx prisma migrate dev --name init

if [ $? -eq 0 ]; then
    echo "✅ تم إعداد قاعدة البيانات بنجاح"
else
    echo "⚠️ تحذير: قد حدث خطأ في إعداد قاعدة البيانات"
fi

echo ""

# تهيئة البيانات
echo "🌱 جاري إضافة البيانات الأولية..."
node scripts/init-db.js

echo ""
echo "=========================================="
echo "🎉 تم التثبيت بنجاح!"
echo "=========================================="
echo ""
echo "لتشغيل المشروع، استخدم:"
echo "  npm run dev"
echo ""
echo "ثم افتح: http://localhost:3000"
echo ""
echo "رابط لوحة التحكم: http://localhost:3000/dashboard"
echo "بيانات الدخول:"
echo "  المستخدم: admin"
echo "  كلمة المرور: admin"
echo ""
