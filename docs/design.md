# Design System

The visual language of the site, how the CSS is organised, and the handful of
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

Every colour is a custom property in `src/styles/tokens.css`. The site is
dark-only by design.

| Token | Value | Use |
|-------|-------|-----|
| `--color-bg` | `#0b1221` | Page background |
| `--color-surface` | `#111a2d` | Project cards, the stats band, the activity panel, the command palette, the dock, monograms |
| `--color-surface-raised` | `#17223a` | Dock item hover, the portrait's ring |
| `--color-border` / `--color-border-strong` | slate at 14% / 28% | Hairlines, control outlines |
| `--color-text-strong` | `#f5f7fb` | Headings, emphasis |
| `--color-text` | `#dce3ec` | Body text |
| `--color-text-soft` | `#b7c2d0` | Descriptions, long-form copy |
| `--color-text-muted` | `#8c99ad` | Metadata, secondary labels |
| `--color-accent` | `#22d3ee` | Links, primary buttons, focus rings, the current section in the dock |
| `--color-indigo` | `#6366f1` | The hero name's gradient and the reading-progress line |
| `--color-dot` | slate at 13% | The squares of the dot band; decorative only |

Three rules keep it consistent:

1. **One accent.** Cyan marks what you can act on, and where you are in the
   dock. Technology tags and metadata are deliberately neutral: a tag is
   information, not an action.
2. **Every text colour passes WCAG AA** on `--color-surface`, including
   `--color-text-muted` at about 6:1. Check contrast before adding a new text
   token.
3. **Five places inline the palette by hand** and cannot read the tokens, so
   they need updating in step:
   - `GitHubActivityCalendar.jsx`, whose library takes literal colours: the
     accent mixed into `--color-surface` at 25, 50, 75 and 100%
   - `LocationGlobe.jsx`, whose WebGL colours are RGB fractions of the accent
   - `frontend/public/404.html`, a standalone page with no bundled CSS
   - `<meta name="theme-color">` in both `index.html` and `404.html`
   - `scripts/gen-og-card.mjs`, which bakes the palette into the social card

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

A second `@font-face`, `Hanken Grotesk Fallback`, points at local Arial with
`ascent-override: 100%`, `descent-override: 30.3%` and `line-gap-override: 0%`,
so the text that paints before the web font arrives occupies the same space
and nothing reflows on swap. Hanken Grotesk's average advance width is within
1% of Arial's, so no `size-adjust` is needed. The values come from the font's
own `hhea` metrics (ascent 1000, descent 303 on a 1000-unit em). If the typeface
changes, recompute them rather than copying these.

### Scale

Sizes are tokens (`--text-2xs` to `--text-display`). The larger steps are
`clamp()` expressions that scale between a phone and a laptop, so the component
files have almost no per-breakpoint font-size overrides. The one exception is the
contact panel's invitation, which takes `--text-title` once it has a column of its
own.

The font subset covers Latin-1 plus general punctuation. A character outside
it (an arrow, for example) renders in a fallback face, so `test/data.test.js`
fails if any copy in `src/data/` uses one. Icons come from `react-icons`
instead.

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

Every interactive control is at least `--tap-target` tall: 44px, rising to 48px
under `@media (pointer: coarse)`. The token is keyed to the input device
rather than a width breakpoint. Two exceptions, both above the 24px WCAG 2.2
minimum: `.btn--sm`, which is 36px on fine pointers and 48px on touch, and the
dock's items, which are 40px on fine pointers and 48px tall on touch. On a 320px
phone a dock item gives up width first, down to 39px wide, so all seven still fit.

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
  64rem.

### The dock

`components/layout/Dock.jsx` is the page's navigation at every width. It replaced
a sticky top bar, the mobile menu and a floating back-to-top button, whose job the
Home item now does.

- Items are real links with accessible names, in the prerendered HTML, so they
  work before hydration. LinkedIn and GitHub drop out below 36rem: the hero and
  contact panel both carry them, and seven items is what fits a phone.
- Hover magnifies with `--dock-size`: the hovered item grows to 56px and its
  neighbours to 48px, reaching across the divider. Items are bottom-aligned, so
  they grow out of the top of the bar, which keeps its height. This is pointer-only
  and off under reduced motion.
- On touch, focusing a contact field hides the dock so it cannot sit over the
  field being typed in.
- The Search item after the divider opens the command palette. It drops out below
  36rem with LinkedIn and GitHub, but stays mounted, so Ctrl/Cmd+K still works.
- The masthead above the hero exists because the greeting uses the first name
  only, and the full name still has to be on the first screen.

### Command palette

`components/ui/CommandPalette.jsx` is `cmdk` inside a native modal `<dialog>`,
which supplies the top layer, the inert background, focus containment and Escape.
Its entries are in `data/commands.js`, built from the other data modules, so a new
section, project or skill reaches the palette without being listed twice.

Two details are load-bearing:

1. **Search uses `scoreCommand`, not `cmdk`'s default.** The default fuzzy score
   matches letters in sequence across an entry's keywords. Over the Skills entry's
   long list that matched nearly anything, so "copy email" selected Skills and
   Enter went there. `scoreCommand` needs every word to appear, and `test/data.test.js`
   holds it to that.
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
nesting a sideways scroller in the page. `GitHubActivity.css` reserves the exact
height of each size so nothing below moves when the chunk arrives.

### The globe

`LocationGlobe.jsx` rises from the bottom of the contact panel's left column, on
screens of 80rem and up only, marking the three places in `education`. It sways
rather than spins, because a full turn would hide all three for half of every
rotation, and it draws only while on screen. It is decorative, so the canvas is
hidden from assistive technology and its caption says the same thing in words.
Without WebGL it stays hidden. Below 80rem it is `display: none`, so its observer
never fires and `cobe` is never downloaded.

### Project cards line up on shared rows

`.project-grid` is two columns on tablets and three on desktops, and each card
spans six row tracks with `grid-template-rows: subgrid`: context, title,
description, highlight, stack and links. A two-line title on one card therefore
pushes its neighbour's description down to match, and every band lines up across
the row.

Three details are load-bearing:

1. **`Reveal` renders the card itself** (`<Reveal as="li" className="project-card">`),
   so the card is a direct child of the grid. Subgrid only inherits tracks from
   a direct parent; a wrapper element between them breaks it.
2. **The highlight box and tag list use `align-self: start`.** The row is sized
   to the tallest highlight in the grid row, and a stretched box showed a band
   of empty background under the shorter one.
3. **Every card fills the last row.** It holds `github` as a "View source" link
   or, where there is no public repository, `sourceNote` as a muted
   line. The row is shared across the cards, so a card holding neither ended with
   61px of blank surface its neighbour did not have (measured at 1280px before
   the fix). A card carries one field or the other, never both.

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
| Hero entrance | The copy blurs and fades in once, settling 6px downward, 40ms apart. The portrait does not animate, so the LCP image paints as soon as it decodes |
| Greeting caret | The cursor after "hi, Waleed here." blinks; it is solid under reduced motion |
| Scroll reveal | Content that starts below the fold gets the same blur, fade and 6px settle when it enters. See below |
| Reading progress | A 2px line along the top of the viewport, driven by `animation-timeline: scroll()` |
| Dock | Items magnify on hover over 220ms, with a tooltip above. See [The dock](#the-dock) |
| Experience rows | The row's height animates open and the chevron turns, 220ms |
| Dot band | Two layers of squares shimmer on 5s and 7s cycles, opacity only |
| Command palette | Fades in and settles 6px, 220ms, over a fading backdrop |
| Globe | Sways slowly about its centre on `requestAnimationFrame`, in WebGL, only while on screen |
| Hover and focus | Colour and border changes, 150ms. Project cards gain a soft ring and do not lift, because they are not click targets |

`Reveal` only ever hides content that is below the viewport **after**
hydration, by writing `data-reveal="pending"` to the node. The prerendered HTML
is therefore always fully visible, nothing above the fold flickers, and a
visitor without JavaScript sees everything. It uses an `IntersectionObserver`
with threshold 0, because a ratio threshold can never be reached by an element
taller than the viewport.

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
  linked with `aria-describedby` and flagged with `aria-invalid`; the result is
  announced from an always-present `aria-live` region
- The honeypot input is off-screen rather than `display: none`, out of the tab
  order and hidden from assistive technology
- Tap targets and reduced motion as described above

The built page passes an axe-core scan (WCAG 2.2 A/AA plus best practices) at
desktop and phone widths, and with the command palette open, with no violations.

---

## Print

Every component reads the colour tokens, so printing is one block in `tokens.css`
that swaps them for ink on white, rather than a colour override per component.
Sections flow across pages, with only small units (a stat band, a project card, a
role) kept whole. The dock, the dot band, the reading-progress line, the
contribution graph and the globe are not printed, and a closed Experience row
prints its bullets anyway.

---

## Generated assets

Several binaries in `public/` are generated rather than hand-drawn, so they
need regenerating rather than editing:

| Asset | Source | How |
|-------|--------|-----|
| `images/og-card.png` | `images/Profile.avif` + the font | `scripts/gen-og-card.mjs` |
| `favicon.ico`, `favicon-96x96.png`, `apple-touch-icon.png` | `favicon.svg`, the hand-drawn crewmate | Rasterised from the SVG; the touch icon bakes in the previous navy `#0a192f`, visually indistinguishable from `--color-bg` |
| `images/Profile.{avif,webp}` | 680x680, square-cropped from the original photo | Re-crop from the original if the photo changes |
| `images/Profile-320.{avif,webp}` | Downscaled from `Profile.avif`. Phones and tablets, where the portrait renders at 96px and 148px, and desktops at 1x, where it renders at 320px | `sharp` resize, then keep `sizes` in `Hero.jsx` and the preload in `index.html` in step |

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
band. Its narrow single column was not kept: see [Layout](#layout).

They were rewritten for this codebase rather than copied in. That project is built
on Next.js, Tailwind, shadcn/ui and Motion, and none of those are dependencies
here: the blur-fade is a CSS transition, the dock's magnification is `:has()`, the
accordion is `<details>`, and the dot band is CSS gradients where the original
draws to a canvas. The palette, typeface, copy and content are this site's own.

---

## Related documents

- [Architecture](architecture.md#frontend) - component layers, prerendering and the data layer
- [Development](development.md#updating-site-content) - editing copy and content
- [Deployment](deployment.md#caching) - why `/images/*` is not cached like `/assets/*`
