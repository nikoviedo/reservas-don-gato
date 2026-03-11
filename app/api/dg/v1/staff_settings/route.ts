import { NextRequest, NextResponse } from "next/server";
import { clearEventsCache, getBlockedEvents } from "@/lib/events";
import { getSettings, updateSettings } from "@/lib/settings";
import { verifyStaffRequest } from "@/lib/auth";

function maskWhatsapp(whatsapp: Record<string, unknown>) {
  return {
    ...whatsapp,
    accessToken: undefined,
    configured: Boolean(whatsapp.phoneNumberId && whatsapp.accessToken)
  };
}

export async function GET(req: NextRequest) {
  if (!verifyStaffRequest(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const settings = await getSettings();
  return NextResponse.json({
    enableTableSelection: settings.enableTableSelection,
    bookingRules: settings.bookingRules,
    whatsapp: maskWhatsapp(settings.whatsapp as unknown as Record<string, unknown>)
  });
}

export async function POST(req: NextRequest) {
  if (!verifyStaffRequest(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json();
  if (body.refreshBlockedEventsNow) {
    clearEventsCache();
    await getBlockedEvents(true);
  }

  const updated = await updateSettings(body);
  return NextResponse.json({ ok: true, updated });
}
