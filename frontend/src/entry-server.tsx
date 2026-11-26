import { StrictMode, type ComponentType } from "react";
import { renderToString } from "react-dom/server";
import Page from "@/Page";
import { renderHead } from "@/head.ts";
import { metaFor, PAGES, pathFor, type Route } from "@/routes.ts";

// Build-time only: `vite build --ssr` compiles this for Node, and
// scripts/prerender.mjs writes one HTML file per page from it.
const caseStudies = import.meta.glob<{ default: ComponentType }>("./case-studies/*.tsx", { eager: true });

function render(route: Route): string {
  const CaseStudyBody = route.kind === "case-study" ? caseStudies[`./case-studies/${route.project.slug}.tsx`]?.default : undefined;
  if (route.kind === "case-study" && !CaseStudyBody) throw new Error(`no case study at src/case-studies/${route.project.slug}.tsx`);
  return renderToString(
    <StrictMode>
      <Page route={route} CaseStudyBody={CaseStudyBody} />
    </StrictMode>
  );
}

export const pages = PAGES.map((route) => ({
  path: pathFor(route),
  indexable: metaFor(route).indexable,
  head: renderHead(route),
  html: render(route),
}));

export { PERSON, SITE } from "@/content/site.ts";
