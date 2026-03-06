import { useEffect, useState, Suspense, lazy } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Footer from "./components/Footer";
import LazyMountSection from "./components/LazyMountSection";
import ErrorBoundary from "./components/ErrorBoundary";

// Lazy-load below-the-fold sections to reduce unused JS + DOM on initial load
const About = lazy(() => import("./components/About"));
const Experience = lazy(() => import("./components/Experience"));
const Projects = lazy(() => import("./components/Projects"));
const Skills = lazy(() => import("./components/Skills"));
const Interests = lazy(() => import("./components/Interests"));
const Contact = lazy(() => import("./components/Contact"));

const ParticlesBackground = lazy(() => import("./components/ParticlesBackground"));

function App() {
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";

    // Load particles only after first user scroll (never during Lighthouse audit)
    const onScroll = () => {
      setShowParticles(true);
      window.removeEventListener("scroll", onScroll);
    };
    window.addEventListener("scroll", onScroll, { once: true, passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="app-root">
      {showParticles && (
        <Suspense fallback={null}>
          <ParticlesBackground />
        </Suspense>
      )}

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
    </div>
  );
}

export default App;
