import Dock from "@/components/layout/Dock";
import Footer from "@/components/layout/Footer";
import Masthead from "@/components/layout/Masthead";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Experience from "@/components/sections/Experience";
import Projects from "@/components/sections/Projects";
import Skills from "@/components/sections/Skills";
import Contact from "@/components/sections/Contact";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import SkipLink from "@/components/ui/SkipLink";
import { sections } from "@/data/portfolio";
// The print stylesheet, as the URL of a file of its own rather than rules in
// the entry stylesheet: see styles/print.css.
import printStyles from "@/styles/print.css?url";
// Everything below the hero, as a second stylesheet: see styles/sections.css.
import sectionStyles from "@/styles/sections.css?url";

// Section ids and order come from data/portfolio.js, which the dock reads
// too, so a section cannot be added to one and forgotten in the other.
// Sections are imported eagerly: the page is prerendered at build time, so
// all of its content is in the HTML before any JavaScript loads, and splitting
// a few kilobytes of section code into separate chunks would only add requests.
const SECTION_COMPONENTS = {
  projects: Projects,
  experience: Experience,
  about: About,
  skills: Skills,
  contact: Contact,
};

function App() {
  return (
    <>
      <SkipLink />
      {/* Behind the masthead and the hero, on the page itself: see
          .dot-field in styles/components.css. */}
      <div className="dot-field" aria-hidden="true" />
      <Masthead />
      <Dock />
      <main id="main" tabIndex={-1}>
        <Hero />
        {/* Here, not in the head: a stylesheet in the body blocks only what
            follows it, so the hero above paints without waiting for the
            styles of the sections below. No `precedence`, as for the print
            sheet, or React would hoist it and make it block everything. */}
        <link rel="stylesheet" href={sectionStyles} />
        {sections.map(({ id }) => {
          const Section = SECTION_COMPONENTS[id];
          return (
            // tabIndex -1 so SectionLink can move focus here after scrolling.
            <section key={id} id={id} className="section" aria-labelledby={`${id}-title`} tabIndex={-1}>
              <ErrorBoundary>
                <Section />
              </ErrorBoundary>
            </section>
          );
        })}
      </main>
      <Footer />
      {/* media="print", so it loads at low priority and blocks nothing. Last
          in the page, after the sections' stylesheet: its rules override
          rules in both, in the same cascade layers, and between two sheets
          the later one wins. Linked first, it lost to every section rule,
          and the project cards printed part-way through their fade. No
          `precedence` here either. */}
      <link rel="stylesheet" media="print" href={printStyles} />
    </>
  );
}

export default App;
