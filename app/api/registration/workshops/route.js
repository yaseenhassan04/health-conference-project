// المسار: app/api/registration/workshops/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "samoud2025";

const WORKSHOPS = {
  bronchoscopy: { capacity: 10 },   // الأحد 8 نوفمبر
  pocus:        { capacity: 10 },   // الإثنين 9 نوفمبر
};

function buildStats(counts) {
  return Object.fromEntries(
    Object.entries(WORKSHOPS).map(([key, w]) => {
      const total = counts[key] || 0;
      return [key, {
        total,
        capacity: w.capacity,
        remaining: Math.max(0, w.capacity - total),
        isFull: total >= w.capacity,
      }];
    })
  );
}

// GET — بدون توكن: إحصائيات فقط | مع توكن: إحصائيات + كل المسجلين
export async function GET(req) {
  try {
    const token = req.headers.get("x-admin-token");
    if (token && token !== ADMIN_TOKEN)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const grouped = await prisma.workshopReg.groupBy({
      by: ["workshop"],
      _count: { _all: true },
    });
    const counts = Object.fromEntries(grouped.map(g => [g.workshop, g._count._all]));
    const stats = buildStats(counts);

    if (!token) return NextResponse.json({ stats });

    const items = await prisma.workshopReg.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ stats, items });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "فشل جلب البيانات" }, { status: 500 });
  }
}

// POST — تسجيل في ورشة محددة
export async function POST(req) {
  try {
    const body = await req.json();
    const { workshop, fullNameAr, fullNameEn, email, whatsapp, specialty, workplace } = body;

    if (!WORKSHOPS[workshop])
      return NextResponse.json({ error: "الورشة غير صحيحة" }, { status: 400 });
    if (!fullNameAr?.trim())
      return NextResponse.json({ error: "الاسم الكامل بالعربي مطلوب" }, { status: 400 });
    if (!email?.trim())
      return NextResponse.json({ error: "البريد الإلكتروني مطلوب" }, { status: 400 });
    if (!whatsapp?.trim())
      return NextResponse.json({ error: "رقم الواتساب مطلوب" }, { status: 400 });
    if (!specialty?.trim())
      return NextResponse.json({ error: "التخصص مطلوب" }, { status: 400 });
    if (!workplace?.trim())
      return NextResponse.json({ error: "جهة العمل مطلوبة" }, { status: 400 });

    // فحص السعة
    const count = await prisma.workshopReg.count({ where: { workshop } });
    if (count >= WORKSHOPS[workshop].capacity)
      return NextResponse.json({ error: "عذراً، امتلأت مقاعد هذه الورشة" }, { status: 400 });

    // فحص التسجيل المسبق في نفس الورشة
    const cleanEmail = email.toLowerCase().trim();
    const existing = await prisma.workshopReg.findFirst({
      where: { workshop, email: cleanEmail },
    });
    if (existing)
      return NextResponse.json({ error: "هذا البريد مسجل مسبقاً في هذه الورشة" }, { status: 400 });

    const registration = await prisma.workshopReg.create({
      data: {
        workshop,
        fullNameAr: fullNameAr.trim(),
        fullNameEn: fullNameEn?.trim() || "",
        email: cleanEmail,
        whatsapp: whatsapp.trim(),
        specialty: specialty.trim(),
        workplace: workplace.trim(),
      },
    });

    return NextResponse.json({ success: true, id: registration.id }, { status: 201 });
  } catch (err) {
    if (err?.code === "P2002")
      return NextResponse.json({ error: "هذا البريد مسجل مسبقاً في هذه الورشة" }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "حدث خطأ، حاول مرة أخرى" }, { status: 500 });
  }
}

// DELETE — حذف تسجيل
export async function DELETE(req) {
  const token = req.headers.get("x-admin-token");
  if (token !== ADMIN_TOKEN)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = Number(new URL(req.url).searchParams.get("id"));
  try {
    await prisma.workshopReg.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "فشل الحذف" }, { status: 500 });
  }
}