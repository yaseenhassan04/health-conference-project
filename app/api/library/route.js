/**
 * app/api/library/route.js (Next.js App Router — GET / POST / PATCH / DELETE)
 * ──────────────────────────────────────────────────────────────────────────────
 * إدارة مراجع المكتبة العلمية - مربوط بالكامل بقاعدة البيانات السحابية وبريسما
 * الرفع السحابي مصاحب عبر: app/api/library/upload/route.js
 * ──────────────────────────────────────────────────────────────────────────────
 */

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { del } from '@vercel/blob'; // استيراد حزمة الحذف السحابي للملفات

const prisma = new PrismaClient();

// منع الـ Caching لضمان قراءة وتحديث فوري للمراجع والكتب العلمية
export const dynamic = 'force-dynamic';

// دالة التحقق من التوكن السري للإدارة لحماية المسارات
function checkAuth(req) {
  return req.headers.get('x-admin-token') === process.env.ADMIN_TOKEN;
}

/* ─── GET: قائمة المراجع (ذكية: تظهر كلها للمشرف، والمنشورة فقط للزوار) ─── */
export async function GET(req) {
  try {
    const isAdmin = checkAuth(req);

    let items;
    if (isAdmin) {
      // المشرف يرى كل المراجع الطبية (المنشورة والمسودات) لترتيبها وتعديلها
      items = await prisma.library.findMany({
        orderBy: { createdAt: 'desc' }
      });
    } else {
      // الزوار والأطباء يرون فقط المراجع التي تم الموافقة على نشرها
      items = await prisma.library.findMany({
        where: { published: true },
        orderBy: { createdAt: 'desc' }
      });
    }

    return NextResponse.json({ items });
  } catch (error) {
    console.error("❌ [library_fetch_error]", error);
    return NextResponse.json({ error: "حدث خطأ أثناء جلب مراجع المكتبة العلمية" }, { status: 500 });
  }
}

/* ─── POST: إضافة مرجع علمي جديد ─── */
export async function POST(req) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, author, category, type, fileUrl, description, year, published } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'عنوان المرجع (title) مطلوب' }, { status: 400 });
    }

    // إدخال المرجع ديناميكياً في قاعدة البيانات عبر Prisma
    const newItem = await prisma.library.create({
      data: {
        title: title.trim(),
        author: author?.trim() || '',
        category: category?.trim() || 'General',
        type: type || 'book',
        fileUrl: fileUrl?.trim() || '',
        description: description?.trim() || '',
        year: year ? parseInt(year) : new Date().getFullYear(),
        published: published !== false,
      }
    });

    return NextResponse.json({ success: true, item: newItem }, { status: 201 });
  } catch (err) {
    console.error("❌ [library_create_error]", err);
    return NextResponse.json({ error: 'بيانات الطلب غير صالحة أو حدث خطأ في الخادم' }, { status: 400 });
  }
}

/* ─── PATCH: تعديل مرجع علمي ─── */
export async function PATCH(req) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'معرف العنصر (id) مطلوب' }, { status: 400 });
    }

    const targetId = isNaN(id) ? id : parseInt(id);

    // حماية البيانات المستبعدة من التعديل العشوائي للروابط والمعرفات
    delete updates.id;
    delete updates.createdAt;

    if (updates.year) updates.year = parseInt(updates.year);
    if (updates.published !== undefined) updates.published = Boolean(updates.published);

    const updatedItem = await prisma.library.update({
      where: { id: targetId },
      data: updates
    });

    return NextResponse.json({ success: true, item: updatedItem });
  } catch (err) {
    console.error("❌ [library_update_error]", err);
    return NextResponse.json({ error: 'العنصر غير موجود أو البيانات المرسلة غير صالحة' }, { status: 500 });
  }
}

/* ─── DELETE: حذف مرجع (+ تنظيف الملف من السحابة فوراً) ─── */
export async function DELETE(req) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'معرف العنصر (id) مطلوب كـ Parameter' }, { status: 400 });
    }

    const targetId = isNaN(id) ? id : parseInt(id);

    // 1️⃣ العثور على المرجع قبل حذفه للتحقق من وجود ملف ملحق سحابي
    const targetItem = await prisma.library.findUnique({
      where: { id: targetId }
    });

    if (!targetItem) {
      return NextResponse.json({ error: 'العنصر غير موجود بالفعل' }, { status: 404 });
    }

    // 2️⃣ حماية السحابة: حذف الملف من Vercel Blob إن وجد وتوفير مساحة المستودع
    if (targetItem.fileUrl && targetItem.fileUrl.includes("public.blob.vercel-storage.com")) {
      try {
        await del(targetItem.fileUrl); // دالة del تحذف كود الـ PDF أو الـ Word سحابياً فوراً
      } catch (blobErr) {
        console.error('تنبيـه: فشل حذف الملف من السحابة، سنستمر بحذف البيانات الوصفية:', blobErr.message);
      }
    }

    // 3️⃣ حذفه نهائياً من قاعدة البيانات
    await prisma.library.delete({
      where: { id: targetId }
    });

    return NextResponse.json({ success: true, message: "تم حذف المرجع العلمي والملف التابع له بنجاح" });

  } catch (error) {
    console.error("❌ [library_delete_error]", error);
    return NextResponse.json({ error: 'حدث خطأ داخلي في الخادم أثناء تنفيذ عملية الحذف' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}