# Design

## Direction

The site reads like an engineering report: numbered sections with their
titles in a column of their own, monospace metadata, figures with captions,
tables of results, and a contents list beside each case study. The aim is that
the design carries the same claim as the content, that the work is measured
and its limits are stated, rather than decoration around it.

It replaced a dark, cyan-gradient design whose interaction patterns (a
floating icon dock, a blur-fade reveal, a pointer light on cards, a dot field)
came from a popular portfolio template, and whose widgets (a WebGL globe, a
contribution graph) were decorative. They were removed rather than restyled.

Two personal touches stay: the hand-drawn crewmate favicon, and the greeting
`hi, Waleed here.` as the first line of the page, set in the monospace with a
blinking caret.

## Colour

Two themes, chosen by `prefers-color-scheme`, defined in
`src/styles/tokens.css`. Light is warm paper and ink with a rust accent; dark
is near-black with a soft orange accent. Components use roles, never values:

| Role | Light | Dark | Used for |
|---|---|---|---|
| `--color-bg` | `#f7f6f2` | `#111214` | The page |
| `--color-surface` | `#ffffff` | `#18191c` | Panels: the feature card, the form, tables |
| `--color-sunk` | `#efede6` | `#0c0d0e` | Wells: tags, the palette's selected row |
| `--color-ink-strong` to `--color-ink-muted` | four steps | four steps | Headings, body, secondary text, metadata |
| `--color-accent` | `#92290a` | `#ff9466` | Links, the primary button, focus, section numbers |
| `--color-rule`, `-strong`, `--color-field` | | | Hairlines, control outlines, form fields |
| `--color-success`, `-warning`, `-danger` | | | Form states only |

The invariants test computes, from this file, that every text colour, the
accent and the status colours hold 7:1 (WCAG AAA) on the page and on a panel
in both themes, that control outlines and field borders hold 3:1, and that no
other stylesheet writes a colour. The browser suite repeats the 7:1 check on
the rendered pages with axe's enhanced-contrast rule.

## Type

One self-hosted variable font, Hanken Grotesk (latin subset, 35 KB, preloaded,
with a metric-matched fallback so the swap moves nothing), and the system's
monospace for metadata, figures and code. No text is smaller than 14px; the
browser suite checks it. Display sizes are fluid with `clamp()`, and above
1920px the root font scales with the viewport so a large monitor keeps the
proportions.

## Layout

- The container stops at 80rem. On a desktop each home section puts its
  number, title and summary in a sticky left column and the content beside
  it, so the page uses the width without stretching lines; text keeps a
  68-character measure.
- Projects are rows rather than cards: name, period and links on the left;
  summary, pipeline strip and result on the right. The thesis project is a
  panel above them.
- Case studies put a sticky contents list beside the article. Text keeps the
  measure; diagrams and tables take the full column and scroll sideways on a
  phone rather than shrinking their text.
- The header is sticky with text links. Below 56rem the links fold into a
  `<details>` menu that works without JavaScript.

## Components worth knowing

- **Pipeline strip** (`components/ui/Pipeline.tsx`): a project's core flow as
  an ordered list drawn as connected steps. It is a real list, so a screen
  reader hears the steps and their count.
- **Diagram** (`components/case-study/Diagram.tsx`): an architecture diagram
  from a small spec of boxes and edges, drawn as SVG with the theme's colours,
  with a title and a full text description. Each case study's diagrams are
  derived from that project's code and documentation.
- **Command palette** (`components/widgets/`): Ctrl or Cmd K, a native modal
  dialog with cmdk for keyboard selection. It is a lazy chunk with its own
  stylesheet, the only one.

## Accessibility

Landmarks and one `h1` per page; a skip link; one visible focus style;
sections and case study headings take focus after a jump; the form announces
results in a live region, focuses the first invalid field and keeps what was
typed on failure; controls are at least 44px tall on touch screens; reduced motion
stops the caret and smooth scrolling; forced-colours mode keeps the palette's
selection visible. axe (WCAG 2.2 A and AA, and best practice) runs on every
page in both themes in CI.

## Motion

Only colour and border transitions on hover and focus, and the caret. Nothing
moves on scroll.

## Print

`src/styles/print.css` prints ink on white, hides the header, menu and form,
and spells out the address of each external link.

## Generated assets

- `frontend/public/images/og-card.png`, the social card:
  `npm i --no-save sharp fontkit wawoff2`, then `node scripts/gen-og-card.mjs`
  from the repository root. Its colours copy the light theme's tokens.
- Case study screenshots in `src/assets/projects/` are crops of images from
  each project's own repository (RemindrAI's is the author's thesis poster),
  at 480 and 960px wide, and wider for a few, as AVIF and WebP.
