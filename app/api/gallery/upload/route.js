import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function checkAuth(req) {
  const expectedToken = process.env.ADMIN_TOKEN || "samoud2025";
  return req.headers.get('x-admin-token') === expectedToken;
}

export async function POST(req) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "لم يتم العثور على ملف مرفوع" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "نوع الملف غير مدعوم" }, { status: 400 });
    }

    const filename = `${Date.now()}-${file.name}`;

    // الرفع إلى المخزن العام
    const blob = await put(filename, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN || process.env.PUBLIC_BLOB_READ_WRITE_TOKEN,    });

    // سحب الرابط السحابي المتولد
    const generatedUrl = blob.url;

    // 💡 الحل السحري: إرجاع الرابط بكل المسميات المحتملة التي قد يتوقعها الفرونت إند
    // ليتعرف عليها تلقائياً ويقوم بحفظها في قاعدة البيانات فوراً دون طلب إدخال يدوي
    return NextResponse.json({ 
      success: true, 
      url: generatedUrl,
      imageUrl: generatedUrl,
      image: generatedUrl,
      link: generatedUrl,
      path: generatedUrl
    });

  } catch (err) {
    console.error("❌ [Vercel Blob Upload Error]:", err.message);
    return NextResponse.json({ error: err.message || "خطأ أثناء الرفع" }, { status: 500 });
  }
}