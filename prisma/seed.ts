import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.setting.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      enableTableSelection: false,
      bookingRules: {
        enabledWeekdays: [3, 4, 5, 6],
        timeSlots: ["20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00"],
        holdExpiryMinutes: 10
      },
      whatsapp: {
        phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID ?? "",
        accessToken: process.env.WHATSAPP_ACCESS_TOKEN ?? "",
        staffTo: process.env.WHATSAPP_STAFF_TO ?? "",
        staffTemplateName: process.env.WHATSAPP_TEMPLATE_STAFF ?? "",
        staffTemplateLang: process.env.WHATSAPP_TEMPLATE_STAFF_LANG ?? "es_AR",
        customerTemplateName: process.env.WHATSAPP_TEMPLATE_CUSTOMER ?? "",
        customerTemplateLang: process.env.WHATSAPP_TEMPLATE_CUSTOMER_LANG ?? "es_AR"
      }
    },
    update: {}
  });
}

main().finally(() => prisma.$disconnect());
