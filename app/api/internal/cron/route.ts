import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { cleanExpiredHolds } from "@/lib/reservations";

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get("secret") !== env.cronSecret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const cleaned = await cleanExpiredHolds();
  return NextResponse.json({ ok: true, cleaned });
}
