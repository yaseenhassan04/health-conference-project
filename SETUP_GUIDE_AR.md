# دليل التطبيق الاحترافي لمشروع الصحة

## 📋 متطلبات التطبيق
- Node.js v18 أو أحدث
- npm أو yarn
- SQLite (مُضمّن في Prisma)

## 🚀 خطوات التطبيق الأساسية

### 1️⃣ تثبيت المكتبات
```bash
cd health_project-master
npm install
```

### 2️⃣ إعداد قاعدة البيانات
```bash
# إنشاء قاعدة البيانات والجداول
npx prisma migrate dev --name init

# (أو إذا كنت تريد Seed البيانات)
npx prisma db push
```

### 3️⃣ التحقق من ملف البيئة
تأكد من وجود ملف `.env` بالمحتويات التالية:
```
DATABASE_URL="file:./dev.db"
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 4️⃣ تشغيل المشروع في وضع التطوير
```bash
npm run dev
```
الموقع سيكون متاحاً على: **http://localhost:3000**

---

## 🔐 الوصول إلى لوحة التحكم

### بيانات دخول الإدارة الافتراضية:
```
اسم المستخدم: admin
كلمة المرور: admin
```

### رابط لوحة التحكم:
```
http://localhost:3000/dashboard
```

---

## 📊 مميزات لوحة التحكم

✅ **عرض الإحصائيات**
- إجمالي المستخدمين المسجلين
- إجمالي الملخصات المرسلة

✅ **إدارة الملخصات**
- عرض جميع الملخصات
- تغيير حالة الملخص (PENDING, APPROVED, REJECTED)
- تحميل الملفات

✅ **إدارة المستخدمين**
- عرض قائمة المستخدمين
- معلومات التسجيل الكاملة

✅ **التقارير والتصدير**
- تصدير البيانات إلى CSV
- تصدير التقارير بصيغة PDF

---

## 🏗️ هيكل المشروع

```
health_project-master/
├── app/
│   ├── dashboard/      # لوحة تحكم الإدارة
│   ├── api/            # API Routes
│   ├── registration/   # صفحة التسجيل
│   ├── about/          # صفحة عن البرنامج
│   └── page.js         # الصفحة الرئيسية
├── prisma/
│   └── schema.prisma   # نموذج قاعدة البيانات
├── components/         # المكونات المشتركة
├── public/uploads/     # مجلد الملفات المرفوعة
└── .env               # متغيرات البيئة
```

---

## 🔧 أوامر مهمة

| الأمر | الوصف |
|------|-------|
| `npm run dev` | تشغيل المشروع (التطوير) |
| `npm run build` | بناء المشروع للإنتاج |
| `npm start` | تشغيل المشروع (الإنتاج) |
| `npm run lint` | فحص الأكواد |
| `npx prisma studio` | واجهة Prisma Studio لإدارة البيانات |

---

## 📧 إعدادات البريد الإلكتروني

لتفعيل إرسال الرسائل:
1. استخدم حساب Gmail
2. أنشئ [كلمة مرور تطبيق](https://myaccount.google.com/apppasswords)
3. أضف البيانات في `.env`:
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

---

## 🗄️ إدارة قاعدة البيانات

### فتح Prisma Studio (واجهة إدارة البيانات):
```bash
npx prisma studio
```

### عرض البيانات مباشرة:
سيفتح متصفح على `http://localhost:5555`

---

## 📦 طرق النشر الاحترافي

### **الخيار 1: نشر على Vercel (الأسهل)**
```bash
# 1. إنشاء حساب على Vercel.com
# 2. ربط مستودع GitHub
# 3. الضغط على Deploy
```

### **الخيار 2: نشر على سيرفر خاص**
```bash
# بناء المشروع
npm run build

# تشغيله
npm start
```

---

## ⚙️ متغيرات البيئة في الإنتاج

عند النشر، استخدم:
```
DATABASE_URL=your-production-database-url
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
NODE_ENV=production
```

---

## 🐛 استكشاف الأخطاء

### المشكلة: الملفات لا تُرفع
✅ **الحل**: تأكد من وجود مجلد `public/uploads`
```bash
mkdir -p public/uploads
```

### المشكلة: البريد الإلكتروني لا يُرسل
✅ **الحل**: تحقق من:
- صحة بيانات `.env`
- استخدام كلمة مرور التطبيق (ليس كلمة المرور الأساسية)
- السماح للتطبيقات بأقل أماناً في Gmail

### المشكلة: خطأ في قاعدة البيانات
✅ **الحل**:
```bash
# إعادة تشغيل Prisma
npx prisma migrate reset
```

---

## 📞 المساعدة والدعم

للمزيد من المعلومات:
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [React Documentation](https://react.dev)

---

## ✨ ملاحظات مهمة

⚠️ **الأمان**:
- غيّر كلمة المرور الافتراضية (admin/admin) قبل النشر
- استخدم قاعدة بيانات آمنة في الإنتاج
- قم بتفعيل HTTPS

⚠️ **النسخ الاحتياطية**:
- قم بعمل نسخ احتياطية منتظمة من البيانات
- احفظ ملفات المستخدمين بأمان

---

**تاريخ التحديث**: 25 أبريل 2026
**الإصدار**: 1.0.0
