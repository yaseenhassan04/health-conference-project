import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "gallery-db.json");

// دالة مساعدة لقراءة البيانات بأمان وضمان هيكلية مصفوفة items سليم
function readDb() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      return { items: [] };
    }
    const fileContent = fs.readFileSync(DB_PATH, "utf8");
    const data = JSON.parse(fileContent);
    
    if (!data || !Array.isArray(data.items)) {
      return { items: Array.isArray(data) ? data : [] };
    }
    return data;
  } catch {
    return { items: [] };
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("❌ فشل الكتابة في ملف المعرض:", err.message);
  }
}

// 1. جلب الصور (متوافق 100% مع طلب الفرونت إند)
export async function GET() {
  try {
    const db = readDb();
    return NextResponse.json(db);
  } catch (err) {
    return NextResponse.json({ items: [] });
  }
}

// 2. استقبال وحفظ الصورة تلقائياً بالمسمى المتوقع للفرونت إند (src)
export async function POST(req) {
  try {
    const body = await req.json();

    // فحص واستخراج الرابط السحابي المرفوع سلفاً
    const finalUrl = body.url || body.imageUrl || body.image || body.link || body.src || body.path;

    if (!finalUrl) {
      return NextResponse.json({ error: "رابط الصورة (URL) مفقود" }, { status: 400 });
    }

    const captionAr = body.captionAr || body.caption_ar || body.titleAr || body.title || "";
    const captionEn = body.captionEn || body.caption_en || body.titleEn || "";
    const tag = body.tag || "فعاليات";
    const tagEn = body.tagEn || body.tag_en || "Events";

    const db = readDb();
    
    // 💡 التعديل الذهبي: حفظ الرابط داخل مفتاح 'src' صراحة ليتوافق مع مخرجات الفرونت إند المعروضة
    const newItem = {
      src: finalUrl, 
      captionAr: captionAr,
      captionEn: captionEn,
      tag: tag,
      tagEn: tagEn,
      id: Date.now(),
    };

    db.items.unshift(newItem);
    writeDb(db);

    // إعادة النتيجة مطابقة تماماً لهيكل دالة الـ GET لمنع انهيار الواجهة
    return NextResponse.json(db);

  } catch (err) {
    console.error("❌ [media POST Error]:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 3. حذف صورة من المعرض
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