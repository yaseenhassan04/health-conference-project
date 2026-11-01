import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "samoud2025";

export async function POST(req) {
  try {
    const token = req.headers.get("x-admin-token");
    if (token !== ADMIN_TOKEN)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // تحقق من وجود BLOB_READ_WRITE_TOKEN
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { error: "BLOB_READ_WRITE_TOKEN غير موجود في .env" },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file)
      return NextResponse.json({ error: "لم يتم إرسال ملف" }, { status: 400 });

    const allowedTypes = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];
    if (!allowedTypes.includes(file.type))
      return NextResponse.json(
        { error: "نوع الملف غير مدعوم" },
        { status: 400 }
      );

    const maxSize = 200 * 1024 * 1024;
    if (file.size > maxSize)
      return NextResponse.json(
        { error: "حجم الفيديو يتجاوز 200MB" },
        { status: 400 }
      );

    const filename = `videos/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;

    const blob = await put(filename, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return NextResponse.json({ url: blob.url }, { status: 201 });

  } catch (err) {
    console.error("Upload error:", err);
    // دائماً يرجع JSON حتى لو في خطأ
    return NextResponse.json(
      { error: err?.message || "فشل الرفع" },
      { status: 500 }
    );
  }
}