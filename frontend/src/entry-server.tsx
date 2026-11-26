import { StrictMode, type ComponentType } from "react";
import { renderToString } from "react-dom/server";
import Page from "@/Page";
import HomePage from "@/pages/HomePage";
import NotFoundPage from "@/pages/NotFoundPage";
import PrivacyPage from "@/pages/PrivacyPage";
import { renderHead } from "@/head.ts";
import { metaFor, PAGES, pathFor, type Route } from "@/routes.ts";

// Build-time only: `vite build --ssr` compiles this for Node, and
// scripts/prerender.mjs writes one HTML file per page from it.
const caseStudies = import.meta.glob<{ default: ComponentType }>("./case-studies/*.tsx", { eager: true });

const pageBodies = { home: HomePage, privacy: PrivacyPage, "not-found": NotFoundPage };
const pageModules = { home: "HomePage", privacy: "PrivacyPage", "not-found": "NotFoundPage" };

// The source module main.tsx loads for a page, as the client build's
// manifest names it.
const moduleFor = (route: Route) =>
  route.kind === "case-study" ? `src/case-studies/${route.project.slug}.tsx` : `src/pages/${pageModules[route.kind]}.tsx`;

function render(route: Route): string {
  const Body = route.kind === "case-study" ? caseStudies[`./case-studies/${route.project.slug}.tsx`]?.default : pageBodies[route.kind];
  if (!Body) throw new Error(`no page body for ${pathFor(route)}`);
  return renderToString(
    <StrictMode>
      <Page route={route} Body={Body} />
    </StrictMode>
  );
}

export const pages = PAGES.map((route) => ({
  path: pathFor(route),
  indexable: metaFor(route).indexable,
  module: moduleFor(route),
  head: renderHead(route),
  html: render(route),
}));

export { PERSON, SITE } from "@/content/site.ts";
