import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const blobUrl = searchParams.get("url");

  if (!blobUrl) {
    return new NextResponse("url مطلوب", { status: 400 });
  }

  try {
    // ✅ أضف التوكن كـ query parameter — هذي الطريقة الرسمية لـ Vercel private blobs
    const urlWithToken = `${blobUrl}?token=${process.env.BLOB_READ_WRITE_TOKEN}`;
    
    const response = await fetch(urlWithToken);

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/jpeg";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });

  } catch (err) {
    console.error("❌ [image proxy]", err.message);
    return new NextResponse(err.message, { status: 500 });
  }
}