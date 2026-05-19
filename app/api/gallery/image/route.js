import { NextResponse } from "next/server";
import { getDownloadUrl } from "@vercel/blob";

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const blobUrl = searchParams.get("url");

  if (!blobUrl) {
    return new NextResponse("url مطلوب", { status: 400 });
  }

  try {
    // توليد رابط مؤقت صالح لـ 10 دقائق
    const { url } = await getDownloadUrl(blobUrl, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
      expiresIn: 600,
    });

    // Redirect للرابط المؤقت
    return NextResponse.redirect(url);
  } catch (err) {
    console.error("❌ [image proxy]", err);
    return new NextResponse("فشل", { status: 500 });
  }
}