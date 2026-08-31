import { NextResponse } from 'next/server';
import { ApiError } from '@/server/lib/apiError';
import { getGalleryMedia, addGalleryMedia, deleteGalleryMedia } from '@/server/services/gallery/media.service';

export async function GET() {
  return NextResponse.json(getGalleryMedia());
}

export async function POST(req) {
  try {
    const body = await req.json();
    const db = addGalleryMedia(body);
    return NextResponse.json(db);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json(err.body, { status: err.status });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { id } = await req.json();
    const db = deleteGalleryMedia({ id });
    return NextResponse.json(db);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
