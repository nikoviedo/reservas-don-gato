import { prisma } from "@/lib/db";
import type { BookingRules, WhatsappSettings } from "@/lib/types";

const defaultRules: BookingRules = {
  enabledWeekdays: [3, 4, 5, 6],
  timeSlots: ["20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00"],
  holdExpiryMinutes: 10
};

export async function getSettings() {
  const current = await prisma.setting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      enableTableSelection: false,
      bookingRules: defaultRules,
      whatsapp: {
        phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID ?? "",
        accessToken: process.env.WHATSAPP_ACCESS_TOKEN ?? "",
        staffTo: process.env.WHATSAPP_STAFF_TO ?? ""
      }
    }
  });

  return {
    ...current,
    bookingRules: current.bookingRules as unknown as BookingRules,
    whatsapp: current.whatsapp as unknown as WhatsappSettings
  };
}

export async function updateSettings(input: {
  enableTableSelection?: boolean;
  bookingRules?: BookingRules;
  whatsapp?: Partial<WhatsappSettings>;
}) {
  const prev = await getSettings();
  const mergedWhatsapp = { ...prev.whatsapp, ...(input.whatsapp ?? {}) };

  return prisma.setting.update({
    where: { id: 1 },
    data: {
      enableTableSelection: input.enableTableSelection ?? prev.enableTableSelection,
      bookingRules: (input.bookingRules ?? prev.bookingRules) as never,
      whatsapp: mergedWhatsapp as never
    }
  });
}
