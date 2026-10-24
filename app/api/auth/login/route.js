/**
 * app/api/auth/login/route.js
 * تسجيل الدخول — يدعم Admin و Staff
 */

import { NextResponse } from "next/server";
import prisma from "@/server/db/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret_key_change_me";

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    if (!username?.trim() || !password?.trim()) {
      return NextResponse.json(
        { error: "يرجى إدخال اسم المستخدم وكلمة المرور" },
        { status: 400 }
      );
    }

    // ── 1. تحقق من Admin أولاً ──────────────────
    const admin = await prisma.admin.findUnique({
      where: { username: username.trim() },
    });

    if (admin) {
      // Admin يستخدم bcrypt أو مقارنة مباشرة حسب نظامك
      const passwordMatch =
        admin.password.startsWith("$2") // bcrypt hash
          ? await bcrypt.compare(password, admin.password)
          : admin.password === password; // plain text fallback

      if (!passwordMatch) {
        return NextResponse.json(
          { error: "كلمة المرور غير صحيحة" },
          { status: 401 }
        );
      }

      const token = jwt.sign(
        {
          id: admin.id,
          name: admin.username,
          role: "admin",
          permissions: ["workshops","news","gallery","library","abstracts","live","users"],
        },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      return NextResponse.json({ token, role: "admin" });
    }

    // ── 2. تحقق من Staff ────────────────────────
    const staff = await prisma.staffUser.findUnique({
      where: { username: username.trim() },
    });

    if (!staff) {
      return NextResponse.json(
        { error: "اسم المستخدم أو كلمة المرور غير صحيحة" },
        { status: 401 }
      );
    }

    if (!staff.active) {
      return NextResponse.json(
        { error: "هذا الحساب موقوف، تواصل مع مدير النظام" },
        { status: 403 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, staff.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "اسم المستخدم أو كلمة المرور غير صحيحة" },
        { status: 401 }
      );
    }

    const permissions = JSON.parse(staff.permissions || "[]");

    const token = jwt.sign(
      {
        id: staff.id,
        name: staff.displayName,
        role: "staff",
        permissions,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return NextResponse.json({ token, role: "staff", permissions });
  } catch (error) {
    console.error("[POST /api/auth/login]", error);
    return NextResponse.json(
      { error: "حدث خطأ في الخادم" },
      { status: 500 }
    );
  }
}