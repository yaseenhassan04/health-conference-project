import { NextResponse } from "next/server";
import { head } from "@vercel/blob";

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const blobUrl = searchParams.get("url");

  if (!blobUrl) {
    return new NextResponse("url مطلوب", { status: 400 });
  }

  try {
    // ✅ استخدم head() للحصول على معلومات الملف أولاً
    const { downloadUrl } = await head(blobUrl, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    // Redirect للـ downloadUrl المؤقت
    return NextResponse.redirect(downloadUrl);

  } catch (err) {
    console.error("❌ [image proxy]", err.message);
    return new NextResponse(err.message, { status: 500 });
  }
}