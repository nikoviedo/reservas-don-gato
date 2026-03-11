import { NextRequest, NextResponse } from "next/server";
import { confirmReservation } from "@/lib/reservations";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (!key) return NextResponse.json({ error: "missing_key" }, { status: 400 });

  const reservation = await confirmReservation(key);
  if (!reservation) return NextResponse.json({ error: "invalid_or_expired" }, { status: 404 });

  return NextResponse.json({ ok: true, code: reservation.code, status: reservation.status });
}
