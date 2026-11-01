import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "samoud2025";
const CAPACITY = 10; // المقاعد المحدودة

export async function GET(req) {
  const token = req.headers.get("x-admin-token");
  if (token !== ADMIN_TOKEN)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const items = await prisma.bronchoscopyRegistration.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      items,
      total: items.length,
      remaining: Math.max(0, CAPACITY - items.length),
      capacity: CAPACITY,
      isFull: items.length >= CAPACITY,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "فشل جلب البيانات" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { fullNameAr, fullNameEn, email, whatsapp, specialty, workplace } = body;

    // تحقق من الحقول المطلوبة
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

    // تحقق من الطاقة الاستيعابية
    const count = await prisma.bronchoscopyRegistration.count();
    if (count >= CAPACITY)
      return NextResponse.json({ error: "عذراً، امتلأت المقاعد" }, { status: 400 });

    // تحقق من التسجيل المسبق
    const existing = await prisma.bronchoscopyRegistration.findFirst({
      where: { email: email.toLowerCase().trim() },
    });
    if (existing)
      return NextResponse.json({ error: "هذا البريد الإلكتروني مسجل مسبقاً" }, { status: 400 });

    const registration = await prisma.bronchoscopyRegistration.create({
      data: {
        fullNameAr: fullNameAr.trim(),
        fullNameEn: fullNameEn?.trim() || "",
        email: email.toLowerCase().trim(),
        whatsapp: whatsapp.trim(),
        specialty: specialty.trim(),
        workplace: workplace.trim(),
      },
    });

    return NextResponse.json({ success: true, id: registration.id }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "حدث خطأ، حاول مرة أخرى" }, { status: 500 });
  }
}

export async function DELETE(req) {
  const token = req.headers.get("x-admin-token");
  if (token !== ADMIN_TOKEN)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));

  try {
    await prisma.bronchoscopyRegistration.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "فشل الحذف" }, { status: 500 });
  }
}