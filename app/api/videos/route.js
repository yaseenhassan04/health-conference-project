// app/api/videos/route.js
// ─── API للفيديوهات الترويجية — يستخدم ملف JSON محلي (نفس نهج الأخبار) ───

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "videos.json");
const ADMIN_TOKEN = "samoud2025";

function readData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
      fs.writeFileSync(DATA_FILE, JSON.stringify({ items: [] }));
    }
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch {
    return { items: [] };
  }
}

function writeData(data) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// GET — جلب كل الفيديوهات
export async function GET() {
  const data = readData();
  return NextResponse.json(data);
}

// POST — إضافة فيديو جديد
export async function POST(req) {
  const token = req.headers.get("x-admin-token");
  if (token !== ADMIN_TOKEN)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { titleAr, titleEn, src, poster, duration, icon, published } = body;

  if (!titleAr?.trim())
    return NextResponse.json({ error: "العنوان مطلوب" }, { status: 400 });
  if (!src?.trim())
    return NextResponse.json({ error: "رابط الفيديو مطلوب" }, { status: 400 });

  const data = readData();
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
  writeData(data);
  return NextResponse.json({ item }, { status: 201 });
}

// PATCH — تعديل أو toggle نشر
export async function PATCH(req) {
  const token = req.headers.get("x-admin-token");
  if (token !== ADMIN_TOKEN)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, ...updates } = body;

  const data = readData();
  const idx = data.items.findIndex((i) => i.id === id);
  if (idx === -1)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  data.items[idx] = { ...data.items[idx], ...updates };
  writeData(data);
  return NextResponse.json({ item: data.items[idx] });
}

// DELETE — حذف فيديو
export async function DELETE(req) {
  const token = req.headers.get("x-admin-token");
  if (token !== ADMIN_TOKEN)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  const data = readData();
  data.items = data.items.filter((i) => i.id !== id);
  writeData(data);
  return NextResponse.json({ ok: true });
}