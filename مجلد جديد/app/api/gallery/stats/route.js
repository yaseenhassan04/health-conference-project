// app/api/gallery/stats/route.js
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// ملف JSON يُخزَّن في /tmp (أو data/) — غيّر المسار حسب بيئتك
const STATS_FILE = path.join(process.cwd(), "data", "gallery-stats.json");

function readStats() {
  try {
    if (!fs.existsSync(STATS_FILE)) return { likes: {}, views: {} };
    return JSON.parse(fs.readFileSync(STATS_FILE, "utf-8"));
  } catch {
    return { likes: {}, views: {} };
  }
}

function writeStats(data) {
  const dir = path.dirname(STATS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(STATS_FILE, JSON.stringify(data), "utf-8");
}

// GET /api/gallery/stats → يرجع الأرقام المحفوظة
export async function GET() {
  const stats = readStats();
  return NextResponse.json(stats);
}

// POST /api/gallery/stats → يحدّث أرقام معينة
// body: { likes?: { [idx]: number }, views?: { [idx]: number } }
export async function POST(req) {
  try {
    const body = await req.json();
    const stats = readStats();

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

    writeStats(stats);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}