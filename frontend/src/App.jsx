import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Experience from "@/components/sections/Experience";
import Projects from "@/components/sections/Projects";
import Skills from "@/components/sections/Skills";
import Contact from "@/components/sections/Contact";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import ScrollToTop from "@/components/ui/ScrollToTop";
import SkipLink from "@/components/ui/SkipLink";
import { sections } from "@/data/portfolio";

// Section ids and order come from data/portfolio.js, which the navbar reads
// too, so a section cannot be added to one and forgotten in the other.
// Sections are imported eagerly: the page is prerendered at build time, so
// all of its content is in the HTML before any JavaScript loads, and splitting
// a few kilobytes of section code into separate chunks would only add requests.
const SECTION_COMPONENTS = {
  about: About,
  experience: Experience,
  projects: Projects,
  skills: Skills,
  contact: Contact,
};

function App() {
  return (
    <>
      <SkipLink />
      <Navbar />
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
      <ScrollToTop />
    </>
  );
}

export default App;
