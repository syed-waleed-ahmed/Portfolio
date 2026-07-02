# Graph Report - .  (2026-07-02)

## Corpus Check
- Corpus is ~24,095 words - fits in a single context window. You may not need a graph.

## Summary
- 120 nodes · 100 edges · 41 communities detected
- Extraction: 82% EXTRACTED · 18% INFERRED · 0% AMBIGUOUS · INFERRED: 18 edges (avg confidence: 0.75)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Frontend Shell, SEO & CICD|Frontend Shell, SEO & CI/CD]]
- [[_COMMUNITY_Backend Security & Contact Flow|Backend Security & Contact Flow]]
- [[_COMMUNITY_Mailer Service Internals|Mailer Service Internals]]
- [[_COMMUNITY_API Testing & Security Policy|API Testing & Security Policy]]
- [[_COMMUNITY_Frontend Architecture & Rationale|Frontend Architecture & Rationale]]
- [[_COMMUNITY_Error Boundary|Error Boundary]]
- [[_COMMUNITY_Scroll-Reveal & Lazy Mount|Scroll-Reveal & Lazy Mount]]
- [[_COMMUNITY_Branding & Icons|Branding & Icons]]
- [[_COMMUNITY_Env Config|Env Config]]
- [[_COMMUNITY_Express Server|Express Server]]
- [[_COMMUNITY_Contact Routes|Contact Routes]]
- [[_COMMUNITY_App Root|App Root]]
- [[_COMMUNITY_Footer|Footer]]
- [[_COMMUNITY_Navbar|Navbar]]
- [[_COMMUNITY_About Section|About Section]]
- [[_COMMUNITY_Contact Section & API|Contact Section & API]]
- [[_COMMUNITY_Experience Section|Experience Section]]
- [[_COMMUNITY_Hero Section|Hero Section]]
- [[_COMMUNITY_Skills Section|Skills Section]]
- [[_COMMUNITY_Scroll Progress|Scroll Progress]]
- [[_COMMUNITY_Scroll To Top|Scroll To Top]]
- [[_COMMUNITY_Skip Link|Skip Link]]
- [[_COMMUNITY_AIML Career Focus|AI/ML Career Focus]]
- [[_COMMUNITY_Robots & Sitemap|Robots & Sitemap]]
- [[_COMMUNITY_ESLint Config|ESLint Config]]
- [[_COMMUNITY_PostCSS Config|PostCSS Config]]
- [[_COMMUNITY_Vite Config|Vite Config]]
- [[_COMMUNITY_Service Worker Kill-Switch|Service Worker Kill-Switch]]
- [[_COMMUNITY_App Entry|App Entry]]
- [[_COMMUNITY_Projects Section|Projects Section]]
- [[_COMMUNITY_Experience Data|Experience Data]]
- [[_COMMUNITY_Portfolio Data|Portfolio Data]]
- [[_COMMUNITY_Projects Data|Projects Data]]
- [[_COMMUNITY_XGBoost|XGBoost]]
- [[_COMMUNITY_React|React]]
- [[_COMMUNITY_.NET ASP Core|.NET ASP Core]]
- [[_COMMUNITY_MySQL|MySQL]]
- [[_COMMUNITY_Power BI|Power BI]]
- [[_COMMUNITY_RAG|RAG]]
- [[_COMMUNITY_Branded 404 Page|Branded 404 Page]]
- [[_COMMUNITY_Search Console Verification|Search Console Verification]]

## God Nodes (most connected - your core abstractions)
1. `Frontend HTML Shell` - 8 edges
2. `Portfolio Project` - 6 edges
3. `ErrorBoundary` - 5 edges
4. `Apple Touch Icon (Portfolio Brand Mark)` - 5 edges
5. `React 19 + Vite Frontend` - 5 edges
6. `mailerService (Resend Delivery)` - 5 edges
7. `sendContactEmail()` - 4 edges
8. `renderContactEmail()` - 4 edges
9. `Folder + Person Card Motif` - 4 edges
10. `Layered Backend Structure (config/routes/services)` - 4 edges

## Surprising Connections (you probably didn't know these)
- `LCP Hero Portrait Preload` --semantically_similar_to--> `Rationale: Lean Bundle (No Animation Lib/PWA)`  [INFERRED] [semantically similar]
  frontend/index.html → README.md
- `LazyMountSection()` --calls--> `useInView()`  [INFERRED]
  D:\portfolio\frontend\src\components\ui\LazyMountSection.jsx → frontend\src\hooks\useInView.js
- `Reveal()` --calls--> `useInView()`  [INFERRED]
  D:\portfolio\frontend\src\components\ui\Reveal.jsx → frontend\src\hooks\useInView.js
- `Portfolio Project` --references--> `Frontend HTML Shell`  [INFERRED]
  README.md → frontend/index.html
- `SEO Meta Tags (OG/Twitter/canonical)` --conceptually_related_to--> `Portfolio Project`  [INFERRED]
  frontend/index.html → README.md

## Hyperedges (group relationships)
- **Contact Form Request Pipeline** — readme_contact_routes, readme_mailer_service, readme_resend_email, readme_rate_limit [EXTRACTED 0.95]
- **Backend Security Hardening Stack** — readme_helmet_headers, readme_rate_limit, readme_email_header_injection_guard, readme_csp [INFERRED 0.85]
- **SEO & Structured Data Layer** — index_seo_meta, index_jsonld_person, index_jsonld_website [INFERRED 0.85]

## Communities

### Community 0 - "Frontend Shell, SEO & CI/CD"
Cohesion: 0.19
Nodes (14): Backend DNS-Prefetch / Preconnect Hint, Deferred Google Analytics, Frontend HTML Shell, JSON-LD Person Schema, JSON-LD WebSite Schema, SEO Meta Tags (OG/Twitter/canonical), Caching & Cache-Busting Rules, GitHub Actions CI/CD (+6 more)

### Community 1 - "Backend Security & Contact Flow"
Cohesion: 0.23
Nodes (12): config/ Env Parsing Layer, Contact Form Flow, contactRoutes (Validation + Rate Limit), Content Security Policy, Email Header-Injection Guard, Helmet Security Headers, Layered Backend Structure (config/routes/services), mailerService (Resend Delivery) (+4 more)

### Community 2 - "Mailer Service Internals"
Cohesion: 0.27
Nodes (8): detailRow(), EmailDeliveryError, escapeHtml(), MailerNotConfiguredError, renderContactEmail(), renderContactText(), sanitizeHeader(), sendContactEmail()

### Community 3 - "API Testing & Security Policy"
Cohesion: 0.25
Nodes (8): Portfolio-API Postman Collection, Postman Local Environment, Postman Production Environment, Postman Collection README, Render Backend (portfolio-backend-kmum), Responsible Disclosure Process, Security Policy, Safe-harbor Terms

### Community 4 - "Frontend Architecture & Rationale"
Cohesion: 0.33
Nodes (7): LCP Hero Portrait Preload, Rationale: @/ Import Alias, Data-Driven Content Architecture, IntersectionObserver Reveal Hook, Rationale: Lean Bundle (No Animation Lib/PWA), Netlify Frontend Deploy, React 19 + Vite Frontend

### Community 5 - "Error Boundary"
Cohesion: 0.33
Nodes (1): ErrorBoundary

### Community 6 - "Scroll-Reveal & Lazy Mount"
Cohesion: 0.33
Nodes (3): LazyMountSection(), Reveal(), useInView()

### Community 7 - "Branding & Icons"
Cohesion: 0.6
Nodes (6): Apple Touch Icon (Portfolio Brand Mark), Folder + Person Card Motif, Purple-Magenta Gradient Branding, 96x96 Favicon (Browser Tab Icon), Favicon SVG (Vector Brand Mark), Profile Hero Portrait

### Community 8 - "Env Config"
Cohesion: 0.67
Nodes (0): 

### Community 9 - "Express Server"
Cohesion: 1.0
Nodes (0): 

### Community 10 - "Contact Routes"
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

### Community 15 - "Contact Section & API"
Cohesion: 1.0
Nodes (2): Portfolio Contact API (/api/contact on Render), Contact Section Component

### Community 16 - "Experience Section"
Cohesion: 1.0
Nodes (0): 

### Community 17 - "Hero Section"
Cohesion: 1.0
Nodes (0): 

### Community 18 - "Skills Section"
Cohesion: 1.0
Nodes (0): 

### Community 19 - "Scroll Progress"
Cohesion: 1.0
Nodes (0): 

### Community 20 - "Scroll To Top"
Cohesion: 1.0
Nodes (0): 

### Community 21 - "Skip Link"
Cohesion: 1.0
Nodes (0): 

### Community 22 - "AI/ML Career Focus"
Cohesion: 1.0
Nodes (2): AI / ML / Full-Stack AI Roles (sought), Multi-Agent Systems

### Community 23 - "Robots & Sitemap"
Cohesion: 1.0
Nodes (1): sitemap.xml

### Community 24 - "ESLint Config"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "PostCSS Config"
Cohesion: 1.0
Nodes (0): 

### Community 26 - "Vite Config"
Cohesion: 1.0
Nodes (0): 

### Community 27 - "Service Worker Kill-Switch"
Cohesion: 1.0
Nodes (0): 

### Community 28 - "App Entry"
Cohesion: 1.0
Nodes (0): 

### Community 29 - "Projects Section"
Cohesion: 1.0
Nodes (1): Projects Section Component

### Community 30 - "Experience Data"
Cohesion: 1.0
Nodes (0): 

### Community 31 - "Portfolio Data"
Cohesion: 1.0
Nodes (0): 

### Community 32 - "Projects Data"
Cohesion: 1.0
Nodes (0): 

### Community 33 - "XGBoost"
Cohesion: 1.0
Nodes (1): XGBoost

### Community 34 - "React"
Cohesion: 1.0
Nodes (1): React

### Community 35 - ".NET ASP Core"
Cohesion: 1.0
Nodes (1): .NET ASP Core

### Community 36 - "MySQL"
Cohesion: 1.0
Nodes (1): MySQL

### Community 37 - "Power BI"
Cohesion: 1.0
Nodes (1): Power BI

### Community 38 - "RAG"
Cohesion: 1.0
Nodes (1): RAG (Retrieval-Augmented Generation)

### Community 39 - "Branded 404 Page"
Cohesion: 1.0
Nodes (1): Branded 404.html Page

### Community 40 - "Search Console Verification"
Cohesion: 1.0
Nodes (1): Google Search Console Verification

## Knowledge Gaps
- **30 isolated node(s):** `Contact Section Component`, `Portfolio Contact API (/api/contact on Render)`, `AI / ML / Full-Stack AI Roles (sought)`, `Projects Section Component`, `XGBoost` (+25 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Express Server`** (2 nodes): `server.js`, `shutdown()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Contact Routes`** (2 nodes): `contactRoutes.js`, `validateContact()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `App Root`** (2 nodes): `App()`, `App.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Footer`** (2 nodes): `Footer.jsx`, `Footer()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Navbar`** (2 nodes): `Navbar.jsx`, `Navbar()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `About Section`** (2 nodes): `About()`, `About.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Contact Section & API`** (2 nodes): `Portfolio Contact API (/api/contact on Render)`, `Contact Section Component`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Experience Section`** (2 nodes): `Experience.jsx`, `Experience()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Hero Section`** (2 nodes): `Hero.jsx`, `Hero()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Skills Section`** (2 nodes): `Skills.jsx`, `Skills()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Scroll Progress`** (2 nodes): `ScrollProgress.jsx`, `ScrollProgress()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Scroll To Top`** (2 nodes): `ScrollToTop.jsx`, `ScrollToTop()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Skip Link`** (2 nodes): `SkipLink.jsx`, `SkipLink()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `AI/ML Career Focus`** (2 nodes): `AI / ML / Full-Stack AI Roles (sought)`, `Multi-Agent Systems`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Robots & Sitemap`** (2 nodes): `robots.txt`, `sitemap.xml`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `ESLint Config`** (1 nodes): `eslint.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `PostCSS Config`** (1 nodes): `postcss.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Vite Config`** (1 nodes): `vite.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Service Worker Kill-Switch`** (1 nodes): `sw.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `App Entry`** (1 nodes): `main.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Projects Section`** (1 nodes): `Projects Section Component`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Experience Data`** (1 nodes): `experience.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Portfolio Data`** (1 nodes): `portfolio.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Projects Data`** (1 nodes): `projects.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `XGBoost`** (1 nodes): `XGBoost`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `React`** (1 nodes): `React`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `.NET ASP Core`** (1 nodes): `.NET ASP Core`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `MySQL`** (1 nodes): `MySQL`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Power BI`** (1 nodes): `Power BI`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `RAG`** (1 nodes): `RAG (Retrieval-Augmented Generation)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Branded 404 Page`** (1 nodes): `Branded 404.html Page`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Search Console Verification`** (1 nodes): `Google Search Console Verification`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Portfolio Project` connect `Frontend Shell, SEO & CI/CD` to `Frontend Architecture & Rationale`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Why does `Node.js + Express Backend` connect `Frontend Shell, SEO & CI/CD` to `Backend Security & Contact Flow`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `Layered Backend Structure (config/routes/services)` connect `Backend Security & Contact Flow` to `Frontend Shell, SEO & CI/CD`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `Portfolio Project` (e.g. with `Frontend HTML Shell` and `SEO Meta Tags (OG/Twitter/canonical)`) actually correct?**
  _`Portfolio Project` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `Apple Touch Icon (Portfolio Brand Mark)` (e.g. with `Favicon SVG (Vector Brand Mark)` and `Profile Hero Portrait`) actually correct?**
  _`Apple Touch Icon (Portfolio Brand Mark)` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Contact Section Component`, `Portfolio Contact API (/api/contact on Render)`, `AI / ML / Full-Stack AI Roles (sought)` to the rest of the system?**
  _30 weakly-connected nodes found - possible documentation gaps or missing edges._