import { useEffect, lazy } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Footer from "./components/Footer";
import LazyMountSection from "./components/LazyMountSection";
import ErrorBoundary from "./components/ErrorBoundary";
import ScrollToTop from "./components/ScrollToTop";
import ScrollProgress from "./components/ScrollProgress";
import SkipLink from "./components/SkipLink";

const About = lazy(() => import("./components/About"));
const Experience = lazy(() => import("./components/Experience"));
const Projects = lazy(() => import("./components/Projects"));
const Skills = lazy(() => import("./components/Skills"));
const Interests = lazy(() => import("./components/Interests"));
const Contact = lazy(() => import("./components/Contact"));

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
