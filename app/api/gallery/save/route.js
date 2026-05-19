import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "gallery-db.json");

function readDb() {
  try { return JSON.parse(fs.readFileSync(DB_PATH, "utf8")); }
  catch { return { items: [] }; }
}

export async function POST(req) {
  const { url, captionAr, captionEn, tag, tagEn } = await req.json();
  const db = readDb();
  db.items.unshift({ 
    src: url, captionAr, captionEn, tag, tagEn,
    id: Date.now()
  });
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  return NextResponse.json({ success: true });
}