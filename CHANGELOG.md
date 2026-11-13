# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

The site deploys continuously from `main`, so a version heading marks a
documented milestone rather than a build artifact. Each version is tagged
`vX.Y.Z` and published as a GitHub Release with its section below as the
notes; the tags for versions before 2.0.0 were added on 2026-11-10, on the
last commit of each version's date. Entries dated before this file existed
were reconstructed from the git history and group the work by milestone rather
than by individual commit.

## [Unreleased]

## [2.2.0] - 2026-11-13

### Added

- **Brand marks on the skill tags.** A tag that names a product now shows its
  mark before the name, 34 tags in all, from
  [Simple Icons](https://github.com/simple-icons/simple-icons) (CC0-1.0) and,
  for Mastra, OpenAI and Groq, [Lobe Icons](https://github.com/lobehub/lobe-icons)
  (MIT). They are drawn in one ink rather than brand colours, several of which
  are black and would vanish on the page. The marks ship as a single SVG
  sprite of 20.5 KB gzipped, fetched once as an image and cached like the
  rest of `/assets/`; the entry JavaScript grew by 0.5 KB and the CSS by
  0.2 KB. Neither package is a dependency: `frontend/scripts/gen-skill-icons.mjs`
  builds the sprite from `skillIcons` in `data/skills.js`, a content test
  fails when the two differ, and a browser test fails when a mark does not
  draw. Practices such as RAG have no mark, seven tools are in neither set,
  and AWS, MySQL and ASP.NET Core were tried and left as text, because each
  mark is its own name in letters too small to read.
- **A light under the pointer on project cards.** On a screen with a mouse, a
  card shows a soft cyan wash where the pointer is and a brighter arc on the
  nearest stretch of its border, adapted from the Magic Card in
  [magicuidesign/magicui](https://github.com/magicuidesign/magicui) (MIT) as
  two CSS gradients and one event listener, with no dependency. It is off on
  touch screens and absent from print.

### Fixed

- **Skill tags align on their text.** With a mark in front, a tag took its
  baseline from the mark's bottom edge, which set the tag and its group's
  name 3px below the rows beside them.

## [2.1.4] - 2026-11-12

### Changed

- **Every Markdown document was reviewed against the code.** Versions, test
  counts, size figures, commands, links and anchors were checked and
  corrected where they had drifted, and wording and formatting were made
  consistent across the README, the community files and `docs/`. Among the
  corrections: `docs/security.md` said GitHub's security features were off
  (they are on), the release process now matches how releases are cut, and
  both architecture diagrams show the browser calling Render directly.

### Fixed

- **The frontend's `engines` range matches Size Limit's.** It read
  `^22.19.0 || >=24.5.0`, which admits Node 25; Size Limit 14 requires
  `^22.19.0 || ^24.5.0 || >=26.0.0`, and the range is now exactly that.

## [2.1.3] - 2026-11-12

### Changed

- **The GitHub activity snapshot is refreshed by hand** to 2026-11-11 (1,008
  contributions), ahead of Monday's scheduled run.

### Fixed

- **The footer's source link meets the touch-target floor.** On a touch
  screen it was 22px tall, the one tappable element without the 48px
  minimum; WCAG exempts it as an inline link, but the README promises 48px.

## [2.1.2] - 2026-11-12

### Fixed

- **The MemorAIz dates now match the resume and the GitHub profile.** The
  Experience entry read "Feb 2026 - Oct 2026", running to graduation; it now
  reads "Feb 2026 - Sep 2026", the internship (Feb - Jun) plus the thesis
  collaboration that followed it.

## [2.1.1] - 2026-11-11

### Changed

- **Skills and crawler data follow the re-synced projects.** Skills adds
  FastAPI, which serves all three, and LLM Evaluation, now a project of its
  own; the `Person` JSON-LD's `knowsAbout` adds LLM Evaluation too.
- **The Projects subtitle mentions the live demos** beside the source links.

## [2.1.0] - 2026-11-11

### Added

- **Live demo links on project cards.** A card can carry `demo`, shown as
  "Live demo" beside "View source", and the command palette lists each demo
  as its own entry. The RAG, multi-agent and LLM-as-Judge cards link their
  deployments. The weekly link check now keeps a cookie jar, because
  Streamlit Community Cloud sends a client without cookies round an endless
  auth redirect, which would fail on both demos while they were up.

### Changed

- **Three project cards re-synced with their repositories,** each of which
  had grown into a deployed service. Figures come from each repository's
  README, evaluation or build-status page; test counts and coverage were
  measured from a checkout of `main`.
  - *Self-Correcting Multi-Agent RAG* (was *Self-Correcting RAG Pipeline*):
    hybrid BM25 and vector search, a tool-using agent with read-only SQL and
    private uploads; recall@5 rose from 0.967 to 0.992 over dense retrieval on
    a 60-question golden set; 341 tests (was 31). The stack drops
    sentence-transformers and FAISS, now optional, for pgvector and Next.js.
  - *Campaign Forge* (now *Multi-Agent Marketing Platform*, as its 2.0.0
    release calls it): from four agents in one pipeline to a workflow engine
    of 28 agents and 14 templates, with checkpointed, resumable runs and an
    Evaluation Lab; branch coverage is 97% (the card said 94%).
  - *LLM-as-Judge* returns, cut in July when it was a prototype: an
    evaluation platform published on PyPI, with 98% test coverage.
- **The Bachelor's thesis card is removed.** It had no repository, and its
  "~25% control-loop stability" figure could not be traced to a source, so it
  broke the rule that every figure on the page is checkable. Six cards keep
  the grid at two full rows of three.

### Security

- **`minimatch` moves to 11 under ESLint** (GHSA-g3hv-75wg-m249, moderate: a
  crafted glob pattern could expand into quadratic work). Every 10.x release is
  affected and ESLint 10.14 still requires `^10`, so Dependabot could not
  update it and `npm audit fix` would have downgraded ESLint. Both projects now
  carry an npm `overrides` entry for `minimatch` `^11.0.1` (resolving 11.0.5).
  The risk here was low, since ESLint only matches the repository's own config
  globs and the package is a development dependency, but both Dependabot alerts
  are now resolved and `npm audit` reports nothing, dev dependencies included.
  `docs/development.md` records when to remove the override.
- **The invariants test found the inline analytics script by its exact
  spelling** (CodeQL `js/bad-tag-filter`). It matched only a bare lowercase
  `<script>`, so a second inline script written `<SCRIPT>` or `<script defer>`
  would have passed it while the CSP blocked that script on the live site. It
  now finds `<script>` elements in any case and with any attributes, keeps the
  inline executable ones, and fails unless there is exactly one.

## [2.0.0] - 2026-11-10

### Added

- **Open-source repository structure.** Issue forms for a bug, an improvement
  and a documentation problem, with blank issues turned off and links that
  route security reports and personal contact elsewhere
  (`.github/ISSUE_TEMPLATE/`); a `CODEOWNERS` file; a `docs/README.md` index
  for anyone opening the folder on GitHub; and short READMEs in `frontend/` and
  `backend/` giving each project's layout and commands. Every version in this
  file is now a git tag and a GitHub Release, the older ones included.
- **Command palette** ([cmdk](https://github.com/pacocoursey/cmdk)): Ctrl/Cmd+K, or
  the Search item in the dock, jumps to a section, opens a project's repository
  or copies the email address. Searching a technology finds the project built with
  it. The entries are built from the existing data files. It is an 18 KB chunk
  fetched only on intent.
- **GitHub contribution graph**
  ([react-activity-calendar](https://github.com/grubersjoe/react-activity-calendar))
  under the project grid, loaded as it nears the viewport. It reads a committed
  snapshot rather than a live API, which was measured answering with 504s and
  taking 11 seconds, so it adds no third-party request and no CSP change.
  `scripts/fetch-github-activity.mjs` refreshes the snapshot, and the new
  `refresh-activity.yml` workflow commits the result every Monday.
- **Globe** ([cobe](https://github.com/shuding/cobe)) in the contact panel, marking
  Karachi, Bologna and Enschede. Screens of 80rem and up only; smaller screens never
  download it or create a WebGL context. Reduced motion gets a still frame.
- Together these add about 2 KB of gzipped JS to the first load. Largest Contentful
  Paint and layout shift were unchanged in before-and-after runs on throttled 4G.
  `beasties` (critical CSS) was tried and left out: First Contentful Paint improved
  by about 350 ms, but it inlined 91% of the stylesheet into the prerendered page
  and Largest Contentful Paint got about 750 ms worse.
- **Build-time prerendering.** `npm run build` now compiles a server bundle of
  the app and writes the rendered page into `dist/index.html`
  (`frontend/scripts/prerender.mjs`); `main.jsx` hydrates it. The full page is
  in the HTML response, so text paints before JavaScript runs, crawlers and
  link previews see every section, and deep links such as `/#projects` land on
  the real document height. The `noscript` fallback became redundant and went.
- **Frontend content tests** (`frontend/test/data.test.js`, 12 tests, `npm test`
  in `frontend/`, and a CI step): every About figure must appear in the entry
  that claims it, project and experience copy stays in a shared length range,
  each project card has exactly one of a repository link or a source note, links
  are absolute `https`, keys are unique, the palette's entries point somewhere
  real, the activity snapshot is a usable year of days, and no copy uses a
  character outside the font subset. The first two were comment-only conventions
  before. The font check serialises every export of every data module: a list of
  named exports once left the About "Approach" paragraphs and the globe caption
  unchecked.
- **Repository invariants** (`test/invariants.test.js` at the root, `npm run
  test:invariants`): 16 tests with no dependencies, reading source files only,
  for couplings that used to fail silently. They check that the CSP hash matches
  the inline analytics script, that `index.html` keeps the exact root element the
  prerender looks for, that the portrait preload matches the AVIF source in
  `Hero.jsx`, that the hand-kept copies of the palette (the theme-color metas,
  `404.html`, the social card script, the contact email's `BRAND`, the graph's
  scale and the globe's cyan) match the tokens, that the three last-modified
  dates agree, that the Node version is pinned the same way everywhere, that the
  contact form's fields, email pattern and honeypot match the API's, that the
  form's API origin is in the CSP and the DNS hint, that the graph and the globe
  switch at the breakpoint the calendar measures, that the data modules import
  only what a bare Node process can load, and that no file contains an em dash.
- **A build gate on Netlify.** `frontend/package.json` gains a `prebuild` script
  that runs ESLint, the content tests and the repository invariants. npm runs it
  before every `npm run build`, which is Netlify's build command, so Netlify no
  longer publishes a commit that fails any of them; the previous deploy stays
  live. Render still deploys every push. `npm run build --ignore-scripts` skips
  the gate, which CI uses because it runs the same checks as separate steps.
- **Bundle budgets** ([Size Limit](https://github.com/ai/size-limit),
  `frontend/.size-limit.json`, `npm run size --prefix frontend` after a build),
  gzipped: entry JS 87 kB (83.1 kB measured), entry CSS 8 kB (7.4 kB), the
  palette chunk 20 kB (18.5 kB), the graph's chunks 27 kB (24.7 kB) and the
  globe's 6.5 kB (5.9 kB). A static import of cobe, the smallest of the three
  lazy libraries, came in just 108 bytes over 89 kB, so the entry budget sits at
  87 kB, where pulling any of them into the first load fails. A budget changes
  in the same commit as the change that needs it, with the reason. Size Limit 14
  does not support the older Node 22 and 24 releases, so the frontend's
  `engines` is `^22.19.0 || >=24.5.0` now; the root and backend stay at
  `>=22.13.0`.
- **Browser tests** ([Playwright](https://playwright.dev/) with
  [axe-core](https://github.com/dequelabs/axe-core), `npm run test:e2e --prefix
  frontend` after a build): 20 tests in `frontend/e2e/site.spec.js` against
  `frontend/dist`, served by `e2e/serve.mjs` with the CSP from `_headers` and
  with `404.html` for unknown paths, as Netlify serves them. `vite preview`
  applies neither, so a CSP break used to show up only in production. Analytics
  and the backend are answered inside the test, so the suite never touches the
  network. It covers a clean load (no console errors, page errors or CSP
  violations, with analytics and the font loaded), every scroll reveal, no
  horizontal overflow from 320px to 1920px, no axe WCAG 2.2 A or AA violations
  at 1440px and 390px or with the palette open, the palette's shortcut, search
  and focus return, the dock's Home link, the contact form's method, live
  region, validation, success and rate-limit paths, the graph on a phone, and
  print. Chromium only. The server refuses a build made with `VITE_API_BASE_URL`
  set, since the real CSP would block the address it bakes in.
- **Backend linting**: ESLint with the recommended rules and Node globals
  (`backend/eslint.config.js`, `npm run lint` in `backend/`), at the versions the
  frontend uses. The root `npm run lint` now runs the frontend's and then the
  backend's.
- **Weekly link check** (`.github/workflows/links.yml`,
  [lychee](https://github.com/lycheeverse/lychee), configured in `lychee.toml`):
  every Monday, and on demand, it checks the links in the data files,
  `index.html`, `humans.txt`, the README, the community files, `docs/` and the
  Postman README, including relative links between files, and fails the run on a
  dead one. LinkedIn and LeetCode answer automated clients with errors and are
  excluded, as is the API. The first run, made locally, checked 163 links with
  no errors.
- Contact form: native `required`, `autocomplete` and `maxLength` matching the
  API's limits; focus moves to the first invalid field with its error linked by
  `aria-describedby`; results announce from a persistent live region; a notice
  after six seconds explains the backend's cold start; a 60-second timeout; and
  every failure message offers the email address as a fallback. Focusing the
  form sends one `no-cors` request to `/health` so the backend is waking before
  the visitor presses send.
- A direct-contact column beside the form (email, LinkedIn, GitHub, resume),
  and a link to the site's own source in the footer.
- `ExternalLink` component: every off-site link gets the same `rel` and tells
  screen-reader users it opens a new tab.
- Named landmarks: each section is `aria-labelledby` its heading.
- 320px portrait variants (`Profile-320.{avif,webp}`, 19 KB and 27 KB) served
  through `srcset`/`sizes`, with a matching `imagesrcset` preload, so phones no
  longer download the 67 KB desktop portrait for a 96px avatar.
- **An About figures band**: four figures, each naming the entry below that
  backs it. **985 tests** guard the RemindrAI service, its console and its first
  tenant; **97.5%** item-match and **99.5%** product-category accuracy come from
  Fruugle; **100K+** records moved through ETL at Jubilee Life Insurance. The
  thesis is the largest piece of work on the page, and the test figure gives it
  a number in the band a recruiter actually scans: the three repositories'
  suites as the thesis report measured them (670 + 146 + 169), re-checked
  against its final verification run of 30 September 2026, and claimed in the
  MemorAIz Experience bullets, per the rule in `about.js`. Two columns on phones,
  four from 48rem. `Vitest` joins the Web & Backend skill group for the same
  reason: testing was claimed nowhere.
- `docs/` documentation set: architecture, API reference, development, design
  system, deployment, testing and security controls.
- `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md` (Contributor Covenant 2.1) and this
  changelog.
- Postman CORS folder covering the preflight from an allowed and a disallowed
  origin, and saved response examples on the primary requests.
- `docs/development.md` gained a Dependencies section: the per-workspace update
  commands, how majors are handled given that Dependabot skips them, and why a
  lockfile-only commit is the normal fix for a transitive advisory.
- `Computer Vision` and `Robotics` join the `Person` schema's `knowsAbout`
  list, as do `Multi-Tenant Systems`, `Multi-Channel Notification Delivery` and
  `GDPR Data Protection Engineering`. Two of the six projects on the page are
  exactly computer vision and robotics, and the structured data named neither,
  so a crawler read the page as narrower than it is. Both stay out of the Skills
  section deliberately: the target roles are AI/ML, and the TIAGo and
  connecting-rod cards already carry their own stacks.

### Changed

- The three manifests move to version 2.0.0 together (the frontend's was
  Vite's default `0.0.0`, the backend's `1.0.0`), and the frontend and backend
  ones carry the same author, licence and repository fields as the root. The
  invariants test now fails if the three versions or the newest version heading
  here disagree.
- **Visual redesign on the same identity** (dark navy, cyan accent). Hanken
  Grotesk replaces NTR: NTR ships one weight, so every bold on the site was
  synthesised by the browser. Section headers are left-aligned with no gradient
  rules; cards lost their hover lift, which implied they were clickable; tags are
  neutral rather than cyan; gradient text is gone.
- **Layout redesign**, adapting the interaction patterns of
  [magicuidesign/portfolio](https://github.com/magicuidesign/portfolio)
  (MIT, Dillion Verma) in plain CSS. No dependency was added, and no copy, palette
  or typeface changed. See [Design lineage](docs/design.md#design-lineage).
  - The page fills a desktop screen. The container widens from 72rem to 92rem with
    a gutter that grows with the viewport, and past 1920px the whole page scales
    with it. No rules separate the sections.
  - Sections use that width: four figures across, story beside education, two
    columns of Experience bullets and of Skills, channels beside the contact form,
    and three columns of project cards.
  - A floating dock replaces the top navigation bar, its mobile menu and the
    back-to-top button. It magnifies on hover, carries the current section, and
    on a phone puts every section within a thumb's reach. The full name moves to a
    masthead that scrolls away.
  - Experience becomes expandable `<details>` rows, with dates beside each role
    and the latest role open, where it was three narrow columns. About's
    education uses the same row shape, and neither has a card around it.
  - The hero portrait is 320px on desktop rather than 288px, and 148px on tablets.
    A 1x screen up to 1920px now downloads the 320w image rather than the 680w one.
  - Entrance and scroll reveal blur and fade rather than rise. Projects gets a
    pill-on-a-rule header and Contact becomes one panel with its title as a pill.
    A CSS-only dot band replaces the hero's colour wash.
  - Metadata and tags move from the system monospace to Hanken Grotesk, so the
    page has one typeface. The footer drops to one line, since the links it
    carried are in the contact panel above it and the dock below it.
- Hero keeps the "hi, Waleed here." greeting and caret, now followed by what
  the work is and a single primary action (View projects).
- The Interests section is folded into About as "Roles I'm targeting". Its
  "Topics I'm Exploring" list went, since each of its five entries was already
  claimed in the hero lead or the Skills groups, and so did its generic
  principles ("clean architecture", "reproducible workflows"). The About
  "Approach" block no longer restates the section subtitle one line below it.
- Skills is a definition list rather than six cards. Twilio and Upstash QStash
  moved to Data & Messaging and Power BI to ML & Data, from Cloud & DevOps.
  ".NET ASP Core" is now "ASP.NET Core". Four tags that padded the count without
  adding a claim are gone: `VS Code`, `Jupyter`, `Git` and `HTML/CSS`. An editor
  listed as a skill makes the tags that do matter harder to find.
- In-page links (the dock, "View projects" and the skip link) go through a new
  `SectionLink` component, and the palette's "Go to" entries through the same
  scroll helper: they scroll to the section rather than leaving `#section` in
  the address bar as the old navbar did, and move keyboard focus to the section
  they jump to.
- The reading-progress bar is a CSS scroll-driven animation instead of a
  `ScrollProgress` component with a scroll listener.
- Scroll reveals only affect content below the fold, and only after hydration.
  The observer uses threshold 0; the old 0.18 ratio could never be reached by an
  element taller than the viewport.
- `ErrorBoundary` wraps each section separately and offers a page reload; its
  old "Try again" re-rendered the same failing tree.
- Printing is now one token override in `tokens.css`. Stat figures, degree names
  and role titles printed as pale grey before, and keeping each section whole left
  half of page one blank.
- The social card and 404 page use the new font and palette.
  `scripts/gen-og-card.mjs` decompresses the WOFF2 to TTF in memory first, since
  fontkit cannot apply weights to a WOFF2 (`wawoff2`, installed on demand with
  `sharp` and `fontkit`). The 404 page's "Error 404" label is in the site's
  metadata style, Hanken Grotesk with no monospace or uppercase tracking.
- `index.html`: shorter meta description, non-standard `language` and redundant
  `googlebot` tags removed, and the backend `preconnect` (a TLS handshake on
  every page view for a form most visitors never use) reduced to
  `dns-prefetch`. The inline analytics snippet is byte-identical, so its CSP
  hash is unchanged. The `WebSite` node's `publisher` points at the `Person`
  node by `@id` instead of declaring a second, anonymous `Person`.
- `vite.config.js` drops `build.target: "es2018"` for Vite's Baseline default,
  which is what the CSS already requires.
- **Graduated.** The Master's in Automation Engineering was awarded on
  5 October 2026, so the copy no longer describes it as in progress:
  - Education reads "Oct 2024 - Oct 2026" rather than "Sep 2024 - Present". The
    start month moves from September to October to match the matriculation date
    on the degree certificate (6 October 2024), which also removes a one-month
    overlap with the Jubilee role that ended in October 2024.
  - The MemorAIz role closes at "Feb 2026 - Oct 2026": the internship ended
    with the thesis.
  - The hero note says the degree is complete and that I am open to AI and ML
    engineering roles, the two families listed under "Roles I'm targeting".
    The About subtitle ends on "what I'm looking for next", since that section
    closes on the target roles.
- `sitemap.xml` `lastmod`, the `ProfilePage` `dateModified` and the `humans.txt`
  "Last update" read 2026-11-05, the last user-visible content change. They had
  fallen behind before (all three once sat at 2026-09-16, a date older than the
  site they described), and the repository invariants now fail when the three
  disagree. `humans.txt` also reported Express 4 and a July build date until the
  Express 5 upgrade, and now lists cmdk, react-activity-calendar and cobe among
  its components.
- The resume link points at a new Google Drive file, four times over since
  1.0.0. `resumeUrl` in `portfolio.js` is the single source for it, so the dock,
  the hero action, the contact column and the command palette all follow from
  one edit.
- The project grid holds six cards. A TIAGo card (autonomous mapping,
  navigation and pick-and-place) replaces the Modular AI Educational Assistant,
  and every card links its public repository or, through `sourceNote`, says why
  there is none. Cards no longer print a period.
- **Project copy re-checked against the repositories it describes**, and three
  cards corrected:
  - *Visual Inspection of Connecting Rods* described "defect classification on
    the production line", "95%+ classification accuracy" and "~80% less manual
    inspection time on the floor", with scikit-learn in the stack. The project
    is a Computer Vision course assignment: a classical OpenCV pipeline that
    measures rods from a fixed image set, with no learned model and no
    deployment. The card now says that, and the stack is Python, OpenCV,
    NumPy and SciPy.
  - *Multi-Agent AI Workflow System* is **Campaign Forge** in its repository. The
    stack listed LangGraph, which it does not use (it is built on the OpenAI SDK
    with Pydantic), and "research, copy, brief, and QA" agents where the code
    has research, copywriter, art-director and manager agents. The "cut manual
    effort by 90%" highlight appears nowhere in the repository and was replaced
    with its documented engineering (retries, validated output, 94% coverage,
    an adversarial eval corpus).
  - *Self-Correcting RAG* listed LangChain, which it does not use; the stack is
    now Python, FastAPI, sentence-transformers, FAISS and Groq, and the
    unmeasured "cutting hallucinated outputs" highlight became what the code
    guarantees.
  - *TIAGo* now says it was a team of three, as its README credits.
- **RemindrAI copy re-synced** against its repositories (`RemindrAI`,
  `remindr-dashboard`, `hfarm_new`) and then against the finished thesis report,
  and cut to the density of everything around it: its Experience bullets had run
  25 to 35 words against 15 to 22 for the other two roles. The bullets now run 19
  to 24 words, and the card has a 42-word description, a 19-word highlight and
  five stack chips. The thesis is titled *"An Embeddable, Multi-Tenant Reminder
  and Multi-Channel Communication Capability for Conversational Applications"*,
  so the card leads on **embeddability**, and its highlight states the adoption
  result rather than repeating the deployment sentence the Experience entry
  carries. New on the page, all from the report: tenancy enforced at four
  independent depths; H-FARM's Student Assistant as the first production tenant;
  the scheduler benchmark, stated as its shape (median claim latency near-flat
  from 1K to 100K due reminders) because the report says the absolute figures
  from a local database do not transfer; and identity pinning, the second of the
  two design decisions the thesis defends, which keeps a reminder's owner out of
  the model's reach. Account linking, dead-lettering and delivery-status
  reconciliation stay in the report but not on the page. The card also drops
  "My Master's thesis", which restated the role line printed directly above it,
  and the `Server Components` chip, which describes the console rather than the
  service and stays listed under Skills.
- Site copy rewritten to remove the tells of machine-written prose: the three
  em dashes and arrow glyphs are gone, and so is the sentence-fragment tic that
  negates the clause before it ("Not notebooks that only run on my machine",
  "not pitch-deck mockups"). Casual register was raised throughout, with no
  figure, date, employer or technology claim altered.
- **Contact API: a tripped honeypot answers exactly as a send does.** The honeypot
  is checked after validation rather than before, so an invalid body gets the
  same `400` with or without the trap filled, and a valid one gets the
  byte-identical `200` a real send gets. That `200` is now exactly
  `{"success": true, "message": "Message sent successfully."}`. It no longer
  carries Resend's message id, which only a real send could return, so it told
  a bot which of its submissions the trap had caught; the id is logged on the
  server instead. The router now runs the rate limiter, validation, the
  honeypot, then the send. Only response time still differs, since a real send
  waits for Resend.
- The backend suite grows from 9 to 18 tests in two files. `contact.test.js`
  blanks the three mail variables before importing the app (dotenv never
  overrides a variable that is already set), so no test can send mail even with
  a real `backend/.env`, and a valid body is now tested as far as the
  unconfigured mailer (`503`). New tests
  cover malformed JSON (`400`, costing no quota), the honeypot's identical
  answers, CORS for an allowed and a disallowed origin, and the `429` on a sixth
  request. Each test that spends quota sends its own `X-Forwarded-For`, so adding
  one never pushes another into a `429`. The new `delivery.test.js` configures
  the mailer against a fake Resend on the reserved `.invalid` domain, so the
  send path is tested for the first time: a delivered message and a tripped
  honeypot get byte-identical bodies, the `mailto:` links carry the sender's
  address encoded, and a newline in a name or subject cannot forge a line in the
  plain-text part.
- Postman requests renamed to a single convention, and the collection and
  environment descriptions brought in line with the current API. The collection
  holds 14 requests: "Empty body", which duplicated "Missing required field", is
  gone, and "Malformed JSON" is new. The honeypot request asserts the exact
  real-send body, with no `id`, and the rate-limit request sends an invalid body,
  so it can never send mail: runs one to five get a `400` and still count, and
  the sixth gets the `429`. The six requests that spend quota are ordered so
  that, on a fresh run, the first five fit in the window and the rate-limit
  request is the one that gets the `429`.
- CI runs four jobs: `frontend` (lint, content tests, repository invariants, the
  build, size budgets and the audit), a new `e2e` (the browser suite, uploading
  the Playwright report for 14 days when it fails), `backend` (lint, tests and
  the audit) and `secret-scan` (gitleaks).
- Dependencies brought up to date in both projects. Two were majors, which
  Dependabot skips by design, so each got the manual changelog read that policy
  asks for:
  - **Express 4 to 5** (`4.22.2` to `5.3.0`). Express 4 is in maintenance, and
    nothing in this codebase depended on the removed API, so the upgrade was a
    version bump rather than a migration. The full suite passed unchanged.
  - **`dotenv` 17 to 18** (`17.4.2` to `18.0.9`). v18 moves the package
    internals from `lib/` to `dist/` and drops the `./lib/env-options` and
    `./lib/cli-options` subpath exports, neither of which this repo imports.
    `config/env.js` uses only `dotenv.config({ quiet: true })`, which v18 still
    documents and which still suppresses the boot banner.
  - The rest are minor or patch: `express-rate-limit` `8.7.3` and `resend`
    `6.37.0` on the backend; `react` and `react-dom` `19.3.1`, `vite` `8.3.6`,
    `@vitejs/plugin-react` `6.2.1`, `eslint` `10.14.0`, `globals` `17.14.0` and
    `eslint-plugin-react-refresh` `0.5.7` on the frontend; and the transitive
    trees refreshed in the lockfiles.
  - **React 19.3 costs 8.6 KB of gzipped JS**: the entry chunk went from 72.4 KB
    to 81.0 KB. Building the previous commit with each bump applied alone puts
    all of it on `react-dom`, whose client build gained the release's new
    features (`<ViewTransition>`, Fragment refs, Trusted Types) whether a page
    uses them or not; Vite 8.3 is size-neutral. Pinning React back to 19.2
    recovers the 8.6 KB if leanness ever outweighs staying current.
  - `backend/package.json` is marked `private`, like the other two manifests,
    so it cannot be published by accident.
- `README.md` restructured as an entry point and documentation index, with the
  detailed reference material moved into `docs/`. It leads with the social card
  and a contents line, adds a Contact section and spells out the Dependabot
  policy (npm majors by hand, Action majors included). It also corrects the
  claim that a project card's `github` is optional: a card takes exactly one of
  `github` or `sourceNote`, and `docs/development.md`, which said the same, is
  fixed too.
- `SECURITY.md` scoped to disclosure policy, with implemented controls moved to
  `docs/security.md`.
- Both `.env.example` files rewritten as sectioned, fully annotated templates,
  each stating what breaks when a variable is missing rather than only what it
  holds. The backend template lists the built-in CORS defaults, since setting
  `ALLOWED_ORIGINS` replaces them rather than adding to them.
- Local development standardized on port 5000, which is what the README, `docs/`
  and the Postman local environment already documented.
- `dotenv.config()` runs with `{ quiet: true }`, so the banner dotenv prints by
  default no longer opens the Render deploy log ahead of the app's own lines.
- Two hard-coded colours, the faint ring round a skill tag and the backdrop
  behind the palette, are tokens now (`--color-halo`, `--color-scrim`), and the
  unused `--text-xl` is gone.
- PR template covers the changelog, the Postman collection and `docs/`.

### Removed

- **Bootstrap and PurgeCSS.** Bootstrap supplied a grid, a handful of utilities
  and a form-control style, and PurgeCSS existed only to strip the rest; the
  pair also made `NODE_ENV=production` a silent requirement of every build.
  Replaced by commented plain CSS in cascade layers (about 2,400 lines today;
  `styles/index.css` declares `reset, tokens, base, layout, components,
  utilities`), with design tokens, native nesting, `clamp()` type, logical
  properties, `color-mix()`, a container query on the contact form, and each
  component's styles beside its JSX. Gzipped CSS fell from 9.95 KB to 5.8 KB at
  the time (7.4 KB after the layout redesign), 24 packages left the frontend
  tree, and `postcss.config.js` is gone.
- Section code-splitting, `LazyMountSection`, the `requestIdleCallback`
  mount-all effect, the forced scroll-to-top on load and `useInView`. With the
  page prerendered they no longer bought anything, and the forced scroll broke
  shared links to a section. At the time, 81 KB of JS plus 9.5 KB of section
  chunks became one 81 KB bundle; the only chunks fetched later now are the
  palette, graph and globe libraries.
- Decorative icons on card headings, Skills groups and contact form labels,
  with the icon-key lookup map and the `icon` fields in `skills.js` that fed it.
  Experience and education rows open with a ringed initial (`Monogram`)
  instead.
- `frontend/public/fonts/ntr-latin-400.woff2`.

### Fixed

- **Contact form**:
  - Before hydration a submit was the browser's own `GET`, which put the
    message in the address bar, the server logs and analytics. The prerendered
    form now says `method="post"`.
  - The status live region was `display: none` while empty, which takes it out
    of the accessibility tree, and a region that reappears together with its
    text is often not announced. It now stays rendered, taking no space while
    empty.
  - While sending, the fields are read-only, since an edit made during a slow
    send was never sent and then vanished on success. The button is
    `aria-disabled` rather than `disabled`, which had dropped keyboard focus to
    the page just as the result arrived, and a second submit while busy is
    ignored.
- Printing left content the visitor had not scrolled to blank, since it was
  still waiting to reveal. It now prints in full, with transitions off.
- `Reveal` and the contribution graph read only the first entry of an
  `IntersectionObserver` batch, so a fast scroll could deliver a stale "not
  intersecting" first and leave content hidden. They now act if any entry
  intersects, and the globe reads the newest.
- The contribution graph drew one more week than it had measured for, spilling
  into the library's own sideways scroller: it now slices whole weeks ending on
  the snapshot's last day. It also re-measures on resize, so a rotated phone or
  a window dragged across 80rem gets a graph that fits.
- The dock's Home link scrolled to the hero, cutting off the masthead and dot
  band above it; it now goes to the very top of the page. On touch screens,
  where the dock steps aside while a contact field has focus, it now visibly
  slides back in; its visibility used to flip only once the slide had ended.
- The globe's WebGL check ran on every screen, so phones, where the globe is
  hidden, created a WebGL context for nothing. It now runs only when the globe
  is about to load, and releases its context straight away.
- The project cards never faded in: their own `transition` (for the hover
  ring) replaced the one Reveal's CSS gives `[data-reveal]`, so they popped in
  and their stagger never ran. The card's rule now lists the reveal's
  properties too, and a browser test checks that every revealed element still
  transitions opacity. The stagger also assumed three columns; it now follows
  the grid's column count, two from 44rem and three from 72rem.
- On Apple platforms the Search tooltip drew the Command key as U+2318, which
  the font subset does not cover. It is an icon followed by "K" now; other
  platforms still read "Ctrl K".
- The graph's "View profile" link gets the full tap-target height.
- A malformed JSON body got a generic `500`. It now gets `400` "Malformed JSON
  body.", and an unsupported charset or encoding `415`. Like the 16 KB cap, both
  are rejected by the body parser before the rate limiter, so they cost no
  quota.
- `backend/.env.example` shipped placeholder values for the three mail
  variables, and any non-empty value counts as configured, so an unedited copy
  turned the documented `503` into a `502` from a failed send, with no warning
  at boot. They are empty now, with examples in comments.
- The notification email's "Received" time was in the server's time zone,
  unlabelled. It is UTC now and says so.
- Comments that had drifted from the code: `portfolio.js` named a navbar as the
  reader of `sections`, where the dock and the palette read it; `Dock.jsx` said
  every item works before hydration, which the Search button does not;
  `Footer.jsx` said the dock repeats the email address, which it does not;
  `Projects.jsx` described the shared last row as a pair rather than a grid
  row; `LocationGlobe.jsx` misstated why the canvas is 720px, and
  `LocationGlobe.css` said the observer "never fires" for a hidden globe,
  where it reports "not intersecting";
  `config/env.js` said `ALLOWED_ORIGINS` adds a domain, where it replaces the
  defaults; and the mailer's `EmailDeliveryError` comment left out an
  unreachable Resend, which the SDK reports the same way. `CLAUDE.md`, the
  README, `docs/` and the Postman README describe the new checks and the API
  behaviour above.
- Documentation brought back in step with the code: the frontend test count (12,
  not 8), a `hooks/` folder that no longer exists, `preconnect` hints the site
  dropped, the claim that no email address is published in the UI, and the claim
  that CI protects `main`, which nothing enforces. The weekly snapshot commit is
  now documented under deployment and security.
- The focus ring set `border-radius` on focus, squaring off circular controls.
- A project highlight box stretched to the height of its row neighbour's,
  leaving a band of empty background under shorter text.
- Below 576px the hero's Bootstrap row overflowed the viewport by 12px on each
  side, masked by `overflow-x: hidden` on `body`; both are gone.
- The contact form comment cited a 5000-character cap in `validate()` that did
  not exist. The cap is now enforced with `maxLength`, matching the API.
- A non-JSON error response (a proxy page during a Render cold start) surfaced
  as a JSON parse error in the form.
- **The RemindrAI copy had the agent chatting over email.** The project card
  and an Experience bullet said it scheduled from conversation across Email,
  WhatsApp, Telegram and Discord, but email is delivery-only by design and an
  inbound email never reaches the agent; of the four, only the other three
  carry a conversation. The card now names the four channels as delivery
  targets.
- **The documented CSP hash command produced a wrong hash on Windows**, which
  is the one failure this repository is loudest about: the analytics snippet is
  pinned by SHA-256, and a bad hash blocks the script with no console error and
  no visible symptom. `.gitattributes` stores `index.html` with LF, so LF is
  what Netlify serves and what the browser hashes, but a Windows working copy
  holds CRLF and the command hashed those bytes. Following the documentation
  exactly would therefore have broken analytics silently. The command now
  normalizes line endings, and the section says to verify it reproduces the
  hash already in `_headers` before trusting it. The committed hash was correct
  throughout; only the instructions for regenerating it were wrong.
- **Three documents described a `featured` project flag** the code dropped in
  August: the README data sample set it, `docs/development.md` told you to set
  it for "the centrepiece card", and `docs/design.md` credited it with the
  gradient top rule. The README sample also carried a `period` field that
  `projects.js` no longer has and `Projects.jsx` never reads. Anyone following
  the README to add a project was copying two dead fields.
- `docs/architecture.md` omitted `SectionHeader` from the `components/ui/`
  layer, the one component every section heading renders through.
- The `404.html` style comment pointed at `.hero-cta-primary`, a class that no
  longer exists anywhere in the codebase; it now names `.btn.btn--primary`, the
  button it matches.
- Contact tests in the Postman collection report a `429` as skipped rather than
  failed, so a full-collection run no longer fails on requests whose only
  problem is that the shared 5-per-15-minute window is exhausted.
- Documented backend security headers now match what Helmet actually sends
  (`X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: no-referrer`); the stricter
  `DENY` set belongs to the Netlify site headers.
- Documented CORS behaviour corrected: a disallowed origin receives a response
  with no `Access-Control-Allow-Origin` rather than a `403`. The inaccurate
  comment in `server.js` was corrected too.

### Security

- **GitHub's own protections are on.** Private vulnerability reporting, which
  `SECURITY.md` now names as the preferred route; secret scanning with push
  protection; and Dependabot alerts and security updates, which open a pull
  request for a vulnerable transitive dependency instead of leaving the audit
  step red until someone runs `npm audit fix`.
- **The notification email's reply links could be rewritten by the sender.**
  The submitter's address went into its `mailto:` links HTML-escaped but not
  URL-encoded, and the API's email pattern admits `?`, `&` and `=`, so an
  address could add a `bcc` or replace the subject in the owner's reply draft.
  It is URL-encoded now, keeping `@` readable, and then escaped. The plain-text
  part printed the name, email and subject as given, so a newline in one could
  forge extra `Email:` or `Subject:` lines; they are flattened the way the
  headers already were.
- The error handler logged a rejected request body's whole error, to which
  body-parser attaches the raw request text: the sender's name, address and
  message. Body errors are logged by type only now.
- The CSP's `font-src` is `'self'` alone; nothing loads a `data:` font.
- Every GitHub Action in every workflow is pinned to a full commit SHA, with its
  version in a comment, so a moved tag cannot change what runs. Every checkout
  that does not push sets `persist-credentials: false`; `refresh-activity.yml`
  pushes the snapshot, so it keeps them.
- Dependabot waits seven days after a release before proposing it
  (`cooldown`), since a compromised or broken version is usually caught and
  pulled within days. Security updates are not delayed.
- High-severity `body-parser` advisory (GHSA-27r3-jxmh-p828, denial of service
  through trailing bytes after a compressed request body), reached transitively
  through `express`, and the moderate `qs` advisory (GHSA-6pq8-jhm2-2vcw). Resolved
  in the lockfile at `2.4.0` and `6.17.1`. The `body-parser` advisory is a
  production dependency, so it had failed the CI audit gate on every run since
  26 October, `main` included. The weekly Dependabot PRs could not clear it because
  they only bump what `package.json` names directly.
- **Critical `proxy-addr` advisory** (GHSA-jqcg-44mw-7w3h, IP spoofing through
  an IPv4-mapped IPv6 trust subnet), cleared by moving `express` to `5.3.0`,
  which depends on `proxy-addr` `2.0.8`. It applies directly here:
  `server.js` sets `trust proxy`, and the contact limiter keys on the
  `req.ip` that `proxy-addr` resolves. It is also a production dependency, so
  it would have failed the CI audit gate on the next run.
- `ip-address` advisories under `express-rate-limit`, resolved in the lockfile:
  high-severity SSRF and trust-boundary bypass through leading-zero octets, CIDR
  suffixes and IPv4-mapped addresses (`10.5.0`), then the moderate
  GHSA-j6r3-76f7-8jcv and GHSA-h3mg-xc3c-68pw (`10.7.3`). A production
  dependency, so the high-severity one would have failed the CI audit gate on
  the next run.
- Two transitive advisories cleared in the lockfiles alone, needing no
  `package.json` edit: `browserslist` (high, unbounded memory growth) on the
  frontend and `qs` (moderate, array-limit bypass) on the backend.
- High-severity `nanoid`, `brace-expansion` and `source-map-js` advisories in
  the frontend's dev tree, resolved in the lockfile. Dev-only, so they were not
  failing CI.

## [1.0.0] - 2026-07-15

The redesign that produced the current site.

### Added

- Honeypot field on the contact form, answered with the same `200` a real send
  returns, and logged with the sender so a false positive is recoverable.
- Single button system (`.btn-outlined` with `--accent` and `--icon`
  modifiers), replacing per-section button styles.
- Reproducible 1200x630 social card generated by `scripts/gen-og-card.mjs`.
- Postman coverage for the 16 KB body cap and the honeypot.

### Changed

- Navy palette, NTR typography and a flatter layout; every colour moved to a
  `:root` token.
- Portrait served at 2x its display slot, sized top-down from the circle rather
  than from the image.
- Images revalidate on every visit so a swapped photo is never served stale.
- Node moved to 24 after 20 reached end of life; CI reads the version from
  `.nvmrc` instead of a hardcoded number.
- Dependabot stopped ignoring GitHub Actions majors, which had left
  `checkout`/`setup-node` three majors behind.

### Fixed

- Anchor jumps land on the correct section, with smoother scrolling.
- Email template ink matched to the site background.

## [0.6.0] - 2026-06-28

### Added

- RemindrAI (MemorAIz) featured across experience, projects and skills.
- Production Postman environment and live-API test links.
- Root scripts driving both workspaces, and `node --watch` for backend dev.
- README badges.

### Changed

- Hardened `.gitignore`; stopped tracking local editor and agent settings.
- HTML-escape hardening in the email template.

## [0.5.0] - 2026-05-19

### Added

- Postman collection with a full API test suite.
- Branded 404 page and a skip-to-content link.
- Caching strategy in `_headers`, plus a kill-switch service worker to recover
  visitors left with the retired PWA worker.
- `.editorconfig`, `.npmrc`, `SECURITY.md` and `.env.example` templates.

### Changed

- Components reorganized into `layout/`, `sections/` and `ui/`, with below-fold
  sections lazily mounted.
- Node version pinned consistently across `.nvmrc`, `netlify.toml`, CI and both
  `engines` fields.
- Dropped `tsparticles` from the frontend.

## [0.4.0] - 2026-04-20

### Added

- Centralized data layer in `frontend/src/data/`, starting with experience and
  the shared portfolio constants.
- `_headers` file configuring security headers and content types on Netlify.

## [0.3.0] - 2026-03-06

### Added

- Contact-form backend: Express API with validation, rate limiting and Resend
  delivery.
- Content Security Policy and security headers, with the inline analytics
  snippet pinned by SHA-256 hash.
- Hero entrance animations in CSS, and PurgeCSS for production builds.

### Changed

- Removed `framer-motion` in favour of CSS keyframes.
- Analytics deferred to `requestIdleCallback` so it never blocks first paint.
- URLs normalized to the apex domain.

## [0.2.0] - 2025-12-26

### Added

- SEO and performance pass: meta tags, lazy loading, AVIF/WebP portrait,
  optimized assets.
- Health route with a timestamp.

### Changed

- Email handling moved to Resend, with improved error handling.

## [0.1.0] - 2025-12-05

### Added

- Initial React portfolio: hero, about, experience, projects, skills, interests
  and contact sections.
- MIT licence and first README.

[Unreleased]: https://github.com/syed-waleed-ahmed/Portfolio/compare/v2.2.0...HEAD
[2.2.0]: https://github.com/syed-waleed-ahmed/Portfolio/compare/v2.1.4...v2.2.0
[2.1.4]: https://github.com/syed-waleed-ahmed/Portfolio/compare/v2.1.3...v2.1.4
[2.1.3]: https://github.com/syed-waleed-ahmed/Portfolio/compare/v2.1.2...v2.1.3
[2.1.2]: https://github.com/syed-waleed-ahmed/Portfolio/compare/v2.1.1...v2.1.2
[2.1.1]: https://github.com/syed-waleed-ahmed/Portfolio/compare/v2.1.0...v2.1.1
[2.1.0]: https://github.com/syed-waleed-ahmed/Portfolio/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/syed-waleed-ahmed/Portfolio/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/syed-waleed-ahmed/Portfolio/compare/v0.6.0...v1.0.0
[0.6.0]: https://github.com/syed-waleed-ahmed/Portfolio/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/syed-waleed-ahmed/Portfolio/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/syed-waleed-ahmed/Portfolio/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/syed-waleed-ahmed/Portfolio/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/syed-waleed-ahmed/Portfolio/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/syed-waleed-ahmed/Portfolio/releases/tag/v0.1.0
