/**
 * app/api/gallery/media/route.js
 * GET    → جلب كل صور المعرض (ديناميكي وسريع)
 * POST   → إضافة صورة جديدة (مؤمن ومربوط بـ Prisma)
 * PATCH  → تعديل بيانات صورة
 * DELETE → حذف صورة من قاعدة البيانات ومن الـ Blob سحابياً
 */

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { del } from "@vercel/blob"; // استيراد دالة الحذف السحابي للملفات عند حذف العنصر

const prisma = new PrismaClient();

// إجبار الـ Route على العمل بشكل ديناميكي ليظهر تحديث الصور فوراً للزوار
export const dynamic = 'force-dynamic';

// دالة التحقق من التوكن السري للإدارة لحماية العمليات الحساسة
function checkAuth(req) {
  return req.headers.get('x-admin-token') === process.env.ADMIN_TOKEN;
}

// ─── GET: جلب كل صور المعرض ───
export async function GET() {
  try {
    // جلب الصور مرتبة من الأحدث إلى الأقدم
    const items = await prisma.galleryMedia.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ items });
  } catch (error) {
    console.error("Failed to fetch gallery items:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء جلب صور المعرض" }, { status: 500 });
  }
}

// ─── POST: إضافة صورة جديدة (مؤمن) ───
export async function POST(req) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { src, captionAr, captionEn = "", tag = "فعاليات", tagEn = "Events" } = body;

    if (!src?.trim())      return NextResponse.json({ error: "رابط الصورة (src) مطلوب" }, { status: 400 });
    if (!captionAr?.trim()) return NextResponse.json({ error: "الوصف العربي مطلوب" }, { status: 400 });

    // الإدخال الديناميكي في قاعدة البيانات عبر بريسما
    const newItem = await prisma.galleryMedia.create({
      data: {
        src: src.trim(),
        captionAr: captionAr.trim(),
        captionEn: captionEn.trim(),
        tag: tag.trim(),
        tagEn: tagEn.trim()
      }
    });

    return NextResponse.json({ item: newItem }, { status: 201 });
  } catch (error) {
    console.error("Failed to create gallery item:", error);
    return NextResponse.json({ error: "حدث خطأ في الخادم أثناء إضافة الصورة" }, { status: 500 });
  }
}

// ─── PATCH: تعديل بيانات صورة (مؤمن) ───
export async function PATCH(req) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: "معرف العنصر (id) مطلوب" }, { status: 400 });

    // فحص ذكي لنوع المعرف منعا لأخطاء الـ Validation
    const targetId = isNaN(id) ? id : parseInt(id);

    // منع تعديل المعرف وتاريخ الإنشاء حماية لسلامة البيانات
    delete updates.id;
    delete updates.createdAt;

    const updatedItem = await prisma.galleryMedia.update({
      where: { id: targetId },
      data: updates
    });

    return NextResponse.json({ item: updatedItem });
  } catch (error) {
    console.error("Failed to update gallery item:", error);
    return NextResponse.json({ error: "العنصر غير موجود أو حدث خطأ في التحديث" }, { status: 504 });
  }
}

// ─── DELETE: حذف صورة من قاعدة البيانات والـ Blob (مؤمن) ───
export async function DELETE(req) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "معرف العنصر (id) مطلوب" }, { status: 400 });

    const targetId = isNaN(id) ? id : parseInt(id);

    // 1. العثور على العنصر أولاً لمعرفة رابط الصورة السحابي قبل حذفه
    const item = await prisma.galleryMedia.findUnique({
      where: { id: targetId }
    });

    if (!item) {
      return NextResponse.json({ error: "العنصر غير موجود بالفعل" }, { status: 404 });
    }

    // 2. حماية وتوفير مساحة الاستضافة: حذف الملف من Vercel Blob إذا كان مرفوعاً هناك
    if (item.src && item.src.includes("public.blob.vercel-storage.com")) {
      try {
        await del(item.src); // دالة del الذكية تحذف الملف من السحابة فوراً عبر رابطه
      } catch (blobErr) {
        console.error("تنبيـه: فشل حذف الملف السحابي ولكن سنستمر بحذفه من القاعدة:", blobErr.message);
      }
    }

    // 3. حذفه نهائياً من قاعدة البيانات
    await prisma.galleryMedia.delete({
      where: { id: targetId }
    });

    return NextResponse.json({ success: true, message: "تم حذف الصورة بنجاح سحابياً ومحلياً" });
  } catch (error) {
    console.error("Failed to delete gallery item:", error);
    return NextResponse.json({ error: "حدث خطأ داخلي أثناء تنفيذ عملية الحذف" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}