// src/App.jsx
import { useEffect } from "react";
import ParticlesBackground from "./components/ParticlesBackground";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Experience from "./components/Experience";
import Projects from "./components/Projects";
import Skills from "./components/Skills";
import Interests from "./components/Interests";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

function App() {
  useEffect(() => {
    // Always start from top on reload
    window.scrollTo(0, 0);

    // Prevent browser from restoring previous scroll position
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);
  return (
    <div className="app-root">
      <ParticlesBackground />
      <Navbar />

      <main>
        <section id="hero">
          <Hero />
        </section>

        <section id="about" className="py-5 section-wrapper">
          <About />
        </section>

        <section id="experience" className="py-5 section-wrapper">
          <Experience />
        </section>

        <section id="projects" className="py-5 section-wrapper">
          <Projects />
        </section>

        <section id="skills" className="py-5 section-wrapper">
          <Skills />
        </section>

        <section id="interests" className="py-5 section-wrapper">
          <Interests />
        </section>

        <section id="contact" className="py-5 section-wrapper">
          <Contact />
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default App;