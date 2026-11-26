import { StrictMode, type ComponentType } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import "@/styles/index.css";
import Page from "@/Page";
import { matchRoute, type Route } from "@/routes.ts";

// Every page's body is a chunk of its own, loaded before hydration so the
// tree matches the prerendered HTML. The prerender preloads the page's chunk,
// so this await costs no extra round trip.
type Load = () => Promise<{ default: ComponentType }>;
const caseStudies = import.meta.glob<{ default: ComponentType }>("./case-studies/*.tsx");
const pages: Record<Exclude<Route["kind"], "case-study">, Load> = {
  home: () => import("@/pages/HomePage"),
  privacy: () => import("@/pages/PrivacyPage"),
  "not-found": () => import("@/pages/NotFoundPage"),
};

const route = matchRoute(window.location.pathname);
const load = route.kind === "case-study" ? caseStudies[`./case-studies/${route.project.slug}.tsx`] : pages[route.kind];
const Body = load ? (await load()).default : undefined;

const container = document.getElementById("root")!;
const app = (
  <StrictMode>
    <Page route={route} Body={Body} />
  </StrictMode>
);

// Production HTML is prerendered, so React attaches to markup already on
// screen. The dev server serves an empty root and renders from scratch.
if (container.firstElementChild) hydrateRoot(container, app);
else createRoot(container).render(app);
