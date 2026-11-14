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

  // AA asks 4.5:1 of text and the scans above hold that. The tokens aim
  // higher, 7:1 for every text colour on every surface it sits on, and this
  // is what keeps a new token or a new surface from quietly ending that.
  test("all text meets the 7:1 of WCAG AAA", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await scrollThrough(page);
    const results = await new AxeBuilder({ page }).withRules(["color-contrast-enhanced"]).analyze();
    expect(violations(results)).toEqual([]);
  });

  // A field's border is the only sign there is somewhere to type, and WCAG
  // 1.4.11 asks 3:1 of it. axe has no rule for this, so it is measured.
  test("form fields have a border of at least 3:1 against the panel", async ({ page }) => {
    await page.goto("/");
    const ratio = await page.locator(".field__control").first().evaluate((field) => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      // Paints colours in order, as layers, and reads back the opaque result.
      const flatten = (...colours) => {
        context.clearRect(0, 0, 1, 1);
        for (const colour of colours) {
          context.fillStyle = colour;
          context.fillRect(0, 0, 1, 1);
        }
        return [...context.getImageData(0, 0, 1, 1).data].slice(0, 3);
      };
      const luminance = (rgb) => {
        const [r, g, b] = rgb.map((v) => (v / 255 <= 0.03928 ? v / 255 / 12.92 : ((v / 255 + 0.055) / 1.055) ** 2.4));
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      const page = getComputedStyle(document.body).backgroundColor;
      const outside = luminance(flatten(page));
      const border = luminance(flatten(page, getComputedStyle(field).borderTopColor));
      return (Math.max(border, outside) + 0.05) / (Math.min(border, outside) + 0.05);
    });
    expect(ratio).toBeGreaterThanOrEqual(3);
  });
});

// A Windows contrast theme, which replaces every author colour with the
// system's. A state that was shown by a tint alone then looks like nothing:
// the dock's current section and the palette's selected row both did.
test.describe("under forced colours", () => {
  test.use({ forcedColors: "active" });

  // How far the marked element's fill stands off the fill beside it, as a
  // contrast ratio, with the marked fill painted over the plain one first.
  // Comparing the two computed values is not enough: with the mark lost they
  // were black at 10% and black, different strings and the same pixels.
  const standsOff = (page, marked, plain) =>
    page.evaluate(
      ([markedSelector, plainSelector]) => {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 1;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        const luminance = (...layers) => {
          context.clearRect(0, 0, 1, 1);
          for (const layer of layers) {
            context.fillStyle = layer;
            context.fillRect(0, 0, 1, 1);
          }
          const [r, g, b] = [...context.getImageData(0, 0, 1, 1).data].slice(0, 3).map((v) => (v / 255 <= 0.03928 ? v / 255 / 12.92 : ((v / 255 + 0.055) / 1.055) ** 2.4));
          return 0.2126 * r + 0.7152 * g + 0.0722 * b;
        };
        const fill = (selector) => getComputedStyle(document.querySelector(selector)).backgroundColor;
        // The computed value is the author's even where the browser then
        // paints the system's over it, so a fill only counts if the element
        // has also opted out of that.
        if (getComputedStyle(document.querySelector(markedSelector)).forcedColorAdjust !== "none") return 1;
        const canvasColour = getComputedStyle(document.documentElement).backgroundColor;
        const ground = luminance(canvasColour, fill(plainSelector));
        const mark = luminance(canvasColour, fill(plainSelector), fill(markedSelector));
        return (Math.max(mark, ground) + 0.05) / (Math.min(mark, ground) + 0.05);
      },
      [marked, plain]
    );

  test("the dock still marks the current section", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('.dock__link[aria-current="true"]')).toHaveCount(1);
    expect(await standsOff(page, '.dock__link[aria-current="true"]', ".dock__link:not([aria-current])")).toBeGreaterThanOrEqual(3);
  });

  test("the palette still marks the selected row", async ({ page }) => {
    await page.goto("/");
    await openPalette(page);
    await expect(page.locator('.palette__item[data-selected="true"]')).toHaveCount(1);
    expect(await standsOff(page, '.palette__item[data-selected="true"]', '.palette__item:not([data-selected="true"])')).toBeGreaterThanOrEqual(3);
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

  // Every message the form can show, in the colours of its state: the field
  // errors, a warning (nothing the visitor did), an error (something to
  // correct) and the thanks. Each is text in a status colour on that colour's
  // own tint, which the page-wide contrast scan never sees, because none of
  // them is on screen when it runs.
  test("every form message has its own tone and keeps 7:1", async ({ page }) => {
    const contrast = async () =>
      violations(await new AxeBuilder({ page }).include(".contact-form").withRules(["color-contrast-enhanced"]).analyze());
    // Under 80rem the globe beside the form is never loaded. Drawing it in
    // software next to four submissions and four scans made this test three
    // times slower and, on a busy runner, slow enough to time out.
    await page.setViewportSize({ width: 1024, height: 800 });
    await page.goto("/");
    await hydrated(page);
    // From here on nothing fades, so axe reads final colours, not a reveal
    // part-way through.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.locator(".field__error").first()).toBeVisible();
    expect(await contrast()).toEqual([]);

    for (const [code, body, tone] of [
      [429, { success: false, error: "Too many requests. Please try again later." }, "warning"],
      [400, { success: false, error: "Invalid email address." }, "error"],
      [200, { success: true, message: "Message sent successfully." }, "success"],
    ]) {
      await mockContact(page, code, body);
      await fill(page);
      await page.getByRole("button", { name: "Send message" }).click();
      await expect(status(page).locator(`.form-feedback--${tone}`)).toBeVisible();
      expect(await contrast()).toEqual([]);
    }
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

// The cards' pictures are AVIF. A browser that cannot decode AVIF draws a
// broken-image icon unless it is offered something else, and this suite's
// Chromium can, so it would never show the gap: WebKit's Windows build did.
test("every project picture offers a WebP beside its AVIF, and loads", async ({ page }) => {
  await page.goto("/");
  await hydrated(page);
  await scrollThrough(page);
  const pictures = () =>
    page.locator(".project-card picture").evaluateAll((elements) =>
      elements.map((picture) => {
        const source = picture.querySelector("source");
        const image = picture.querySelector("img");
        // Edge to edge inside the card's 1px border. The reset caps a
        // picture at 100% of the card's content box, which once left it
        // 2.5rem short of the right edge with every other check passing.
        const card = picture.closest(".project-card").getBoundingClientRect();
        const box = image.getBoundingClientRect();
        return {
          avif: source?.type === "image/avif" && source.srcset.split(",").length === 2,
          webp: /\.webp$/.test(image.getAttribute("src")) && image.srcset.split(",").every((candidate) => /\.webp \d+w$/.test(candidate.trim())),
          loaded: image.complete && image.naturalWidth > 0,
          chose: image.currentSrc.split(".").pop(),
          spans: Math.abs(box.left - card.left) <= 1.5 && Math.abs(card.right - box.right) <= 1.5,
        };
      })
    );
  await expect.poll(pictures).toEqual(Array(6).fill({ avif: true, webp: true, loaded: true, chose: "avif", spans: true }));
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
  // card's picture down a row, in every card alike, so comparing the cards
  // with each other would not show it. The picture's distance from the
  // card's top does: it bleeds to the edge, so that distance is 0.
  // offsetTop, measured from the card, rather than a bounding box: the cards
  // are still settling from their staggered reveal.
  const rows = await cards.evaluateAll((elements) =>
    elements.slice(0, 3).map((element) => [...element.children].map((child) => child.offsetTop))
  );
  for (const tops of rows) {
    expect(tops).toHaveLength(7);
    expect(tops[0]).toBe(0);
    expect(tops).toEqual(rows[0]);
  }
});
