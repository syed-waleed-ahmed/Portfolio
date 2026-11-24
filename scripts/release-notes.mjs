// Prints a version's section of CHANGELOG.md as GitHub release notes:
//
//   node scripts/release-notes.mjs 3.0.0 | gh release create v3.0.0 --title "3.0.0" --notes-file - --verify-tag
//
// The changelog is wrapped at about 78 columns, as every Markdown file here
// is, and a Markdown file on GitHub joins those lines back into paragraphs.
// Release notes do not: GitHub renders them as it renders a comment, where
// every line break is kept, so the notes of every release up to 3.0.0 came
// out as ragged lines of a few words each. This joins each paragraph and
// each list item back into one line before the notes are published, and
// leaves headings, tables, quotes and code blocks as they are.
//
// `unwrap` is exported so the notes of a release already published can be
// rewritten the same way.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// A line that starts a block of its own rather than continuing the one above.
const STARTS_BLOCK = /^\s*(?:#{1,6}\s|[-*+]\s|\d+[.)]\s|>|\||```|<)/;

export function unwrap(markdown) {
  const out = [];
  let fenced = false;
  for (const line of markdown.replace(/\r\n/g, "\n").split("\n")) {
    if (/^\s*```/.test(line)) {
      fenced = !fenced;
      out.push(line);
      continue;
    }
    const previous = out.at(-1);
    const continues =
      !fenced &&
      line.trim() !== "" &&
      !STARTS_BLOCK.test(line) &&
      previous !== undefined &&
      previous.trim() !== "" &&
      !/^\s*(?:#{1,6}\s|\||```)/.test(previous);
    if (continues) out[out.length - 1] = `${previous.trimEnd()} ${line.trim()}`;
    else out.push(line);
  }
  return out.join("\n");
}

// The section under `## [version] - date`, up to the next `## [` heading.
export function section(changelog, version) {
  const lines = changelog.replace(/\r\n/g, "\n").split("\n");
  const start = lines.findIndex((line) => line.startsWith(`## [${version}] - `));
  if (start === -1) throw new Error(`CHANGELOG.md has no "## [${version}] - " heading`);
  const end = lines.findIndex((line, index) => index > start && line.startsWith("## ["));
  return lines.slice(start + 1, end === -1 ? undefined : end).join("\n").trim();
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const version = process.argv[2]?.replace(/^v/, "");
  if (!version) {
    console.error("usage: node scripts/release-notes.mjs X.Y.Z");
    process.exit(1);
  }
  const changelog = readFileSync(new URL("../CHANGELOG.md", import.meta.url), "utf8");
  process.stdout.write(`${unwrap(section(changelog, version))}\n`);
}
