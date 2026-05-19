import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { put } from "@vercel/blob"; // التأكد من استيراد مكتبة الرفع

const DB_PATH = path.join(process.cwd(), "gallery-db.json");

// دالة قراءة قاعدة البيانات وتنظيفها من الملفات التالفة الناتجة عن المحاولات السابقة
function readDb() {
  try {
    if (!fs.existsSync(DB_PATH)) return { items: [] };
    const fileContent = fs.readFileSync(DB_PATH, "utf8");
    const data = JSON.parse(fileContent);
    
    let items = [];
    if (data && Array.isArray(data.items)) {
      items = data.items;
    } else if (Array.isArray(data)) {
      items = data;
    }

    // 🛡️ تنظيف تلقائي: حذف أي عنصر تالف لا يحتوي على رابط (src) صالح لمنع الشاشة البيضاء
    const cleanItems = items.filter(item => item && item.src && typeof item.src === 'string' && !item.src.startsWith('undefined') && item.src.trim() !== '');
    
    return { items: cleanItems };
  } catch {
    return { items: [] };
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("❌ فشل كتابة البيانات:", err.message);
  }
}

export async function GET() {
  return NextResponse.json(readDb());
}

export async function POST(req) {
  try {
    const body = await req.json();
    
    // 💡 الخدعة الذكية: قراءة التوكن الجديد التابع لـ Vercel إذا لم يكن القديم موجوداً
    const token = process.env.BLOB_READ_WRITE_TOKEN || process.env.PUBLIC_BLOB_READ_WRITE_TOKEN;

    // استخراج الرابط المستلم بعد الرفع
    const finalUrl = body.url || body.imageUrl || body.image || body.link || body.src;

    // 🛑 جدار حماية لمنع حفظ الروابط الفارغة أو التالفة التي تسبب شاشات بيضاء
    if (!finalUrl || typeof finalUrl !== 'string' || finalUrl.trim() === '' || finalUrl.startsWith('undefined')) {
      return NextResponse.json({ error: "فشل الرفع السحابي: الرابط المستلم غير صالح أو فارغ" }, { status: 400 });
    }

    const db = readDb();
    const newItem = {
      src: finalUrl,
      captionAr: body.captionAr || body.title || "",
      captionEn: body.captionEn || "",
      tag: body.tag || "فعاليات",
      tagEn: body.tagEn || "Events",
      id: Date.now(),
    };

    db.items.unshift(newItem);
    writeDb(db);
    return NextResponse.json(db);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { id } = await req.json();
    const db = readDb();
    db.items = db.items.filter(item => item.id !== id);
    writeDb(db);
    return NextResponse.json(db);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}