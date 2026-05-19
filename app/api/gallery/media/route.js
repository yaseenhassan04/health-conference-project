import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "gallery-db.json");

export async function GET() {
  try {
    const db = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
    return NextResponse.json(db);
  } catch {
    return NextResponse.json({ items: [] });
  }
}