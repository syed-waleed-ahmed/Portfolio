import { useEffect, lazy } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Footer from "./components/Footer";
import LazyMountSection from "./components/LazyMountSection";
import ErrorBoundary from "./components/ErrorBoundary";
import ScrollToTop from "./components/ScrollToTop";
import ScrollProgress from "./components/ScrollProgress";

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
      <ScrollProgress />
      <Navbar />

      <ErrorBoundary>
        <main>
          <Hero />

          <LazyMountSection id="about" className="py-5 section-wrapper">
            <About />
          </LazyMountSection>

          <LazyMountSection id="experience" className="py-5 section-wrapper">
            <Experience />
          </LazyMountSection>

          <LazyMountSection id="projects" className="py-5 section-wrapper">
            <Projects />
          </LazyMountSection>

          <LazyMountSection id="skills" className="py-5 section-wrapper">
            <Skills />
          </LazyMountSection>

          <LazyMountSection id="interests" className="py-5 section-wrapper">
            <Interests />
          </LazyMountSection>

          <LazyMountSection id="contact" className="py-5 section-wrapper">
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
