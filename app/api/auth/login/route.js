/**
 * app/api/auth/login/route.js
 * POST /api/auth/login
 * Body: { username, password }
 * Returns: { token } — JWT يحتوي على { id, name, role }
 *
 * ⚠️ الآن: يوزرات مكتوبة في الكود (hardcoded)
 * لاحقاً: استبدل USERS بـ query من قاعدة البيانات
 */

import { NextResponse } from "next/server";
import { SignJWT } from "jose"; // مكتبة jose — مدعومة في Next.js Edge

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "conference_secret_key_change_in_production"
);

/* ─────────────────────────────────────────────
   قائمة المستخدمين المؤقتة
   غيّرها أو استبدلها بقاعدة بيانات لاحقاً
   كلمات المرور يجب أن تكون hashed في الإنتاج!
──────────────────────────────────────────────*/
const USERS = [
  {
    id: "1",
    username: "admin",
    password: "Admin@2026",      // ← غيّر هذا
    name: "مدير النظام",
    role: "admin",
  },
  {
    id: "2",
    username: "doctor1",
    password: "Doctor@2026",     // ← غيّر هذا
    name: "د. أحمد محمد",
    role: "doctor",
  },
  {
    id: "3",
    username: "doctor2",
    password: "Doctor2@2026",
    name: "د. سارة العلي",
    role: "doctor",
  },
  {
    id: "4",
    username: "media1",
    password: "Media@2026",      // ← غيّر هذا
    name: "محمد الإعلامي",
    role: "media",
  },
];

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "يرجى إدخال اسم المستخدم وكلمة المرور" },
        { status: 400 }
      );
    }

    /* البحث عن المستخدم */
    const user = USERS.find(
      u => u.username === username.trim() && u.password === password
    );

    if (!user) {
      return NextResponse.json(
        { error: "اسم المستخدم أو كلمة المرور غير صحيحة" },
        { status: 401 }
      );
    }

    /* توليد JWT */
    const token = await new SignJWT({
      id:   user.id,
      name: user.name,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")   // صالح 24 ساعة
      .sign(JWT_SECRET);

    return NextResponse.json({
      token,
      user: { id: user.id, name: user.name, role: user.role },
    });

  } catch (err) {
    console.error("[login]", err);
    return NextResponse.json(
      { error: "خطأ في الخادم" },
      { status: 500 }
    );
  }
}