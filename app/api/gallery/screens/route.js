/**
 * app/api/gallery/screens/route.js
 * شاشات التفاعل - مؤمن ومربوط بـ Prisma بالكامل للإنتاج
 * GET    → جلب كل الشاشات مرتبة حسب أولوية العرض (order)
 * POST   → إضافة شاشة تفاعلية جديدة (مؤمن)
 * PATCH  → تعديل بيانات الشاشة وتحديثها (مؤمن)
 * DELETE → حذف الشاشة نهائياً من النظام (مؤمن)
 */

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// منع الـ Caching لضمان مرونة التحديث الفوري لترتيب وعرض الشاشات
export const dynamic = 'force-dynamic';

// دالة التحقق من التوكن السري للإدارة لحماية المسارات
function checkAuth(req) {
  return req.headers.get('x-admin-token') === process.env.ADMIN_TOKEN;
}

// ─── GET: جلب شاشات التفاعل ───
export async function GET() {
  try {
    // جلب الشاشات وفرزها تصاعدياً بناءً على حقل الترتيب المُحدد (order)
    const items = await prisma.galleryScreen.findMany({
      orderBy: { order: 'asc' }
    });
    return NextResponse.json({ items });
  } catch (error) {
    console.error("Failed to fetch gallery screens:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء جلب شاشات التفاعل" }, { status: 500 });
  }
}

// ─── POST: إضافة شاشة تفاعلية جديدة (مؤمن) ───
export async function POST(req) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      type = "link",
      titleAr,
      titleEn = "",
      descAr = "",
      descEn = "",
      icon = "🖥️",
      href = "/media",
      mediaUrl = "",
      embedCode = "",
      published = true,
      order
    } = body;

    if (!titleAr?.trim()) {
      return NextResponse.json({ error: "العنوان العربي (titleAr) مطلوب" }, { status: 400 });
    }

    // حساب الترتيب التلقائي في حال لم يقم الأدمن بتحديده
    let finalOrder = order;
    if (finalOrder === undefined || finalOrder === null) {
      const count = await prisma.galleryScreen.count();
      finalOrder = count;
    }

    const newItem = await prisma.galleryScreen.create({
      data: {
        type: type.trim(),
        titleAr: titleAr.trim(),
        titleEn: titleEn.trim(),
        descAr: descAr.trim(),
        descEn: descEn.trim(),
        icon: icon.trim(),
        href: href.trim(),
        mediaUrl: mediaUrl.trim(),
        embedCode: embedCode.trim(),
        published: Boolean(published),
        order: parseInt(finalOrder)
      }
    });

    return NextResponse.json({ item: newItem }, { status: 201 });
  } catch (error) {
    console.error("Failed to create gallery screen:", error);
    return NextResponse.json({ error: "حدث خطأ في الخادم أثناء إضافة الشاشة التفاعلية" }, { status: 500 });
  }
}

// ─── PATCH: تعديل بيانات شاشة (مؤمن) ───
export async function PATCH(req) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json({ error: "معرف الشاشة (id) مطلوب" }, { status: 400 });
    }

    const targetId = isNaN(id) ? id : parseInt(id);

    // تنظيف البيانات المستبعدة من التعديل المباشر
    delete updates.id;
    delete updates.createdAt;
    
    if (updates.order !== undefined) updates.order = parseInt(updates.order);
    if (updates.published !== undefined) updates.published = Boolean(updates.published);

    const updatedItem = await prisma.galleryScreen.update({
      where: { id: targetId },
      data: updates
    });

    return NextResponse.json({ item: updatedItem });
  } catch (error) {
    console.error("Failed to update gallery screen:", error);
    return NextResponse.json({ error: "الشاشة غير موجودة أو حدث خطأ في التحديث" }, { status: 500 });
  }
}

// ─── DELETE: حذف شاشة تفاعلية (مؤمن) ───
export async function DELETE(req) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const id = new URL(req.url).searchParams.get("id");
    
    if (!id) {
      return NextResponse.json({ error: "معرف الشاشة (id) مطلوب" }, { status: 400 });
    }

    const targetId = isNaN(id) ? id : parseInt(id);

    await prisma.galleryScreen.delete({
      where: { id: targetId }
    });

    return NextResponse.json({ success: true, message: "تم حذف شاشة التفاعل بنجاح" });
  } catch (error) {
    console.error("Failed to delete gallery screen:", error);
    return NextResponse.json({ error: "العنصر غير موجود أو حدث خطأ داخلي أثناء الحذف" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}