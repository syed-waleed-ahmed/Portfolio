// Content invariants for src/data/, on Node's built-in runner (`npm test`).
// The data files are plain modules with no JSX, so they import without a
// bundler and this suite needs no dependencies.
//
// These rules were previously conventions in comments. Each one encodes a
// mistake that actually shipped once: a figure in the About band drifting
// from the entry it summarizes, one project card growing far denser than its
// neighbours, and a character the self-hosted font subset cannot draw.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { stats, education, targetRoles } from "../src/data/about.js";
import { experiences } from "../src/data/experience.js";
import { projects } from "../src/data/projects.js";
import { skillGroups } from "../src/data/skills.js";
import { personalInfo, socialLinks, sections } from "../src/data/portfolio.js";
import { commandGroups, scoreCommand } from "../src/data/commands.js";

const words = (text) => text.trim().split(/\s+/).length;

const entryText = (entry) => Object.values(entry).flat().filter((v) => typeof v === "string").join(" ");

test("every About figure appears in an entry that names its source", () => {
  const entries = [...experiences, ...projects].map(entryText);
  for (const { value, source } of stats) {
    const backed = entries.some((text) => text.includes(source) && text.includes(value));
    assert.ok(backed, `"${value}" (${source}) is not claimed in experience.js or projects.js`);
  }
});

test("project cards keep a matching density", () => {
  for (const p of projects) {
    const d = words(p.description);
    const h = words(p.highlight);
    assert.ok(d >= 32 && d <= 53, `${p.title}: description is ${d} words, expected 32-53`);
    assert.ok(h >= 9 && h <= 26, `${p.title}: highlight is ${h} words, expected 9-26`);
    assert.ok(
      p.stack.length >= 4 && p.stack.length <= 5,
      `${p.title}: ${p.stack.length} stack chips, expected 4-5`
    );
  }
});

// The project cards share their last subgrid row. A card holding neither a
// link nor a note left that row empty, showing a band of blank surface its
// neighbour in the same row did not have; holding both would put two things
// in one row track. See docs/design.md.
test("every project card fills its last row, with a link or a note", () => {
  for (const p of projects) {
    assert.ok(
      Boolean(p.github) !== Boolean(p.sourceNote),
      `${p.title}: expected exactly one of github / sourceNote, got ${
        p.github ? "github" : "no github"
      } and ${p.sourceNote ? "sourceNote" : "no sourceNote"}`
    );
  }
});

test("experience bullets stay within the shared length range", () => {
  for (const role of experiences) {
    for (const bullet of role.bullets) {
      const n = words(bullet);
      assert.ok(n >= 12 && n <= 26, `${role.company}: ${n}-word bullet, expected 12-26: "${bullet}"`);
    }
  }
});

test("titles, keys and tags are unique", () => {
  const unique = (list, what) => assert.equal(new Set(list).size, list.length, `duplicate ${what}`);
  unique(projects.map((p) => p.title), "project title");
  unique(experiences.map((e) => e.company), "experience company (used as a React key)");
  unique(sections.map((s) => s.id), "section id");
  unique(stats.map((s) => s.value + s.source), "stat (used as a React key)");
  unique(skillGroups.flatMap((g) => g.tags), "skill tag across groups");
});

test("section ids are valid fragment identifiers", () => {
  for (const { id, label } of sections) {
    assert.match(id, /^[a-z][a-z-]*$/, `section id "${id}"`);
    assert.ok(label.trim(), `section "${id}" has no label`);
    assert.notEqual(id, "top", `"top" is reserved for the hero`);
  }
});

test("links are absolute https URLs", () => {
  const urls = [
    personalInfo.resumeUrl,
    ...Object.values(socialLinks),
    ...projects.map((p) => p.github).filter(Boolean),
  ];
  for (const url of urls) {
    assert.equal(new URL(url).protocol, "https:", url);
  }
  for (const p of projects.filter((project) => project.github)) {
    assert.ok(p.github.startsWith("https://github.com/"), `${p.title}: ${p.github}`);
  }
  assert.match(personalInfo.email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/);
});

// Mirrors the unicode-range of the Hanken Grotesk @font-face in
// src/styles/base.css. A character outside it renders in the fallback font,
// which is easy to miss in review and obvious on the page (an arrow or a
// curly quote in a different typeface from the words around it).
const FONT_RANGES = [
  [0x0000, 0x00ff], [0x0131, 0x0131], [0x0152, 0x0153], [0x02bb, 0x02bc],
  [0x02c6, 0x02c6], [0x02da, 0x02da], [0x02dc, 0x02dc], [0x0304, 0x0304],
  [0x0308, 0x0308], [0x0329, 0x0329], [0x2000, 0x206f], [0x20ac, 0x20ac],
  [0x2122, 0x2122], [0x2191, 0x2191], [0x2193, 0x2193], [0x2212, 0x2212],
  [0x2215, 0x2215], [0xfeff, 0xfeff], [0xfffd, 0xfffd],
];

const commands = commandGroups.flatMap((group) => group.items);

// Ranked as the palette ranks them: the best-scoring entry is selected first,
// and that is what Enter runs.
const bestMatch = (search) =>
  commands
    .map((item) => ({ item, score: scoreCommand(item.label, search, item.keywords) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)[0]?.item;

test("command palette entries point somewhere real", () => {
  const ids = new Set(["top", ...sections.map((section) => section.id)]);
  for (const { action, label, target } of commands) {
    if (action === "scroll") assert.ok(ids.has(target), `${label}: no section "${target}"`);
    if (action === "open") assert.match(target, /^https:\/\//, label);
  }
});

test("command palette ids and labels are unique", () => {
  for (const key of ["id", "label"]) {
    const values = commands.map((item) => item[key]);
    assert.equal(new Set(values).size, values.length, `duplicate ${key}`);
  }
});

// Each of these went to the wrong place, or matched at all, under cmdk's default
// fuzzy score: the Skills entry's long keyword list matched nearly anything.
test("command palette search finds what was asked for", () => {
  assert.equal(bestMatch("copy email").id, "copy-email");
  assert.equal(bestMatch("skills").id, "go-skills");
  assert.equal(bestMatch("kafka").id, "go-skills");
  assert.equal(bestMatch("zzzzqq"), undefined);
  assert.match(bestMatch("faiss").label, /RAG/);
});

test("the GitHub activity snapshot is a usable year of days", () => {
  const days = JSON.parse(readFileSync(new URL("../src/data/github-activity.json", import.meta.url), "utf8"));
  assert.ok(days.length >= 300, `only ${days.length} days`);
  for (const [index, { date, count, level }] of days.entries()) {
    assert.match(date, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(Number.isInteger(count) && count >= 0, date);
    assert.ok(Number.isInteger(level) && level >= 0 && level <= 4, date);
    if (index > 0) assert.ok(date > days[index - 1].date, `${date} is out of order`);
  }
});

test("all copy is drawable by the self-hosted font subset", () => {
  const copy = [stats, education, targetRoles, experiences, projects, skillGroups, personalInfo, commandGroups]
    .flatMap((data) => JSON.stringify(data));
  for (const text of copy) {
    for (const ch of text) {
      const cp = ch.codePointAt(0);
      const covered = FONT_RANGES.some(([lo, hi]) => cp >= lo && cp <= hi);
      assert.ok(covered, `U+${cp.toString(16).toUpperCase().padStart(4, "0")} "${ch}" is outside the font subset`);
    }
  }
});
