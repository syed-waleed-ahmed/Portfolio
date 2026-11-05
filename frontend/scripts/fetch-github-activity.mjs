// Refreshes src/data/github-activity.json, the snapshot behind the contribution
// graph. Run by hand or by .github/workflows/refresh-activity.yml:
//
//   node frontend/scripts/fetch-github-activity.mjs
//
// The site serves this snapshot rather than calling the API from each visitor's
// browser. The API is a free community service that was measured answering with
// 504s and taking 11 seconds, so a live fetch meant a loading state, a failure
// state and a third-party request on every visit. The build itself never touches
// the network either, so its output depends only on what is in the repository.
//
// The file is written only after the response validates, so a bad run leaves the
// last good snapshot in place. Imports nothing outside the repository, so it
// needs no `npm ci` first.
import { writeFile } from "node:fs/promises";
import { githubUsername } from "../src/data/portfolio.js";

const API_URL = `https://github-contributions-api.jogruber.de/v4/${githubUsername}?y=last`;
const OUTPUT = new URL("../src/data/github-activity.json", import.meta.url);

const ATTEMPTS = 6;
const RETRY_DELAY_MS = 10_000;
const REQUEST_TIMEOUT_MS = 60_000;
const MIN_DAYS = 300;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchDays = async () => {
  const response = await fetch(API_URL, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const { contributions } = await response.json();
  return contributions;
};

const validate = (days) => {
  if (!Array.isArray(days) || days.length < MIN_DAYS) {
    throw new Error(`expected at least ${MIN_DAYS} days, got ${days?.length}`);
  }
  for (const { date, count, level } of days) {
    const valid =
      /^\d{4}-\d{2}-\d{2}$/.test(date) &&
      Number.isInteger(count) &&
      count >= 0 &&
      Number.isInteger(level) &&
      level >= 0 &&
      level <= 4;
    if (!valid) throw new Error(`invalid day: ${JSON.stringify({ date, count, level })}`);
  }
  return days;
};

const fetchWithRetries = async () => {
  for (let attempt = 1; ; attempt++) {
    try {
      return validate(await fetchDays());
    } catch (error) {
      console.warn(`attempt ${attempt}/${ATTEMPTS} failed: ${error.message}`);
      if (attempt === ATTEMPTS) throw error;
      await sleep(RETRY_DELAY_MS * attempt);
    }
  }
};

const days = await fetchWithRetries();

// One day per line, so a refresh reads as a small diff.
const lines = days.map(({ date, count, level }) => `  ${JSON.stringify({ date, count, level })}`);
await writeFile(OUTPUT, `[\n${lines.join(",\n")}\n]\n`);

const total = days.reduce((sum, day) => sum + day.count, 0);
console.log(`github-activity: ${days.length} days, ${total} contributions, to ${days.at(-1).date}`);
