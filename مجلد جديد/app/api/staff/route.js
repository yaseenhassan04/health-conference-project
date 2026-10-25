/**
 * app/api/staff/route.js
 * إدارة يوزرات الـ Staff — للأدمن فقط
 * GET    /api/staff          ← جلب كل اليوزرات
 * POST   /api/staff          ← إنشاء يوزر جديد
 * PATCH  /api/staff          ← تعديل يوزر
 * DELETE /api/staff?id=X     ← حذف يوزر
 */

import { NextResponse } from "next/server";
import prisma from "@/server/db/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret_key_change_me";

const ALLOWED_PERMISSIONS = [
  "workshops",
  "news",
  "gallery",
  "library",
  "abstracts",
  "live",
];

// ── تحقق إن الطالب أدمن ──────────────────────────
function getAdminFromRequest(req) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.replace("Bearer ", "").trim();
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.role !== "admin") return null;
    return payload;
  } catch {
    return null;
  }
}

// ── GET: جلب كل اليوزرات ─────────────────────────
export async function GET(req) {
  if (!getAdminFromRequest(req)) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const staff = await prisma.staffUser.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      username: true,
      displayName: true,
      permissions: true,
      active: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    staff: staff.map((s) => ({
      ...s,
      permissions: JSON.parse(s.permissions || "[]"),
    })),
  });
}

// ── POST: إنشاء يوزر جديد ────────────────────────
export async function POST(req) {
  if (!getAdminFromRequest(req)) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const body = await req.json();
  const { username, password, displayName, permissions = [] } = body;

  if (!username?.trim() || !password?.trim() || !displayName?.trim()) {
    return NextResponse.json(
      { error: "اسم المستخدم وكلمة المرور والاسم مطلوبة" },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" },
      { status: 400 }
    );
  }

  // تحقق من الصلاحيات
  const validPerms = permissions.filter((p) => ALLOWED_PERMISSIONS.includes(p));

  // تحقق إن اليوزرنيم مش موجود
  const existing = await prisma.staffUser.findUnique({
    where: { username: username.trim() },
  });
  if (existing) {
    return NextResponse.json(
      { error: "اسم المستخدم موجود مسبقاً" },
      { status: 409 }
    );
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.staffUser.create({
    data: {
      username: username.trim(),
      password: hashed,
      displayName: displayName.trim(),
      permissions: JSON.stringify(validPerms),
      active: true,
    },
  });

  return NextResponse.json(
    {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        permissions: validPerms,
        active: user.active,
      },
    },
    { status: 201 }
  );
}

// ── PATCH: تعديل يوزر ────────────────────────────
export async function PATCH(req) {
  if (!getAdminFromRequest(req)) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const body = await req.json();
  const { id, displayName, password, permissions, active } = body;

  if (!id) {
    return NextResponse.json({ error: "id مطلوب" }, { status: 400 });
  }

  const updateData = {};

  if (displayName !== undefined) updateData.displayName = displayName.trim();
  if (active !== undefined) updateData.active = Boolean(active);
  if (permissions !== undefined) {
    const validPerms = permissions.filter((p) => ALLOWED_PERMISSIONS.includes(p));
    updateData.permissions = JSON.stringify(validPerms);
  }
  if (password?.trim()) {
    if (password.length < 6) {
      return NextResponse.json(
        { error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" },
        { status: 400 }
      );
    }
    updateData.password = await bcrypt.hash(password, 10);
  }

  const updated = await prisma.staffUser.update({
    where: { id: parseInt(id) },
    data: updateData,
    select: {
      id: true,
      username: true,
      displayName: true,
      permissions: true,
      active: true,
    },
  });

  return NextResponse.json({
    success: true,
    user: {
      ...updated,
      permissions: JSON.parse(updated.permissions || "[]"),
    },
  });
}

// ── DELETE: حذف يوزر ─────────────────────────────
export async function DELETE(req) {
  if (!getAdminFromRequest(req)) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id مطلوب" }, { status: 400 });
  }

  await prisma.staffUser.delete({ where: { id: parseInt(id) } });

  return NextResponse.json({ success: true });
}