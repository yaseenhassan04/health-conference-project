import { NextResponse } from "next/server";

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

    // ✅ Base64 — بدون Blob، تشتغل فوراً بدون proxy
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    return NextResponse.json({ success: true, url: dataUrl });

  } catch (err) {
    console.error("❌ [upload]", err.message);
    return NextResponse.json({ error: err.message || "خطأ داخلي" }, { status: 500 });
  }
}