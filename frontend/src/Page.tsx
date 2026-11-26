import type { ComponentType } from "react";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import HomePage from "@/pages/HomePage";
import NotFoundPage from "@/pages/NotFoundPage";
import PrivacyPage from "@/pages/PrivacyPage";
import type { Route } from "@/routes.ts";

interface Props {
  route: Route;
  // The case study's body, loaded before render by the caller: statically on
  // the server, as its own chunk in the browser.
  CaseStudyBody?: ComponentType | undefined;
}

// The frame every page shares. Each page is prerendered into its own HTML file
// and hydrated with this same tree.
export default function Page({ route, CaseStudyBody }: Props) {
  const onHome = route.kind === "home";
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SiteHeader onHome={onHome} />
      <main id="main" tabIndex={-1}>
        {route.kind === "home" && <HomePage />}
        {route.kind === "case-study" && CaseStudyBody && (
          <ErrorBoundary>
            <CaseStudyBody />
          </ErrorBoundary>
        )}
        {route.kind === "privacy" && <PrivacyPage />}
        {route.kind === "not-found" && <NotFoundPage />}
      </main>
      <SiteFooter />
    </>
  );
}
