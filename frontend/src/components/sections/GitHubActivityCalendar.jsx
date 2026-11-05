import { ActivityCalendar } from "react-activity-calendar";
import days from "@/data/github-activity.json";

// The wide size matches the breakpoint and width in GitHubActivity.css, which
// reserves the height of whichever size is in use.
const WIDE = "(min-width: 80rem)";
const SIZES = {
  wide: { blockSize: 14, blockMargin: 3, blockRadius: 3 },
  narrow: { blockSize: 11, blockMargin: 2, blockRadius: 2 },
};

const WEEKS_IN_A_YEAR = 53;
const WEEKS_PER_MONTH = 4.35;

// --color-accent mixed into --color-surface at 25, 50, 75 and 100%, over the
// raised surface for an empty day. The library takes literal colours, so these
// need updating with the tokens: see docs/design.md.
const THEME = { dark: ["#17223a", "#15485d", "#1a778e", "#1ea5be", "#22d3ee"] };

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
const formatDate = (date) => DATE_FORMAT.format(new Date(date));

const describeDay = ({ count, date }) => {
  if (count === 0) return `No contributions on ${formatDate(date)}`;
  return `${count} contribution${count === 1 ? "" : "s"} on ${formatDate(date)}`;
};

const TOOLTIPS = { activity: { text: describeDay, placement: "top", offset: 6, hoverRestMs: 120 } };

// Names the snapshot's last day, so a graph that has not been refreshed lately
// says how old it is rather than implying it is live.
const totalLabel = (weeks) => {
  const span = weeks >= 52 ? "year" : `${Math.round(weeks / WEEKS_PER_MONTH)} months`;
  return `{{count}} contributions in the ${span} to ${formatDate(days.at(-1).date)}`;
};

// Shows the most recent weeks that fit the width it is given, rather than a year
// in a sideways scroller nested inside the page. Only ever rendered in the
// browser, after the block nears the viewport, so it can read the media query.
const GitHubActivityCalendar = ({ width }) => {
  const size = window.matchMedia(WIDE).matches ? SIZES.wide : SIZES.narrow;
  const weeks = Math.min(
    WEEKS_IN_A_YEAR,
    Math.floor((width + size.blockMargin) / (size.blockSize + size.blockMargin))
  );

  return (
    <ActivityCalendar
      data={days.slice(-weeks * 7)}
      colorScheme="dark"
      theme={THEME}
      fontSize={12}
      labels={{ totalCount: totalLabel(weeks) }}
      tooltips={TOOLTIPS}
      {...size}
    />
  );
};

export default GitHubActivityCalendar;
