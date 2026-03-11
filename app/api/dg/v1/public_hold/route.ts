import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sanitizePhone, sanitizeText } from "@/lib/sanitize";
import { createReservation } from "@/lib/reservations";
import { checkRateLimit } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().min(6),
  date: z.string(),
  time: z.string(),
  pax: z.number().int().min(1).max(20),
  notes: z.string().optional(),
  tableId: z.string().optional().nullable()
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "local";
  if (!checkRateLimit(ip)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const raw = await req.json();
  const data = schema.parse(raw);
  const result = await createReservation({
    ...data,
    name: sanitizeText(data.name, 80),
    phone: sanitizePhone(data.phone),
    notes: data.notes ? sanitizeText(data.notes, 500) : undefined
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    ok: true,
    code: result.reservation.code,
    status: result.reservation.status
  });
}
