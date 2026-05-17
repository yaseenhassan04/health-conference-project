/**
 * app/api/gallery/media/route.js
 * GET    → جلب كل صور المعرض
 * POST   → إضافة صورة جديدة
 * PATCH  → تعديل صورة
 * DELETE → حذف صورة  (?id=xxx)
 *
 * ⚠️ حالياً يحفظ في ملف JSON محلي (data/gallery-media.json)
 * غيّره لاحقاً لـ MySQL أو Prisma
 */

import { NextResponse } from "next/server";
import fs   from "fs";
import path from "path";
import { randomUUID } from "crypto";

const DATA_FILE = path.join(process.cwd(), "data", "gallery-media.json");

/* تأكد من وجود الملف */
function ensureFile() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir))  fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]");
}

function readItems() {
  ensureFile();
  try { return JSON.parse(fs.readFileSync(DATA_FILE, "utf8")); }
  catch { return []; }
}

function writeItems(items) {
  ensureFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2));
}

export async function GET() {
  const items = readItems();
  return NextResponse.json({ items });
}

export async function POST(req) {
  const body = await req.json();
  const { src, captionAr, captionEn = "", tag = "فعاليات", tagEn = "Events" } = body;

  if (!src)        return NextResponse.json({ error: "src مطلوب" }, { status: 400 });
  if (!captionAr)  return NextResponse.json({ error: "captionAr مطلوب" }, { status: 400 });

  const items = readItems();
  const item  = { id: randomUUID(), src, captionAr, captionEn, tag, tagEn, createdAt: new Date().toISOString() };
  items.push(item);
  writeItems(items);
  return NextResponse.json({ item }, { status: 201 });
}

export async function PATCH(req) {
  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "id مطلوب" }, { status: 400 });

  const items = readItems();
  const idx   = items.findIndex(i => i.id === id);
  if (idx === -1) return NextResponse.json({ error: "غير موجود" }, { status: 404 });

  items[idx] = { ...items[idx], ...updates, updatedAt: new Date().toISOString() };
  writeItems(items);
  return NextResponse.json({ item: items[idx] });
}

export async function DELETE(req) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id مطلوب" }, { status: 400 });

  const items = readItems();
  const filtered = items.filter(i => i.id !== id);
  if (filtered.length === items.length)
    return NextResponse.json({ error: "غير موجود" }, { status: 404 });

  writeItems(filtered);
  return NextResponse.json({ success: true });
}