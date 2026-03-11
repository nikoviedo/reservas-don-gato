export const env = {
  timezone: "America/Argentina/Buenos_Aires",
  staffPassword: process.env.STAFF_PASSWORD ?? "admin123",
  staffPublicToken: process.env.STAFF_PUBLIC_TOKEN,
  jwtSecret: process.env.JWT_SECRET ?? "changeme",
  cronSecret: process.env.CRON_SECRET ?? "cron-secret",
  firestoreUrl:
    process.env.FIRESTORE_EVENTS_URL ??
    "https://firestore.googleapis.com/v1/projects/dongato-agenda/databases/(default)/documents/eventos",
  blockedEventsTtlSec: Number(process.env.BLOCKED_EVENTS_TTL_SEC ?? 60),
  confirmUrlBase: process.env.CONFIRM_URL_BASE ?? "http://localhost:3000"
};
