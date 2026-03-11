import { NextResponse } from "next/server";
import { getBlockedEvents } from "@/lib/events";
import { getSettings } from "@/lib/settings";

export async function GET() {
  const settings = await getSettings();
  const blockedEvents = await getBlockedEvents();
  const disabledDates = Object.keys(blockedEvents);

  return NextResponse.json({
    enableTableSelection: settings.enableTableSelection,
    bookingRules: settings.bookingRules,
    blockedEvents,
    disabledDates,
    whatsappEnabled: {
      staffConfigured: Boolean(settings.whatsapp.phoneNumberId && settings.whatsapp.accessToken && settings.whatsapp.staffTo),
      customerConfigured: Boolean(settings.whatsapp.phoneNumberId && settings.whatsapp.accessToken)
    }
  });
}
