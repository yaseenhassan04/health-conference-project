import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "gallery-db.json");

// دالة مساعدة لقراءة البيانات بأمان
function readDb() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      return { items: [] };
    }
    return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
  } catch {
    return { items: [] };
  }
}

// دالة مساعدة للكتابة في الملف
function writeDb(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("❌ فشل الكتابة في الملف المحلي:", err.message);
  }
}

// 1. جلب الصور لعرضها بالمعرض
export async function GET() {
  try {
    const db = readDb();
    return NextResponse.json(db);
  } catch (err) {
    return NextResponse.json({ items: [] });
  }
}

// 2. استقبال بيانات الصورة وحفظها تلقائياً بالمعرض
export async function POST(req) {
  try {
    const body = await req.json();
    console.log("📥 البيانات المستلمة من الفرونت إند:", body);

    // 💡 فحص واستخراج الرابط بجميع المسميات الممكنة التي قد يرسلها الفرونت إند
    const imageUrl = body.url || body.imageUrl || body.image || body.link || body.src || body.path;

    if (!imageUrl) {
      return NextResponse.json({ error: "URL مطلوب ولكن لم يتم إرساله من الواجهة" }, { status: 400 });
    }

    // 💡 استخراج النصوص والتسميات بأي صيغة يرسلها الفرونت إند (سواء حروف صغيرة أو كبيرة)
    const captionAr = body.captionAr || body.caption_ar || body.titleAr || body.title || "";
    const captionEn = body.captionEn || body.caption_en || body.titleEn || "";
    const tag = body.tag || "فعاليات";
    const tagEn = body.tagEn || body.tag_en || "Events";

    const db = readDb();
    
    // إضافة الصورة الجديدة في بداية المصفوفة لتقرأ بالمعرض فوراً
    db.items.unshift({
      src: imageUrl,
      captionAr: captionAr,
      captionEn: captionEn,
      tag: tag,
      tagEn: tagEn,
      id: Date.now(),
    });
    
    writeDb(db);

    return NextResponse.json({ success: true, items: db.items });
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
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}