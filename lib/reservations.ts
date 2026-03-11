import crypto from "crypto";
import { ReservationStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { weekdayFromDate } from "@/lib/dates";
import { getBlockedEvents } from "@/lib/events";
import { getSettings } from "@/lib/settings";
import { notifyWhatsapp } from "@/lib/whatsapp";

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createReservation(input: {
  name: string;
  phone: string;
  date: string;
  time: string;
  pax: number;
  notes?: string;
  tableId?: string | null;
}) {
  const settings = await getSettings();
  const blockedEvents = await getBlockedEvents();
  if (blockedEvents[input.date]) return { error: "date_blocked", status: 409 };

  const weekday = weekdayFromDate(input.date);
  if (!settings.bookingRules.enabledWeekdays.includes(weekday)) return { error: "weekday_not_allowed", status: 400 };
  if (!settings.bookingRules.timeSlots.includes(input.time)) return { error: "timeslot_not_allowed", status: 400 };

  const existing = await prisma.reservation.findFirst({
    where: { phone: input.phone, date: new Date(input.date), time: input.time, status: { in: [ReservationStatus.HOLD, ReservationStatus.PENDING, ReservationStatus.CONFIRMED] } }
  });
  if (existing) return { error: "duplicate_reservation", status: 409 };

  const last = await prisma.reservation.findFirst({ orderBy: { createdAt: "desc" } });
  const nextNumber = (last ? Number(last.code.split("-")[1] ?? "1000") : 1000) + 1;
  const code = `DG-${nextNumber}`;

  const rawToken = crypto.randomBytes(24).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

  const reservation = await prisma.reservation.create({
    data: {
      code,
      name: input.name,
      phone: input.phone,
      date: new Date(input.date),
      time: input.time,
      pax: input.pax,
      notes: input.notes,
      tableId: settings.enableTableSelection ? input.tableId ?? null : null,
      status: ReservationStatus.HOLD,
      confirmKeyHash: tokenHash,
      confirmKeyExpiresAt: expiresAt
    }
  });

  const confirmUrl = `${env.confirmUrlBase}/api/dg/v1/public_confirm?key=${rawToken}`;
  const waResult = await notifyWhatsapp({
    settings: settings.whatsapp,
    staffMessage: `Nueva reserva: ${code} - ${input.name} - ${input.phone} - ${input.date} ${input.time} - ${input.pax} pax`,
    customerPhone: input.phone,
    customerMessage: `Hola ${input.name}, recibimos tu reserva ${code}.`,
    confirmUrl
  });

  await prisma.reservation.update({
    where: { id: reservation.id },
    data: {
      whatsappStatus: waResult.ok ? "ok" : "error",
      whatsappError: waResult.ok ? null : waResult.error
    }
  });

  return { reservation: { ...reservation, confirmUrl } };
}

export async function confirmReservation(key: string) {
  const tokenHash = hashToken(key);
  const now = new Date();
  const reservation = await prisma.reservation.findFirst({
    where: { confirmKeyHash: tokenHash, confirmKeyExpiresAt: { gt: now } }
  });
  if (!reservation) return null;

  return prisma.reservation.update({
    where: { id: reservation.id },
    data: { status: ReservationStatus.CONFIRMED, confirmedAt: now, confirmKeyHash: null, confirmKeyExpiresAt: null }
  });
}

export async function cleanExpiredHolds() {
  const settings = await getSettings();
  const expiry = settings.bookingRules.holdExpiryMinutes ?? 10;
  const threshold = new Date(Date.now() - expiry * 60_000);

  const result = await prisma.reservation.updateMany({
    where: { status: ReservationStatus.HOLD, createdAt: { lt: threshold } },
    data: { status: ReservationStatus.CANCELLED }
  });

  return result.count;
}
