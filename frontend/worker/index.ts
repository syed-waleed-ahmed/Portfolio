// The site's Worker. Static files are served by Cloudflare before this runs;
// wrangler.jsonc sends only /api/* here first, and anything that matches no
// file falls through to the assets binding, which answers with the 404 page.
import { API_HEADERS, handleContact, isContactRequest } from "./contact.ts";
import { mailerConfigured, type Env } from "./env.ts";

export { ContactLimiter } from "./limiter.ts";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (isContactRequest(url)) return handleContact(request, env);
    if (url.pathname === "/api/health") {
      // Read by the deploy's verification: a deploy without the mail
      // secrets fails there, rather than in front of a visitor.
      return Response.json({ status: "ok", mailer: mailerConfigured(env) ? "configured" : "missing" }, { headers: API_HEADERS });
    }
    if (url.pathname.startsWith("/api/")) return Response.json({ ok: false, error: "Not found." }, { status: 404, headers: API_HEADERS });
    return env.ASSETS.fetch(request);
  },
};
