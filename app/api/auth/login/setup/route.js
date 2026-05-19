import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { setupKey } = await req.json();
    if (setupKey !== 'setup_samoud_2026_once') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const hashed = await bcrypt.hash('Admin@2026', 10);
    const existing = await prisma.admin.findUnique({ where: { username: 'admin' } });
    if (existing) {
      return NextResponse.json({ success: true, status: 'already_exists' });
    }
    await prisma.admin.create({ data: { username: 'admin', password: hashed } });
    return NextResponse.json({ success: true, status: 'created' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}