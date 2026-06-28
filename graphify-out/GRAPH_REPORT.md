# Graph Report - D:/portfolio  (2026-06-28)

## Corpus Check
- Corpus is ~12,024 words - fits in a single context window. You may not need a graph.

## Summary
- 107 nodes · 96 edges · 34 communities detected
- Extraction: 84% EXTRACTED · 16% INFERRED · 0% AMBIGUOUS · INFERRED: 15 edges (avg confidence: 0.74)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Backend & Contact API|Backend & Contact API]]
- [[_COMMUNITY_Security & Caching Infra|Security & Caching Infra]]
- [[_COMMUNITY_SEO & Document Head|SEO & Document Head]]
- [[_COMMUNITY_Author & Education|Author & Education]]
- [[_COMMUNITY_Error Boundary|Error Boundary]]
- [[_COMMUNITY_Reveal & Lazy-Mount Hooks|Reveal & Lazy-Mount Hooks]]
- [[_COMMUNITY_Branding & Icons|Branding & Icons]]
- [[_COMMUNITY_Frontend Architecture|Frontend Architecture]]
- [[_COMMUNITY_CICD & Automation|CI/CD & Automation]]
- [[_COMMUNITY_Server Lifecycle|Server Lifecycle]]
- [[_COMMUNITY_Contact Route Validation|Contact Route Validation]]
- [[_COMMUNITY_App Root|App Root]]
- [[_COMMUNITY_Footer|Footer]]
- [[_COMMUNITY_Navbar|Navbar]]
- [[_COMMUNITY_About Section|About Section]]
- [[_COMMUNITY_Contact Section|Contact Section]]
- [[_COMMUNITY_Experience Section|Experience Section]]
- [[_COMMUNITY_Hero Section|Hero Section]]
- [[_COMMUNITY_Interests Section|Interests Section]]
- [[_COMMUNITY_Projects Section|Projects Section]]
- [[_COMMUNITY_Skills Section|Skills Section]]
- [[_COMMUNITY_Scroll Progress|Scroll Progress]]
- [[_COMMUNITY_Scroll To Top|Scroll To Top]]
- [[_COMMUNITY_Skip Link|Skip Link]]
- [[_COMMUNITY_Robots & Sitemap|Robots & Sitemap]]
- [[_COMMUNITY_ESLint Config|ESLint Config]]
- [[_COMMUNITY_PostCSS Config|PostCSS Config]]
- [[_COMMUNITY_Vite Config|Vite Config]]
- [[_COMMUNITY_Service Worker|Service Worker]]
- [[_COMMUNITY_Main Entry|Main Entry]]
- [[_COMMUNITY_Experience Data|Experience Data]]
- [[_COMMUNITY_Portfolio Data|Portfolio Data]]
- [[_COMMUNITY_Projects Data|Projects Data]]
- [[_COMMUNITY_Skills Data|Skills Data]]

## God Nodes (most connected - your core abstractions)
1. `Frontend index.html` - 8 edges
2. `Syed Waleed Ahmed (AI Engineer)` - 7 edges
3. `Backend (Node.js + Express)` - 6 edges
4. `ErrorBoundary` - 5 edges
5. `Frontend (React 19 + Vite)` - 5 edges
6. `Netlify (Frontend Hosting)` - 5 edges
7. `Security Policy` - 5 edges
8. `Apple Touch Icon (Portfolio Brand Mark)` - 5 edges
9. `Portfolio README` - 4 edges
10. `Resend (Transactional Email)` - 4 edges

## Surprising Connections (you probably didn't know these)
- `humans.txt (Authorship Signal)` --conceptually_related_to--> `Frontend (React 19 + Vite)`  [INFERRED]
  frontend/public/humans.txt → README.md
- `LazyMountSection()` --calls--> `useInView()`  [INFERRED]
  D:\portfolio\frontend\src\components\ui\LazyMountSection.jsx → D:\portfolio\frontend\src\hooks\useInView.js
- `Reveal()` --calls--> `useInView()`  [INFERRED]
  D:\portfolio\frontend\src\components\ui\Reveal.jsx → D:\portfolio\frontend\src\hooks\useInView.js
- `Postman Local Environment` --references--> `Backend (Node.js + Express)`  [EXTRACTED]
  postman/README.md → README.md
- `Inline SW Cleanup Script` --conceptually_related_to--> `Kill-switch Service Worker (sw.js)`  [INFERRED]
  frontend/index.html → README.md

## Hyperedges (group relationships)
- **Contact Form Submission Pipeline** — readme_frontend, readme_contact_endpoint, readme_ratelimit, readme_resend, readme_contact_flow [EXTRACTED 0.95]
- **Stale Service Worker Recovery** — readme_sw_killswitch, index_sw_cleanup, readme_sw_rationale, readme_caching [EXTRACTED 0.90]
- **SEO & Discoverability Signals** — index_jsonld_person, index_jsonld_website, index_og_twitter, robots_txt, sitemap_xml, humans_txt [INFERRED 0.80]

## Communities

### Community 0 - "Backend & Contact API"
Cohesion: 0.18
Nodes (17): humans.txt (Authorship Signal), Portfolio-API Postman Collection, Postman Local Environment, Postman Production Environment, Postman Collection README, Backend (Node.js + Express), POST /api/contact, Contact Form Flow (+9 more)

### Community 1 - "Security & Caching Infra"
Cohesion: 0.29
Nodes (8): Inline SW Cleanup Script, Caching & Cache-Busting, Content Security Policy (Netlify _headers), Helmet Security Headers, Netlify (Frontend Hosting), Pinned Node 20 (.nvmrc/netlify.toml/engines), Kill-switch Service Worker (sw.js), Stale SW Recovery Rationale

### Community 2 - "SEO & Document Head"
Cohesion: 0.32
Nodes (8): Google Analytics (deferred gtag), Frontend index.html, JSON-LD Person Schema, JSON-LD WebSite Schema, LCP Hero Portrait Preload (AVIF), main.jsx Module Entry, Open Graph + Twitter Cards, Backend DNS-prefetch / preconnect

### Community 3 - "Author & Education"
Cohesion: 0.29
Nodes (7): Google Search Console Verification, NED University of Engineering and Technology, University of Bologna, University of Twente, Branded 404.html Page, Syed Waleed Ahmed (AI Engineer), Custom 404 Page

### Community 4 - "Error Boundary"
Cohesion: 0.33
Nodes (1): ErrorBoundary

### Community 5 - "Reveal & Lazy-Mount Hooks"
Cohesion: 0.33
Nodes (3): LazyMountSection(), Reveal(), useInView()

### Community 6 - "Branding & Icons"
Cohesion: 0.6
Nodes (6): Apple Touch Icon (Portfolio Brand Mark), Folder + Person Card Motif, Purple-Magenta Gradient Branding, 96x96 Favicon (Browser Tab Icon), Favicon SVG (Vector Brand Mark), Profile Hero Portrait

### Community 7 - "Frontend Architecture"
Cohesion: 0.4
Nodes (5): @/ Import Alias, Data-driven Architecture (src/data), Layered Component Architecture, Lean Bundle Rationale (no animation lib), useInView Hook (IntersectionObserver)

### Community 8 - "CI/CD & Automation"
Cohesion: 0.67
Nodes (3): CI/CD (GitHub Actions), Dependabot Auto-updates, gitleaks Secret Scan

### Community 9 - "Server Lifecycle"
Cohesion: 1.0
Nodes (0): 

### Community 10 - "Contact Route Validation"
Cohesion: 1.0
Nodes (0): 

### Community 11 - "App Root"
Cohesion: 1.0
Nodes (0): 

### Community 12 - "Footer"
Cohesion: 1.0
Nodes (0): 

### Community 13 - "Navbar"
Cohesion: 1.0
Nodes (0): 

### Community 14 - "About Section"
Cohesion: 1.0
Nodes (0): 

### Community 15 - "Contact Section"
Cohesion: 1.0
Nodes (0): 

### Community 16 - "Experience Section"
Cohesion: 1.0
Nodes (0): 

### Community 17 - "Hero Section"
Cohesion: 1.0
Nodes (0): 

### Community 18 - "Interests Section"
Cohesion: 1.0
Nodes (0): 

### Community 19 - "Projects Section"
Cohesion: 1.0
Nodes (0): 

### Community 20 - "Skills Section"
Cohesion: 1.0
Nodes (0): 

### Community 21 - "Scroll Progress"
Cohesion: 1.0
Nodes (0): 

### Community 22 - "Scroll To Top"
Cohesion: 1.0
Nodes (0): 

### Community 23 - "Skip Link"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "Robots & Sitemap"
Cohesion: 1.0
Nodes (1): sitemap.xml

### Community 25 - "ESLint Config"
Cohesion: 1.0
Nodes (0): 

### Community 26 - "PostCSS Config"
Cohesion: 1.0
Nodes (0): 

### Community 27 - "Vite Config"
Cohesion: 1.0
Nodes (0): 

### Community 28 - "Service Worker"
Cohesion: 1.0
Nodes (0): 

### Community 29 - "Main Entry"
Cohesion: 1.0
Nodes (0): 

### Community 30 - "Experience Data"
Cohesion: 1.0
Nodes (0): 

### Community 31 - "Portfolio Data"
Cohesion: 1.0
Nodes (0): 

### Community 32 - "Projects Data"
Cohesion: 1.0
Nodes (0): 

### Community 33 - "Skills Data"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **17 isolated node(s):** `Data-driven Architecture (src/data)`, `@/ Import Alias`, `gitleaks Secret Scan`, `Dependabot Auto-updates`, `Render (Backend Hosting)` (+12 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Server Lifecycle`** (2 nodes): `server.js`, `shutdown()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Contact Route Validation`** (2 nodes): `escapeHtml()`, `contactRoutes.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `App Root`** (2 nodes): `App()`, `App.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Footer`** (2 nodes): `Footer.jsx`, `Footer()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Navbar`** (2 nodes): `Navbar.jsx`, `Navbar()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `About Section`** (2 nodes): `About()`, `About.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Contact Section`** (2 nodes): `Contact()`, `Contact.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Experience Section`** (2 nodes): `Experience.jsx`, `Experience()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Hero Section`** (2 nodes): `Hero.jsx`, `Hero()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Interests Section`** (2 nodes): `Interests.jsx`, `Interests()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Projects Section`** (2 nodes): `Projects.jsx`, `Projects()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Skills Section`** (2 nodes): `Skills.jsx`, `Skills()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Scroll Progress`** (2 nodes): `ScrollProgress.jsx`, `ScrollProgress()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Scroll To Top`** (2 nodes): `ScrollToTop.jsx`, `ScrollToTop()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Skip Link`** (2 nodes): `SkipLink.jsx`, `SkipLink()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Robots & Sitemap`** (2 nodes): `robots.txt`, `sitemap.xml`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `ESLint Config`** (1 nodes): `eslint.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `PostCSS Config`** (1 nodes): `postcss.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Vite Config`** (1 nodes): `vite.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Service Worker`** (1 nodes): `sw.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Main Entry`** (1 nodes): `main.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Experience Data`** (1 nodes): `experience.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Portfolio Data`** (1 nodes): `portfolio.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Projects Data`** (1 nodes): `projects.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Skills Data`** (1 nodes): `skills.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Frontend (React 19 + Vite)` connect `Backend & Contact API` to `Security & Caching Infra`, `Frontend Architecture`?**
  _High betweenness centrality (0.074) - this node is a cross-community bridge._
- **Why does `Syed Waleed Ahmed (AI Engineer)` connect `Author & Education` to `Backend & Contact API`, `SEO & Document Head`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Why does `Frontend index.html` connect `SEO & Document Head` to `Security & Caching Infra`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `Syed Waleed Ahmed (AI Engineer)` (e.g. with `Branded 404.html Page` and `Google Search Console Verification`) actually correct?**
  _`Syed Waleed Ahmed (AI Engineer)` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Data-driven Architecture (src/data)`, `@/ Import Alias`, `gitleaks Secret Scan` to the rest of the system?**
  _17 weakly-connected nodes found - possible documentation gaps or missing edges._