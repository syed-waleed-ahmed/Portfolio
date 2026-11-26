import { useEffect } from "react";

// Links within a page (the header's sections, a case study's contents, the
// skip link) are ordinary fragment links, so they work before the script
// loads. Once it has, this keeps the fragment out of the address bar: a click
// scrolls to the target and moves focus there, as the browser would, and an
// address that arrives with a fragment is cleaned after the browser has
// scrolled to it. Renders nothing.
export default function InPageLinks() {
  useEffect(() => {
    const clean = () => window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
    if (window.location.hash) clean();

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(link instanceof HTMLAnchorElement) || link.target === "_blank") return;
      const url = new URL(link.href);
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || !url.hash) return;
      const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!target) return;

      event.preventDefault();
      // Scrolling follows the stylesheet: smooth, unless reduced motion is on,
      // and stopping below the sticky header.
      if (target.id === "top") window.scrollTo({ top: 0 });
      else target.scrollIntoView({ block: "start" });
      target.focus({ preventScroll: true });
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
