// What the Worker is given by Cloudflare, typed to the parts it uses.
// Secrets are set with `wrangler secret put` (docs/deployment.md) and never
// appear in this repository.

export interface Stub {
  fetch(request: Request): Promise<Response>;
}

export interface DurableObjectNamespaceLike {
  idFromName(name: string): unknown;
  get(id: unknown): Stub;
}

export interface Env {
  // The prerendered site, from wrangler.jsonc's assets block.
  ASSETS: Stub;
  // One limiter object per client address; see limiter.ts.
  CONTACT_LIMITER: DurableObjectNamespaceLike;
  RESEND_API_KEY?: string;
  // A sender on a domain verified with Resend, and the inbox that receives.
  EMAIL_FROM?: string;
  EMAIL_TO?: string;
}

export const mailerConfigured = (env: Env) => Boolean(env.RESEND_API_KEY && env.EMAIL_FROM && env.EMAIL_TO);
