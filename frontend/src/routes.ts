// Every page the site has, its URL and its metadata. The prerender writes one
// HTML file per entry in PAGES, the client hydrates whichever matches its URL,
// and the sitemap is generated from the same list, so a page cannot exist in
// one place and be missing from another.
// Relative imports, not "@/": the Node tests and the prerender load this file
// without a bundler.
import { projects, projectBySlug, type Project } from "./content/projects.ts";
import { PERSON, SITE } from "./content/site.ts";

export type Route =
  | { kind: "home" }
  | { kind: "case-study"; project: Project }
  | { kind: "privacy" }
  | { kind: "not-found" };

export const caseStudyPath = (slug: string) => `/work/${slug}/`;

export function pathFor(route: Route): string {
  switch (route.kind) {
    case "home":
      return "/";
    case "case-study":
      return caseStudyPath(route.project.slug);
    case "privacy":
      return "/privacy/";
    case "not-found":
      return "/404";
  }
}

// Cloudflare serves /work/x/index.html at /work/x/ and redirects /work/x to
// it, so a missing trailing slash is accepted here too.
export function matchRoute(pathname: string): Route {
  const path = pathname.endsWith("/") ? pathname : `${pathname}/`;
  if (path === "/") return { kind: "home" };
  if (path === "/privacy/") return { kind: "privacy" };
  const slug = /^\/work\/([a-z0-9-]+)\/$/.exec(path)?.[1];
  const project = slug ? projectBySlug(slug) : undefined;
  return project ? { kind: "case-study", project } : { kind: "not-found" };
}

// The pages the prerender writes. The 404 page is written to dist/404.html,
// which Cloudflare serves for any unknown path.
export const PAGES: Route[] = [
  { kind: "home" },
  ...projects.map((project): Route => ({ kind: "case-study", project })),
  { kind: "privacy" },
  { kind: "not-found" },
];

export interface PageMeta {
  title: string;
  description: string;
  path: string;
  type: "profile" | "article" | "website";
  indexable: boolean;
}

export function metaFor(route: Route): PageMeta {
  switch (route.kind) {
    case "home":
      return {
        title: `${PERSON.name} · ${PERSON.title} in Bologna, Italy`,
        description:
          "AI software engineer in Bologna, Italy. I build LLM applications and the backend systems that keep them reliable. Case studies with architecture, evaluation and limitations.",
        path: "/",
        type: "profile",
        indexable: true,
      };
    case "case-study":
      return {
        title: `${route.project.title} · case study by ${PERSON.name}`,
        description: `Case study: ${route.project.title}, ${route.project.subtitle}. Its architecture, how it was evaluated, and its limits.`,
        path: caseStudyPath(route.project.slug),
        type: "article",
        indexable: true,
      };
    case "privacy":
      return {
        title: `Privacy · ${PERSON.name}`,
        description: "What this site collects, which is only what you send through the contact form, and where it goes.",
        path: "/privacy/",
        type: "website",
        indexable: true,
      };
    case "not-found":
      return {
        title: `Page not found · ${PERSON.name}`,
        description: "This page does not exist.",
        path: "/404",
        type: "website",
        indexable: false,
      };
  }
}

export const absoluteUrl = (path: string) => `${SITE.url}${path}`;
