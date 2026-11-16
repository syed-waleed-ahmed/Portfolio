import { lazy, Suspense, useEffect, useRef, useState } from "react";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import ExternalLink from "@/components/ui/ExternalLink";
import Reveal from "@/components/ui/Reveal";
import { socialLinks } from "@/data/portfolio";
import "./GitHubActivity.css";

const GitHubActivityCalendar = lazy(() => import("./GitHubActivityCalendar"));

// The contribution graph, under the projects it is the running record of.
//
// The server HTML holds the heading, the profile link and reserved space. The
// calendar and its data are a separate chunk, loaded as the block nears the
// viewport, so a visitor who never scrolls this far does not pay for them. The
// data is a committed snapshot rather than a live fetch: see
// scripts/fetch-github-activity.mjs for why.
//
// A chunk can still fail to load, say in a tab left open across a deploy, so a
// line stands in for the calendar inside the same reserved space and nothing
// below it moves.
const GitHubActivity = () => {
  const slotRef = useRef(null);
  const [width, setWidth] = useState(null);

  useEffect(() => {
    const slot = slotRef.current;
    if (!slot || !("IntersectionObserver" in window)) return;
    let resizeObserver = null;
    const measure = () => setWidth(slot.clientWidth);

    // Measured again on every resize once loaded, so a rotated phone or a
    // window dragged across the breakpoint gets a graph that fits, rather
    // than the one laid out for the width it had first.
    const observer = new IntersectionObserver(
      // Any entry, as in Reveal: a batch can hold more than one for the slot.
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        measure();
        if ("ResizeObserver" in window) {
          resizeObserver = new ResizeObserver(measure);
          resizeObserver.observe(slot);
        }
      },
      { rootMargin: "600px 0px" }
    );
    observer.observe(slot);
    return () => {
      observer.disconnect();
      resizeObserver?.disconnect();
    };
  }, []);

  return (
    <Reveal as="section" className="activity" aria-labelledby="activity-title">
      <div className="activity__header">
        <h3 id="activity-title" className="activity__title">
          GitHub activity
        </h3>
        <ExternalLink href={socialLinks.github} className="text-link activity__link">
          View profile
        </ExternalLink>
      </div>

      <div ref={slotRef} className="activity__calendar">
        {width !== null && (
          <ErrorBoundary fallback={<p className="activity__unavailable">The graph could not be loaded.</p>}>
            <Suspense fallback={null}>
              <GitHubActivityCalendar width={width} />
            </Suspense>
          </ErrorBoundary>
        )}
      </div>
    </Reveal>
  );
};

export default GitHubActivity;
