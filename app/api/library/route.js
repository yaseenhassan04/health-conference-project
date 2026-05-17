// app/api/library/route.js  (Next.js App Router — GET / POST / PATCH / DELETE)
// ──────────────────────────────────────────────────────────────────────────────
// التخزين: JSON محلي في  data/library.json
// الرفع:   ملف منفصل    app/api/library/upload/route.js
// ──────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import fs   from 'fs';
import path from 'path';

const DATA_FILE  = path.join(process.cwd(), 'data', 'library.json');
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'library');

/* ─── helpers ─── */
function readData() {
  try {
    if (!fs.existsSync(DATA_FILE)) return { items: [] };
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  } catch {
    return { items: [] };
  }
}

function writeData(data) {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function checkAuth(req) {
  return req.headers.get('x-admin-token') === process.env.ADMIN_TOKEN;
}

/* ─── GET: قائمة المراجع المنشورة (للزوار بدون token) ─── */
export async function GET() {
  const data      = readData();
  const published = (data.items || []).filter(i => i.published !== false);
  return NextResponse.json({ items: published });
}

/* ─── POST: إضافة مرجع جديد ─── */
export async function POST(req) {
  if (!checkAuth(req))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { title, author, category, type, fileUrl, description, year } = body;

  if (!title?.trim())
    return NextResponse.json({ error: 'title is required' }, { status: 400 });

  const data    = readData();
  const newItem = {
    id:          Date.now().toString(),
    title:       title.trim(),
    author:      author?.trim()       || '',
    category:    category?.trim()     || 'General',
    type:        type                 || 'book',
    fileUrl:     fileUrl?.trim()      || '',
    description: description?.trim()  || '',
    year:        year                 || new Date().getFullYear(),
    published:   body.published !== false,
    createdAt:   new Date().toISOString(),
  };

  data.items = data.items || [];
  data.items.push(newItem);
  writeData(data);

  return NextResponse.json({ success: true, item: newItem }, { status: 201 });
}

/* ─── PATCH: تعديل مرجع (أو تغيير حالة النشر) ─── */
export async function PATCH(req) {
  if (!checkAuth(req))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body      = await req.json();
  const { id, ...updates } = body;

  const data = readData();
  const idx  = (data.items || []).findIndex(i => i.id === id);
  if (idx === -1)
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });

  data.items[idx] = {
    ...data.items[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  writeData(data);

  return NextResponse.json({ success: true, item: data.items[idx] });
}

/* ─── DELETE: حذف مرجع (+ الملف المحلي إن وُجد) ─── */
export async function DELETE(req) {
  if (!checkAuth(req))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  const data   = readData();
  const before = (data.items || []).length;
  const target = (data.items || []).find(i => i.id === id);

  data.items = (data.items || []).filter(i => i.id !== id);

  if (data.items.length === before)
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });

  /* حذف الملف المحلي إذا كان مرفوعاً على السيرفر */
  if (target?.fileUrl?.startsWith('/uploads/')) {
    const filePath = path.join(process.cwd(), 'public', target.fileUrl);
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (err) {
      console.error('Error deleting file:', err);
    }
  }

  writeData(data);
  return NextResponse.json({ success: true });
}