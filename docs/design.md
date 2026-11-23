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

One stylesheet is not in that bundle: `styles/print.css`, everything the page
changes for paper, linked on its own with `media="print"`. See [Print](#print).

### Co-located component styles

Each component imports its own stylesheet (`Hero.jsx` imports `Hero.css`), so
the styles for a piece of UI sit next to its markup and are deleted with it.
Shared primitives that several components use (`.btn`, `.tag`, `.monogram`,
`.timeline`, `.dot-field`, `.text-link`) live in `styles/components.css`
instead.

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
The hues are few on purpose: one navy for every surface, one slate for every
line, cyan for what can be acted on, and a status colour only while there is a
status to report.

| Role | Token | Value | Used for | Contrast |
|------|-------|-------|----------|----------|
| Page | `--color-bg` | `#080e1b` | The page, and anything cut into a panel: tags, form fields, contact channels, dock items, the well a project picture sits in | |
| Panel | `--color-surface` | `#121d32` | Project cards, the contact panel, the activity panel, the command palette, monograms | 1.15:1 on the page |
| Raised | `--color-surface-raised` | `#1c2b45` | A hovered dock item, a core skill, a picture's placeholder, autofilled fields | 1.19:1 on a panel |
| Floating | `--color-surface-translucent` | panel at 88% | The dock, over whatever scrolls beneath it | |
| Hairline | `--color-border` | slate at 22% | Card and panel edges, tags, separators, the rule under a section header | 1.4:1 |
| Outline | `--color-border-strong` | slate at 42% | Buttons, the dock, the palette, contact channels, the timeline rail | 2.3:1 |
| Field | `--color-border-field` | slate at 64% | Form fields | 3.2:1 on the panel, 3.7:1 on the fill |
| Heading | `--color-text-strong` | `#f8fbff` | Headings, figures, emphasis | 18.5:1, 16.2:1 |
| Body | `--color-text` | `#d7e3f2` | Body text | 14.8:1, 12.9:1 |
| Soft | `--color-text-soft` | `#bccadc` | Descriptions, long-form copy, tags | 11.5:1, 10.1:1 |
| Muted | `--color-text-muted` | `#a3b4ca` | Metadata, secondary labels | 9.1:1, 7.9:1 |
| Accent | `--color-accent` | `#65e9f5` | Links, the primary button, focus rings, the current section in the dock, the section numbers | 13.3:1, 11.6:1 |
| Accent, hovered | `--color-accent-hover` | `#9df2fa` | The same, under the pointer | |
| Accent ink | `--color-accent-ink` | `#071221` | Text on the accent | 13.0:1 on the accent |
| Partner | `--color-indigo` | `#6366f1` | Blended into cyan in the hero name and the reading-progress line, and the second light behind the page; never alone | |
| Inverse | `--color-inverse`, `--color-inverse-ink` | heading on page, swapped | Every tooltip | 18.5:1 |
| Success | `--color-success` | `#a2f2d1` | A sent message, and the availability dot in the hero | 14.8:1, 12.9:1 |
| Warning | `--color-warning` | `#ffe1a8` | A send that failed through nothing the visitor did | 15.2:1, 13.3:1 |
| Error | `--color-danger` | `#ffc0c9` | An invalid field, a message the server rejected | 12.5:1, 10.9:1 |
| Decoration | `--color-dot`, `--color-glow`, `--color-glow-indigo`, `--color-band`, `--color-scrim` | slate at 30%, accent at 9%, indigo at 16%, panel at 55%, near-black at 60% | The dot field; the two lights behind the top of the page; the lift at the top of every other section; the dimmed page behind the palette | |

Where two ratios are given, they are against the page and against a panel,
rounded down.

Each hue also has two derived steps, and they are derived the same way for
all four (accent, success, warning, danger): `-border` is the hue at 50%,
which holds at least 3.7:1 as an edge, and `-subtle` is the hue at 10%, a tint
for text of that hue to sit on (at least 8.8:1, on a panel). Until November
2026 each status colour had its own hand-picked border and tint, taken from a
different red and green than its text, at 35% and 40%. That left an invalid
field with a border of about 1.9:1, fainter than the 3.1:1 of a valid one.

### The palette of November 2026

These values date from the redesign of 2026-11-23. They began as a proposed
palette, a deeper navy with a lighter cyan and pastel status colours, whose
contrast ratios were recomputed here and found correct. Three of its values
were then changed after being looked at on the page:

- **The panel** was proposed at `#1b2940`, 1.32:1 on the page. Six large
  cards at that step read as slabs on a dashboard. At 1.15:1 a panel is still
  visible before its border is, and the page stays one navy. Before the
  redesign page and panel were 1.08:1 apart, and the hairline did all of the
  separating.
- **Soft and muted text** were proposed at 12.5:1 and 11.0:1 on the page, so
  close to body text that four steps read as two. They are 11.5:1 and 9.1:1,
  which leaves muted text at 7.97:1 on a panel, the tightest pair on the
  page.
- **The field border** went from 56% to 64%. It is translucent and the
  field's own fill runs under it, so on the contact panel, which now has a
  surface of its own, 56% measured 2.7:1 against the panel outside it.

The indigo was left alone. It is also the header of the contact email
(`BRAND.accent`), under white text, where a lighter violet would not hold.

Six rules keep it consistent:

1. **One accent.** Cyan marks what you can act on, and where you are: the
   dock's current section and the number each section opens with. Technology
   tags and metadata are deliberately neutral: a tag is information, not an
   action.
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
   muted text is 7.6:1, at the brightest point of the indigo 7.8:1, and on
   the lift 8.5:1. The two lights are centred off opposite corners, so they
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
| Outlined: `.btn--secondary`, `.btn--icon`, the contact channels | Outline border | Accent border and a 10% accent fill; the label keeps its colour | |
| Text link: `.text-link` | Accent | Accent-hover, underlined | In a status message: the message's colour, underlined |
| Dock item | Page fill, hairline, muted icon | Raised fill, heading-colour icon | Current section: accent border, tint and icon |
| Form field | Page fill, field border | Muted border | Focus: accent border and halo. Invalid: error border, at 3.3:1 |
| Project card | Panel, hairline, its picture a step dimmed in its well | The pointer's light, its picture at full strength, and a ring if it holds a link | |

The three outlined controls each had a hover of their own until November
2026: one tinted its fill, one coloured its icon, one coloured its label.

A technology tag looks the same wherever it appears: the page colour as its
fill, a hairline, soft text. Skills shows it a size larger, and draws the ten
core skills (`coreSkills` in `data/skills.js`) raised out of the panel where
every other tag is cut into it: the raised surface, an outline, and
heading-colour text at a heavier weight. That is the one variant, `.tag--core`,
and it still takes no accent. The comment beside `coreSkills` says which
project or role each one carries; there are no levels and no years.

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

Sizes are tokens (`--text-2xs` to `--text-display`). The larger steps are
`clamp()` expressions that scale between a phone and a laptop, so the component
files have almost no per-breakpoint font-size overrides. Two sizes are
written outside the scale, each as a `clamp()` of its own: the hero's
headline, which sits between `--text-title` and `--text-2xl`, and the figures
under it.

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
  `min(100% - 2 * gutter, 92rem)`, and the gutter grows with the viewport, so
  the container uses 91% of a 1440px screen and 77% of a 1920px one. A 46rem
  single column was tried first and rejected for leaving too much of a desktop
  screen empty, so wide layouts are a requirement here, not a nicety.
- **The order is the one a recruiter reads in**: the hero, Projects,
  Experience, About, Skills, Contact. `sections` in `data/portfolio.js` sets
  it for the page, the dock and the palette. About led the page until November
  2026, which put two screens of narrative between the introduction and the
  first project.
- **The hero is the first screen.** On a screen at least 64rem wide and 44rem
  tall it takes the height of the viewport: the copy in the middle of the
  space, the four figures along the bottom edge, and the dock under them. The
  figures used to open About, and on a first screen the dock floated across
  their labels. A shorter window, a tablet and a phone let the hero take its
  own height. The masthead above it carries the name, the role and, from a
  tablet up, the city. The hero opens with a status line saying which roles I
  am open to, then the greeting, the headline in the heading colour, the
  lead, the buttons and the graduation note.
- On a phone the portrait is a 4rem thumbnail beside the status line, so the
  greeting, the headline and the first button are all inside the first
  screen; it was 96px on a row of its own, which pushed the buttons to the
  bottom edge. On a tablet it is 148px beside the copy, and on a desktop 20rem
  with a second outline set off behind it, down and to the right.
- **The figures are a strip, not tiles**: each a number set large over the
  line that says what it counts and the entry that backs it, with one rule
  above the row. As four tiles on a filled band they read as a dashboard
  widget. Two across on a phone and four from 48rem, with explicit column
  counts, so a row is never left one short.
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
- Experience and Education are timelines (`.timeline`): each row opens with a
  monogram, and from 40rem a hairline joins one monogram to the next. Experience
  is a list of `<details>` rows: monogram, role and company, then dates and
  place in their own column. The most recent role starts open; the rest are a
  click away, and several can be open at once. The bullets are in the
  prerendered HTML whichever state a row is in, and the print stylesheet shows
  them all. From 64rem an open row's bullets flow in two CSS columns,
  balanced; as a two-column grid they lined up across rows, which left a gap
  under every short bullet and the fifth bullet on a row of its own.
- A role or school opens with a `.monogram`, the initial in a ringed circle. It
  holds the place a logo would, with no logo file or third-party image request.
- About sets the story beside a second column that holds education and, under
  it, the target roles, so the two columns run to about the same height;
  education alone ended half way down. The story's first paragraph is set a
  size up and in the body colour, as a lede.
- Skills is a definition list, one group per row, with two groups across from
  64rem. A tag naming a product carries its mark: see
  [Skill marks](#skill-marks). Ten tags are drawn stronger: see
  [States](#states).
- Contact is the page's largest panel, on a surface of its own: availability
  and place as its heading line, the direct channels and the globe on the left
  over the dot field, and the form on the right.

### The dock

`components/layout/Dock.jsx` is the page's navigation at every width. It replaced
a sticky top bar, the mobile menu and a floating back-to-top button, whose job the
Home item now does: it scrolls to the very top of the page, masthead included,
not just to the hero.

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
- **One ink.** Every mark is drawn in `--color-text-soft`. Brand colours were
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
order. From 64rem its picture stands beside its text instead of over it, in a
well that fills the card's left half with the page's cyan light behind; its
title is set at `--text-title`, and it shows its `role` above the title. It
takes one row of the grid and lays out its own rows.

**The other five** each span six row tracks with `grid-template-rows: subgrid`:
picture, title, description, highlight, stack and links. A two-line title on
one card therefore pushes its neighbour's description down to match, and every
band lines up across the row. They no longer print `role`: it read
"Independent Project" five times, and the section's subtitle says it once.
The field stays on every entry for the command palette's search.

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
since none is upscaled): about 170 KB for the twelve AVIF files and 211 KB for
the twelve WebP, gzipped as Size Limit counts them. The FastAPI pair was saved
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
about 665px, in the featured card and the two under it, against files that
stop at 960px or narrower: on a 2x screen those three are drawn at about 1.4 file pixels per
CSS pixel rather than 2. A wider cut of those three would fix that and
take the picture budgets with it, and has not been made. The picture row is
shared like the other five, so a card without one would show an empty band: a
content test requires
all four files and an `imageAlt` of 12 to 40 words for every project. They
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
Print leaves them alone.

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
| Hero entrance | The status line and the copy sharpen from a 6px blur and settle 6px downward, once, 40ms apart. It is never invisible: on a phone the hero's text is the Largest Contentful Paint, and Chrome does not count an element at opacity 0, so the fade from nothing it had until November 2026 held the LCP back by about 150ms on a throttled phone. The portrait, the LCP on a desktop, does not animate, so it paints as soon as it decodes |
| Greeting caret | The cursor after "hi, Waleed here." blinks; it is solid under reduced motion |
| Scroll reveal | Content that starts below the fold gets the same blur, fade and 6px settle when it enters, over 400ms. Experience rows follow each other 40ms apart, and project cards stagger 50ms along each row, by the layout `Projects.css` knows. See below |
| Reading progress | A 2px line along the top of the viewport, driven by `animation-timeline: scroll()` |
| Dock | Items magnify on hover over 220ms, with a tooltip above. On touch the dock slides away while a contact field has focus. See [The dock](#the-dock) |
| Experience rows | The row's height animates open and the chevron turns, 220ms |
| Command palette | Fades in and settles 6px, 220ms, over a fading backdrop |
| Globe | Sways slowly about its centre on `requestAnimationFrame`, in WebGL, only while on screen |
| Hover and focus | Colour and border changes, 150ms. Project cards that hold a link gain a soft ring over 220ms and do not lift, because they are not click targets |
| Pointer light | A project card under a mouse pointer shows a soft wash and a brighter border where the pointer is, fading in over 220ms. It moves only as the pointer does. See [Project cards](#project-cards-line-up-on-shared-rows) |

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
- A core skill is told apart by weight and surface as well as brightness, and
  its tag ends with a visually hidden ", core skill"
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

The browser suite runs an axe-core scan (the WCAG 2.0, 2.1 and 2.2 A and AA
rules) on the built page at desktop and phone widths, and with the command
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
by coming later. An invariant fails if an `@media print` rule turns up in any
other stylesheet, or if the link goes; Size Limit gives the file a budget of
its own.

Sections flow across pages, with only small units (the figures, a project
card, a role) kept whole. The dock, the dot field, the two lights, the
reading-progress line, the contribution graph and the globe are not printed,
the hero takes its own height, and a closed Experience row prints its bullets
anyway.

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
| `images/Profile-320.{avif,webp}` | The same crop at 320px | `sharp` resize. Phones at 3x, tablets at 2x and desktops at 1x, where the portrait renders at 320px |
| `images/Profile-192.{avif,webp}` | The same crop at 192px | `sharp` resize. Phones up to 2x (96px) and tablets at 1x (148px). Added in November 2026, when PageSpeed Insights found phones fetching the 320px file for a 168-pixel slot |

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

The redesign of 2026-11-23 kept the dock, the palette, the work rows, the
blur-fade and the pointer light, and recomposed the rest: the palette, the
hero, the order of the sections, their headers, the project grid and the
contact panel. It added no dependency. Four published sources shaped
particular decisions, and each is named here for the idea, not for anything
copied:

- **Linear's account of its 2026 design refresh**: supporting chrome should
  not compete for attention it has not earned, and structure should be felt
  rather than seen. Hence four text steps that are visibly apart, panels a
  small step off the page rather than a large one, and hairlines kept faint.
- **Vercel's Web Interface Guidelines**: more contrast under the pointer and
  under focus than at rest, tabular figures where numbers are compared, no
  `transition: all`, and nothing animated that does not explain a cause and
  its effect. The site held these already. The redesign broke none of them
  and took one animation out, the dot band's shimmer.
- **Geist's colour documentation**: draw each border once, and tell
  backgrounds apart sparingly. Hence one hairline under each section header,
  and a lift on every other section rather than a background for each.
- **Alexander Horner's notes on his 2026 portfolio**: more character without
  turning playful, through asymmetry and numbered structure. Hence the
  numbered headers, the subtitle set against the right edge, and one featured
  project at full width over smaller ones.

---

## Related documents

- [Architecture](architecture.md#frontend) - component layers, prerendering and the data layer
- [Development](development.md#updating-site-content) - editing copy and content
- [Deployment](deployment.md#caching) - why `/images/*` is not cached like `/assets/*`
