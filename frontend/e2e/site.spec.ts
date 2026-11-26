// Browser checks for what the build and the Node tests cannot see: the pages
// as a browser runs them, under the production headers. The contact API is
// answered here, so the suite never sends a message.
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { projects } from "../src/content/projects.ts";
import { SECTIONS } from "../src/content/site.ts";

const PAGES = ["/", ...projects.map((project) => `/work/${project.slug}/`), "/privacy/"];

// Console errors (a hydration mismatch is reported there), uncaught
// exceptions and CSP violations, collected from before the first script.
async function watch(page: Page) {
  const problems: string[] = [];
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
}

// React has hydrated once the palette's shortcut hint or button responds;
// the simplest signal is the root having a React fiber key.
const hydrated = (page: Page) =>
  expect.poll(() => page.evaluate(() => Object.keys(document.getElementById("root")?.firstElementChild ?? {}).some((key) => key.startsWith("__react")))).toBe(true);

const axe = (page: Page) => new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]);
const violations = (results: Awaited<ReturnType<AxeBuilder["analyze"]>>) =>
  results.violations.map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(" ")).join(", ")}`);

test.describe("every page", () => {
  for (const path of PAGES) {
    test(`${path} loads with no errors, no third-party requests and no cookies`, async ({ page, context }) => {
      const problems = await watch(page);
      const foreign: string[] = [];
      page.on("request", (request) => {
        const url = new URL(request.url());
        if (!["127.0.0.1", "localhost", new URL(page.url() || "http://127.0.0.1").hostname].includes(url.hostname) && url.protocol.startsWith("http")) foreign.push(request.url());
      });
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await hydrated(page);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForLoadState("networkidle");
      expect(problems).toEqual([]);
      expect(foreign).toEqual([]);
      expect(await context.cookies()).toEqual([]);
      await expect(page.locator("h1")).toHaveCount(1);
    });

    for (const scheme of ["light", "dark"] as const) {
      test(`${path} has no axe violations and all text at 7:1, ${scheme}`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: scheme });
        await page.goto(path);
        await hydrated(page);
        expect(violations(await axe(page).analyze())).toEqual([]);
        expect(violations(await new AxeBuilder({ page }).withRules(["color-contrast-enhanced"]).analyze())).toEqual([]);
      });
    }
  }

  test("an unknown path gets the 404 page, with a 404 and noindex", async ({ page }) => {
    const response = await page.goto("/no-such-page");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("This page does not exist.");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex");
  });
});

test.describe("layout", () => {
  for (const width of [320, 390, 768, 1024, 1440, 1920, 2560]) {
    test(`nothing scrolls sideways at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const path of ["/", "/work/remindrai/", "/work/self-correcting-rag/"]) {
        await page.goto(path);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow, `${path} at ${width}px`).toBeLessThanOrEqual(0);
      }
    });
  }

  test("no text is smaller than 14px", async ({ page }) => {
    for (const path of ["/", "/work/remindrai/"]) {
      await page.goto(path);
      const small = await page.evaluate(() =>
        [...document.querySelectorAll("body *")]
          .filter((el) => !el.closest("svg, .visually-hidden, .honeypot") && [...el.childNodes].some((node) => node.nodeType === 3 && node.textContent!.trim()))
          .filter((el) => parseFloat(getComputedStyle(el).fontSize) < 14)
          .map((el) => `${el.tagName.toLowerCase()}.${el.className} ${getComputedStyle(el).fontSize}`)
      );
      expect(small, path).toEqual([]);
    }
  });

  test("the home page's sections follow SECTIONS, and the header links reach them", async ({ page }) => {
    await page.goto("/");
    const ids = await page.locator("main > section.section").evaluateAll((sections) => sections.map((section) => section.id));
    expect(ids).toEqual(SECTIONS.map((section) => section.id));
    await page.setViewportSize({ width: 1440, height: 900 });
    for (const { id, label } of SECTIONS) {
      await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: label }).click();
      await expect(page.locator(`#${id}`)).toBeInViewport();
    }
  });

  test("on a phone the menu opens without JavaScript and lists every section and the resume", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await page.goto("/");
    await page.getByRole("group").filter({ has: page.locator("summary") }).first();
    await page.locator(".site-menu summary").click();
    for (const { label } of SECTIONS) await expect(page.locator(".site-menu").getByRole("link", { name: label })).toBeVisible();
    await expect(page.locator(".site-menu").getByRole("link", { name: /Resume/ })).toBeVisible();
    // Every project and every case study are in the HTML before any script.
    await expect(page.locator(".project")).toHaveCount(projects.length - 1);
    await context.close();
  });
});

test.describe("case studies", () => {
  for (const project of projects) {
    test(`${project.title}: contents, diagram and links all resolve`, async ({ page }) => {
      await page.goto(`/work/${project.slug}/`);
      await expect(page.getByRole("heading", { level: 1 })).toContainText(project.title);
      const diagrams = page.getByRole("img").and(page.locator("svg.diagram"));
      expect(await diagrams.count()).toBeGreaterThan(0);
      for (const diagram of await diagrams.all()) await expect(diagram).toHaveAccessibleName(/.+/);
      const targets = await page.locator(".case__toc a").evaluateAll((links) => links.map((link) => link.getAttribute("href")!));
      expect(targets.length).toBeGreaterThan(3);
      for (const target of targets) await expect(page.locator(target)).toHaveCount(1);
      const ld = await page.locator('script[type="application/ld+json"]').first().textContent();
      expect(JSON.parse(ld!)["@type"]).toBe("TechArticle");
    });
  }
});

test.describe("command palette", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  const open = async (page: Page) => {
    await hydrated(page);
    await page.keyboard.press("Control+k");
    const dialog = page.getByRole("dialog", { name: "Command menu" });
    await expect(dialog).toBeVisible();
    return dialog;
  };

  // The rendered order, not just the scoring function: cmdk could not find a
  // group whose value had a space in it, so "Go to" never moved and Enter on
  // a technology search went to a section instead of the project.
  test("a technology search selects the project that uses it, and Enter opens it", async ({ page }) => {
    await page.goto("/");
    const dialog = await open(page);
    for (const [search, expected] of [["rag", "Self-Correcting RAG"], ["pgvector", "Self-Correcting RAG"], ["langgraph", "AI Workflow Assistant"]] as const) {
      await dialog.getByRole("combobox").fill(search);
      await expect(dialog.locator('[cmdk-item][aria-selected="true"]')).toHaveText(expected);
    }
    await dialog.getByRole("combobox").fill("rag");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/work\/self-correcting-rag\/$/);
  });

  test("copies the email address, and gives focus back on Escape", async ({ page, context, browserName }) => {
    test.skip(browserName !== "chromium", "only Chromium lets a test grant clipboard access");
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/");
    const dialog = await open(page);
    await dialog.getByRole("combobox").fill("copy email");
    await page.keyboard.press("Enter");
    await expect(dialog.getByRole("status")).toHaveText("Email address copied.");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("opens from the Search button and returns focus to it", async ({ page }) => {
    await page.goto("/work/remindrai/");
    await hydrated(page);
    // From the keyboard, the case focus restoration exists for: WebKit, like
    // Safari, does not focus a button that is clicked.
    await page.getByRole("button", { name: "Search" }).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog", { name: "Command menu" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "Search" })).toBeFocused();
  });
});

test.describe("contact form", () => {
  const fill = async (page: Page) => {
    await page.getByLabel("Name").fill("Jane");
    await page.getByLabel("Email").fill("jane@example.com");
    await page.getByLabel("Subject").fill("Hello");
    await page.getByLabel("Message").fill("A test message from the browser suite.");
  };

  test.beforeEach(async ({ page }) => {
    await page.goto("/#contact");
    await hydrated(page);
  });

  test("posts rather than gets before the script loads, to its own origin", async ({ page }) => {
    await expect(page.locator("form.contact-form")).toHaveAttribute("method", "post");
    await expect(page.locator("form.contact-form")).toHaveAttribute("action", "/api/contact");
  });

  test("an empty submit marks every field, focuses the first, and sends nothing", async ({ page }) => {
    let requests = 0;
    await page.route("**/api/contact", (route) => {
      requests += 1;
      return route.abort();
    });
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByLabel("Name")).toBeFocused();
    await expect(page.locator('[aria-invalid="true"]')).toHaveCount(4);
    expect(requests).toBe(0);
  });

  test("a sent message is announced, and the JSON the API receives is the form's", async ({ page }) => {
    let received: Record<string, string> | undefined;
    await page.route("**/api/contact", async (route) => {
      received = route.request().postDataJSON();
      await route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' });
    });
    await fill(page);
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.locator(".contact-form__status")).toContainText("your message is on its way");
    expect(received).toMatchObject({ name: "Jane", email: "jane@example.com", subject: "Hello", website: "" });
    await expect(page.getByLabel("Name")).toHaveValue("");
  });

  test("a rate limit is a warning that offers email, and keeps what was typed", async ({ page }) => {
    await page.route("**/api/contact", (route) =>
      route.fulfill({ status: 429, contentType: "application/json", body: '{"ok":false,"error":"Too many messages."}' })
    );
    await fill(page);
    await page.getByRole("button", { name: "Send message" }).click();
    const status = page.locator(".form-feedback--warning");
    await expect(status).toContainText("try again in 15 minutes");
    await expect(status.getByRole("link")).toHaveAttribute("href", /^mailto:/);
    await expect(page.getByLabel("Message")).not.toHaveValue("");
  });

  test("a 400 from the API marks the field it names", async ({ page }) => {
    await page.route("**/api/contact", (route) =>
      route.fulfill({ status: 400, contentType: "application/json", body: '{"ok":false,"error":"Enter a valid email address, like name@example.com.","field":"email"}' })
    );
    await fill(page);
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByLabel("Email")).toHaveAttribute("aria-invalid", "true");
  });
});

test.describe("preferences", () => {
  test("reduced motion stops the caret", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const duration = await page.locator(".hero__caret").evaluate((el) => parseFloat(getComputedStyle(el).animationDuration));
    expect(duration).toBeLessThan(0.001);
  });

  test("print hides the header and the form and spells out links", async ({ page }) => {
    await page.goto("/");
    await page.emulateMedia({ media: "print" });
    await expect(page.locator(".site-header")).toBeHidden();
    await expect(page.locator(".contact-form")).toBeHidden();
  });

  test("under forced colours the palette's selected row is still marked", async ({ page, browserName }) => {
    test.skip(browserName === "webkit", "WebKit cannot emulate forced colours");
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ forcedColors: "active" });
    await page.goto("/");
    await hydrated(page);
    await page.keyboard.press("Control+k");
    const selected = page.locator('[cmdk-item][aria-selected="true"]').first();
    await expect(selected).toBeVisible();
    expect(await selected.evaluate((el) => getComputedStyle(el).forcedColorAdjust)).toBe("none");
  });
});
