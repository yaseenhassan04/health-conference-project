/**
 * app/api/gallery/upload/route.js
 * POST → رفع صورة وحفظها سحابياً في Vercel Blob
 * Returns: { url: "https://xxx.public.blob.vercel-storage.com/gallery/xxx.jpg" }
 */

import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { randomUUID } from "crypto";

// إجبار الـ Route على العمل بشكل ديناميكي
export const dynamic = 'force-dynamic';

// ✅ الحل الصحيح لخطأ 413 في Next.js App Router لرفع حد حجم الطلب
export const sizeLimit = '10mb'; 

// دالة التحقق من التوكن لحماية الرفع من أي استغلال خارجي لوحدة التخزين
function checkAuth(req) {
  // ✅ أضفنا القيمة الاحتياطية هنا لتطابق الـ Frontend تماماً في حال عدم ضبط الـ env
  const expectedToken = process.env.ADMIN_TOKEN || "samoud2025";
  return req.headers.get('x-admin-token') === expectedToken;
}

export async function POST(req) {
  // 1️⃣ حماية المسار
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file     = formData.get("file");

    if (!file) return NextResponse.json({ error: "لا يوجد ملف مرفوع" }, { status: 400 });

    // 2️⃣ التحقق من نوع الصيغة (Mime Type)
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: "نوع الملف غير مدعوم، يرجى رفع صور فقط" }, { status: 400 });
    }

    // 3️⃣ التحقق من الحجم (5 MB) لمنع استهلاك مساحة التخزين السحابية
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "حجم الصورة يتجاوز الحد المسموح به (5MB)" }, { status: 400 });
    }

    // 4️⃣ استخراج امتداد الملف وتوليد اسم فريد وآمن
    const ext      = file.type.split("/")[1].replace("jpeg", "jpg");
    const filename = `gallery/${randomUUID()}.${ext}`;

    // 5️⃣ تحويل الملف إلى Buffer والرفع مباشرة إلى Vercel Blob
    const buffer = Buffer.from(await file.arrayBuffer());
    
    const blob = await put(filename, buffer, {
      access: "public", // لكي يكون الرابط متاحاً للزوار في المعرض
    });

    // 6️⃣ إرجاع الرابط السحابي الدائم المستقر
    return NextResponse.json({ 
      success: true,
      url: blob.url // الرابط الجديد سيبدأ بـ https://...vercel-storage.com
    });

  } catch (err) {
    console.error("❌ [gallery/upload سحابي]", err);
    return NextResponse.json({ error: "حدث خطأ أثناء معالجة الرفع السحابي" }, { status: 500 });
  }
}