import { useEffect, lazy } from "react";
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
  useEffect(() => {
    window.scrollTo(0, 0);
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  return (
    <div className="app-root">
      <SkipLink />
      <ScrollProgress />
      <Navbar />

      <ErrorBoundary>
        <main id="main" tabIndex="-1">
          <Hero />

          <LazyMountSection id="about" className="section-wrapper">
            <About />
          </LazyMountSection>

          <LazyMountSection id="experience" className="section-wrapper">
            <Experience />
          </LazyMountSection>

          <LazyMountSection id="projects" className="section-wrapper">
            <Projects />
          </LazyMountSection>

          <LazyMountSection id="skills" className="section-wrapper">
            <Skills />
          </LazyMountSection>

          <LazyMountSection id="interests" className="section-wrapper">
            <Interests />
          </LazyMountSection>

          <LazyMountSection id="contact" className="section-wrapper">
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
