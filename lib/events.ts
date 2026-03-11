import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { normalizeDate } from "@/lib/dates";

let memoryCache: { until: number; blockedEvents: Record<string, string> } | null = null;

function isPrivateType(type: string) {
  const lower = type.toLowerCase();
  return lower.includes("priv") && !lower.includes("public");
}

export async function getBlockedEvents(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && memoryCache && memoryCache.until > now) {
    return memoryCache.blockedEvents;
  }

  const dbCache = await prisma.eventCache.findUnique({ where: { id: 1 } });
  if (!forceRefresh && dbCache) {
    const ageSec = (now - dbCache.fetchedAt.getTime()) / 1000;
    if (ageSec <= env.blockedEventsTtlSec) {
      const blocked = dbCache.blockedEvents as Record<string, string>;
      memoryCache = { until: now + env.blockedEventsTtlSec * 1000, blockedEvents: blocked };
      return blocked;
    }
  }

  const response = await fetch(env.firestoreUrl, { cache: "no-store" });
  const payload = await response.json();
  const docs = payload.documents ?? [];
  const blockedEvents: Record<string, string> = {};

  for (const doc of docs) {
    const fields = doc.fields ?? {};
    const dateRaw = fields.date?.stringValue ?? fields.fecha?.stringValue;
    const type = fields.type?.stringValue ?? "";
    if (!dateRaw || !isPrivateType(type)) continue;
    const normalized = normalizeDate(dateRaw);
    if (!normalized) continue;
    blockedEvents[normalized] = fields.title?.stringValue ?? "EVENTO PRIVADO";
  }

  await prisma.eventCache.upsert({
    where: { id: 1 },
    create: { id: 1, fetchedAt: new Date(), blockedEvents: blockedEvents as never },
    update: { fetchedAt: new Date(), blockedEvents: blockedEvents as never }
  });

  memoryCache = { until: now + env.blockedEventsTtlSec * 1000, blockedEvents };
  return blockedEvents;
}

export function clearEventsCache() {
  memoryCache = null;
}
