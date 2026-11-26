import { StrictMode, type ComponentType } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import "@/styles/index.css";
import Page from "@/Page";
import { matchRoute } from "@/routes.ts";

// Each case study is a chunk of its own, loaded before hydration so the tree
// matches the prerendered HTML.
const caseStudies = import.meta.glob<{ default: ComponentType }>("./case-studies/*.tsx");

const route = matchRoute(window.location.pathname);
const load = route.kind === "case-study" ? caseStudies[`./case-studies/${route.project.slug}.tsx`] : undefined;
const CaseStudyBody = load ? (await load()).default : undefined;

const container = document.getElementById("root")!;
const app = (
  <StrictMode>
    <Page route={route} CaseStudyBody={CaseStudyBody} />
  </StrictMode>
);

// Production HTML is prerendered, so React attaches to markup already on
// screen. The dev server serves an empty root and renders from scratch.
if (container.firstElementChild) hydrateRoot(container, app);
else createRoot(container).render(app);
