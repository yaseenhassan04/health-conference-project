import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { randomUUID } from "crypto";

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
    const file     = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "لا يوجد ملف مرفوع" }, { status: 400 });
    }

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: "نوع الملف غير مدعوم، يرجى رفع صور فقط" }, { status: 400 });
    }

    // توليد اسم فريد للملف في المجلد gallery
    const ext      = file.type.split("/")[1].replace("jpeg", "jpg");
    const filename = `gallery/${randomUUID()}.${ext}`;

    // الرفع الفعلي السحابي إلى Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    // نعيد الـ url الحقيقي السحابي للـ Frontend
    return NextResponse.json({ 
      success: true, 
      url: blob.url 
    });

  } catch (err) {
    console.error("❌ [Vercel Blob Upload Error]:", err.message);
    return NextResponse.json({ error: "حدث خطأ أثناء معالجة الرفع السحابي" }, { status: 500 });
  }
}