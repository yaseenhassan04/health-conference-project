# 📖 دليل API المشروع

## 🎯 نقاط النهاية (Endpoints)

### 👥 المستخدمين

#### التسجيل
```
POST /api/register
Content-Type: application/json

{
  "fullName": "أحمد محمد",
  "email": "user@example.com",
  "profession": "طبيب",
  "country": "مصر"
}
```

**الرد الناجح (201):**
```json
{
  "message": "تم التسجيل بنجاح",
  "user": { "id": 1, "email": "user@example.com" }
}
```

#### الحصول على جميع المستخدمين
```
GET /api/users
```

**الرد:**
```json
{
  "users": [
    {
      "id": 1,
      "fullName": "أحمد محمد",
      "email": "user@example.com",
      "profession": "طبيب",
      "country": "مصر"
    }
  ]
}
```

---

### 📄 الملخصات (Abstracts)

#### إرسال ملخص
```
POST /api/abstracts
Content-Type: multipart/form-data

- title: "عنوان البحث"
- authorName: "اسم الباحث"
- email: "author@example.com"
- category: "General"
- file: <PDF File>
```

**الرد الناجح (201):**
```json
{
  "message": "تم إرسال البحث بنجاح",
  "abstract": {
    "id": 1,
    "title": "عنوان البحث",
    "status": "PENDING"
  }
}
```

#### الحصول على جميع الملخصات
```
GET /api/abstracts
```

#### تحديث حالة الملخص
```
PUT /api/abstracts/[id]
Content-Type: application/json

{
  "status": "APPROVED"  // أو REJECTED
}
```

---

### 🏛️ الإدارة (Admin)

#### تسجيل الدخول
يتم التحقق من بيانات المسؤول في الواجهة الأمامية:
- المستخدم: `admin`
- كلمة المرور: `admin` (غيّر هذا قبل الإنتاج!)

#### الحصول على قائمة المسؤولين
```
GET /api/admin
```

#### إنشاء مسؤول جديد
```
POST /api/admin
Content-Type: application/json

{
  "username": "admin2",
  "password": "secure_password"
}
```

#### تحديث حساب مسؤول
```
PUT /api/admin
Content-Type: application/json

{
  "id": 1,
  "username": "admin_new",
  "password": "new_password"
}
```

#### حذف مسؤول
```
DELETE /api/admin?id=1
```

---

### 📧 البريد الإلكتروني

#### إرسال بريد
```
POST /api/send_email
Content-Type: application/json

{
  "to": "recipient@example.com",
  "subject": "موضوع البريد",
  "message": "نص الرسالة"
}
```

---

### ❓ الأسئلة

#### الحصول على الأسئلة
```
GET /api/questions
```

#### إرسال سؤال
```
POST /api/questions
Content-Type: application/json

{
  "text": "نص السؤال",
  "author": "اسم السائل"
}
```

---

## 🔐 معايير الأمان

### معاينة البيانات
- البريد الإلكتروني يجب أن يكون صحيحاً
- الملفات يجب أن تكون بصيغة PDF
- أسماء المستخدمين يجب أن تكون فريدة

### رموز الخطأ
- `400` - طلب غير صحيح
- `401` - غير مصرح
- `404` - غير موجود
- `500` - خطأ داخلي في السيرفر

---

## 🧪 أمثلة استخدام

### مثال مع Fetch
```javascript
// تسجيل مستخدم جديد
const response = await fetch('/api/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fullName: 'أحمد محمد',
    email: 'user@example.com',
    profession: 'طبيب',
    country: 'مصر'
  })
});

const data = await response.json();
console.log(data);
```

### مثال مع cURL
```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "أحمد محمد",
    "email": "user@example.com",
    "profession": "طبيب",
    "country": "مصر"
  }'
```

---

**آخر تحديث**: 25 أبريل 2026
