// Content and logic tests, on Node's own runner with no dependencies:
//   npm test
// Node strips the types, so these import the same modules the site renders.
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { commandGroups, rankCommands, scoreCommand } from "../src/commands.ts";
import { experience, education } from "../src/content/experience.ts";
import { projects } from "../src/content/projects.ts";
import { PERSON, SECTIONS, SITE } from "../src/content/site.ts";
import { familiarSkills, shownSkills } from "../src/content/skills.ts";
import { renderHead } from "../src/head.ts";
import { matchRoute, metaFor, PAGES, pathFor } from "../src/routes.ts";
import { contactErrors, FIELDS, validateContact } from "../src/shared/contact.ts";

const SRC = new URL("../src/", import.meta.url);
const words = (text: string) => text.trim().split(/\s+/).length;

// ----- Projects --------------------------------------------------------------

test("every project has a unique slug and a case study page", () => {
  const slugs = projects.map((project) => project.slug);
  assert.equal(new Set(slugs).size, slugs.length, "duplicate slug");
  for (const slug of slugs) {
    assert.match(slug, /^[a-z0-9-]+$/);
    assert.ok(existsSync(new URL(`case-studies/${slug}.tsx`, SRC)), `src/case-studies/${slug}.tsx is missing`);
  }
  const files = readdirSync(new URL("case-studies/", SRC)).map((file) => file.replace(/\.tsx$/, ""));
  assert.deepEqual(files.sort(), [...slugs].sort(), "a case study file has no project in content/projects.ts");
});

// A test count measures activity, not an outcome, so it never headlines a
// project. It may appear inside a case study's reliability notes.
test("no project leads with a test count", () => {
  for (const project of projects) {
    for (const field of ["summary", "decision", "evidence"] as const) {
      assert.doesNotMatch(project[field], /\b\d[\d,]*\s+(?:automated\s+)?tests?\b/i, `${project.title}: ${field} quotes a test count`);
    }
  }
});

test("project copy stays short enough to scan", () => {
  for (const project of projects) {
    assert.ok(words(project.summary) <= 50, `${project.title}: summary is ${words(project.summary)} words`);
    assert.ok(words(project.evidence) <= 60, `${project.title}: evidence is ${words(project.evidence)} words`);
    assert.ok(project.pipeline.length >= 4 && project.pipeline.length <= 7, `${project.title}: ${project.pipeline.length} pipeline steps`);
    assert.ok(project.stack.length >= 4 && project.stack.length <= 6, `${project.title}: ${project.stack.length} stack entries`);
  }
});

test("links are absolute https URLs", () => {
  const urls = [
    ...Object.values(PERSON.links),
    SITE.url,
    SITE.repository,
    ...projects.flatMap((project) => [project.source.kind === "public" ? project.source.repository : undefined, project.demo]),
  ].filter((url): url is string => Boolean(url));
  for (const url of urls) assert.equal(new URL(url).protocol, "https:", url);
});

test("experience bullets are complete sentences of a readable length", () => {
  for (const role of experience) {
    assert.ok(role.bullets.length >= 2 && role.bullets.length <= 5, `${role.organization}: ${role.bullets.length} bullets`);
    for (const bullet of role.bullets) {
      const n = words(bullet);
      assert.ok(n >= 12 && n <= 42, `${role.organization}: ${n}-word bullet`);
      assert.match(bullet, /\.$/, `${role.organization}: bullet should end with a full stop`);
    }
    if (role.caseStudy) assert.ok(projects.some((project) => project.slug === role.caseStudy), `${role.organization}: no case study "${role.caseStudy}"`);
  }
  assert.ok(education.length > 0);
});

test("a skill is listed once, in one tier", () => {
  const all = [...shownSkills.flatMap((group) => group.skills), ...familiarSkills];
  assert.equal(new Set(all).size, all.length, "a skill appears twice");
});

// ----- Font subset ----------------------------------------------------------

// Mirrors the unicode-range of the self-hosted font in styles/base.css. A
// character outside it falls back to another typeface mid-sentence.
const FONT_RANGES: [number, number][] = [
  [0x0000, 0x00ff], [0x0131, 0x0131], [0x0152, 0x0153], [0x02bb, 0x02bc], [0x02c6, 0x02c6], [0x02da, 0x02da],
  [0x02dc, 0x02dc], [0x0304, 0x0304], [0x0308, 0x0308], [0x0329, 0x0329], [0x2000, 0x206f], [0x20ac, 0x20ac],
  [0x2122, 0x2122], [0x2191, 0x2191], [0x2193, 0x2193], [0x2212, 0x2212], [0x2215, 0x2215], [0xfeff, 0xfeff], [0xfffd, 0xfffd],
];

// Every source file is scanned as text, so copy written in JSX is covered as
// well as the data modules.
test("all copy is drawable by the self-hosted font subset", () => {
  const files: URL[] = [];
  const walk = (dir: URL) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const url = new URL(entry.name + (entry.isDirectory() ? "/" : ""), dir);
      if (entry.isDirectory()) walk(url);
      else if (/\.(ts|tsx)$/.test(entry.name)) files.push(url);
    }
  };
  walk(SRC);
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    for (const ch of text) {
      const cp = ch.codePointAt(0)!;
      assert.ok(
        FONT_RANGES.some(([lo, hi]) => cp >= lo && cp <= hi),
        `${file.pathname.split("/src/")[1]}: U+${cp.toString(16).toUpperCase().padStart(4, "0")} "${ch}" is outside the font subset`
      );
    }
  }
});

// ----- Routes and metadata --------------------------------------------------

test("every page's path leads back to the same page", () => {
  for (const route of PAGES.filter((route) => route.kind !== "not-found")) {
    const path = pathFor(route);
    assert.deepEqual(matchRoute(path), route, path);
    assert.deepEqual(matchRoute(path.replace(/\/$/, "") || "/"), route, `${path} without its trailing slash`);
  }
  assert.equal(matchRoute("/work/no-such-project/").kind, "not-found");
  assert.equal(matchRoute("/wp-admin").kind, "not-found");
});

test("titles and descriptions are unique and a sensible length", () => {
  const metas = PAGES.map(metaFor);
  assert.equal(new Set(metas.map((meta) => meta.title)).size, metas.length, "duplicate title");
  for (const meta of metas.filter((m) => m.indexable)) {
    assert.ok(meta.title.length <= 90, `${meta.path}: title is ${meta.title.length} characters`);
    assert.ok(meta.description.length >= 70 && meta.description.length <= 200, `${meta.path}: description is ${meta.description.length} characters`);
  }
});

test("each page's head carries valid structured data and the right indexing", () => {
  for (const route of PAGES) {
    const head = renderHead(route);
    const blocks = [...head.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map(([, json]) => JSON.parse(json!));
    const meta = metaFor(route);
    if (meta.indexable) assert.match(head, new RegExp(`<link rel="canonical" href="${SITE.url}${meta.path}" />`));
    else assert.match(head, /<meta name="robots" content="noindex" \/>/);
    if (route.kind === "home") {
      assert.deepEqual(blocks.map((block) => block["@type"]), ["Person", "WebSite", "ProfilePage", "ItemList"]);
      assert.match(head, /rel="preload" as="image"/, "the home page preloads the portrait");
    }
    if (route.kind === "case-study") assert.equal(blocks[0]["@type"], "TechArticle");
  }
});

// ----- Command palette ------------------------------------------------------

const best = (search: string) => rankCommands(search)[0]?.items[0]?.id;

// Each of these selected the wrong entry, or matched at all, under cmdk's
// default fuzzy score, or under a group sort that could not find "Go to".
test("a search selects what was asked for", () => {
  assert.equal(best("rag"), "case-self-correcting-rag");
  assert.equal(best("pgvector"), "case-self-correcting-rag");
  assert.equal(best("langgraph"), "case-ai-workflow-assistant");
  assert.equal(best("judge"), "case-llm-as-judge");
  assert.equal(best("fruugle"), "go-experience");
  assert.equal(best("copy email"), "copy-email");
  assert.equal(best("resume"), "resume");
  assert.equal(best("rag demo"), "demo-self-correcting-rag");
  assert.equal(rankCommands("zzzzqq").length, 0);
});

test("palette groups have slug ids and every entry is unique", () => {
  for (const group of commandGroups) assert.match(group.id, /^[a-z-]+$/, `group "${group.heading}" needs a slug id`);
  const ids = commandGroups.flatMap((group) => group.items.map((item) => item.id));
  assert.equal(new Set(ids).size, ids.length, "duplicate command id");
  for (const item of commandGroups.flatMap((group) => group.items)) {
    const action = item.action;
    if (action.kind !== "section") continue;
    assert.ok(action.id === "top" || SECTIONS.some((section) => section.id === action.id), item.label);
  }
  assert.equal(scoreCommand("Anything", ""), 1, "an empty search shows everything");
});

// ----- The contact form's rules ---------------------------------------------

const VALID = { name: "Jane", email: "jane@example.com", subject: "Hi", message: "Hello there." };

test("valid input passes, trimmed", () => {
  const result = validateContact({ ...VALID, name: "  Jane  " });
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.values.name, "Jane");
});

test("each field's problem is reported, and the API sees the first", () => {
  const { errors } = contactErrors({ name: "", email: "not-an-email", subject: "x".repeat(201), message: "" });
  assert.deepEqual(Object.keys(errors), ["name", "subject", "message", "email"]);
  assert.deepEqual(validateContact({}), { ok: false, field: "name", error: "Name is required." });
});

test("an address no mailbox could hold is refused", () => {
  for (const email of ["a@b.c\u0000", "a\u0007@b.co", "a@b.co\uD800", "no-at-sign", "two@@at.co"]) {
    assert.equal(validateContact({ ...VALID, email }).ok, false, JSON.stringify(email));
  }
});

test("length caps are enforced on every field", () => {
  for (const { name, max } of FIELDS) {
    const tooLong = name === "email" ? `${"a".repeat(max)}@b.co` : "a".repeat(max + 1);
    const result = validateContact({ ...VALID, [name]: tooLong });
    assert.equal(result.ok, false, name);
    if (!result.ok) assert.equal(result.field, name);
  }
});

test("non-object and non-string input count as empty, not as a crash", () => {
  for (const input of [null, undefined, 42, "text", [], { name: 1, email: {}, subject: [], message: true }]) {
    assert.equal(validateContact(input).ok, false);
  }
});
