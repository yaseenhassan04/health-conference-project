// app/api/gallery/media/route.js
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { put } from '@vercel/blob';
import { ApiError } from '@/server/lib/apiError';
import {
  getGalleryMedia,
  addGalleryMedia,
  updateGalleryMedia,
  deleteGalleryMedia,
} from '@/server/services/gallery/media.service';

export const dynamic = 'force-dynamic';

function isAdmin(req) {
  const expected = process.env.ADMIN_TOKEN;
  const got = req.headers.get('x-admin-token') || '';
  if (!expected || !got) return false;
  const a = Buffer.from(got);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
const forbid = () => NextResponse.json({ error: 'غير مصرّح' }, { status: 401 });
const toList = (db) => (Array.isArray(db) ? db : db?.items ?? []);
const fail = (err) =>
  err instanceof ApiError
    ? NextResponse.json(err.body, { status: err.status })
    : NextResponse.json({ error: err.message }, { status: 500 });

const FIELDS = ['type', 'src', 'thumbnail', 'captionAr', 'captionEn', 'tag', 'tagEn', 'category', 'published', 'order'];
const pick = (o) => Object.fromEntries(FIELDS.filter((k) => k in o).map((k) => [k, o[k]]));

export async function GET(req) {
  try {
    const wantAll = new URL(req.url).searchParams.get('all') === '1' && isAdmin(req);
    let items = toList(await getGalleryMedia());
    if (!wantAll) items = items.filter((i) => i.published !== false);
    items = [...items].sort((a, b) => (a.order ?? 1e9) - (b.order ?? 1e9));
    return NextResponse.json({ items });
  } catch (err) {
    return fail(err);
  }
}

/* ───── POST: إضافة (تم تعديلها لدعم رفع الملفات وتجنب خطأ التكرار) ───── */
export async function POST(req) {
  if (!isAdmin(req)) return forbid();
  try {
    const contentType = req.headers.get('content-type') || '';
    let body = {};

    // دعم استقبال FormData (في حال تم إرفاق ملف فعلي) أو JSON العادي
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') || formData.get('src');

      if (file && typeof file === 'object') {
        // 💡 رفع الملف إلى Vercel Blob مع إضافة رمز عشوائي لمنع خطأ التكرار نهائياً
        const blob = await put(file.name, file, {
          access: 'public',
          addRandomSuffix: true,
          allowOverwrite: true,
        });
        body.src = blob.url;
      } else if (typeof file === 'string') {
        body.src = file;
      }

      for (const key of FIELDS) {
        const val = formData.get(key);
        if (val !== null) body[key] = val;
      }
    } else {
      body = pick(await req.json());
    }

    if (!body.src) return NextResponse.json({ error: 'الملف أو الرابط مطلوب' }, { status: 400 });

    const before = toList(await getGalleryMedia());
    const list = toList(await addGalleryMedia(body));
    const item = list.find((i) => !before.some((b) => String(b.id) === String(i.id))) ?? list[list.length - 1];
    return NextResponse.json({ item, items: list });
  } catch (err) {
    return fail(err);
  }
}

export async function PATCH(req) {
  if (!isAdmin(req)) return forbid();
  try {
    const { id, ...rest } = await req.json();
    if (!id) return NextResponse.json({ error: 'id مطلوب' }, { status: 400 });

    const res = await updateGalleryMedia({ id, patch: pick(rest) });
    const item = res?.item ?? toList(res).find((i) => i.id === id);
    if (!item) return NextResponse.json({ error: 'العنصر غير موجود' }, { status: 404 });
    return NextResponse.json({ item });
  } catch (err) {
    return fail(err);
  }
}

export async function DELETE(req) {
  if (!isAdmin(req)) return forbid();
  try {
    let id = new URL(req.url).searchParams.get('id');
    if (!id) {
      try { id = (await req.json()).id; } catch {}
    }
    if (!id) return NextResponse.json({ error: 'id مطلوب' }, { status: 400 });

    const list = toList(await deleteGalleryMedia({ id }));
    return NextResponse.json({ ok: true, items: list });
  } catch (err) {
    return fail(err);
  }
}