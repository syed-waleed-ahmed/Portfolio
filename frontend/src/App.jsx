import { useEffect, useRef, useState, Suspense, lazy } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Footer from "./components/Footer";

// Lazy-load below-the-fold sections to reduce unused JS + DOM on initial load
const About = lazy(() => import("./components/About"));
const Experience = lazy(() => import("./components/Experience"));
const Projects = lazy(() => import("./components/Projects"));
const Skills = lazy(() => import("./components/Skills"));
const Interests = lazy(() => import("./components/Interests"));
const Contact = lazy(() => import("./components/Contact"));

const ParticlesBackground = lazy(() => import("./components/ParticlesBackground"));

function LazyMountSection({ id, className = "", children }) {
  const ref = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // If IntersectionObserver isn't available, mount immediately
    if (!("IntersectionObserver" in window)) {
      setMounted(true);
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setMounted(true);
          obs.disconnect();
        }
      },
      // Mount a bit before user reaches the section (smooth UX)
      { root: null, rootMargin: "300px 0px", threshold: 0.01 }
    );

    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section id={id} className={className} ref={ref}>
      {mounted ? <Suspense fallback={null}>{children}</Suspense> : null}
    </section>
  );
}

function App() {
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";

    // load particles well AFTER the page becomes interactive
    const id = "requestIdleCallback" in window
      ? window.requestIdleCallback(() => setShowParticles(true), { timeout: 4000 })
      : window.setTimeout(() => setShowParticles(true), 3000);

    return () => {
      if (typeof id === "number") window.clearTimeout(id);
      else window.cancelIdleCallback?.(id);
    };
  }, []);

  return (
    <div className="app-root">
      {showParticles && (
        <Suspense fallback={null}>
          <ParticlesBackground />
        </Suspense>
      )}

      <Navbar />

      <main>
        {/* Hero already renders id="hero" inside Hero.jsx, so don't wrap it again */}
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

      <Footer />
    </div>
  );
}

export default App;
