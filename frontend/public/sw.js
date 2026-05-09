/*
 * Kill-switch service worker.
 *
 * The site briefly shipped with `vite-plugin-pwa`, which registered a
 * service worker on visitors' devices. We've since removed PWA support,
 * but any visitor who hit the old version still has that SW running —
 * intercepting every request and serving stale cached files.
 *
 * This file replaces the old SW. When their browser checks for an
 * update (within 24 h, or on next navigation), it picks up THIS file,
 * which then:
 *   1. Deletes every cache the old SW created
 *   2. Unregisters itself
 *   3. Force-reloads every open tab on this origin
 *
 * After it runs once per device, the SW is gone forever and the browser
 * treats the site as a normal (cache-friendly) static page.
 *
 * Once analytics shows zero SW traffic for ~30 days, this file can be
 * deleted.
 */

self.addEventListener("install", () => {
  // Activate immediately, don't wait for old SW to finish
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // 1. Wipe everything the old SW cached
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));

      // 2. Unregister ourselves so no SW remains
      try {
        await self.registration.unregister();
      } catch {
        // ignore
      }

      // 3. Force-reload any open tabs so they fetch fresh content
      const clients = await self.clients.matchAll({ type: "window" });
      for (const client of clients) {
        try {
          client.navigate(client.url);
        } catch {
          // ignore
        }
      }
    })()
  );
});

// While we're alive, never intercept fetches — fall through to network.
self.addEventListener("fetch", () => {
  /* no-op */
});
