# Design System

The visual language of the site, how the CSS is organized, and the handful of
rules that keep it from drifting. Read this before changing colours, type
sizes, layout or motion.

## CSS architecture

Plain CSS, no framework and no post-processing plugins. Vite bundles it and
lowers modern syntax only where the browser target needs it.

### Cascade layers

`src/styles/index.css` declares the layer order once, and every style rule in
the project lives inside one of these layers:

```css
@layer reset, tokens, base, layout, components, utilities;
```

| Layer | File(s) | Holds |
|-------|---------|-------|
| `reset` | `styles/reset.css` | Box sizing, margin reset, media defaults |
| `tokens` | `styles/tokens.css` | Custom properties, and `color-scheme` |
| `base` | `styles/base.css` | Element defaults: body type, headings, links, focus, selection |
| `layout` | `styles/layout.css` | `.container`, `.section`, the section header |
| `components` | `styles/components.css` and the `.css` beside each component | Buttons, tags, the monogram, the timeline rail, the dot field, links, reveal, and each component's own styles |
| `utilities` | `styles/utilities.css` | `.visually-hidden` |

A later layer beats an earlier one whatever the selector specificity, so a
component rule overrides a base rule without `!important` or a longer
selector. Nothing is unlayered. `main.jsx` imports `index.css` before `App`,
which is what puts the layer statement ahead of every component stylesheet in
the bundle.

### Three stylesheets, loaded in order

The rules reach a browser as three files, and where each is linked decides
what waits for it:

| File | Holds | Linked | Blocks |
|------|-------|--------|--------|
| `index-*.css`, the entry stylesheet | Tokens, reset, base, layout, the shared primitives, the masthead, the hero and the dock | In `<head>`, by Vite | The first paint |
| `sections-*.css` (`styles/sections.css`) | Everything below the hero: the five sections, the activity panel, the globe, the footer | In `<main>`, after the hero and before the first section | Only what follows it |
| `print-*.css` (`styles/print.css`) | Everything the page changes for paper | Last in the page, with `media="print"` | Nothing |

A stylesheet linked in the body holds up the content after it and not the
content before it, so the hero paints as soon as the entry stylesheet arrives;
a browser fetches both at once. Until 2026-11-24 every rule was in the entry
stylesheet, 7.9 kB that a visitor waited for in full before seeing anything.
It is 5.5 kB now, and the sections' sheet is 3.9 kB.

The component files stay beside their components. `styles/sections.css` lists
the eight that belong below the hero with `@import`, and their components no
longer import them: an import there would put the file back into the entry
stylesheet. `App.jsx` imports both extra sheets with `?url` and renders the
`<link>` elements itself, with no `precedence`, so React leaves each where it
is written.

The order of the three links is load-bearing. All three write into the same
cascade layers, and between two sheets the later one wins, so the print sheet
has to come last: linked first, as it was for a day, it lost to every rule in
the sections' sheet and the project cards printed part-way through their
fade. An invariant holds the order, and holds every stylesheet to being loaded
exactly once.

### Co-located component styles

Each component's stylesheet sits beside it (`Hero.css` beside `Hero.jsx`), so
the styles for a piece of UI sit next to its markup and are deleted with it.
The hero, the masthead, the dock and the lazy widgets import theirs; the
sections below the hero are listed in `styles/sections.css` instead, for the
reason under [Three stylesheets](#three-stylesheets-loaded-in-order).
Shared primitives that several components use (`.btn`, `.tag`, `.label`,
`.monogram`, `.timeline`, `.more`, `.dot-field`, `.text-link`) live in
`styles/components.css` instead.

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
| Container queries | Contact form, the hero's greeting | Fields respond to the form's width, not the viewport's; the greeting is sized in `cqi`, as a share of its column |
| `subgrid` | Project cards | Rows line up across cards; see below |
| CSS counters | Section headers | Each section's number follows the order of `sections`, with no number written anywhere |
| Multi-column layout | An open Experience row | Bullets flow down one column and into the next, balanced, with no row to line up across |
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
The hues are few on purpose: a midnight page with graphite surfaces over it,
one slate for every line, cyan for what can be acted on, and a status colour
only while there is a status to report.

| Role | Token | Value | Used for | Contrast |
|------|-------|-------|----------|----------|
| Page | `--color-bg` | `#070a11` | The page, and anything cut into a panel: tags, form fields, contact channels, dock items, the well a project picture sits in, a core skill's cell | |
| Panel | `--color-surface` | `#121824` | Project cards, the contact panel, the activity panel, the command palette, monograms | 1.11:1 on the page |
| Raised | `--color-surface-raised` | `#1c2434` | A hovered dock item, the floor under the featured picture, a picture's placeholder, autofilled fields | 1.14:1 on a panel |
| Floating | `--color-surface-translucent` | panel at 88% | The dock, over whatever scrolls beneath it | |
| Hairline | `--color-border` | slate at 22% | Card and panel edges, tags, separators, the lines between cells | 1.4:1 |
| Outline | `--color-border-strong` | slate at 42% | Buttons, the dock, the palette, contact channels, the timeline rail | 2.2:1 |
| Field | `--color-border-field` | slate at 66% | Form fields | 3.4:1 on the panel, 3.8:1 on the fill |
| Heading | `--color-text-strong` | `#f6f9fd` | Headings, figures, emphasis | 18.7:1, 16.8:1 |
| Body | `--color-text` | `#d3dbe7` | Body text | 14.1:1, 12.7:1 |
| Soft | `--color-text-soft` | `#b9c4d3` | Descriptions, long-form copy, tags | 11.2:1, 10.0:1 |
| Muted | `--color-text-muted` | `#a2aec1` | Metadata, labels, the second tone of a two-tone statement | 8.8:1, 7.9:1 |
| Accent | `--color-accent` | `#6ee7f7` | Links, the primary button, focus rings, the current section in the dock, the section numbers | 13.6:1, 12.2:1 |
| Accent, hovered | `--color-accent-hover` | `#a4f0fa` | The same, under the pointer | |
| Accent ink | `--color-accent-ink` | `#06131a` | Text on the accent | 12.9:1 on the accent |
| Partner, read as text | `--color-lavender` | `#b4b8ff` | Where the hero name's gradient starts, running into cyan; never alone | 10.5:1, 9.5:1 |
| Partner, never text | `--color-indigo` | `#6366f1` | The reading-progress line, the second light behind the page, the header of the contact email | |
| Inverse | `--color-inverse`, `--color-inverse-ink` | heading on page, swapped | Every tooltip | 18.7:1 |
| Success | `--color-success` | `#a2f2d1` | A sent message, and the availability dot in the hero | 15.2:1, 13.6:1 |
| Warning | `--color-warning` | `#ffe1a8` | A send that failed through nothing the visitor did | 15.6:1, 14.0:1 |
| Error | `--color-danger` | `#ffc0c9` | An invalid field, a message the server rejected | 12.8:1, 11.5:1 |
| Decoration | `--color-dot`, `--color-glow`, `--color-glow-indigo`, `--color-band`, `--color-scrim` | slate at 30%, accent at 9%, indigo at 16%, panel at 55%, near-black at 60% | The dot field; the two lights behind the top of the page; the lift at the top of every other section; the dimmed page behind the palette | |

Where two ratios are given, they are against the page and against a panel,
rounded down.

Each hue also has two derived steps, and they are derived the same way for
all four (accent, success, warning, danger): `-border` is the hue at 50%,
which holds at least 3.4:1 as an edge, and `-subtle` is the hue at 10%, a tint
for text of that hue to sit on (at least 9.2:1, on a panel). Until November
2026 each status colour had its own hand-picked border and tint, taken from a
different red and green than its text, at 35% and 40%. That left an invalid
field with a border of about 1.9:1, fainter than the 3.1:1 of a valid one.

### How the palette was chosen

It was set in two passes, on 2026-11-23 and 2026-11-24, and the second
replaced the first.

The first pass took a proposed palette, a deeper navy with a lighter cyan and
pastel status colours, and moved its panel from 1.32:1 to 1.15:1 on the page,
because six large cards at the proposed step read as slabs on a dashboard.
It was still a navy page under navy panels, and that was the fault with the
original as well: every section looked like the one before it.

The second pass set three concepts side by side, each as a full token table
with every ratio computed, not estimated:

| Concept | Page, panel | Accent | Outcome |
|---------|-------------|--------|---------|
| A, aurora engineering | Midnight `#070a11`, graphite `#121824` | Cyan `#6ee7f7`, lavender partner | Chosen. Every pair passes, and it keeps the cyan the site is known by |
| B, dark editorial | Charcoal `#0a0a0b`, `#141416` | Electric blue `#8ab8ff` | As drafted, muted text was 6.9:1 on a panel and the accent's 50% edge 2.9:1. Fixable, but it would have been a different site |
| C, precision laboratory | Blue-black `#070c0f`, `#10191d` | Mint `#86f3d2`, lavender partner | Every pair passes. Reads as a different product, and mint is the success colour here |

Concept A is what the table above holds. What changed from the first pass:

- **The page and its surfaces lost most of their blue.** The page is a
  midnight close to black and the panels are graphite with a little of its
  blue, so colour comes from the light behind the page, the accent and the
  pictures, not from the ground.
- **The hero name runs from lavender into cyan**, not from indigo. Indigo is
  4.4:1 on the page, which made the first letters of the name the dimmest
  thing in a line now set at 150px; lavender is 10.5:1. Indigo stays for
  what is never read: the progress line, the second light, and the header of
  the contact email, under white text, where a lighter violet would not hold.
- **The field border is 66%**, from 64%: with a darker page under it, 64% fell
  to 3.3:1 against the panel.

Six rules keep it consistent:

1. **One accent.** Cyan marks what you can act on, and where you are: the
   dock's current section and the number each section opens with. Beyond
   that it draws only a few fine lines of the hero's frame (the caret, the
   name, the portrait's second outline, the short rule before each figure's
   source), never a surface or a block of text. Technology tags and metadata
   are deliberately neutral: a tag is information, not an action.
2. **Every text colour passes WCAG AAA**, 7:1, on both the page and a panel,
   the status colours on their own tints included. An invariant computes the
   plain pairs from `tokens.css`, and the browser suite runs axe's
   enhanced-contrast rule over the rendered page and over each state of the
   form, which is where the tints are checked. Edges are held to
   less, by what each has to do: a hairline only separates, an outline marks
   a thing, and a form field's border, the only sign that there is somewhere
   to type, meets the 3:1 of WCAG 1.4.11 on both sides of the line.
   Text also sits over the two lights behind the top of the page and over the
   lift at the top of a section, and axe cannot judge text over a gradient.
   Those are held by arithmetic: at the brightest point of the cyan light
   muted text is 7.5:1, at the brightest point of the indigo 7.6:1, and on
   the lift 8.3:1. The two lights are centred off opposite corners, so they
   never stack to more than either alone. Raising `--color-glow`,
   `--color-glow-indigo` or `--color-band` means doing that sum again.
3. **A role is named for its job.** The tooltips, and the section pills while
   there were any, once used `--color-text-strong` as a background and
   `--color-bg` as a text colour; they use the inverse pair, which aliases the
   same two values. The dock's translucent fill was a one-off `color-mix()` in
   its stylesheet and is now a token.
4. **No colour is written outside `tokens.css`.** An invariant scans every
   other stylesheet for a hex, a colour function or a named colour, and names
   the declaration. `color-mix()` of tokens, `transparent`, `currentColor`
   and the alpha of a mask are fine. `styles/print.css` gives the tokens
   their values for paper, so it may write a literal as a token's value and
   nowhere else.
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
   - `LocationGlobe.jsx`, whose WebGL markers and arcs take the accent as RGB
     fractions
   - `frontend/public/404.html`, a standalone page with no bundled CSS
   - `<meta name="theme-color">` in both `index.html` and `404.html`
   - `scripts/gen-og-card.mjs`, which bakes the palette into the social card,
     so the card has to be regenerated as well
   - `BRAND` in `backend/services/mailerService.js`, which colours the
     notification email: its indigo, cyan and ink are `--color-indigo`,
     `--color-accent` and `--color-bg`, and the rest are neutrals of its own,
     since the email is light

   `test/invariants.test.js` at the repository root checks every one of these
   against `tokens.css` and names the file that drifted, so a palette change
   fails CI and the deploy's build until they all follow. A new copy belongs in
   this list and in that test. One raster also bakes in a colour, the
   Apple touch icon's background: see [Generated assets](#generated-assets).

Three colours on the rendered page do not come from a colour token, and each
is known: the contribution graph's own 4% white stroke round each day, which
the library sets inline; the browser's default colours on the honeypot input,
which is a pixel wide and off screen; and the near-black inside the shadow
tokens.

### States

Every control answers the pointer in the language of its family, and keyboard
focus is the same on all of them: a 2px accent ring, or on a form field an
accent border with a soft halo.

| Family | At rest | Under the pointer | Other states |
|--------|---------|-------------------|--------------|
| Filled: `.btn--primary` | Accent, accent ink | Accent-hover | Busy: 70% opacity, a progress cursor, still focusable |
| Outlined: `.btn--secondary`, the contact channels | Outline border | Accent border and a 10% accent fill; the label keeps its colour | |
| Text link: `.text-link` | Accent | Accent-hover, underlined | In a status message: the message's colour, underlined |
| Dock item | Page fill, hairline, muted icon | Raised fill, heading-colour icon | Current section: accent border, tint and icon |
| Form field | Page fill, field border | Muted border | Focus: accent border and halo. Invalid: error border, at 3.4:1 |
| Project card | Panel, hairline, its picture a step dimmed in its well | The pointer's light, its picture at full strength, and a ring if it holds a link | |

The three outlined controls each had a hover of their own until November
2026: one tinted its fill, one coloured its icon, one coloured its label.

A technology tag looks the same wherever it appears: the page colour as its
fill, a hairline, soft text. Skills shows it a size larger and changes only
its measurements. For a day the ten core skills were tags drawn stronger in
place; they are a block of their own now (see [Layout](#layout)), and a tag
has one look again.

---

## Typography

**Hanken Grotesk**, a variable font (weights 100 to 900) self-hosted from
`public/fonts/`, latin subset only, about 35 KB. One file serves every weight
on the page, so bold text is a real bold rather than one synthesized by the
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

Sizes are tokens (`--text-2xs` to `--text-2xl`, with `--text-title` between). The larger steps are
`clamp()` expressions that scale between a phone and a laptop, so the component
files have almost no per-breakpoint font-size overrides. Three sizes are
written outside the scale: the hero's headline and the figures under it, each
a `clamp()` of its own, and the greeting.

**The greeting is sized to its column, not to the screen.** "hi, Waleed
here." is one line, 6.55 times its font size wide with the caret in
Chromium and a little wider in Firefox and WebKit, so `14.4cqi`, 14.4% of the
column's width per em, leaves it 3 to 5% short of the column's edge in all
three at every size: 40px on a 320px phone, 50px on a 390px one, 131px on a
1440px desktop and 154px on a 1920px one. It is capped by the
height of the window as well (`20vh`), so on a short laptop screen it does
not take the whole of it, and at 11rem. The factor depends on the typeface,
the weights and the tracking: change any of them and it has to be measured
again, and six browser tests fail if the line leaves its column, wraps, or
stops filling four fifths of it.

**One voice for metadata.** `.label` is upper case, spaced 0.08em, 12px (13px
for the dates, which sit beside larger type) and muted: the role and the place in the masthead, the entry behind a figure, the
context over the featured project, the dates of a role or a degree. It says
where a thing sits, never what it is, and it is the only upper-case text on
the page. There is still one typeface: the labels are Hanken Grotesk, not a
monospace.

**Two tones for a statement.** Where a sentence has a claim and a
qualification, the claim is in the heading colour and the rest in a quieter
one: the hero's headline and lead, and the contact panel's "Open to AI and ML
engineering roles. Based in Bologna, Italy."

The font subset covers Latin-1, general punctuation and a few symbols. A
character outside it (a right arrow, for example) renders in a fallback face,
so `test/data.test.js` fails if any export of any module in `src/data/` uses
one. Copy written in JSX (the hero, the section subtitles, the contact panel)
is not checked and follows the same rule by hand. Symbols come from
`react-icons` instead: the Search tooltip, for one, draws the Mac Command key
as the `LuCommand` icon, because U+2318 is outside the subset.

---

## Buttons and links

`.btn` is the shape, with modifiers:

| Class | Use |
|-------|-----|
| `.btn--primary` | The one filled action in a group (Send message) |
| `.btn--secondary` | Outlined alternative (Reload page) |
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

Links to a part of the page (the dock and the skip link) render
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
  `min(100% - 2 * gutter, 92rem)`, and the gutter grows with the viewport, so
  the container uses 91% of a 1440px screen and 77% of a 1920px one. A 46rem
  single column was tried first and rejected for leaving too much of a desktop
  screen empty, so wide layouts are a requirement here, not a nicety.
- **The order is the one a recruiter reads in**: the hero, Projects,
  Experience, About, Skills, Contact. `sections` in `data/portfolio.js` sets
  it for the page, the dock and the palette. About led the page until November
  2026, which put two screens of narrative between the introduction and the
  first project.
- **The greeting is the design.** "hi, Waleed here." is set as wide as its
  column on every screen (see [Typography](#typography)), light, with the
  name the one bold word and the one coloured one. Under it the statement
  runs in two tones and, from a desktop up, two columns: what I build on the
  left, in the heading colour; why it holds up on the right, in the soft
  one, with the graduation note under it. The portrait stands in the
  right-hand column. The hero opens with a status line saying which roles I
  am open to. It holds no buttons: a row of four (View projects, Resume,
  LinkedIn, GitHub) stood under the lead until 2026-11-23 and was taken out,
  since the dock at the foot of the same screen carries all four and the
  contact panel carries the last three again. On a phone the dock drops
  LinkedIn and GitHub, so there they are in the contact panel only.
- **The hero is the first screen, in one of two ways.** On a desktop window
  at least 48rem tall it takes the height of the viewport: the copy in the
  middle of the space, the four figures along the bottom edge, and the dock
  under them. In a shorter one, as a laptop window with its toolbars is, the
  copy alone takes the first screen, clear of the dock, and the figures start
  just under the fold. 48rem is where everything fits: at that height the
  figures clear the dock at every desktop width from 1024 to 1920px, measured.
  Left to its own height in a short window, the hero put the
  figures exactly where the dock floats, and that was the first thing a
  visitor saw of them. A tablet and a phone let the hero take its own height.
  Two browser tests hold the two cases, at 1440 by 900 and 1528 by 651.
- The masthead above carries the name, the role and, from a tablet up, the
  place, with its coordinates beside it: the same point the globe at the foot
  of the page marks, and decoration, so a screen reader is given the city
  alone.
- On a phone the portrait is a 4rem thumbnail beside the status line, so the
  greeting, the headline, the lead and the first two figures are all inside
  the first screen; it was 96px on a row of its own. On a tablet it is 148px beside the status line and the greeting, and on a desktop 20rem
  with a second outline set off behind it, down and to the right.
- **The figures are a strip, not tiles**: each a number set large over the
  line that says what it counts and the entry that backs it, with one rule
  above the row and, from 48rem, a hairline between one figure and the next.
  As four tiles on a filled band they read as a dashboard widget. Two across
  on a phone and four from 48rem, with explicit column counts, so a row is
  never left one short.
- Sections spend the width rather than stretching text across it. From 64rem:
  the hero puts the copy beside the portrait, About puts the story beside
  education and the target roles, an open Experience row flows its bullets in
  two columns, Skills groups run in two columns, and Contact puts the channels
  beside the form. Projects divide six columns by weight: see
  [Project cards](#project-cards-one-featured-then-two-then-three). Lines stay
  readable because the columns limit them; only the hero's copy and the
  section subtitles also carry a max-width.
- Past 1920px the root font size scales with the viewport, up to 150%. Everything
  is in rem, so the page keeps its shape on a large monitor instead of leaving small
  text in a narrowing strip. Zooming still works, since it shrinks the viewport
  below that query.
- `.section` carries the vertical rhythm (`--section-space`, fluid). Every
  other section (Projects, About, Contact) opens on a lift: a hairline and a
  tone, `--color-band`, that fades back into the page within 22rem. It gives a
  long page a rhythm without giving any section a colour of its own.
- **One section header**, for every section: the section's number over a short
  accent rule, the title at `--text-2xl`, the subtitle, and a hairline under
  the lot. From 64rem the subtitle moves beside the title, against the right
  edge, on the title's baseline. The number is a CSS counter on the sections,
  so reordering `sections` renumbers the page, and it carries empty
  alternative text, so a screen reader hears the heading alone. Three headers
  stood here until November 2026: a small left-aligned title, a pill on a rule
  over a centred title for Projects, and a pill astride the panel's border for
  Contact. The page read as three designs.
- **Two lights and a dot field stand behind the top of the page.** The lights
  are two radial gradients on the canvas (`html`, screen only): cyan from the
  right, behind the portrait, and indigo from the left. Over them, under the
  text, the dot field is a sparse grid of dots on a 1.5rem pitch that fades
  out from the top right corner. It is static: one gradient tile and a mask.
  The contact panel has a dot field of its own, brightest in its top left
  corner, and the globe below it is drawn in dots too, so the same mark opens
  and closes the page. The dot band it replaced was a 100px strip of 2px
  squares on a slow shimmer, faint enough that it was easy to miss.
- Experience and Education are timelines (`.timeline`): each row carries a
  monogram, and from 40rem a hairline joins one monogram to the next. Experience
  is a list of `<details>` rows. On a desktop the dates lead: a column of
  their own down the left edge, the period as a label and the place under it,
  then the monogram, the role and the company, so the list reads as a ledger,
  when and where and then what. Until 2026-11-24 the dates sat against the
  right edge, a full screen's width from the role they dated. On a tablet
  they are still a column on the right, and on a phone they stack under the
  company. The most recent role starts open; the rest are a
  click away, and several can be open at once. The bullets are in the
  prerendered HTML whichever state a row is in, and the print stylesheet shows
  them all. From 64rem an open row's bullets flow in two CSS columns,
  balanced; as a two-column grid they lined up across rows, which left a gap
  under every short bullet and the fifth bullet on a row of its own.
- A role or school carries a `.monogram`, the initial in a ringed circle. It
  holds the place a logo would, with no logo file or third-party image request.
- About sets the story beside a second column that holds education and, under
  it, the target roles, so the two columns run to about the same height;
  education alone ended half way down. The story's first paragraph is set a
  size up and in the body colour, as a lede.
- **Skills is two parts.** First the ten the work on the page is built on
  (`coreSkills` in `data/skills.js`), as cells that share their hairlines,
  two across on a phone and five from 72rem: each is a claim and its
  evidence, the skill and then the projects or the role that show it. A
  content test checks every name in a proof against the entries, and every
  "five of the six projects" against the stacks. There are no levels and no
  years. Then the full inventory, a definition list with one group per row
  and two groups across from 64rem. A tag naming a product carries its mark:
  see [Skill marks](#skill-marks). Sixty-two tags of equal weight said
  nothing about which ten mattered.
- **A phone shows less at first, and loses nothing.** Two things sit in a
  native `<details>` there (`.more`): the description on each of the five
  ordinary project cards, and the skills inventory. On a phone they are shut,
  one tap away, so a card shows its title and its result and Skills shows the
  ten; from 44rem the stylesheet holds them open and hides the toggle. That
  takes `::details-content`, which is what lets a stylesheet show the inside
  of a closed `<details>`; a browser without it keeps the toggle and behaves
  as a phone does. The content is in the prerendered HTML either way,
  find-in-page opens it, and it needs no JavaScript. The phone page is 9,987px
  with them, from 10,771px.
- Contact is the page's largest panel, on a surface of its own: availability
  and place as its heading line, in two tones, the direct channels and the
  globe on the left over the dot field, and the form on the right.

### The dock

`components/layout/Dock.jsx` is the page's navigation at every width. It replaced
a sticky top bar, the mobile menu and a floating back-to-top button, whose job the
Home item now does: it scrolls to the very top of the page, masthead included,
not just to the hero.

- It floats, and is lit as anything that floats here is: a hairline along its
  top edge, where light from above would catch it, over the shadow it throws
  on the page. The command palette has the same two.
- The navigation items are real links with accessible names, in the prerendered
  HTML, so they work before hydration; only the Search button needs JavaScript.
  LinkedIn and GitHub drop out below 36rem: the contact panel carries them,
  and seven items is what fits a phone.
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
  only, and the full name still has to be on the first screen. It carries the
  role beside the name and, from a tablet up, the city.
- On a desktop first screen the dock sits under the hero's figures, not over
  them: the hero's bottom padding there is `--dock-clearance`, the same
  figure `scroll-padding` uses. A browser test holds it at 1440 by 900.

### Command palette

`components/widgets/CommandPalette.jsx` is `cmdk` inside a native modal `<dialog>`,
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

`components/widgets/GitHubActivity.jsx` is a panel under the project grid. It
reads `data/github-activity.json`, a committed snapshot, rather than calling the
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

`components/widgets/LocationGlobe.jsx` rises from the bottom of the contact
panel's left column, on screens of 80rem and up only, marking the three places
in `education` (listed with their coordinates as `locations` in
`data/about.js`). It sways rather than
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
36 tags and 35 marks, since Vercel's serves two, from
[Simple Icons](https://github.com/simple-icons/simple-icons) (CC0-1.0) and, for
Mastra, OpenAI and Groq, which it does not carry, from
[Lobe Icons](https://github.com/lobehub/lobe-icons) (MIT). The marks are
trademarks of their owners and are used only to name the tool beside them.

- **One sprite, not thirty-six components.**
  `frontend/scripts/gen-skill-icons.mjs` writes `src/assets/skill-icons.svg`,
  a file of `<symbol>` elements, and each tag holds an
  `<svg><use href="...#id"></svg>`. The browser fetches the
  sprite once, as an image, and Vite fingerprints it, so it is cached like the
  rest of `/assets/`. Imported as `react-icons` components, the same paths
  would sit in the entry chunk and a second time in the prerendered HTML.
- **`skillIcons` in `data/skills.js` is the source.** It maps a tag to a symbol
  id, the script builds the sprite from it, and a content test fails when the
  two differ. Nothing is installed permanently: both icon packages are
  fetched with `npm i --no-save`, as the command at the top of the script
  shows, and the sprite is committed, so a build needs neither.
- **One ink.** Every mark is drawn in its tag's own text colour,
  `--color-text-soft`, or `--color-text-strong` beside a core skill's name.
  Brand colours were
  not used: several marks are black and would vanish on this background, and
  thirty-five hues in a row would outweigh the names.
- **Not every tag has one, on purpose.** A practice such as RAG or CI/CD has
  no mark. Neither set carries XGBoost, Matplotlib, Seaborn, Power BI, SQL
  Server, pgvector, Twilio, llama.cpp, LiteLLM or Google Cloud Run, and a
  look-alike would claim a different product; Google Cloud's own mark would
  claim the whole platform for a tag that names one service of it.
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

### Project cards: one featured, then two, then three

`.project-grid` is one column on phones, two from 44rem and six from 72rem,
and the cards divide those columns by weight. The featured project
(`featured: true` in `data/projects.js`: the first entry, held to exactly one
by a content test) takes the full width. The next two take three columns each
and the last three take two each. On a tablet the second card runs across both
columns, so five cards never leave one alone at the end. Until November 2026
all six were the same card in two rows of three, and the thesis project
carried no more weight than any other.

**The featured card** is the same card, with the same parts in the same
order and two more. From 64rem its picture stands beside its text instead of
over it, in a well that fills the card's left half: lit from above by the
page's cyan light and standing on a floor that lifts toward the raised
surface, the way a product shot is staged. Its title is set at
`--text-title`, it shows its `role` above the title as a label, and under its
highlight it carries three figures in cells that share their hairlines
(`facts` in `data/projects.js`). Each figure restates a claim the MemorAIz
entry in Experience already makes, and names the phrase it restates; a
content test fails if that phrase goes. It takes one row of the grid and lays
out its own rows.

**The other five** each span six row tracks with `grid-template-rows: subgrid`:
picture, title, description, highlight, stack and links. A two-line title on
one card therefore pushes its neighbour's description down to match, and every
band lines up across the row. They no longer print `role`: it read
"Independent Project" five times, and the section's subtitle says it once.
The field stays on every entry for the command palette's search. Their
description is the `<details>` a phone shows shut: see [Layout](#layout).

**The three largest cards have a wider cut where the source allows.** The
featured card and the two under it draw their pictures at up to 665px, which
a 2x screen cannot fill from a 960px file. A project names a third width in
`imageWidest`: 1440px for RemindrAI, from the poster's 1790px crop, and
1120px for the AI Workflow Assistant, its crop at its own size. The Research
Team's crop is 900px wide in its screenshot, so it has none, and stays a
little soft on a 2x screen. A browser picks by `sizes` and its own density,
so a 1x screen and a phone never fetch the wider file.

**Every card opens with a picture in a well.** The `<picture>` is a panel cut
into the card and filled with the page colour, like a tag or a form field. It
bleeds to the card's edges, and the 2:1 image stands inside it on its bottom
edge, set in by the well's padding (`--well`: 1rem, or 2rem in the featured
card and the two wide ones). Three of the six pictures are light and three are
dark, and bled to the card's edges they made the grid a checkerboard; set in
from the same dark mount, each reads as a screenshot of something. Each is cut
from an image in that project's own repository, never a mock-up, so it can be
checked like the card's figures:

| Card | Source | Crop (left, top, width) | Shows |
|------|--------|-------------------------|-------|
| RemindrAI | The thesis poster, 2160x2700 (the repository is private) | 195, 848, 1790 | A chat request becoming one reminder on four channels |
| AI Workflow Assistant | `docs/screenshots/report-dark.png` (retaken 2026-11-16) | 280, 100, 1120 | A verified report in dark mode |
| Multi-Agent Research Team | `docs/screenshots/report-real.png` (a real run, not the test engine's sample output) | 93, 92, 900 | Three agents completed on one topic |
| Self-Correcting RAG | `docs/images/live-demo.jpg` | 0, 0, 712 | The demo's Ask tab |
| LLM-as-Judge | `docs/assets/screenshots/playground.png` | 0, 0, 1060 | A pairwise verdict with a bias warning |
| FastAPI Niche Assistant | `docs/assets/web-ui.jpg` (the Qwen release's, 1528x634) | 110, 90, 920 | The web UI's welcome screen |

Each crop is as wide as the third number and half as tall.

The files are in `src/assets/projects/` at 480 and 960px wide, as AVIF and
as WebP (`<image>-480.avif`, `<image>-960.webp` and so on; the RAG one stops at
its source's 712px, the Research Team's at 900px and the FastAPI one at 920px,
since none is upscaled), and the two wider cuts described above: about 231 KB
for the fourteen AVIF files and 299 KB for the fourteen WebP, gzipped as Size
Limit counts them, of which the twelve at 480 and 960px are 170 and 211 KB. The FastAPI pair was saved
at 960 until 2026-11-20, about 4% larger than its crop, which nothing checked:
the file's width is not compared with its source anywhere, so a new picture
needs that looked at by hand. Cut at its own size the pair is 1.3 kB heavier,
not lighter, since an enlarged picture is a blurred one and compresses better. Each card renders a `<picture>` with
the AVIF as its `<source>` and the WebP as its `<img>`, the pattern the hero's
portrait uses. A browser takes one or the other, never both. The WebP is there
because a browser that cannot decode AVIF otherwise draws six broken-image
icons, which is what WebKit's Windows build did when the site was first
opened in it. A project names its picture in `data/projects.js` and
`Projects.jsx` resolves the name to Vite's fingerprinted URLs, so the data
module stays importable by plain Node. They load lazily, since the grid starts
below the fold at every width, and the `width` and `height` attributes hold
the 2:1 box until they arrive. Their `sizes` come from `PICTURE_SIZES` in
`Projects.jsx`, which holds three lists because the grid gives the cards three
widths. Each follows the picture's rendered width at every breakpoint: the
card's width, less its borders and the well's padding. A change to the
container, the gutter, the grid's columns or `--well` has to update it; the
comment there has the derivation, and it was measured within 2px at 22 widths
from 320 to 2560px. Up to a 1920px screen the widest a picture is drawn is
about 665px, in the featured card and the two under it, which a 960px file
fills at only 1.4 file pixels per CSS pixel on a 2x screen. Two of those
three have the wider cut described above; the Research Team's source is too
narrow for one. The picture row is shared like the other five, so a card
without one would show an empty band: a content test requires all four files,
the two wider ones where a project names `imageWidest`, and an `imageAlt` of
12 to 40 words for every project. They
were cut by hand with `sharp` (extract, resize, AVIF at quality 55, WebP at
quality 78); a new card needs the same four files. The AI Workflow
Assistant's and the Research Team's AVIF files add
`chromaSubsampling: "4:2:0"` and `effort: 9`: both screenshots are mostly
small text, and at sharp's default 4:4:4 the first pair alone took 63 KB and
pushed the twelve past their 175 KB budget. At 4:2:0 the two pairs take 40 KB
and 29 KB with the text still crisp.

The `<picture>`, the well, is the card's grid item, and it bleeds past the
card's padding with negative margins and a width that adds the padding back.
That needs `max-inline-size: none`: the reset caps a picture at 100% of its
container, which here is the card's content box, and with the cap it stopped
2.5rem short of the card's right edge. A browser test checks both: that the
well reaches the card's edges, and that the image sits in from it by the same
margin on each side.

Three of the six are light, the LLM-as-Judge and Research Team screenshots
and the RemindrAI poster, shown as those projects really look, and at full
strength each is the brightest thing on the page by a wide margin. All six
therefore rest at 84% brightness, the same step, so none is singled out, and
come up to full strength while the pointer or keyboard focus is in their card.
Print shows them at full strength.

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

A fourth follows from the subgrid: **the light under the pointer is two
absolutely positioned pseudo-elements.** On a screen with a mouse, a card
shows a soft cyan wash where the pointer is and a brighter arc on the nearest
stretch of its border, the pattern of Magic UI's Magic Card (see
[Design lineage](#design-lineage)). `Projects.jsx` has one `pointermove`
listener on the grid that writes `--spot-x` and `--spot-y` to the card under
the pointer, with no state and so no re-render, and `Projects.css` draws two
radial gradients there: `::before` under the text at `z-index: -1`, and
`::after` over the border, masked down to its 1px. In flow, either one would
be a grid item and take one of the six rows. The light is off on touch
screens, where a tap would leave `:hover` parked on the last card touched.

Without subgrid support the cards fall back to ordinary columns: content still
reads top to bottom, it just stops lining up. That fallback is why the layout
carries no fixed heights.

---

## Motion

Motion mostly serves orientation, and all of it is CSS transitions or
keyframes, apart from the decorative globe. There is no animation
library.

| Motion | Detail |
|--------|--------|
| Hero entrance | The status line, the greeting and the statement sharpen from a 6px blur and settle 6px downward, once, 40ms apart. It is never invisible: on a phone the hero's text is the Largest Contentful Paint, and Chrome does not count an element at opacity 0, so the fade from nothing it had until November 2026 held the LCP back by about 150ms on a throttled phone. The portrait, the LCP on a desktop, does not animate, so it paints as soon as it decodes |
| Greeting caret | The cursor after "hi, Waleed here." blinks; it is solid under reduced motion |
| Scroll reveal | Content that starts below the fold gets the same blur, fade and 6px settle when it enters, over 400ms. Experience rows follow each other 40ms apart, and project cards stagger 50ms along each row, by the layout `Projects.css` knows. See below |
| Reading progress | A 2px line along the top of the viewport, driven by `animation-timeline: scroll()` |
| Dock | Items magnify on hover over 220ms, with a tooltip above. On touch the dock slides away while a contact field has focus. See [The dock](#the-dock) |
| Experience rows | The row's height animates open and the chevron turns, 220ms |
| Command palette | Fades in and settles 6px, 220ms, over a fading backdrop |
| Globe | Sways slowly about its centre on `requestAnimationFrame`, in WebGL, only while on screen |
| Hover and focus | Colour and border changes, 150ms. Project cards that hold a link gain a soft ring over 220ms and do not lift, because they are not click targets |
| Pointer light | A project card under a mouse pointer shows a soft wash and a brighter border where the pointer is, fading in over 220ms. It moves only as the pointer does. See [Project cards](#project-cards-one-featured-then-two-then-three) |

Nothing in the page's backdrop moves. The two lights and the dot field are
static, where the dot band they replaced shimmered on 5s and 7s cycles.

`Reveal` only ever hides content that is below the viewport **after**
hydration, by writing `data-reveal="pending"` to the node. The prerendered HTML
is therefore always fully visible, nothing above the fold flickers, and a
visitor without JavaScript sees everything. It uses an `IntersectionObserver`
with threshold 0, because a ratio threshold can never be reached by an element
taller than the viewport, and reveals on any intersecting entry in a callback,
since a busy main thread can deliver an older "not intersecting" entry first.
Printing never waits for it: the print stylesheet shows pending content at
full opacity (see [Print](#print)).

Under `prefers-reduced-motion: reduce` the duration tokens drop to 0, a global
rule shortens any remaining animation to effectively nothing, smooth scrolling
is turned off, `Reveal` skips hiding content entirely, the hero's caret stops
blinking and stays solid, the dock does not magnify and the globe draws one
still frame.

---

## Accessibility

- Skip link as the first focusable element, moving focus to `<main>`
- Command palette: a native modal dialog with a labelled combobox; focus returns
  to where it was on close, or to the section jumped to, and a copied address is
  announced from a live region
- One visible `:focus-visible` treatment site-wide, following each control's
  own shape; form fields use a border-and-halo variant
- Every section is a named landmark (`aria-labelledby` its heading), with one
  `<h1>` and a strict heading order. The number above each heading is
  generated content with empty alternative text, so it is not read out
- The two disclosures a phone shows shut are native `<details>`: they toggle
  with Enter or Space and announce their state. Held open on a wider screen,
  their content is rendered, not only painted, so assistive technology reads
  it; a browser test checks that
- The coordinates in the masthead are hidden from assistive technology, which
  is given the city's name
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
  borders and focus rings stay visible, and the decoration (the dot field, the
  two lights, the availability dot, the reading-progress line, the pointer
  light) simply goes
- Tap targets and reduced motion as described above

The browser suite runs an axe-core scan (the WCAG 2.0 and 2.1 A and AA rules,
and the 2.2 AA rules) on the built page at desktop and phone widths, and with the command
palette open, and fails CI on any violation. It also drives the keyboard paths
above: the palette's shortcut, search and focus return, and the form's focus on
an invalid field. See [Testing](testing.md#browser-tests).

---

## Print

Every component reads the colour tokens, so printing swaps them for ink on
white rather than overriding each component. That swap, and every other rule
for paper, is one stylesheet: `src/styles/print.css`. `App.jsx` imports it with
`?url`, so Vite emits it as a file of its own, and links it with
`media="print"`: a browser fetches it at low priority and it never holds up
the first paint. Until November 2026 the print rules sat beside each component
inside the entry stylesheet, about 300 gzipped bytes of its 8 kB budget for
something most visitors never use.

Each rule there sits in the cascade layer of the rule it overrides, and wins
by coming later, which is why the print sheet is the last thing linked in the
page (see [Three stylesheets](#three-stylesheets-loaded-in-order)). An
invariant fails if an `@media print` rule turns up in any other stylesheet, if
the link goes, or if it moves ahead of the sections' sheet; Size Limit gives
the file a budget of its own.

Sections flow across pages, with only small units (the figures, a project
card, a role) kept whole. The dock, the dot field, the two lights, the
reading-progress line, the contribution graph and the globe are not printed,
the hero takes its own height, and everything a `<details>` holds prints
whether it was open or not: a closed Experience row's bullets, a project
card's description, the skills inventory.

Printing lays the page out without scrolling it, so content `Reveal` was still
holding back would print blank. A rule in the print stylesheet shows every
`[data-reveal="pending"]` element at full opacity with no blur or offset, and
turns the reveal transitions off. A browser test prints the page: content not
yet scrolled to shows, the dock does not, and the text is ink.

---

## Generated assets

Several binaries in `public/` are generated rather than hand-drawn, so they
need regenerating rather than editing:

| Asset | Source | How |
|-------|--------|-----|
| `images/og-card.png` | `images/Profile.avif` + the font | `scripts/gen-og-card.mjs` |
| `src/assets/skill-icons.svg` (in `src/`, not `public/`, so Vite fingerprints it) | `skillIcons` in `src/data/skills.js` + two icon packages | `frontend/scripts/gen-skill-icons.mjs`, see [Skill marks](#skill-marks) |
| `favicon.ico`, `favicon-96x96.png`, `apple-touch-icon.png` | `favicon.svg`, the hand-drawn crewmate | Rasterized from the SVG; the touch icon bakes in `#0a192f`, the navy of two palettes ago, still close enough to `--color-bg` to read as the same |
| `images/Profile-840.{avif,webp}` | An 840px square (left 48, top 70) of the 960x1280 studio portrait of November 2026, which is not in the repository | `sharp` extract, unscaled. Requested only past 2048px at 2x, where the portrait renders at 16.6vw |
| `images/Profile.{avif,webp}` | The same crop at 680px | `sharp` resize. Desktops at 2x and 1x screens past 1920px; the JSON-LD `image` and the `<img>` fallback point here |
| `images/Profile-320.{avif,webp}` | The same crop at 320px | `sharp` resize. Tablets at 2x and desktops at 1x, where the portrait renders at 320px |
| `images/Profile-192.{avif,webp}` | The same crop at 192px | `sharp` resize. Phones up to 3x (a 64px slot since the redesign; it was 96px) and tablets at 1x (148px). Added in November 2026, when PageSpeed Insights found phones fetching the 320px file for a 168-pixel slot |

The four portrait sizes are resized with Lanczos and encoded as AVIF at
quality 60 (effort 9) and WebP at 82. A new photo needs all eight files
re-cut from one crop, then the OG card regenerated. A new size also changes
the `srcSet` and `sizes` in `Hero.jsx` and the preload in `index.html`, which
the invariants test holds in step.

```bash
# from the repository root, where the script lives (not frontend/scripts/)
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
expandable work rows and the blur-fade entrance. Its narrow single column was
not kept: see [Layout](#layout). Two more of its patterns came across in
November 2026 and went again in the redesign later that month: the
pill-on-a-rule header, replaced by the numbered header every section now
shares, and the dot band, replaced by the dot field. The light under the
pointer on project cards is adapted the same way from the Magic Card in the
same author's [magicuidesign/magicui](https://github.com/magicuidesign/magicui),
also MIT.

They were rewritten for this codebase rather than copied in. That project is built
on Next.js, Tailwind, shadcn/ui and Motion, and none of those are dependencies
here: the blur-fade is a CSS transition, the dock's magnification is `:has()`, the
accordion is `<details>`, and the pointer light is two gradients and a dozen
lines of event handler where the original animates motion values. The palette,
typeface, copy and content are this site's own.

### The redesign of November 2026

It was done in two passes. The first, on 2026-11-23, kept the dock, the
command palette, the work rows, the blur-fade and the pointer light and
recomposed the rest: the palette, the hero, the order of the sections, their
headers, the project grid and the contact panel. The second, a day later,
went further in the same direction, because the first still read as a dark
navy page with a conventional hero: the surfaces lost their blue, the
greeting became the largest thing on the page, the featured project gained
its figures and its staged picture, Skills gained its ten, and the styles of
everything below the hero moved to a stylesheet of their own. Neither pass
added a dependency.

Eight sites were looked at in a browser before the second pass, and each is
named here for an idea, not for anything copied. None of their assets,
typefaces or layouts are used.

| Site | What it does | Taken into | How, here | Left behind |
|------|--------------|------------|-----------|-------------|
| Rauno Freiberg's | The introduction sentence is the hero: set very large, lines indented against each other, one flat shape behind | The greeting | Sized to fill its column in `cqi`, light with one bold word | The horizontal card carousel, the light theme |
| Linear's | A page close to black, not blue; a medium-weight headline set tight and left; the product shot on a lit floor; small numbered upper-case labels | The palette, the featured project's picture, `.label` | Graphite surfaces, a gradient floor in the well, one label style | The marketing layout |
| Raycast's | Paired statements in two tones, a white line and a grey one; a product window with light along its top edge | The hero's statement, the contact panel's heading line | A second colour on the second sentence | The window's coloured rim |
| Maxime Heckel's | A blueprint: grid lines and coordinates as annotation | The masthead | The coordinates of Bologna, from the data the globe already uses | The 3D scene, the shader |
| Olivier Larose's | An identity statement stacked in display type, with tiny labels in the margins | The masthead's labels beside the greeting | Role at the left edge, place at the right | The display serif, the centred column |
| Emil Kowalski's | Name and role as a two-tone pair; each project a title and one sentence | Phone project cards | A card shows its title and its result first | The narrow single column, rejected here before |
| Brittany Chiang's | Upper-case spaced labels for navigation and dates; an experience entry with its dates set apart | Dates as labels in Experience and Education | `.label` on the period | The fixed sidebar |
| Vercel's Geist | Cells that share their borders; each border drawn once | The figures, the featured card's facts, the core skills | A 1px gap over a border-coloured ground for the core skills; a border on every cell but the first for the figures and the facts | Its typefaces |

Three written sources shaped particular decisions as well:

- **Linear's account of its 2026 design refresh**: supporting chrome should
  not compete for attention it has not earned, and structure should be felt
  rather than seen. Hence four text steps that are visibly apart, panels a
  small step off the page rather than a large one, and hairlines kept faint.
- **Vercel's Web Interface Guidelines**: more contrast under the pointer and
  under focus than at rest, tabular figures where numbers are compared, no
  `transition: all`, and nothing animated that does not explain a cause and
  its effect. The site held these already. The redesign broke none of them
  and took one animation out, the dot band's shimmer.
- **Alexander Horner's notes on his 2026 portfolio**: more character without
  turning playful, through asymmetry and numbered structure. Hence the
  numbered headers, the subtitle set against the right edge, and one featured
  project at full width over smaller ones.

---

## Related documents

- [Architecture](architecture.md#frontend) - component layers, prerendering and the data layer
- [Development](development.md#updating-site-content) - editing copy and content
- [Deployment](deployment.md#caching) - why `/images/*` is not cached like `/assets/*`
