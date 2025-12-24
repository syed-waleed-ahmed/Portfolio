import { useEffect, useState, Suspense, lazy } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Experience from "./components/Experience";
import Projects from "./components/Projects";
import Skills from "./components/Skills";
import Interests from "./components/Interests";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

const ParticlesBackground = lazy(() => import("./components/ParticlesBackground"));

function App() {
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";

    // load particles AFTER the page becomes interactive
    const id = requestIdleCallback
      ? requestIdleCallback(() => setShowParticles(true))
      : setTimeout(() => setShowParticles(true), 1200);

    return () => {
      if (typeof id === "number") clearTimeout(id);
      else cancelIdleCallback?.(id);
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
        <section id="hero"><Hero /></section>
        <section id="about" className="py-5 section-wrapper"><About /></section>
        <section id="experience" className="py-5 section-wrapper"><Experience /></section>
        <section id="projects" className="py-5 section-wrapper"><Projects /></section>
        <section id="skills" className="py-5 section-wrapper"><Skills /></section>
        <section id="interests" className="py-5 section-wrapper"><Interests /></section>
        <section id="contact" className="py-5 section-wrapper"><Contact /></section>
      </main>

      <Footer />
    </div>
  );
}

export default App;
