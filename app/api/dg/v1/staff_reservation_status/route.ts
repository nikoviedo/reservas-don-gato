import { NextRequest, NextResponse } from "next/server";
import { ReservationStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { verifyStaffRequest } from "@/lib/auth";

const allowedStatuses = new Set(Object.values(ReservationStatus));

export async function POST(req: NextRequest) {
  if (!verifyStaffRequest(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json();
  if (!allowedStatuses.has(body.status)) return NextResponse.json({ error: "invalid_status" }, { status: 400 });

  const updated = await prisma.reservation.update({
    where: { id: body.id },
    data: { status: body.status }
  });

  return NextResponse.json({ ok: true, item: updated });
}
