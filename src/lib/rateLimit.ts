// Limitation de débit en mémoire (par instance serverless).
// Suffisant contre les bots basiques ; pour du volume, passer à Upstash/KV.

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_HITS = 5;

const hits = new Map<string, number[]>();

/** true si la requête est autorisée pour cette clé (IP), false si limitée. */
export function rateLimit(key: string): boolean {
  const now = Date.now();
  const bucket = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (bucket.length >= MAX_HITS) {
    hits.set(key, bucket);
    return false;
  }
  bucket.push(now);
  hits.set(key, bucket);

  // Nettoyage opportuniste pour borner la mémoire
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
    }
  }
  return true;
}

/** IP client derrière le proxy Vercel. */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}
