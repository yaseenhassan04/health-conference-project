/**
 * app/api/gallery/upload/route.js
 * POST → رفع صورة وحفظها في /public/uploads/gallery/
 * Returns: { url: "/uploads/gallery/xxx.jpg" }
 */

import { NextResponse } from "next/server";
import fs   from "fs";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "gallery");

export async function POST(req) {
  try {
    /* تأكد من وجود المجلد */
    if (!fs.existsSync(UPLOAD_DIR))
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });

    const formData = await req.formData();
    const file     = formData.get("file");

    if (!file) return NextResponse.json({ error: "لا يوجد ملف" }, { status: 400 });

    /* التحقق من النوع */
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type))
      return NextResponse.json({ error: "نوع الملف غير مدعوم" }, { status: 400 });

    /* التحقق من الحجم (5 MB) */
    if (file.size > 5 * 1024 * 1024)
      return NextResponse.json({ error: "الحجم يتجاوز 5MB" }, { status: 400 });

    /* تحديد الامتداد */
    const ext      = file.type.split("/")[1].replace("jpeg", "jpg");
    const filename = `${randomUUID()}.${ext}`;
    const filePath = path.join(UPLOAD_DIR, filename);

    /* الحفظ */
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({ url: `/uploads/gallery/${filename}` });

  } catch (err) {
    console.error("[gallery/upload]", err);
    return NextResponse.json({ error: "خطأ في الرفع" }, { status: 500 });
  }
}