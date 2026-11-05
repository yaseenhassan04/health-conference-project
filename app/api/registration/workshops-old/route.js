import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "samoud2025";

const WORKSHOP_NAMES = {
  w1: "Safe ED Skills",
  w2: "Challenge Cases in DM",
  w3: "Electrolytes Is Not Just a Number",
  w4: "Gastroenterology Knowledge & Skills",
  w5: "POCUS",
};

export async function GET(req) {
  const token = req.headers.get("x-admin-token");
  if (token !== ADMIN_TOKEN)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const all = await prisma.workshopRegistration.findMany({
    orderBy: { createdAt: "asc" }
  });

  // عدد المسجلين لكل ورشة
  const workshopCounts = {};
  Object.keys(WORKSHOP_NAMES).forEach((id) => {
    const count = all.filter((r) => {
      try { return JSON.parse(r.workshops).includes(id); } catch { return false; }
    }).length;
    workshopCounts[id] = { name: WORKSHOP_NAMES[id], count, capacity: 20, available: 20 - count };
  });

  const oneWorkshop  = all.filter(r => { try { return JSON.parse(r.workshops).length === 1; } catch { return false; } }).length;
  const twoWorkshops = all.filter(r => { try { return JSON.parse(r.workshops).length === 2; } catch { return false; } }).length;

  return NextResponse.json({
    total: all.length,
    workshopCounts,
    oneWorkshop,
    twoWorkshops,
    recent: all.map(r => ({
      id: r.id,
      fullNameAr: r.fullNameAr,
      fullNameEn: r.fullNameEn,
      email: r.email,
      phone: r.phone,
      whatsapp: r.whatsapp,
      specialty: r.specialty,
      workplace: r.workplace,
      workshops: (() => { try { return JSON.parse(r.workshops); } catch { return []; } })(),
      createdAt: r.createdAt,
    })),
  });
}