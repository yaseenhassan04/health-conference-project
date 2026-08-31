import { NextResponse } from 'next/server';
import { saveGalleryScreenshot } from '@/server/services/gallery/media.service';

export async function POST(req) {
  const body = await req.json();
  const result = saveGalleryScreenshot(body);
  return NextResponse.json(result);
}
