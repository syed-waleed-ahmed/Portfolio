# Design System

The visual language of the site, how the CSS is organized, and the handful of
rules that keep it from drifting. Read this before changing colours, type
sizes, layout or motion.

## CSS architecture

Plain CSS, no framework and no post-processing plugins. Vite bundles it and
lowers modern syntax only where the browser target needs it.

### Cascade layers

`src/styles/index.css` declares the layer order once, and every rule in the
project lives inside one of these layers:

```css
@layer reset, tokens, base, layout, components, utilities;
```

| Layer | File(s) | Holds |
|-------|---------|-------|
| `reset` | `styles/reset.css` | Box sizing, margin reset, media defaults |
| `tokens` | `styles/tokens.css` | Custom properties only |
| `base` | `styles/base.css` | Element defaults: body type, headings, links, focus, selection |
| `layout` | `styles/layout.css` | `.container`, `.section`, the section header |
| `components` | `styles/components.css` and the `.css` beside each component | Buttons, tags, the monogram, the dot band, links, reveal, and each section's own styles |
| `utilities` | `styles/utilities.css` | `.visually-hidden` |

A later layer beats an earlier one whatever the selector specificity, so a
component rule overrides a base rule without `!important` or a longer
selector. Nothing is unlayered. `main.jsx` imports `index.css` before `App`,
which is what puts the layer statement ahead of every component stylesheet in
the bundle.

### Co-located component styles

Each component imports its own stylesheet (`Hero.jsx` imports `Hero.css`), so
the styles for a piece of UI sit next to its markup and are deleted with it.
Shared primitives that several components use (`.btn`, `.tag`, `.monogram`,
`.dot-band`, `.text-link`) live in `styles/components.css` instead.

Class names follow a light BEM shape: `.project-card`, `.project-card__title`,
`.btn--primary`. State lives in attributes rather than extra classes:
`[aria-current]`, `[aria-invalid]`, `[open]`, `[data-reveal]`. That keeps the
CSS selecting on the same thing assistive technology reads.

### Modern CSS in use

| Feature | Where | Why |
|---------|-------|-----|
| Cascade layers | Everywhere | Predictable overrides with no specificity fights |
| Native nesting | Component files | States and children stay beside their parent rule |
| `clamp()` | Type, spacing and section tokens | Fluid sizes with no breakpoint steps |
| Logical properties | Everywhere | `margin-block`, `inset-inline`, `border-inline-start` |
| `color-mix()` | Accent tints and translucent surfaces | Derived colours stay tied to their token |
| Container queries | Contact form | Fields respond to the form's width, not the viewport's |
| `subgrid` | Project cards | Rows line up across cards; see below |
| `:has()` | Project card hover, dock magnification, hiding the dock while a form field has focus on touch | Only cards that contain a link react to hover; an item can respond to its right-hand neighbour being hovered |
| `::details-content`, `interpolate-size` | Experience rows | The native `<details>` animates open; unsupported browsers just open it at once |
| Scroll-driven animation | Reading-progress line along the top of the viewport | No JavaScript; unsupported browsers just omit the line |
| `field-sizing: content` | Contact message box | Grows with its text; falls back to six rows and a resize handle |
| `text-wrap: balance / pretty` | Headings and paragraphs | No orphaned last words |

Because of these, the build uses Vite's default browser target (Baseline
widely available) rather than an older explicit one.

---

## Colour tokens

Every colour is a custom property in `src/styles/tokens.css`, and each is a
role: a component picks a role, never a value. The site is dark-only by design.
The hues are few on purpose: one navy for every surface, one slate for every
line, cyan for what can be acted on, and a status colour only while there is a
status to report.

| Role | Token | Value | Used for | Contrast |
|------|-------|-------|----------|----------|
| Page | `--color-bg` | `#0b1221` | The page, and anything cut into a panel: tags, form fields, contact channels, dock items | |
| Panel | `--color-surface` | `#111a2d` | Project cards, the stats band, the activity panel, the command palette, monograms | 1.08:1 on the page |
| Raised | `--color-surface-raised` | `#17223a` | A hovered dock item, the portrait's ring, a picture's placeholder, autofilled fields | 1.10:1 on a panel |
| Floating | `--color-surface-translucent` | panel at 88% | The dock, over whatever scrolls beneath it | |
| Hairline | `--color-border` | slate at 22% | Card and panel edges, tags, separators | 1.5:1 |
| Outline | `--color-border-strong` | slate at 42% | Buttons, the dock, the palette, contact channels | 2.3:1 |
| Field | `--color-border-field` | slate at 56% | Form fields | 3.1:1 |
| Heading | `--color-text-strong` | `#f5f7fb` | Headings, figures, emphasis | 17.4:1, 16.2:1 |
| Body | `--color-text` | `#dce3ec` | Body text | 14.5:1, 13.4:1 |
| Soft | `--color-text-soft` | `#b7c2d0` | Descriptions, long-form copy, tags | 10.4:1, 9.6:1 |
| Muted | `--color-text-muted` | `#a1adbf` | Metadata, secondary labels | 8.2:1, 7.6:1 |
| Accent | `--color-accent` | `#22d3ee` | Links, the primary button, focus rings, the current section in the dock | 10.4:1, 9.6:1 |
| Accent, hovered | `--color-accent-hover` | `#67e8f9` | The same, under the pointer | |
| Accent ink | `--color-accent-ink` | `#04161c` | Text on the accent | 10.2:1 on the accent |
| Partner | `--color-indigo` | `#6366f1` | Blended into cyan in the hero name and the reading-progress line, never alone | |
| Inverse | `--color-inverse`, `--color-inverse-ink` | heading on page, swapped | The section pills and every tooltip | 17.4:1 |
| Success | `--color-success` | `#86efac` | A sent message | 13.3:1, 12.4:1 |
| Warning | `--color-warning` | `#fcd34d` | A send that failed through nothing the visitor did | 13.0:1, 12.0:1 |
| Error | `--color-danger` | `#fca5a5` | An invalid field, a message the server rejected | 9.9:1, 9.1:1 |
| Decoration | `--color-dot`, `--color-scrim` | slate at 13%, near-black at 60% | The dot band's squares; the dimmed page behind the palette | |

Where two ratios are given, they are against the page and against a panel.

Each hue also has two derived steps, and they are derived the same way for
all four (accent, success, warning, danger): `-border` is the hue at 50%,
which holds at least 3.3:1 as an edge, and `-subtle` is the hue at 10%, a tint
for text of that hue to sit on (at least 8.3:1). Until November 2026 each
status colour had its own hand-picked border and tint, taken from a different
red and green than its text, at 35% and 40%. That left an invalid field with a
border of about 1.9:1, fainter than the 3.1:1 of a valid one.

Six rules keep it consistent:

1. **One accent.** Cyan marks what you can act on, and where you are in the
   dock. Technology tags and metadata are deliberately neutral: a tag is
   information, not an action.
2. **Every text colour passes WCAG AAA**, 7:1, on both the page and a panel,
   the status colours on their own tints included. An invariant computes it
   from `tokens.css`, and the browser suite runs axe's enhanced-contrast rule
   over the rendered page and over each state of the form. Edges are held to
   less, by what each has to do: a hairline only separates, an outline marks
   a thing, and a form field's border, the only sign that there is somewhere
   to type, meets the 3:1 of WCAG 1.4.11.
3. **A role is named for its job.** The pills and tooltips once used
   `--color-text-strong` as a background and `--color-bg` as a text colour;
   they now use the inverse pair, which aliases the same two values. The dock's
   translucent fill was a one-off `color-mix()` in its stylesheet and is a
   token.
4. **No colour is written outside `tokens.css`.** An invariant scans every
   other stylesheet for a hex, a colour function or a named colour, and names
   the declaration. `color-mix()` of tokens, `transparent`, `currentColor`
   and the alpha of a mask are fine.
5. **Information has no hue.** A neutral note (the form's "still sending")
   uses the text and outline roles. The warning exists because a rate limit,
   a sleeping server and a dropped connection are not the visitor's error,
   and red said they were; only a field to correct, or a `400`, is an error.
   A link inside a status message takes the message's colour and stays
   underlined, so one sentence never carries three hues.
6. **Six places inline the palette by hand** and cannot read the tokens, so
   they need updating in step:
   - `GitHubActivityCalendar.jsx`, whose library takes literal colours: the
     accent mixed into `--color-surface` at 25, 50, 75 and 100%, over
     `--color-surface-raised` for an empty day
   - `LocationGlobe.jsx`, whose WebGL colours are RGB fractions of the accent
   - `frontend/public/404.html`, a standalone page with no bundled CSS
   - `<meta name="theme-color">` in both `index.html` and `404.html`
   - `scripts/gen-og-card.mjs`, which bakes the palette into the social card
   - `BRAND` in `backend/services/mailerService.js`, which colours the
     notification email: its indigo, cyan and ink are `--color-indigo`,
     `--color-accent` and `--color-bg`, and the rest are neutrals of its own,
     since the email is light

   `test/invariants.test.js` at the repository root checks every one of these
   against `tokens.css` and names the file that drifted, so a palette change
   fails CI and Netlify's build until they all follow. A new copy belongs in
   this list and in that test. One raster also bakes in a colour, the
   Apple touch icon's background: see [Generated assets](#generated-assets).

Three paints on the rendered page are not tokens, and are known: the
contribution graph's own 4% white stroke round each day, which the library
sets inline; the browser's default colours on the honeypot input, which is a
pixel wide and off screen; and the shadow tokens' near-black.

### States

Every control answers the pointer in the language of its family, and keyboard
focus is the same on all of them: a 2px accent ring, or on a form field an
accent border with a soft halo.

| Family | At rest | Under the pointer | Other states |
|--------|---------|-------------------|--------------|
| Filled: `.btn--primary` | Accent, accent ink | Accent-hover | Busy: 70% opacity, a progress cursor, still focusable |
| Outlined: `.btn--secondary`, `.btn--icon`, the contact channels | Outline border | Accent border and a 10% accent fill; the label keeps its colour | |
| Text link: `.text-link` | Accent | Accent-hover, underlined | In a status message: the message's colour, underlined |
| Dock item | Page fill, hairline, muted icon | Raised fill, heading-colour icon | Current section: accent border, tint and icon |
| Form field | Page fill, field border | Muted border | Focus: accent border and halo. Invalid: error border, at 3.3:1 |
| Project card | Panel, hairline, its picture a step dimmed | The pointer's light, its picture at full strength, and a ring if it holds a link | |

The three outlined controls each had a hover of their own until November
2026: one tinted its fill, one coloured its icon, one coloured its label.

A technology tag looks the same wherever it appears: the page colour as its
fill, a hairline, soft text. Skills shows it a size larger and changes only
its measurements.

---

## Typography

**Hanken Grotesk**, a variable font (weights 100 to 900) self-hosted from
`public/fonts/`, latin subset only, about 35 KB. One file serves every weight
on the page, so bold text is a real bold rather than one synthesised by the
browser (`font-synthesis-weight: none` enforces that). `index.html` preloads
it. Its licence is `public/fonts/OFL-hanken-grotesk.txt`.

It is served from `public/` rather than bundled so that `404.html` can use the
same file and `index.html` can preload it by a stable URL, and it keeps
`font-src` at `'self'` with no third-party request on the critical path.

It is the only typeface on the page. Dates, project context and technology tags
are set in it at small sizes rather than in a monospace, with `tabular-nums`
where figures line up in a column.

### Metric-matched fallback

A second `@font-face`, `Hanken Grotesk Fallback`, points at a local Arial
(Helvetica Neue, Helvetica or Roboto where there is none) with
`ascent-override: 100%`, `descent-override: 30.3%` and `line-gap-override: 0%`,
so the text that paints before the web font arrives occupies the same space
and nothing reflows on swap. Hanken Grotesk's average advance width is within
1% of Arial's, so `size-adjust` stays at 100%. The values come from the font's
own `hhea` metrics (ascent 1000, descent 303 on a 1000-unit em). If the typeface
changes, recompute them rather than copying these.

### Scale

Sizes are tokens (`--text-2xs` to `--text-display`). The larger steps are
`clamp()` expressions that scale between a phone and a laptop, so the component
files have almost no per-breakpoint font-size overrides. The one exception is the
contact panel's invitation, which takes `--text-title` once it has a column of its
own.

The font subset covers Latin-1, general punctuation and a few symbols. A
character outside it (a right arrow, for example) renders in a fallback face,
so `test/data.test.js` fails if any export of any module in `src/data/` uses
one. Copy written in JSX (the hero, the section subtitles, the contact panel)
is not checked and follows the same rule by hand. Icons come from `react-icons` instead: the Search
tooltip, for one, draws the Mac Command key as the `LuCommand` icon, because
U+2318 is outside the subset.

---

## Buttons and links

`.btn` is the shape, with modifiers:

| Class | Use |
|-------|-----|
| `.btn--primary` | The one filled action in a group (View projects, Send message) |
| `.btn--secondary` | Outlined alternative (Resume, Reload page) |
| `.btn--icon` | Square icon-only control; needs an `aria-label` |
| `.btn--sm` | Compact size for the error fallback's reload button |

`.text-link` is the inline link style: accent colour, underline on hover.

A busy button is `aria-disabled="true"` rather than `disabled`: disabling the
send button while it has focus would drop focus to the page just as the result
arrives. `.btn` styles both states the same way, and the form ignores a second
submit while one is in flight.

Every interactive control is at least `--tap-target` tall: 44px, rising to 48px
under `@media (pointer: coarse)`. The token is keyed to the input device
rather than a width breakpoint. Two exceptions, both above the 24px WCAG 2.2
minimum: `.btn--sm`, which is 36px on fine pointers and 48px on touch, and the
dock's items, which are 40px on fine pointers and 48px tall on touch. On a 320px
phone a dock item gives up width first, down to 39px wide, so all seven still fit.
Links inside a sentence, such as the email link in the form's error message,
take the height of their line, which WCAG exempts. The footer's source link sits
in a line of text too, but takes the full target on touch screens all the same.
A link that stands alone, like the activity panel's "View profile" or a project
card's "View source", gets the full target at every size.

Off-site links render through `components/ui/ExternalLink.jsx`, which sets
`target="_blank" rel="noopener noreferrer"` and tells screen-reader users the
link opens a new tab.

Links to a part of the page (the dock, "View projects", the skip link) render
through `components/ui/SectionLink.jsx`, which calls `scrollToSection.js`, the
helper the command palette also uses. It scrolls to the target without writing
`#section` into the address bar, clears any hash already there, and moves focus
to the target so the next Tab continues inside it.
Targets are `<main>` and the page sections, which carry `tabIndex={-1}` for
that reason; `[tabindex="-1"]:focus` draws no outline around them. It is still
a real `href="#id"` link, so it works before hydration and with modifier-key
clicks. `scroll-padding-block` on `html` offsets every jump, and its end value,
`--dock-clearance`, is what stops a control reached with Tab from coming to rest
underneath the dock.

---

## Layout

- The page fills a desktop screen. `.container` is
  `min(100% - 2 * gutter, 92rem)`, and the gutter grows with the viewport, which
  uses 91% of a 1440px screen and 77% of a 1920px one. A 46rem single column was
  tried first and rejected for leaving too much of a desktop screen empty, so wide
  layouts are a requirement here, not a nicety.
- Sections spend that width rather than stretching text across it. From 64rem: the
  hero puts the copy beside a large portrait, About puts the story beside education,
  Experience bullets and Skills groups run in two columns, and Contact puts the
  invitation and channels beside the form. Project cards go to three columns at
  72rem. Lines stay readable because the columns limit them; only the hero's copy
  and the centred subtitles also carry a max-width.
- Past 1920px the root font size scales with the viewport, up to 150%. Everything
  is in rem, so the page keeps its shape on a large monitor instead of leaving small
  text in a narrowing strip. Zooming still works, since it shrinks the viewport
  below that query.
- `.section` carries the vertical rhythm (`--section-space`, fluid). Sections are
  separated by that space alone, with no rules between them.
- Section headers come in three forms. The default is a small left-aligned title.
  Projects uses the feature form, a pill on a rule that fades out at both ends,
  over a larger centred title. Contact is one bordered panel whose title is itself
  the pill, astride the top border, centred up to 64rem and at the panel's left edge
  above it. The heavier two mark where the page changes pace, so adding more of them
  would cost them that.
- The dot band is a CSS-only field of 2px squares behind the top of the page and
  the contact panel. It fades out downward and shimmers slowly, animating opacity
  only.
- Experience is a list of `<details>` rows: monogram, role and company, then dates
  and place in their own column. The most recent role starts open; the rest are
  a click away, and several can be open at once. The bullets are in the prerendered
  HTML whichever state a row is in, and a print rule shows them all.
- A role or school opens with a `.monogram`, the initial in a ringed circle. It
  holds the place a logo would, with no logo file or third-party image request.
- The About figures are two tiles across on phones and four from 48rem, with
  explicit column counts, so a row is never left with an empty cell showing the
  band's background.
- Skills is a definition list, one group per row, with two groups across from
  64rem. A tag naming a product carries its mark: see
  [Skill marks](#skill-marks).

### The dock

`components/layout/Dock.jsx` is the page's navigation at every width. It replaced
a sticky top bar, the mobile menu and a floating back-to-top button, whose job the
Home item now does: it scrolls to the very top of the page, masthead and dot band
included, not just to the hero.

- The navigation items are real links with accessible names, in the prerendered
  HTML, so they work before hydration; only the Search button needs JavaScript.
  LinkedIn and GitHub drop out below 36rem: the hero and contact panel both
  carry them, and seven items is what fits a phone.
- Hover magnifies with `--dock-size`: the hovered item grows to 56px and its
  neighbours to 48px, reaching across the divider. Items are bottom-aligned, so
  they grow out of the top of the bar, which keeps its height. This is pointer-only
  and off under reduced motion.
- On touch, focusing a contact field slides the dock out of view so it cannot
  sit over the field being typed in, and it slides back once the field loses
  focus.
- The Search item after the divider opens the command palette. It drops out below
  36rem with LinkedIn and GitHub, but stays mounted, so Ctrl/Cmd+K still works.
  Its tooltip reads "Search (Ctrl K)" in the prerendered HTML and switches to
  the Command key on Apple platforms after hydration.
- The masthead above the hero exists because the greeting uses the first name
  only, and the full name still has to be on the first screen.

### Command palette

`components/ui/CommandPalette.jsx` is `cmdk` inside a native modal `<dialog>`,
which supplies the top layer, the inert background, focus containment and Escape.
Its entries are in `data/commands.js`, built from the other data modules, so a new
section, project or skill reaches the palette without being listed twice. A
project's entry opens its repository, or jumps to Projects when there is no
public one, and a running demo gets an entry of its own.

Two details are load-bearing:

1. **Search uses `scoreCommand`, not `cmdk`'s default.** The default fuzzy score
   matches letters in sequence across an entry's keywords. Over the Skills entry's
   long list that matched nearly anything, so "copy email" selected Skills and
   Enter went there. `scoreCommand` needs every word to appear. A label match
   ranks first, and among keyword matches a shorter list ranks higher, which puts
   the project built on pgvector above the Skills section, and a project's source
   entry above its demo, whose list is one keyword longer. `test/data.test.js`
   holds it to both.
2. **The input is focused explicitly after `showModal()`.** The dialog otherwise
   focuses `cmdk`'s root, which has a `tabIndex` of -1, and typing goes nowhere.

### GitHub activity

`GitHubActivity.jsx` is a panel under the project grid. It reads
`data/github-activity.json`, a committed snapshot, rather than calling the
contributions API from each visitor's browser. That API was measured answering
with 504s and taking 11 seconds, so a live fetch meant a loading state, a failure
state and a third-party request on every visit. The snapshot needs no CSP change.
Its label names the date the data runs to, so a stale graph says so.

The calendar is 53 weeks of 14px blocks from 80rem up, beside the heading. Below
that it uses 11px blocks and shows the most recent weeks that fit, rather than
nesting a sideways scroller in the page. It slices whole weeks ending on the
snapshot's last day, because the library pads a week that starts mid-week into
one more column than was measured for, which spilled into its own scroller. Once
loaded it measures its slot again on every resize, so a rotated phone or a
window dragged across 80rem gets a graph that fits. `GitHubActivity.css`
reserves the exact height of each size so nothing below moves when the chunk
arrives.

### The globe

`LocationGlobe.jsx` rises from the bottom of the contact panel's left column, on
screens of 80rem and up only, marking the three places in `education` (listed
with their coordinates as `locations` in `data/about.js`). It sways rather than
spins, because a full turn would hide all three for half of every rotation, and
it draws only while on screen. It is decorative, so the canvas is hidden from
assistive technology and its caption says the same thing in words. Without
WebGL the canvas never fades in and the caption stands alone. Below 80rem it is
`display: none`, so its observer only ever reports it off screen: a phone never
downloads `cobe`, and never creates a WebGL context either, since the support
check runs only when the globe is about to load and releases its context
straight away.

### Skill marks

A skill tag that names a product shows that product's mark before its name:
34 tags and 33 marks, since Vercel's serves two, from [Simple Icons](https://github.com/simple-icons/simple-icons)
(CC0-1.0) and, for Mastra, OpenAI and Groq, which it does not carry, from
[Lobe Icons](https://github.com/lobehub/lobe-icons) (MIT). The marks are
trademarks of their owners and are used only to name the tool beside them.

- **One sprite, not thirty-three components.** `scripts/gen-skill-icons.mjs`
  writes `src/assets/skill-icons.svg`, a file of `<symbol>` elements, and each
  tag holds an `<svg><use href="...#id"></svg>`. The browser fetches the
  sprite once, as an image, and Vite fingerprints it, so it is cached like the
  rest of `/assets/`. Imported as `react-icons` components, the same paths
  would sit in the entry chunk and a second time in the prerendered HTML.
- **`skillIcons` in `data/skills.js` is the source.** It maps a tag to a symbol
  id, the script builds the sprite from it, and a content test fails when the
  two differ. The script installs nothing permanent: both icon packages are
  fetched with `npm i --no-save`, as the command at the top of the script
  shows, and the sprite is committed, so a build needs neither.
- **One ink.** Every mark is drawn in `--color-text-soft`. Brand colours were
  not used: several marks are black and would vanish on this background, and
  thirty hues in a row would outweigh the names.
- **Not every tag has one, on purpose.** A practice such as RAG or CI/CD has
  no mark. Neither set carries XGBoost, Matplotlib, Seaborn, Power BI, SQL
  Server, pgvector or Twilio, and a look-alike would claim a different product.
  AWS, MySQL and ASP.NET Core were tried and removed: each mark is mostly its
  own name in letters, which at a tag's 16px is a smudge repeating the word
  beside it.
- **The tag aligns on its text, not its mark.** A flex box takes its baseline
  from its first item, and a mark sitting first has none but its bottom edge,
  which dropped every marked tag, and the group name aligned to it, 3px below
  its neighbours. The tag aligns its items on the baseline and the mark
  centres itself.

The mark is decoration, hidden from assistive technology: the tag's text is
its name. A `<use>` whose sprite failed to load draws nothing and reports
nothing, so the browser suite checks that every one has a bounding box.

### Project cards line up on shared rows

`.project-grid` is one column on phones, two from 44rem and three from 72rem.
Each card spans seven row tracks with `grid-template-rows: subgrid`: picture,
context, title, description, highlight, stack and links. A two-line title on
one card therefore pushes its neighbour's description down to match, and every
band lines up across the row.

**Every card opens with a picture**, a 2:1 crop that bleeds to the card's
edges. Each is cut from an image in that project's own repository, never a
mock-up, so it can be checked like the card's figures:

| Card | Source | Crop (left, top, width) | Shows |
|------|--------|-------------------------|-------|
| RemindrAI | The thesis poster, 2160x2700 (the repository is private) | 195, 848, 1790 | A chat request becoming one reminder on four channels |
| TIAGo | `docs/images/task1_map_vs_world.png` | 0, 10, 1596 | The SLAM map in RViz beside the Gazebo world |
| Campaign Forge | `docs/images/run-inspector.jpg` | 318, 0, 1210 | The Run Inspector on a completed demo-mode run |
| Self-Correcting RAG | `docs/images/live-demo.jpg` | 0, 0, 712 | The demo's Ask tab |
| LLM-as-Judge | `docs/assets/screenshots/playground.png` | 0, 0, 1060 | A pairwise verdict with a bias warning |
| FastAPI Niche Assistant | `docs/assets/web-ui.jpg` | 128, 95, 1000 | The web UI's welcome screen |

Each crop is as wide as the third number and half as tall.

The files are in `src/assets/projects/` at 480 and 960px wide, as AVIF and
as WebP (`<image>-480.avif`, `<image>-960.webp` and so on; the RAG one stops at
its source's 712px): about 159 KB for the twelve AVIF files and 190 KB for
the twelve WebP. Each card renders a `<picture>` with the AVIF as its
`<source>` and the WebP as its `<img>`, the pattern the hero's portrait
uses. A browser takes one or the other, never both. The WebP is there
because a browser that cannot decode AVIF otherwise draws six broken-image
icons, which is what WebKit's Windows build did when the site was first
opened in it. A project names its picture in
`data/projects.js` and `Projects.jsx` resolves the name to Vite's
fingerprinted URLs, so the data module stays importable by plain Node. They
load lazily, since the grid starts below the fold at every width, and the
`width` and `height` attributes hold the 2:1 box until they arrive. The
picture row is shared like the other six, so a card without one would show an
empty band: a content test requires all four files and an `imageAlt` of 12 to
40 words for every project. They were cut by hand with `sharp` (extract, resize,
AVIF at quality 55, WebP at quality 78); a new card needs the same four files.
The `<picture>` is the card's grid item and sets its own width with
`max-inline-size: none`: the reset caps a picture at 100% of its container,
which here is the card's content box, and with the cap it stopped 2.5rem short
of the card's right edge.

Two of the six are screenshots of light interfaces, shown as those projects
really look, and at full strength each was the brightest thing on the page by
a wide margin. All six therefore rest at 84% brightness, the same step, so none
is singled out, and come up to full strength while the pointer or keyboard
focus is in their card. Print leaves them alone.

Three details are load-bearing:

1. **`Reveal` renders the card itself** (`<Reveal as="li" className="project-card">`),
   so the card is a direct child of the grid. Subgrid only inherits tracks from
   a direct parent; a wrapper element between them breaks it.
2. **The highlight box and tag list use `align-self: start`.** The row is sized
   to the tallest highlight in the grid row, and a stretched box showed a band
   of empty background under the shorter one.
3. **Every card fills the last row.** It holds `github` as a "View source" link
   or, where there is no public repository, `sourceNote` as a muted line. The
   row is shared across the cards, so a card holding neither ended with 61px of
   blank surface its neighbour did not have (measured at 1280px before the
   fix). A card carries one field or the other, never both. A card with a
   running deployment adds `demo`, a "Live demo" link beside "View source", so
   it needs `github` as well: beside a `sourceNote` it would not render. The
   row is a wrapping flex line, so in a narrow card the second link drops below
   the first rather than shrinking its tap target.

A fourth follows from the first: **the light under the pointer is two
absolutely positioned pseudo-elements.** On a screen with a mouse, a card
shows a soft cyan wash where the pointer is and a brighter arc on the nearest
stretch of its border, the pattern of Magic UI's Magic Card (see
[Design lineage](#design-lineage)). `Projects.jsx` has one `pointermove`
listener on the grid that writes `--spot-x` and `--spot-y` to the card under
the pointer, with no state and so no re-render, and `Projects.css` draws two
radial gradients there: `::before` under the text at `z-index: -1`, and
`::after` over the border, masked down to its 1px. In flow, either one would
be a grid item and take one of the seven rows. The light is off on touch
screens, where a tap would leave `:hover` parked on the last card touched.

Without subgrid support the cards fall back to ordinary columns: content still
reads top to bottom, it just stops lining up. That fallback is why the layout
carries no fixed heights.

---

## Motion

Motion is limited to things that help orientation, and all of it is CSS
transitions or keyframes, apart from the decorative globe. There is no animation
library.

| Motion | Detail |
|--------|--------|
| Hero entrance | The copy sharpens from a 6px blur and settles 6px downward, once, 40ms apart. It is never invisible: on a phone the hero's text is the Largest Contentful Paint, and Chrome does not count an element at opacity 0, so the fade from nothing it had until November 2026 held the LCP back by about 150ms on a throttled phone. The portrait, the LCP on a desktop, does not animate, so it paints as soon as it decodes |
| Greeting caret | The cursor after "hi, Waleed here." blinks; it is solid under reduced motion |
| Scroll reveal | Content that starts below the fold gets the same blur, fade and 6px settle when it enters, over 400ms. Experience rows follow each other 40ms apart, and project cards stagger 50ms along each row, by the column count `Projects.css` knows. See below |
| Reading progress | A 2px line along the top of the viewport, driven by `animation-timeline: scroll()` |
| Dock | Items magnify on hover over 220ms, with a tooltip above. On touch the dock slides away while a contact field has focus. See [The dock](#the-dock) |
| Experience rows | The row's height animates open and the chevron turns, 220ms |
| Dot band | Two layers of squares shimmer on 5s and 7s cycles, opacity only |
| Command palette | Fades in and settles 6px, 220ms, over a fading backdrop |
| Globe | Sways slowly about its centre on `requestAnimationFrame`, in WebGL, only while on screen |
| Hover and focus | Colour and border changes, 150ms. Project cards that hold a link gain a soft ring over 220ms and do not lift, because they are not click targets |
| Pointer light | A project card under a mouse pointer shows a soft wash and a brighter border where the pointer is, fading in over 220ms. It moves only as the pointer does. See [Project cards](#project-cards-line-up-on-shared-rows) |

`Reveal` only ever hides content that is below the viewport **after**
hydration, by writing `data-reveal="pending"` to the node. The prerendered HTML
is therefore always fully visible, nothing above the fold flickers, and a
visitor without JavaScript sees everything. It uses an `IntersectionObserver`
with threshold 0, because a ratio threshold can never be reached by an element
taller than the viewport, and reveals on any intersecting entry in a callback,
since a busy main thread can deliver an older "not intersecting" entry first.
Printing never waits for it: a print rule shows pending content at full
opacity (see [Print](#print)).

Under `prefers-reduced-motion: reduce` the duration tokens drop to 0, a global
rule shortens any remaining animation to effectively nothing, smooth scrolling
is turned off, `Reveal` skips hiding content entirely, the dot band holds still,
the dock does not magnify and the globe draws one still frame.

---

## Accessibility

- Skip link as the first focusable element, moving focus to `<main>`
- Command palette: a native modal dialog with a labelled combobox; focus returns
  to where it was on close, or to the section jumped to, and a copied address is
  announced from a live region
- One visible `:focus-visible` treatment site-wide, following each control's
  own shape; form fields use a border-and-halo variant
- Every section is a named landmark (`aria-labelledby` its heading), with one
  `<h1>` and a strict heading order
- Dock: every item has an accessible name and the current section is marked with
  `aria-current`; a tooltip repeats the name on hover and on keyboard focus;
  `scroll-padding` keeps a focused control clear of it
- Experience rows are native `<details>`, so they toggle with Enter or Space and
  announce their state without any ARIA
- Contact form: native `required`, `autocomplete`, `maxLength` matching the API;
  on a failed submit focus moves to the first invalid field, whose error is
  linked with `aria-describedby` and flagged with `aria-invalid`; while sending,
  the fields are read-only and the button stays focusable (`aria-disabled`, not
  `disabled`); the result is announced from an `aria-live` region that is
  rendered, and so in the accessibility tree, even while it is empty
- The honeypot input is off-screen rather than `display: none`, out of the tab
  order and hidden from assistive technology
- Under a Windows contrast theme (`forced-colors: active`), where the browser
  replaces every author colour, the two states that were shown by a tint
  alone keep a mark: the dock's current section and the command palette's
  selected row opt out with `forced-color-adjust: none` and take the system's
  `Highlight` and `HighlightText`. Everything else is left to the theme: text,
  borders and focus rings stay visible, and the decoration (the dot band, the
  reading-progress line, the pointer light) simply goes
- Tap targets and reduced motion as described above

The browser suite runs an axe-core scan (the WCAG 2.0, 2.1 and 2.2 A and AA
rules) on the built page at desktop and phone widths, and with the command
palette open, and fails CI on any violation. It also drives the keyboard paths
above: the palette's shortcut, search and focus return, and the form's focus on
an invalid field. See [Testing](testing.md#browser-tests).

---

## Print

Every component reads the colour tokens, so printing is one block in `tokens.css`
that swaps them for ink on white, rather than a colour override per component.
Sections flow across pages, with only small units (a stat band, a project card, a
role) kept whole. The dock, the dot band, the reading-progress line, the
contribution graph and the globe are not printed, and a closed Experience row
prints its bullets anyway.

Printing lays the page out without scrolling it, so content `Reveal` was still
holding back would print blank. A print rule in `components.css` shows every
`[data-reveal="pending"]` element at full opacity with no blur or offset, and
turns the reveal transitions off.

---

## Generated assets

Several binaries in `public/` are generated rather than hand-drawn, so they
need regenerating rather than editing:

| Asset | Source | How |
|-------|--------|-----|
| `images/og-card.png` | `images/Profile.avif` + the font | `scripts/gen-og-card.mjs` |
| `src/assets/skill-icons.svg` (in `src/`, not `public/`, so Vite fingerprints it) | `skillIcons` in `src/data/skills.js` + two icon packages | `frontend/scripts/gen-skill-icons.mjs`, see [Skill marks](#skill-marks) |
| `favicon.ico`, `favicon-96x96.png`, `apple-touch-icon.png` | `favicon.svg`, the hand-drawn crewmate | Rasterised from the SVG; the touch icon bakes in the previous navy `#0a192f`, visually indistinguishable from `--color-bg` |
| `images/Profile.{avif,webp}` | 680x680, square-cropped from the original photo | Re-crop from the original if the photo changes |
| `images/Profile-192.{avif,webp}` | Downscaled from `Profile.avif` (AVIF quality 60, WebP 82). Phones up to 2x, where the portrait renders at 96px, and tablets at 1x (148px). Added in November 2026, when PageSpeed Insights found phones fetching the 320px file for a 168-pixel slot | `sharp` resize, then keep the `srcSet` in `Hero.jsx` and the preload in `index.html` in step |
| `images/Profile-320.{avif,webp}` | Downscaled from `Profile.avif`. Phones at 3x, tablets at 2x, and desktops at 1x, where the portrait renders at 320px | `sharp` resize, then keep `sizes` in `Hero.jsx` and the preload in `index.html` in step |

```bash
npm i --no-save sharp fontkit wawoff2
node scripts/gen-og-card.mjs
```

The script reads only files already in the repository, so the output is
reproducible from a clean checkout. It draws text as vector paths from the font
file rather than as SVG `<text>`, so it does not depend on the font being
installed on the machine, and it throws rather than emitting a card with text
running off the edge. `wawoff2` decompresses the WOFF2 to TTF in memory,
because `fontkit` cannot apply font variations (weights) to a WOFF2 directly.

The three packages are installed on demand and deliberately kept out of
`package.json`: `sharp` ships around 30 MB of native binaries, and CI has no
reason to pull that in to lint and build a static site. Install them in one
command; a second `npm i --no-save` prunes what the first added.

`src/data/github-activity.json` is generated as well, by a script and a weekly
workflow rather than by hand: see
[Development](development.md#updating-site-content).

---

## Design lineage

The interaction patterns are adapted from
[magicuidesign/portfolio](https://github.com/magicuidesign/portfolio) by Dillion
Verma, MIT licensed, Copyright (c) 2024 Dillion Verma: the floating dock, the
expandable work rows, the blur-fade entrance, the pill-on-a-rule header and the dot
band. Its narrow single column was not kept: see [Layout](#layout). The light
under the pointer on project cards is adapted the same way from the Magic Card
in the same author's [magicuidesign/magicui](https://github.com/magicuidesign/magicui),
also MIT.

They were rewritten for this codebase rather than copied in. That project is built
on Next.js, Tailwind, shadcn/ui and Motion, and none of those are dependencies
here: the blur-fade is a CSS transition, the dock's magnification is `:has()`, the
accordion is `<details>`, the dot band is CSS gradients where the original
draws to a canvas, and the pointer light is two gradients and a dozen lines of
event handler where the original animates motion values. The palette, typeface, copy and content are this site's own.

---

## Related documents

- [Architecture](architecture.md#frontend) - component layers, prerendering and the data layer
- [Development](development.md#updating-site-content) - editing copy and content
- [Deployment](deployment.md#caching) - why `/images/*` is not cached like `/assets/*`
