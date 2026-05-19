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
      return NextResponse.json({ error: "لا يوجد ملف" }, { status: 400 });
    }

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: "نوع الملف غير مدعوم" }, { status: 400 });
    }

    const filename = `${Date.now()}-${file.name}`;

    // الرفع المباشر باستخدام التوكن المخصص للمخزن العام الجديد
    const blob = await put(filename, file, {
      access: 'public',
      token: process.env.PUBLIC_BLOB_READ_WRITE_TOKEN, // التوكن الجديد لمنع التضارب
    });

    return NextResponse.json({ success: true, url: blob.url });

  } catch (err) {
    console.error("❌ [Vercel Blob Upload Error]:", err.message);
    return NextResponse.json({ error: err.message || "خطأ داخلي أثناء الرفع" }, { status: 500 });
  }
}