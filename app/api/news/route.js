/**
 * app/api/news/route.js
 * API للأخبار - إدارة الأخبار في الصفحة الرئيسية (مؤمن ومربوط بـ Prisma سحابياً)
 * GET    → جلب كل الأخبار للزوار (مفتوح للجميع - مرتب تلقائياً من الأحدث للأقدم)
 * POST   → إضافة خبر جديد للمؤتمر (مؤمن)
 * PATCH  → تعديل تفاصيل خبر موجود (مؤمن)
 * DELETE → حذف خبر نهائياً (مؤمن)
 */
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";


export const dynamic = 'force-dynamic';

// دالة التحقق من التوكن السري للإدارة لحماية العمليات الحساسة
function checkAuth(req) {
  const incomingToken = req.headers.get('x-admin-token');
  // جلب التوكن من السيرفر، وإذا لم يكن موجوداً نستخدم القيمة الافتراضية samoud2025 لعدم قفل السيرفر
  const serverToken = process.env.ADMIN_TOKEN || "samoud2025";
  
  return incomingToken === serverToken;
}

// ─── GET: جلب كل الأخبار (مفتوح للعامة ولا يتطلب توكن) ───
export async function GET() {
  try {
    const items = await prisma.news.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ items });
  } catch (error) {
    console.error("❌ [news_fetch_error]", error);
    return NextResponse.json({ error: "حدث خطأ أثناء جلب مستجدات الأخبار" }, { status: 500 });
  }
}

// ─── POST: إضافة خبر جديد (مؤمن) ───
export async function POST(req) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, date, icon = "📰", content, published = true } = body;

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: "العنوان والمحتوى حقول مطلوبة لإتمام النشر" },
        { status: 400 }
      );
    }

    const finalDate = date || new Date().toLocaleDateString("ar-EG");

    const newItem = await prisma.news.create({
      data: {
        title: title.trim(),
        date: finalDate,
        icon: icon.trim(),
        content: content.trim(),
        published: Boolean(published)
      }
    });

    return NextResponse.json({ item: newItem }, { status: 201 });
  } catch (error) {
    console.error("❌ [news_create_error]", error);
    return NextResponse.json({ error: "حدث خطأ في الخادم أثناء إضافة الخبر" }, { status: 500 });
  }
}

// ─── PATCH: تعديل خبر (مؤمن) ───
export async function PATCH(req) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "معرف الخبر (id) مطلوب" }, { status: 400 });
    }

    const targetId = isNaN(id) ? id : parseInt(id);

    delete updates.id;
    delete updates.createdAt;
    if (updates.published !== undefined) updates.published = Boolean(updates.published);

    const updatedItem = await prisma.news.update({
      where: { id: targetId },
      data: updates
    });

    return NextResponse.json({ item: updatedItem });
  } catch (error) {
    console.error("❌ [news_update_error]", error);
    return NextResponse.json({ error: "الخبر غير موجود أو البيانات المرسلة غير صالحة" }, { status: 500 });
  }
}

// ─── DELETE: حذف خبر نهائياً (مؤمن) ───
export async function DELETE(req) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const id = new URL(req.url).searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "معرف الخبر (id) مطلوب كـ Parameter" }, { status: 400 });
    }

    const targetId = isNaN(id) ? id : parseInt(id);

    await prisma.news.delete({
      where: { id: targetId }
    });


    return NextResponse.json({ success: true, message: "تم حذف الخبر بنجاح من شريط المستجدات" });
  } catch (error) {
    console.error("❌ [news_delete_error]", error);
    return NextResponse.json({ error: "الخبر غير موجود بالفعل أو حدث خطأ داخلي" }, { status: 500 });
  } 
}