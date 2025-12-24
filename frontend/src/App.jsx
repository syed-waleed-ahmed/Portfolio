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
    // ✅ Prevent browser scroll restoration BEFORE forcing scroll top
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // ✅ Ensure top on first paint (helps Safari/iOS)
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    // ✅ Also force it after load (covers iOS restoring scroll after hydration)
    const onLoad = () => window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    window.addEventListener("load", onLoad);

    return () => {
      window.removeEventListener("load", onLoad);
    };
  }, []);

  return (
    <div className="app-root">
      <ParticlesBackground />
      <Navbar />

      <main>
        {/* Hero already renders <motion.section id="hero" ...> so no need to wrap again */}
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
