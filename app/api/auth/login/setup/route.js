/**
 * app/api/auth/setup/route.js
 * ⚠️ احذف هذا الملف فوراً بعد الاستخدام
 *
 * POST /api/auth/setup
 * Body: { "setupKey": "setup_samoud_2026_once" }
 */

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

const SETUP_KEY = 'setup_samoud_2026_once';

export async function POST(req) {
  try {
    const { setupKey } = await req.json();
    if (setupKey !== SETUP_KEY) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    /* 
      Schema الحالي:
      Admin { id, username, password, createdAt }
      ← ما في name ولا role
    */
    const ADMINS = [
      { username: 'admin',   password: 'Admin@2026'   },
      { username: 'doctor1', password: 'Doctor@2026'  },
      { username: 'doctor2', password: 'Doctor2@2026' },
      { username: 'media1',  password: 'Media@2026'   },
    ];

    const results = [];

    for (const admin of ADMINS) {
      const existing = await prisma.admin.findUnique({
        where: { username: admin.username }
      });

      if (existing) {
        results.push({ username: admin.username, status: 'already_exists' });
        continue;
      }

      const hashed = await bcrypt.hash(admin.password, 10);

      await prisma.admin.create({
        data: {
          username: admin.username,
          password: hashed,
        }
      });

      results.push({ username: admin.username, status: 'created' });
    }

    return NextResponse.json({ success: true, results });

  } catch (err) {
    console.error('[setup_error]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}