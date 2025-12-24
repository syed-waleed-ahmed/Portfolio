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
        {/* Hero already renders <motion.section id="hero"> internally,
            so no need to wrap it in another <section id="hero"> */}
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Interests />
        <Contact />
      </main>

      <Footer />
    </div>
  );
}

export default App;
