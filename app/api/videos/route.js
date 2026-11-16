// app/api/videos/route.js
// ─── يستخدم Vercel Blob لتخزين videos.json ───

import { NextResponse } from "next/server";
import { put, list, del, getDownloadUrl } from "@vercel/blob";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "samoud2025";
const JSON_BLOB_KEY = "data/videos.json";

// ─── قراءة البيانات من Blob ───
async function readData() {
  try {
    const { blobs } = await list({ prefix: JSON_BLOB_KEY });
    if (!blobs.length) return { items: [] };

    const res = await fetch(blobs[0].url);
    if (!res.ok) return { items: [] };
    return await res.json();
  } catch {
    return { items: [] };
  }
}

// ─── كتابة البيانات إلى Blob ───
async function writeData(data) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });

  // احذف النسخة القديمة أولاً
  try {
    const { blobs } = await list({ prefix: JSON_BLOB_KEY });
    if (blobs.length) {
      await del(blobs.map((b) => b.url));
    }
  } catch {
    // تجاهل أخطاء الحذف
  }

  // ارفع النسخة الجديدة
  await put(JSON_BLOB_KEY, blob, {
    access: "public",
    allowOverwrite: true,
  });
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// ─── GET — جلب كل الفيديوهات ───
export async function GET() {
  try {
    const data = await readData();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ─── POST — إضافة فيديو جديد ───
export async function POST(req) {
  const token = req.headers.get("x-admin-token");
  if (token !== ADMIN_TOKEN)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { titleAr, titleEn, src, poster, duration, icon, published } = body;

    if (!titleAr?.trim())
      return NextResponse.json({ error: "العنوان مطلوب" }, { status: 400 });
    if (!src?.trim())
      return NextResponse.json({ error: "رابط الفيديو مطلوب" }, { status: 400 });

    const data = await readData();
    const item = {
      id: genId(),
      titleAr: titleAr.trim(),
      titleEn: titleEn?.trim() || titleAr.trim(),
      src: src.trim(),
      poster: poster?.trim() || "/hero-banner.png",
      duration: duration?.trim() || "",
      icon: icon || "🎬",
      published: published !== false,
      createdAt: new Date().toISOString(),
    };

    data.items.unshift(item);
    await writeData(data);
    return NextResponse.json({ item }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message || "فشل الحفظ" }, { status: 500 });
  }
}

// ─── PATCH — تعديل أو toggle نشر ───
export async function PATCH(req) {
  const token = req.headers.get("x-admin-token");
  if (token !== ADMIN_TOKEN)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { id, ...updates } = body;

    const data = await readData();
    const idx = data.items.findIndex((i) => i.id === id);
    if (idx === -1)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    data.items[idx] = { ...data.items[idx], ...updates };
    await writeData(data);
    return NextResponse.json({ item: data.items[idx] });
  } catch (err) {
    return NextResponse.json({ error: err.message || "فشل التعديل" }, { status: 500 });
  }
}

// ─── DELETE — حذف فيديو ───
export async function DELETE(req) {
  const token = req.headers.get("x-admin-token");
  if (token !== ADMIN_TOKEN)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const data = await readData();
    data.items = data.items.filter((i) => i.id !== id);
    await writeData(data);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message || "فشل الحذف" }, { status: 500 });
  }
}