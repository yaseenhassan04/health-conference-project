@echo off
REM scripts/setup.bat
REM سكريبت التثبيت السريع للمشروع (Windows)

chcp 65001 > nul
cls

echo.
echo ========================================
echo 🚀 بدء تثبيت مشروع الصحة
echo ========================================
echo.

REM تحقق من Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js غير مثبت. يرجى تثبيت Node.js 18 أو أحدث
    echo https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js موجود: 
node --version
echo ✅ npm موجود:
npm --version
echo.

REM تثبيت المكتبات
echo 📦 جاري تثبيت المكتبات...
call npm install

if errorlevel 1 (
    echo ❌ فشل تثبيت المكتبات
    pause
    exit /b 1
)

echo ✅ تم تثبيت المكتبات بنجاح
echo.

REM إعداد قاعدة البيانات
echo 🗄️  جاري إعداد قاعدة البيانات...
call npx prisma migrate dev --name init

echo ✅ تم إعداد قاعدة البيانات
echo.

REM تهيئة البيانات
echo 🌱 جاري إضافة البيانات الأولية...
node scripts/init-db.js

echo.
echo ==========================================
echo 🎉 تم التثبيت بنجاح!
echo ==========================================
echo.
echo لتشغيل المشروع، استخدم:
echo   npm run dev
echo.
echo ثم افتح: http://localhost:3000
echo.
echo رابط لوحة التحكم: http://localhost:3000/dashboard
echo بيانات الدخول:
echo   المستخدم: admin
echo   كلمة المرور: admin
echo.
pause
