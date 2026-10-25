// app/api/gallery/stats/route.js
import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

// استخدم الـ variables الموجودة فعلاً
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

const KEY = "gallery:stats";

export async function GET() {
  try {
    const stats = await redis.get(KEY);
    return NextResponse.json(stats ?? { likes: {}, views: {} });
  } catch {
    return NextResponse.json({ likes: {}, views: {} });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const stats = (await redis.get(KEY)) ?? { likes: {}, views: {} };

    if (body.likes) {
      for (const [k, v] of Object.entries(body.likes)) {
        stats.likes[k] = Number(v);
      }
    }
    if (body.views) {
      for (const [k, v] of Object.entries(body.views)) {
        stats.views[k] = Number(v);
      }
    }

    await redis.set(KEY, stats);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}