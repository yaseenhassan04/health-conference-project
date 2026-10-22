import { NextResponse } from "next/server";
import prisma from "@/server/db/prisma";
const WORKSHOP_NAMES = {
  w1: "Safe ED Skills",
  w2: "Challenge Cases in DM",
  w3: "Electrolytes Is Not Just a Number",
  w4: "Gastroenterology Knowledge & Skills",
  w5: "POCUS",
};

// ── POST: تسجيل جديد ──────────────────────────────────────
export async function POST(req) {
  try {
    const body = await req.json();
    const {
      fullNameAr,
      fullNameEn,
      phone,
      whatsapp,
      email,
      specialty,
      workplace,
      yearsExp,
      workshops,
    } = body;

    // 1. تحقق من الحقول المطلوبة
    if (
      !fullNameAr?.trim() ||
      !fullNameEn?.trim() ||
      !phone?.trim() ||
      !whatsapp?.trim() ||
      !email?.trim() ||
      !specialty?.trim() ||
      !workplace?.trim() ||
      !workshops?.length
    ) {
      return NextResponse.json(
        { error: "يرجى تعبئة جميع الحقول المطلوبة" },
        { status: 400 }
      );
    }

    // 2. تحقق من الحد الأقصى للورشات
    if (workshops.length > 2) {
      return NextResponse.json(
        { error: "لا يمكن التسجيل في أكثر من ورشتين" },
        { status: 400 }
      );
    }

    // 3. تحقق من ورشات صالحة
    const validIds = Object.keys(WORKSHOP_NAMES);
    const invalidWorkshops = workshops.filter((id) => !validIds.includes(id));
    if (invalidWorkshops.length > 0) {
      return NextResponse.json(
        { error: "ورشة عمل غير صالحة" },
        { status: 400 }
      );
    }

    // 4. تحقق من البريد الإلكتروني مسبقاً
    const existing = await prisma.workshopRegistration.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (existing) {
      return NextResponse.json(
        { error: "هذا البريد الإلكتروني مسجل مسبقاً في ورشات العمل" },
        { status: 409 }
      );
    }

    // 5. تحقق من سعة كل ورشة (15 مقعد)
    for (const workshopId of workshops) {
      const count = await prisma.workshopRegistration.count({
        where: {
          workshops: { contains: workshopId },
        },
      });
      if (count >= 15) {
        return NextResponse.json(
          {
            error: `ورشة "${WORKSHOP_NAMES[workshopId]}" امتلأت — لا توجد أماكن شاغرة`,
          },
          { status: 409 }
        );
      }
    }

    // 6. حفظ التسجيل
    const registration = await prisma.workshopRegistration.create({
      data: {
        fullNameAr: fullNameAr.trim(),
        fullNameEn: fullNameEn.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim(),
        email: email.toLowerCase().trim(),
        specialty,
        workplace: workplace.trim(),
        yearsExp: yearsExp?.toString() || "",
        workshops: JSON.stringify(workshops),
      },
    });

    return NextResponse.json(
      { success: true, id: registration.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/registration/workshops]", error);
    return NextResponse.json(
      { error: "حدث خطأ في الخادم، يرجى المحاولة مجدداً" },
      { status: 500 }
    );
  }
}

// ── GET: إحصائيات الداشبورد ───────────────────────────────
export async function GET() {
  try {
    const all = await prisma.workshopRegistration.findMany({
      orderBy: { createdAt: "desc" },
    });

    // عدد المسجلين لكل ورشة
    const workshopCounts = {};
    Object.keys(WORKSHOP_NAMES).forEach((id) => {
      workshopCounts[id] = {
        name: WORKSHOP_NAMES[id],
        count: all.filter((r) => r.workshops.includes(id)).length,
        capacity: 15,
        available: 15 - all.filter((r) => r.workshops.includes(id)).length,
      };
    });

    // توزيع حسب التخصص
    const specialtyCounts = {};
    all.forEach((r) => {
      specialtyCounts[r.specialty] = (specialtyCounts[r.specialty] || 0) + 1;
    });

    // توزيع حسب عدد الورشات المختارة
    const oneWorkshop = all.filter(
      (r) => JSON.parse(r.workshops).length === 1
    ).length;
    const twoWorkshops = all.filter(
      (r) => JSON.parse(r.workshops).length === 2
    ).length;

    return NextResponse.json({
      total: all.length,
      workshopCounts,
      specialtyCounts,
      oneWorkshop,
      twoWorkshops,
      recent: all.slice(0, 20).map((r) => ({
        id: r.id,
        fullNameAr: r.fullNameAr,
        fullNameEn: r.fullNameEn,
        email: r.email,
        whatsapp: r.whatsapp,
        specialty: r.specialty,
        workplace: r.workplace,
        workshops: JSON.parse(r.workshops),
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    console.error("[GET /api/registration/workshops]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}