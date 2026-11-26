// Five submissions per client per 15 minutes, counted exactly.
//
// Cloudflare's built-in rate-limiting binding counts per data centre and only
// over 10 or 60 seconds, so a quarter-hour window lives in a Durable Object
// instead: one small object per client address, holding nothing but the times
// of its recent submissions. An alarm deletes them when the window has passed,
// so nothing is kept longer than the privacy page says.

export const LIMIT = 5;
export const WINDOW_MS = 15 * 60 * 1000;

export interface StorageLike {
  get<T>(key: string): Promise<T | undefined>;
  put<T>(key: string, value: T): Promise<void>;
  deleteAll(): Promise<void>;
  setAlarm(time: number): Promise<void>;
}

export interface Verdict {
  allowed: boolean;
  // Seconds until the oldest submission leaves the window, when refused.
  retryAfter?: number;
}

// The Durable Object. Classic fetch-handler style rather than RPC, so it
// needs nothing from the Workers runtime and the tests can construct it.
export class ContactLimiter {
  storage: StorageLike;
  now: () => number;

  constructor(state: { storage: StorageLike }, _env?: unknown, now: () => number = Date.now) {
    this.storage = state.storage;
    this.now = now;
  }

  async recent(): Promise<number[]> {
    const cutoff = this.now() - WINDOW_MS;
    return ((await this.storage.get<number[]>("hits")) ?? []).filter((time) => time > cutoff);
  }

  async fetch(): Promise<Response> {
    const hits = await this.recent();
    const now = this.now();
    if (hits.length >= LIMIT) {
      const verdict: Verdict = { allowed: false, retryAfter: Math.ceil((hits[0]! + WINDOW_MS - now) / 1000) };
      return Response.json(verdict);
    }
    hits.push(now);
    await this.storage.put("hits", hits);
    await this.storage.setAlarm(hits[0]! + WINDOW_MS);
    const verdict: Verdict = { allowed: true };
    return Response.json(verdict);
  }

  async alarm(): Promise<void> {
    const hits = await this.recent();
    if (hits.length === 0) {
      await this.storage.deleteAll();
      return;
    }
    await this.storage.put("hits", hits);
    await this.storage.setAlarm(hits[0]! + WINDOW_MS);
  }
}

// The key a request is counted under. Cloudflare sets CF-Connecting-IP to the
// address it received the request from, so no proxy count has to be guessed.
// IPv6 clients usually hold a whole /56 or /64, so they are counted by their
// /56, or one client could cycle through addresses for fresh quota.
export function clientKey(request: Request): string {
  const ip = request.headers.get("CF-Connecting-IP")?.trim();
  if (!ip) return "unknown";
  if (!ip.includes(":")) return `v4:${ip}`;
  const [head = "", tail = ""] = ip.toLowerCase().split("::");
  const left = head ? head.split(":") : [];
  const right = tail ? tail.split(":") : [];
  const groups = [...left, ...Array(Math.max(0, 8 - left.length - right.length)).fill("0"), ...right].map((group) => group.padStart(4, "0"));
  return `v6:${groups.slice(0, 3).join(":")}:${groups[3]!.slice(0, 2)}`;
}
