import { NextResponse } from "next/server";
import { getDownloadUrl } from "@vercel/blob";

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const blobUrl = searchParams.get("url");

  if (!blobUrl) {
    return NextResponse.json({ error: "url مطلوب" }, { status: 400 });
  }

  try {
    const { url } = await getDownloadUrl(blobUrl, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
      expiresIn: 3600, // ساعة واحدة
    });

    return NextResponse.json({ signedUrl: url });
  } catch (err) {
    console.error("❌ [signed-url]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}