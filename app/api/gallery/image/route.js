import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const blobUrl = searchParams.get("url");

  if (!blobUrl) {
    return new NextResponse("url مطلوب", { status: 400 });
  }

  try {
    // ✅ الطريقة الصحيحة: fetch الصورة مباشرة بالتوكن
    const response = await fetch(blobUrl, {
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Blob fetch failed: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/jpeg";

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("❌ [image proxy]", err);
    return new NextResponse("فشل", { status: 500 });
  }
}