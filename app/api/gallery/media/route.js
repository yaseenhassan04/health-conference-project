// /api/gallery/media/route.js
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "gallery-db.json");

function readDb() {
  try { 
    return JSON.parse(fs.readFileSync(DB_PATH, "utf8")); 
  } catch { 
    return { items: [] }; 
  }
}

function writeDb(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// ✅ جلب الصور
export async function GET() {
  try {
    const db = readDb();
    return NextResponse.json(db);
  } catch (err) {
    return NextResponse.json({ items: [] });
  }
}

// ✅ إضافة صورة جديدة
export async function POST(req) {
  try {
    const body = await req.json();
    const { url, captionAr, captionEn, tag, tagEn } = body;

    if (!url) {
      return NextResponse.json({ error: "URL مطلوب" }, { status: 400 });
    }

    const db = readDb();
    db.items.unshift({
      src: url,
      captionAr: captionAr || "",
      captionEn: captionEn || "",
      tag: tag || "فعاليات",
      tagEn: tagEn || "Events",
      id: Date.now(),
    });
    writeDb(db);

    return NextResponse.json({ success: true, items: db.items });
  } catch (err) {
    console.error("❌ [media POST]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ✅ حذف صورة
export async function DELETE(req) {
  try {
    const { id } = await req.json();
    const db = readDb();
    db.items = db.items.filter(item => item.id !== id);
    writeDb(db);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}