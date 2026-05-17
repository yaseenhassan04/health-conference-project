/**
 * app/api/gallery/screens/route.js
 * شاشات التفاعل - تدعم الآن: صور، فيديوهات، روابط، نصوص
 */

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

const DATA_FILE = path.join(process.cwd(), "data", "gallery-screens.json");

function ensureFile() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]");
}

function readItems() {
  ensureFile();
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {
    return [];
  }
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
  
  // الحقول الجديدة مع دعم الوسائط
  const {
    type = "link",        // "image", "video", "link", "text"
    titleAr,
    titleEn = "",
    descAr = "",
    descEn = "",
    icon = "🖥️",
    href = "/media",
    mediaUrl = "",        // رابط الصورة أو الفيديو
    embedCode = "",       // كود تضمين (مثل YouTube embed)
    published = true,
    order = 0             // ترتيب العرض
  } = body;

  if (!titleAr) {
    return NextResponse.json({ error: "titleAr مطلوب" }, { status: 400 });
  }

  const items = readItems();
  
  const item = {
    id: randomUUID(),
    type,              // ← مهم لتحديد نوع المحتوى
    titleAr,
    titleEn,
    descAr,
    descEn,
    icon,
    href,
    mediaUrl,          // ← جديد
    embedCode,         // ← جديد
    published,
    order: order || items.length,
    createdAt: new Date().toISOString()
  };
  
  items.push(item);
  writeItems(items);
  return NextResponse.json({ item }, { status: 201 });
}

export async function PATCH(req) {
  const body = await req.json();
  const { id, ...updates } = body;
  
  if (!id) {
    return NextResponse.json({ error: "id مطلوب" }, { status: 400 });
  }

  const items = readItems();
  const idx = items.findIndex(i => i.id === id);
  
  if (idx === -1) {
    return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  }

  // تحديث الحقول مع الاحتفاظ بالحقول القديمة غير المرسلة
  items[idx] = {
    ...items[idx],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  writeItems(items);
  return NextResponse.json({ item: items[idx] });
}

export async function DELETE(req) {
  const id = new URL(req.url).searchParams.get("id");
  
  if (!id) {
    return NextResponse.json({ error: "id مطلوب" }, { status: 400 });
  }

  const items = readItems();
  const filtered = items.filter(i => i.id !== id);
  
  if (filtered.length === items.length) {
    return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  }

  writeItems(filtered);
  return NextResponse.json({ success: true });
}