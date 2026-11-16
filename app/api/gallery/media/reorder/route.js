// app/api/gallery/media/reorder/route.js
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { put } from '@vercel/blob';
import { getGalleryMedia } from '@/server/services/gallery/media.service';

export const dynamic = 'force-dynamic';

function isAdmin(req) {
  const expected = process.env.ADMIN_TOKEN;
  const got = req.headers.get('x-admin-token') || '';
  if (!expected || !got) return false;
  const a = Buffer.from(got);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// ─── POST: إعادة ترتيب الصور في request واحد ───
export async function POST(req) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'غير مصرّح' }, { status: 401 });
  try {
    const { order } = await req.json();
    if (!Array.isArray(order)) return NextResponse.json({ error: 'order مطلوب' }, { status: 400 });

    const { items } = await getGalleryMedia();
    const orderMap = new Map(order.map((o) => [String(o.id), Number(o.order)]));

    const updated = items.map((item) => ({
      ...item,
      order: orderMap.has(String(item.id)) ? orderMap.get(String(item.id)) : (item.order ?? 999),
    }));

    updated.sort((a, b) => a.order - b.order);

    await put('gallery/db.json', JSON.stringify({ items: updated }, null, 2), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}