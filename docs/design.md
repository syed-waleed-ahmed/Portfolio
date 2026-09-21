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
| `components` | `styles/components.css` and the `.css` beside each component | Buttons, cards, tags, links, reveal, and each section's own styles |
| `utilities` | `styles/utilities.css` | `.visually-hidden` |

A later layer beats an earlier one whatever the selector specificity, so a
component rule overrides a base rule without `!important` or a longer
selector. Nothing is unlayered. `main.jsx` imports `index.css` before `App`,
which is what puts the layer statement ahead of every component stylesheet in
the bundle.

### Co-located component styles

Each component imports its own stylesheet (`Hero.jsx` imports `Hero.css`), so
the styles for a piece of UI sit next to its markup and are deleted with it.
Shared primitives that several components use (`.btn`, `.card`, `.tag`,
`.text-link`) live in `styles/components.css` instead.

Class names follow a light BEM shape: `.project-card`, `.project-card__title`,
`.btn--primary`. State lives in attributes rather than extra classes:
`[aria-current]`, `[aria-invalid]`, `[data-visible]`, `[data-menu-open]`,
`[data-reveal]`. That keeps the CSS selecting on the same thing assistive
technology reads.

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
| `:has()` | Project card hover | Only cards that contain a link react to hover |
| Scroll-driven animation | Reading-progress line in the header | No JavaScript; unsupported browsers just omit the line |
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
| `--color-surface` | `#111a2d` | Cards, the stats band, form panel |
| `--color-surface-raised` | `#17223a` | The floating back-to-top button |
| `--color-border` / `--color-border-strong` | slate at 14% / 28% | Hairlines, control outlines |
| `--color-text-strong` | `#f5f7fb` | Headings, emphasis |
| `--color-text` | `#dce3ec` | Body text |
| `--color-text-soft` | `#b7c2d0` | Descriptions, long-form copy |
| `--color-text-muted` | `#8c99ad` | Metadata, secondary labels |
| `--color-accent` | `#22d3ee` | Links, primary buttons, focus rings, small labels |
| `--color-indigo` | `#6366f1` | Atmosphere and the hero name: hero wash, the name's gradient, reading-progress line |

Three rules keep it consistent:

1. **One accent.** Cyan marks what you can act on, plus the small monospace
   labels. Technology tags are deliberately neutral: a tag is information, not
   an action.
2. **Every text colour passes WCAG AA** on `--color-surface`, including
   `--color-text-muted` at about 6:1. Check contrast before adding a new text
   token.
3. **Four places inline the palette by hand** and cannot read the tokens, so
   they need updating in step:
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

**Monospace** labels (project context, dates, technology tags) use the system stack
(`ui-monospace`, SF Mono, Cascadia Mono, Consolas and so on), which costs no
download.

### Metric-matched fallback

A second `@font-face`, `Hanken Grotesk Fallback`, points at local Arial with
`ascent-override: 100%`, `descent-override: 30.3%` and `line-gap-override: 0%`,
so the text that paints before the web font arrives occupies the same space
and nothing reflows on swap. Hanken Grotesk's average advance width is within
1% of Arial's, so no `size-adjust` is needed. The values come from the font's
own `hhea` metrics (ascent 1000, descent 303 on a 1000-unit em). If the typeface
changes, recompute them rather than copying these.

### Scale

Sizes are tokens (`--text-xs` to `--text-display`). The larger steps are
`clamp()` expressions that scale between a phone and a laptop, so there are no
per-breakpoint font-size overrides anywhere in the component files.

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
| `.btn--sm` | Compact size for the header |

`.text-link` is the inline link style: accent colour, underline on hover.

Every interactive control is at least `--tap-target` tall: 44px, rising to 48px
under `@media (pointer: coarse)`. The token is keyed to the input device
rather than a width breakpoint. The one exception is `.btn--sm` in the desktop
header, which is 36px on fine pointers (above the 24px WCAG 2.2 minimum) and
48px on touch.

Off-site links render through `components/ui/ExternalLink.jsx`, which sets
`target="_blank" rel="noopener noreferrer"` and tells screen-reader users the
link opens a new tab.

Links to a part of the page (the navbar, the name, "View projects", the skip
link) render through `components/ui/SectionLink.jsx`. It scrolls to the target
without writing `#section` into the address bar, clears any hash already
there, and moves focus to the target so the next Tab continues inside it.
Targets are `<main>` and the page sections, which carry `tabIndex={-1}` for
that reason; `[tabindex="-1"]:focus` draws no outline around them. It is still
a real `href="#id"` link, so it works before hydration and with modifier-key
clicks. The sticky header's hairline is an inset shadow rather than a border so
the header is exactly `--header-height` tall, which is the offset
`scroll-padding` applies to every jump.

---

## Layout

- `.container` is `min(100% - 2 * gutter, 72rem)`, with a fluid gutter.
- `.section` carries the vertical rhythm (`--section-space`, fluid) and a
  hairline between consecutive sections.
- Section headers are left-aligned, like the content under them, with no icon
  badges or decorative rules.
- Experience is a CV-style list: dates and place in a narrow column, the role
  in a readable measure beside it.
- Skills is a definition list, one group per row.

### Project cards line up on shared rows

`.project-grid` is a two-column grid on wider screens, and each card spans six
row tracks with `grid-template-rows: subgrid`: context, title, description,
highlight, stack and links. A two-line title on one card therefore pushes its
neighbour's description down to match, and every band lines up across the row.

Three details are load-bearing:

1. **`Reveal` renders the card itself** (`<Reveal as="li" className="project-card">`),
   so the card is a direct child of the grid. Subgrid only inherits tracks from
   a direct parent; a wrapper element between them breaks it.
2. **The highlight box and tag list use `align-self: start`.** The row is sized
   to the tallest highlight in the grid row, and a stretched box showed a band
   of empty background under the shorter one.
3. **Every card fills the last row.** It holds `github` as a "View source" link
   or, where there is no public repository, `sourceNote` as a muted monospace
   line. The row is shared across the pair, so a card holding neither ended with
   61px of blank surface its neighbour did not have (measured at 1280px before
   the fix). A card carries one field or the other, never both.

Without subgrid support the cards fall back to ordinary columns: content still
reads top to bottom, it just stops lining up. That fallback is why the layout
carries no fixed heights.

---

## Motion

Motion is limited to things that help orientation, and all of it is CSS
transitions or keyframes. There is no animation library.

| Motion | Detail |
|--------|--------|
| Hero entrance | The text block rises 10px and fades in once, staggered by 40ms. The portrait does not animate, so the LCP image paints as soon as it decodes |
| Greeting caret | The cursor after "hi, Waleed here." blinks; it is solid under reduced motion |
| Scroll reveal | Content that starts below the fold fades up 12px when it enters. See below |
| Reading progress | A 2px line under the header, driven by `animation-timeline: scroll()` |
| Hover and focus | Colour and border changes, 150ms. Cards do not lift, because they are not click targets |

`Reveal` only ever hides content that is below the viewport **after**
hydration, by writing `data-reveal="pending"` to the node. The prerendered HTML
is therefore always fully visible, nothing above the fold flickers, and a
visitor without JavaScript sees everything. It uses an `IntersectionObserver`
with threshold 0, because a ratio threshold can never be reached by an element
taller than the viewport.

Under `prefers-reduced-motion: reduce` the duration tokens drop to 0, a global
rule shortens any remaining animation to effectively nothing, smooth scrolling
is turned off, and `Reveal` skips hiding content entirely.

---

## Accessibility

- Skip link as the first focusable element, moving focus to `<main>`
- One visible `:focus-visible` treatment site-wide, following each control's
  own shape; form fields use a border-and-halo variant
- Every section is a named landmark (`aria-labelledby` its heading), with one
  `<h1>` and a strict heading order
- Navbar: current section marked with `aria-current`; the mobile menu is a
  disclosure button with `aria-expanded`, closes on Escape (returning focus to
  the toggle), on an outside click, and on widening to desktop
- Contact form: native `required`, `autocomplete`, `maxLength` matching the API;
  on a failed submit focus moves to the first invalid field, whose error is
  linked with `aria-describedby` and flagged with `aria-invalid`; the result is
  announced from an always-present `aria-live` region
- The back-to-top button is `inert` while hidden, so it cannot be tabbed to
- The honeypot input is off-screen rather than `display: none`, out of the tab
  order and hidden from assistive technology
- Tap targets and reduced motion as described above

The built page passes an axe-core scan (WCAG 2.2 A/AA plus best practices) at
desktop and phone widths with no violations.

---

## Generated assets

Several binaries in `public/` are generated rather than hand-drawn, so they
need regenerating rather than editing:

| Asset | Source | How |
|-------|--------|-----|
| `images/og-card.png` | `images/Profile.avif` + the font | `scripts/gen-og-card.mjs` |
| `favicon.ico`, `favicon-96x96.png`, `apple-touch-icon.png` | `favicon.svg`, the hand-drawn crewmate | Rasterised from the SVG; the touch icon bakes in the previous navy `#0a192f`, visually indistinguishable from `--color-bg` |
| `images/Profile.{avif,webp}` | 680x680, square-cropped from the original photo | Re-crop from the original if the photo changes |
| `images/Profile-320.{avif,webp}` | Downscaled from `Profile.avif` for phones, where the portrait renders at 88px | `sharp` resize, then keep `sizes` in `Hero.jsx` and the preload in `index.html` in step |

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

---

## Related documents

- [Architecture](architecture.md#frontend) - component layers, prerendering and the data layer
- [Development](development.md#updating-site-content) - editing copy and content
- [Deployment](deployment.md#caching) - why `/images/*` is not cached like `/assets/*`
