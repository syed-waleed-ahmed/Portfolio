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
import { existsSync, readFileSync } from "node:fs";
import * as about from "../src/data/about.js";
import * as experienceModule from "../src/data/experience.js";
import * as projectsModule from "../src/data/projects.js";
import * as skillsModule from "../src/data/skills.js";
import * as portfolio from "../src/data/portfolio.js";
import * as commandsModule from "../src/data/commands.js";

const { stats } = about;
const { experiences } = experienceModule;
const { projects } = projectsModule;
const { coreSkills, skillGroups } = skillsModule;
const { personalInfo, socialLinks, sections } = portfolio;
const { commandGroups, scoreCommand } = commandsModule;

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

// The grid gives one project the full width and a layout of its own, and the
// styles for that assume it is the first card: a second one, or one further
// down, would be laid out as a wide card in the wrong place.
test("exactly one project is featured, and it comes first", () => {
  const featured = projects.filter((p) => p.featured);
  assert.equal(featured.length, 1, `${featured.length} projects are marked featured, expected one`);
  assert.equal(projects[0], featured[0], `"${featured[0].title}" is featured but is not the first project`);
});

// The featured card shows three figures under its highlight. Each restates a
// claim made elsewhere on the page, and carries the phrase it restates: a
// figure whose phrase is gone from Experience and from the card's own text
// is a number with nothing behind it.
test("the featured project's figures restate claims the entries make", () => {
  const [featured] = projects.filter((p) => p.featured);
  assert.ok(featured.facts?.length === 3, "the featured project should carry three facts: the card's row has three cells");
  const claims = [...experiences.flatMap((e) => e.bullets), featured.description, featured.highlight].join(" ");
  for (const { value, label, claim } of featured.facts) {
    assert.ok(value && label, "a fact needs a value and a label");
    assert.ok(claims.includes(claim), `fact "${value} ${label}" restates "${claim}", which no Experience bullet or card text says any more`);
  }
});

// Skills opens with the ten the work is built on, each naming where it was
// used. That is a claim about the entries above it, so it is checked against
// them: a proof may name a project (by the part of its title before the
// colon), the assistant an Experience bullet describes, or a count of the
// six projects, and the entry it names must show the skill.
test("every core skill is a tag, and its proof points at entries that show it", () => {
  const tags = new Set(skillGroups.flatMap((g) => g.tags));
  assert.ok(
    coreSkills.length >= 6 && coreSkills.length <= 12,
    `${coreSkills.length} core skills: past a dozen the emphasis stops meaning anything`
  );
  const names = coreSkills.map((skill) => skill.name);
  assert.equal(new Set(names).size, names.length, "a core skill is listed twice");

  // What shows a skill in an entry: its name in the stack or the text, or
  // for the three that are practices rather than products, the word the
  // entries use for it.
  const SHOWN_BY = { "Multi-Agent Systems": /multi-agent/i, RAG: /\bRAG\b/, "LLM Evaluation": /\beval|judge/i };
  const shows = (text, name) => (SHOWN_BY[name] ?? new RegExp(name.replace(/[.+]/g, "\\$&"), "i")).test(text);
  const bullets = experiences.flatMap((e) => e.bullets);
  const COUNTS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six"];

  for (const { name, proof } of coreSkills) {
    assert.ok(tags.has(name), `coreSkills lists "${name}", which is not a skill tag`);
    const counted = proof.match(/^(\w+) of the six projects$/);
    if (counted) {
      const using = projects.filter((p) => p.stack.some((tech) => shows(tech, name))).length;
      assert.equal(projects.length, 6, "the proofs say 'of the six projects'");
      assert.equal(counted[1], COUNTS[using], `${name}: "${proof}", but ${using} project stacks list it`);
      continue;
    }
    for (const entry of proof.split(", ")) {
      const project = projects.find((p) => p.title.split(":")[0] === entry);
      const bullet = bullets.find((text) => text.includes(entry));
      assert.ok(project || bullet, `${name}: the proof names "${entry}", which is neither a project title nor named in an Experience bullet`);
      assert.ok(shows(project ? entryText(project) : bullet, name), `${name}: "${entry}" does not show it in its stack or text`);
    }
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
    ...projects.map((p) => p.demo).filter(Boolean),
  ];
  for (const url of urls) {
    assert.equal(new URL(url).protocol, "https:", url);
  }
  for (const p of projects.filter((project) => project.github)) {
    assert.ok(p.github.startsWith("https://github.com/"), `${p.title}: ${p.github}`);
  }
  // The demo link sits beside "View source" in the card's last row; beside a
  // sourceNote it would put a link and a note in one row track.
  for (const p of projects.filter((project) => project.demo)) {
    assert.ok(p.github, `${p.title}: a demo link needs a github link beside it`);
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
  // A technology finds the project's source; asking for a demo finds the demo.
  assert.match(bestMatch("pgvector").label, /RAG$/);
  assert.match(bestMatch("rag demo").label, /RAG live demo$/);
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

// The card looks its picture up by name, and a name with no file renders an
// <img> with no src: a broken-image box on the page and nothing in the build.
// Four files each: AVIF, and the WebP a browser without AVIF falls back to.
test("every project names a picture that exists, with words for it", () => {
  for (const p of projects) {
    assert.match(p.image ?? "", /^[a-z][a-z0-9-]*$/, `${p.title}: image "${p.image}"`);
    // A third, wider cut is optional: the cards drawn largest name one when
    // their source is wide enough. It has to be wider than 960 to be worth a
    // file, and it needs both formats like the rest.
    if (p.imageWidest !== undefined) {
      assert.ok(Number.isInteger(p.imageWidest) && p.imageWidest > 960, `${p.title}: imageWidest is ${p.imageWidest}, expected a width over 960`);
    }
    for (const format of ["avif", "webp"]) {
      for (const width of [480, 960, ...(p.imageWidest ? [p.imageWidest] : [])]) {
        const file = new URL(`../src/assets/projects/${p.image}-${width}.${format}`, import.meta.url);
        assert.ok(existsSync(file), `${p.title}: src/assets/projects/${p.image}-${width}.${format} is missing`);
      }
    }
    const n = words(p.imageAlt ?? "");
    assert.ok(n >= 12 && n <= 40, `${p.title}: ${n}-word imageAlt, expected 12-40, saying what the picture shows`);
  }
  const names = projects.map((p) => p.image);
  assert.equal(new Set(names).size, names.length, "two projects share a picture");
});

// The sprite is generated from skillIcons and committed, so the two can part:
// a <use> pointing at a symbol the sprite lacks draws nothing and reports
// nothing, and a mark keyed by a renamed tag silently stops showing.
test("every skill mark names a real tag and a symbol in the sprite", () => {
  const { skillIcons } = skillsModule;
  const tags = new Set(skillGroups.flatMap((g) => g.tags));
  for (const tag of Object.keys(skillIcons)) {
    assert.ok(tags.has(tag), `skillIcons lists "${tag}", which is not a skill tag`);
  }
  const sprite = readFileSync(new URL("../src/assets/skill-icons.svg", import.meta.url), "utf8");
  const symbols = [...sprite.matchAll(/<symbol id="([^"]+)"/g)].map(([, id]) => id).sort();
  const wanted = [...new Set(Object.values(skillIcons))].sort();
  assert.deepEqual(
    symbols,
    wanted,
    "src/assets/skill-icons.svg is out of date: run scripts/gen-skill-icons.mjs (the command is at the top of that file)"
  );
});

// Every export of every data module, so a new one is covered the day it is
// added. A list of named exports here once left the About "Approach"
// paragraphs and the globe caption unchecked. Functions serialise to nothing.
test("all copy is drawable by the self-hosted font subset", () => {
  const modules = [about, experienceModule, projectsModule, skillsModule, portfolio, commandsModule];
  const copy = modules.flatMap((module) => Object.values(module).map((value) => JSON.stringify(value) ?? ""));
  for (const text of copy) {
    for (const ch of text) {
      const cp = ch.codePointAt(0);
      const covered = FONT_RANGES.some(([lo, hi]) => cp >= lo && cp <= hi);
      assert.ok(covered, `U+${cp.toString(16).toUpperCase().padStart(4, "0")} "${ch}" is outside the font subset`);
    }
  }
});
