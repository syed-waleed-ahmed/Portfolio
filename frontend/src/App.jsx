import { useEffect, useState, lazy } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import LazyMountSection from "@/components/ui/LazyMountSection";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import ScrollToTop from "@/components/ui/ScrollToTop";
import ScrollProgress from "@/components/ui/ScrollProgress";
import SkipLink from "@/components/ui/SkipLink";

const About = lazy(() => import("@/components/sections/About"));
const Experience = lazy(() => import("@/components/sections/Experience"));
const Projects = lazy(() => import("@/components/sections/Projects"));
const Skills = lazy(() => import("@/components/sections/Skills"));
const Interests = lazy(() => import("@/components/sections/Interests"));
const Contact = lazy(() => import("@/components/sections/Contact"));

function App() {
  const [mountAll, setMountAll] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  // Mount every section once the browser is idle, rather than waiting for each
  // one to be scrolled near. Scroll-gated mounting left the page far shorter
  // than its real height, so a jump to a lower section aimed at a target that
  // kept moving away as the sections above it mounted and grew.
  useEffect(() => {
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(() => setMountAll(true), { timeout: 2000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(() => setMountAll(true), 200);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className="app-root">
      <SkipLink />
      <ScrollProgress />
      <Navbar />

      <ErrorBoundary>
        <main id="main" tabIndex="-1">
          <Hero />

          <LazyMountSection id="about" className="section-wrapper" force={mountAll}>
            <About />
          </LazyMountSection>

          <LazyMountSection id="experience" className="section-wrapper" force={mountAll}>
            <Experience />
          </LazyMountSection>

          <LazyMountSection id="projects" className="section-wrapper" force={mountAll}>
            <Projects />
          </LazyMountSection>

          <LazyMountSection id="skills" className="section-wrapper" force={mountAll}>
            <Skills />
          </LazyMountSection>

          <LazyMountSection id="interests" className="section-wrapper" force={mountAll}>
            <Interests />
          </LazyMountSection>

          <LazyMountSection id="contact" className="section-wrapper" force={mountAll}>
            <Contact />
          </LazyMountSection>
        </main>
      </ErrorBoundary>

      <Footer />
      <ScrollToTop />
    </div>
  );
}

export default App;
