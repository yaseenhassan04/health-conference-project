// app/api/gallery/stats/route.js
import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const url = process.env.KV_REST_API_URL;
const token = process.env.KV_REST_API_TOKEN;
const redis = url && token ? new Redis({ url, token }) : null;

const KEY = "gallery:stats";

export async function GET() {
  if (!redis) {
    return NextResponse.json({ likes: {}, views: {} });
  }
  try {
    const stats = await redis.get(KEY);
    return NextResponse.json(stats ?? { likes: {}, views: {} });
  } catch {
    return NextResponse.json({ likes: {}, views: {} });
  }
}

export async function POST(req) {
  if (!redis) {
    // بدل 500 — نرجع 200 ونتجاهل الحفظ
    return NextResponse.json({ ok: true, skipped: true });
  }
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
    return NextResponse.json({ ok: true, skipped: true });
  }
}