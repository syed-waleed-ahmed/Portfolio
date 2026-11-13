// Browser checks for what the build and the content tests cannot see: the page
// as a browser runs it, under the CSP in public/_headers. Each test names the
// behaviour it protects; most of them caught a real bug once.
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// The default in Contact.jsx. Analytics and the backend are the only network
// the page touches, and both are answered here, so the suite runs offline.
const API = "https://portfolio-backend-kmum.onrender.com";

test.beforeEach(async ({ page }) => {
  await page.route(/googletagmanager\.com|google-analytics\.com/, (route) =>
    route.fulfill({ status: 200, contentType: "text/javascript", body: "" })
  );
  await page.route(`${API}/health`, (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: '{"status":"ok"}' })
  );
});

// Console errors (React reports a hydration mismatch there), uncaught
// exceptions and CSP violations, collected from before the first script runs.
const watch = async (page) => {
  const problems = [];
  page.on("console", (message) => {
    if (message.type() === "error") problems.push(message.text());
  });
  page.on("pageerror", (error) => problems.push(error.message));
  await page.addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (event) => {
      console.error(`CSP violation: ${event.violatedDirective} blocked ${event.blockedURI || "inline"}`);
    });
  });
  return problems;
};

// Effects run once React has hydrated, and Reveal's effect marks content
// below the fold, so its first mark means event handlers are attached.
const hydrated = (page) => expect(page.locator("[data-reveal]").first()).toBeAttached();

// html has scroll-behavior: smooth, under which a scripted scroll only starts
// animating and never arrives; forced to auto, every step lands. A sweep in
// half-screen steps loads the lazy parts; then anything Reveal still holds
// back is visited directly, since a busy runner can scroll past an element
// between two intersection checks, where a reader would stop and look.
const scrollThrough = (page) =>
  page.evaluate(async () => {
    document.documentElement.style.scrollBehavior = "auto";
    const frame = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    for (let y = 0; y <= document.documentElement.scrollHeight; y += window.innerHeight / 2) {
      window.scrollTo(0, y);
      await frame();
    }
    for (const element of document.querySelectorAll('[data-reveal="pending"]')) {
      element.scrollIntoView({ block: "center" });
      await frame();
    }
  });

const axe = (page) =>
  new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();

const violations = (results) =>
  results.violations.map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.target).join(", ")}`);

// Retried because a click or key press before hydration does nothing.
const openPalette = async (page) => {
  const dialog = page.getByRole("dialog", { name: "Command menu" });
  await expect(async () => {
    await page.getByRole("button", { name: "Search" }).click();
    await expect(dialog).toBeVisible({ timeout: 1000 });
  }).toPass();
  return dialog;
};

test("loads under the real CSP with no errors, and analytics and the font load", async ({ page }) => {
  const problems = await watch(page);
  await page.goto("/");
  await hydrated(page);
  // The inline snippet adds the gtag script at idle. If the CSP blocked the
  // snippet (its hash in _headers is stale), this never appears.
  await expect(page.locator('script[src*="googletagmanager.com"]')).toBeAttached();
  const font = await page.evaluate(async () => {
    await document.fonts.ready;
    return [...document.fonts].filter((face) => face.family.includes("Hanken Grotesk")).map((face) => face.status);
  });
  expect(font).toContain("loaded");
  await scrollThrough(page);
  expect(problems).toEqual([]);
});

test("reveals everything that starts below the fold", async ({ page }) => {
  await page.goto("/");
  await hydrated(page);
  await scrollThrough(page);
  const pending = () =>
    page.locator('[data-reveal="pending"]').evaluateAll((elements) =>
      elements.map((element) => `${element.tagName.toLowerCase()}.${element.className} at ${Math.round(element.getBoundingClientRect().top + window.scrollY)}px`)
    );
  await expect.poll(pending).toEqual([]);
});

test("every revealed element keeps the reveal's fade", async ({ page }) => {
  await page.goto("/");
  await hydrated(page);
  // A component rule that sets its own `transition` replaces the one Reveal's
  // CSS gives [data-reveal], at equal specificity in the same layer. The
  // project cards did, so they popped in and their stagger never ran.
  const missing = await page.locator("[data-reveal]").evaluateAll((elements) =>
    elements
      .filter((element) => !getComputedStyle(element).transitionProperty.split(", ").includes("opacity"))
      .map((element) => `${element.tagName.toLowerCase()}.${element.className}`)
  );
  expect(missing).toEqual([]);
});

for (const width of [320, 390, 768, 1440, 1920]) {
  test(`has no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await hydrated(page);
    // Through to the end, so the lazy graph and globe are on the page too.
    await scrollThrough(page);
    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });
}

test.describe("accessibility", () => {
  // Reduced motion leaves every section visible from the start, so axe reads
  // final colours rather than a fade in progress.
  test.use({ reducedMotion: "reduce" });

  for (const [name, viewport] of [
    ["desktop", { width: 1440, height: 900 }],
    ["phone", { width: 390, height: 844 }],
  ]) {
    test(`axe finds no WCAG 2.2 A or AA violations on ${name}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto("/");
      await scrollThrough(page);
      expect(violations(await axe(page))).toEqual([]);
    });
  }

  test("axe finds no violations with the command palette open", async ({ page }) => {
    await page.goto("/");
    await openPalette(page);
    expect(violations(await axe(page))).toEqual([]);
  });
});

test.describe("command palette", () => {
  test.use({ permissions: ["clipboard-read", "clipboard-write"] });

  test("opens with Ctrl+K, runs a search, and gives focus back on Escape", async ({ page }) => {
    await page.goto("/");
    await hydrated(page);
    await page.keyboard.press("Control+k");
    const dialog = page.getByRole("dialog", { name: "Command menu" });
    await expect(dialog).toBeVisible();
    const input = dialog.getByRole("combobox");
    await expect(input).toBeFocused();

    // Under cmdk's default fuzzy score this landed on Skills.
    await input.fill("copy email");
    await page.keyboard.press("Enter");
    await expect(dialog.getByRole("status")).toHaveText("Email address copied.");

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("returns focus to the Search button it was opened from", async ({ page }) => {
    await page.goto("/");
    const dialog = await openPalette(page);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(page.getByRole("button", { name: "Search" })).toBeFocused();
  });
});

test("the dock's Home link returns to the very top of the page", async ({ page }) => {
  await page.goto("/");
  await hydrated(page);
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, document.documentElement.scrollHeight);
  });
  await page.getByRole("link", { name: "Home" }).click();
  // Not just to the hero: the masthead above it is part of the top.
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});

test.describe("contact form", () => {
  const status = (page) => page.locator(".contact-form__status");

  // Answers POST /api/contact as the backend would, CORS included: the form
  // posts JSON cross-origin, so the browser sends a preflight first and drops
  // any response without Access-Control-Allow-Origin.
  const mockContact = (page, status, body) =>
    page.route(`${API}/api/contact`, (route) => {
      const cors = {
        "Access-Control-Allow-Origin": new URL(page.url()).origin,
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
      };
      if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: cors });
      return route.fulfill({ status, headers: cors, contentType: "application/json", body: JSON.stringify(body) });
    });

  const fill = async (page) => {
    await page.getByLabel("Name").fill("Jane");
    await page.getByLabel("Email", { exact: true }).fill("jane@example.com");
    await page.getByLabel("Subject").fill("Hello");
    await page.getByLabel("Message").fill("A message long enough to send.");
  };

  test("posts rather than gets, and keeps its live region in the accessibility tree", async ({ page }) => {
    await page.goto("/");
    // A submit before hydration is the browser's own; GET would put the
    // message in the URL.
    await expect(page.locator("form.contact-form")).toHaveAttribute("method", "post");
    // Rendered while empty, so a screen reader is listening before the text
    // arrives. display: none would take it out of the tree.
    await expect(status(page)).toBeAttached();
    expect(await status(page).evaluate((element) => getComputedStyle(element).display)).not.toBe("none");
  });

  test("an empty submit focuses the first field and marks it invalid", async ({ page }) => {
    await page.goto("/");
    await hydrated(page);
    await page.getByRole("button", { name: "Send message" }).click();
    const name = page.getByLabel("Name");
    await expect(name).toBeFocused();
    await expect(name).toHaveAttribute("aria-invalid", "true");
  });

  test("a successful send is announced in the live region", async ({ page }) => {
    await mockContact(page, 200, { success: true, message: "Message sent successfully." });
    await page.goto("/");
    await hydrated(page);
    await fill(page);
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(status(page)).toContainText("Thanks for reaching out");
    await expect(page.getByLabel("Name")).toHaveValue("");
  });

  test("a rate-limited send explains the wait and offers email", async ({ page }) => {
    await mockContact(page, 429, { success: false, error: "Too many requests. Please try again later." });
    await page.goto("/");
    await hydrated(page);
    await fill(page);
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(status(page)).toContainText("try again in 15 minutes");
    await expect(status(page).getByRole("link")).toHaveAttribute("href", /^mailto:/);
  });
});

test("the contribution graph fits a phone without its own scroller", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await hydrated(page);
  await scrollThrough(page);
  const calendar = page.locator(".react-activity-calendar__scroll-container");
  await expect(calendar).toBeVisible();
  // One column too many once spilled into a horizontal scroller here.
  const { scrollWidth, clientWidth } = await calendar.evaluate((element) => ({
    scrollWidth: element.scrollWidth,
    clientWidth: element.clientWidth,
  }));
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
});

test("printing shows content the visitor had not scrolled to", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('[data-reveal="pending"]').first()).toBeAttached();
  await page.emulateMedia({ media: "print" });
  const opacities = await page.locator("[data-reveal]").evaluateAll((elements) =>
    elements.map((element) => getComputedStyle(element).opacity)
  );
  expect(opacities.every((opacity) => opacity === "1")).toBe(true);
});

test("every skill mark draws from the sprite", async ({ page }) => {
  await page.goto("/");
  // A <use> whose sprite did not load, or whose id the sprite lacks, is not
  // an error anywhere: it is an empty box. Its bounding box says which.
  const empty = () =>
    page.locator(".tag__icon use").evaluateAll((uses) =>
      uses.filter((use) => use.getBBox().width === 0).map((use) => use.getAttribute("href"))
    );
  await expect(page.locator(".tag__icon").first()).toBeAttached();
  await expect.poll(empty).toEqual([]);
});

test("the light under the pointer leaves the project cards' rows aligned", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await hydrated(page);
  const cards = page.locator(".project-card");
  await cards.first().scrollIntoViewIfNeeded();
  await expect(async () => {
    await cards.nth(1).hover();
    await expect(cards.nth(1)).toHaveCSS("--spot-x", /px$/, { timeout: 1000 });
  }).toPass();
  // The two layers of the light are pseudo-elements of a subgrid. In flow
  // they would be grid items: the first would take the top row and move the
  // card's own first line down a row, in every card alike, so comparing the
  // cards with each other would not show it. Its distance from the card's
  // top does. offsetTop, measured from the card, rather than a bounding box:
  // the cards are still settling from their staggered reveal.
  const rows = await cards.evaluateAll((elements) =>
    elements.slice(0, 3).map((element) => ({
      padding: parseFloat(getComputedStyle(element).paddingTop),
      tops: [...element.children].map((child) => child.offsetTop),
    }))
  );
  for (const { padding, tops } of rows) {
    expect(tops).toHaveLength(6);
    expect(tops[0]).toBe(padding);
    expect(tops).toEqual(rows[0].tops);
  }
});
