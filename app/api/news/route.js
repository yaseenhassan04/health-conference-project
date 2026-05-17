/**
 * app/api/news/route.js
 * API للأخبار - إدارة الأخبار في الصفحة الرئيسية
 */

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

const DATA_FILE = path.join(process.cwd(), "data", "news.json");

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

// GET: جلب كل الأخبار (مرتبة حسب التاريخ)
export async function GET() {
  const items = readItems();
  // ترتيب من الأحدث إلى الأقدم
  items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return NextResponse.json({ items });
}

// POST: إضافة خبر جديد
export async function POST(req) {
  const body = await req.json();
  const { title, date, icon = "📰", content, published = true } = body;

  if (!title || !content) {
    return NextResponse.json(
      { error: "العنوان والمحتوى مطلوبان" },
      { status: 400 }
    );
  }

  const items = readItems();
  const newItem = {
    id: randomUUID(),
    title,
    date: date || new Date().toLocaleDateString("ar-EG"),
    icon,
    content,
    published,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  items.push(newItem);
  writeItems(items);
  return NextResponse.json({ item: newItem }, { status: 201 });
}

// PATCH: تعديل خبر
export async function PATCH(req) {
  const body = await req.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "id مطلوب" }, { status: 400 });
  }

  const items = readItems();
  const index = items.findIndex((i) => i.id === id);

  if (index === -1) {
    return NextResponse.json({ error: "الخبر غير موجود" }, { status: 404 });
  }

  items[index] = {
    ...items[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  writeItems(items);
  return NextResponse.json({ item: items[index] });
}

// DELETE: حذف خبر
export async function DELETE(req) {
  const id = new URL(req.url).searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id مطلوب" }, { status: 400 });
  }

  const items = readItems();
  const filtered = items.filter((i) => i.id !== id);

  if (filtered.length === items.length) {
    return NextResponse.json({ error: "الخبر غير موجود" }, { status: 404 });
  }

  writeItems(filtered);
  return NextResponse.json({ success: true });
}