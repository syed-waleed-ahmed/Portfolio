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
      {/* media="print", so it loads at low priority and blocks nothing. No
          `precedence`: with one, React would manage it as a render-blocking
          stylesheet, which is what this is here to avoid. */}
      <link rel="stylesheet" media="print" href={printStyles} />
      <SkipLink />
      {/* Behind the masthead and the hero, on the page itself: see
          .dot-field in styles/components.css. */}
      <div className="dot-field" aria-hidden="true" />
      <Masthead />
      <Dock />
      <main id="main" tabIndex={-1}>
        <Hero />
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
    </>
  );
}

export default App;
