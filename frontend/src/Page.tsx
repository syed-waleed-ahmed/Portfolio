import type { ComponentType } from "react";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import type { Route } from "@/routes.ts";

interface Props {
  route: Route;
  // The page's body, loaded before render by the caller: statically on the
  // server, as its own chunk in the browser, so a page never downloads
  // another page's code.
  Body?: ComponentType | undefined;
}

// The frame every page shares. Each page is prerendered into its own HTML file
// and hydrated with this same tree.
export default function Page({ route, Body }: Props) {
  const onHome = route.kind === "home";
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SiteHeader onHome={onHome} />
      <main id="main" tabIndex={-1}>
        {Body &&
          (route.kind === "case-study" ? (
            <ErrorBoundary>
              <Body />
            </ErrorBoundary>
          ) : (
            <Body />
          ))}
      </main>
      <SiteFooter />
    </>
  );
}
