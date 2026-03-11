const bucket = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 10;

export function checkRateLimit(key: string) {
  const now = Date.now();
  const hits = (bucket.get(key) ?? []).filter((ts) => now - ts < WINDOW_MS);
  if (hits.length >= MAX_PER_WINDOW) return false;
  hits.push(now);
  bucket.set(key, hits);
  return true;
}
