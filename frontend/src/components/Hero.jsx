import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";

const exploreItems = [
  "Full-Stack AI Engineering",
  "LLMs & RAG Pipelines",
  "Multi-Agent Systems",
  "Intelligent Automation",
  "Data-Driven Problem Solving",
];

const Hero = () => {
  const [exploreIndex, setExploreIndex] = useState(0);

  // rotate "Currently exploring" text
  useEffect(() => {
    const id = setInterval(
      () => setExploreIndex((i) => (i + 1) % exploreItems.length),
      2600
    );
    return () => clearInterval(id);
  }, []);

  // === Apple-ish parallax on scroll ===
  const { scrollYProgress } = useScroll();
  const heroImageY = useTransform(scrollYProgress, [0, 0.4], [0, -80]);
  const heroBgY = useTransform(scrollYProgress, [0, 0.4], [0, 40]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.85]);

  return (
    <motion.section
      id="hero"
      className="hero-gradient hero-wrapper d-flex align-items-center"
      style={{ opacity: heroOpacity }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <div className="container position-relative">
        {/* blurred glowing blobs with slight parallax */}
        <motion.div className="hero-orbit hero-orbit-1" style={{ y: heroBgY }} />
        <motion.div className="hero-orbit hero-orbit-2" style={{ y: heroBgY }} />
        <motion.div className="hero-orbit hero-orbit-3" style={{ y: heroBgY }} />

        <div className="row align-items-center g-5">
          {/* LEFT: text side */}
          <div className="col-lg-7">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <p className="display-4 fw-bold hero-title mb-3">
                Hi, I'm <span className="gradient-text">Syed Waleed Ahmed</span>
              </p>

              <p className="hero-lead mb-4">
                Master’s student in Automation Engineering at the University of Bologna,
                specializing in{" "}
                <span className="fw-semibold">AI, ML, Intelligent Automation</span>, and{" "}
                <span className="fw-semibold">LLM-driven workflows</span>. I build end-to-end
                AI systems that combine multi-agent orchestration, workflow automation, and
                data-driven decision making.
              </p>

              {/* Currently exploring */}
              <div className="d-flex align-items-center gap-2 mb-3 hero-explore-row">
                <span className="text-muted small">Currently exploring</span>
                <div className="explore-pill">
                  <span className="explore-dot" />
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={exploreItems[exploreIndex]}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.35 }}
                    >
                      {exploreItems[exploreIndex]}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </div>

              {/* Email / Phone chips */}
              <div className="d-flex flex-wrap gap-3 mb-3">
                <a
                  href="mailto:syedwaleedahmed9@gmail.com"
                  className="btn btn-primary neon-btn hero-contact-pill hero-contact-pill-strong"
                >
                  <span className="hero-contact-label">Email</span>
                </a>

                <div className="hero-contact-pill hero-contact-pill-strong">
                  <span className="hero-contact-label">Phone / Whatsapp</span>
                  <div className="d-flex flex-column flex-sm-row gap-2">
                    <span className="d-none d-sm-inline">•</span>
                    <a href="tel:+393519609532">+39 3519609532</a>
                  </div>
                </div>
              </div>

              {/* Social pills */}
              <div className="d-flex flex-wrap gap-2">
                <a
                  href="https://www.linkedin.com/in/syed-waleed-ahmed/"
                  target="_blank"
                  rel="noreferrer"
                  className="social-pill"
                >
                  LinkedIn
                </a>
                <a
                  href="https://github.com/syed-waleed-ahmed"
                  target="_blank"
                  rel="noreferrer"
                  className="social-pill"
                >
                  GitHub
                </a>
                <a
                  href="https://leetcode.com/u/syed-waleed-ahmed/"
                  target="_blank"
                  rel="noreferrer"
                  className="social-pill"
                >
                  LeetCode
                </a>
                <a
                  href="https://drive.google.com/file/d/1fCVwwAEqV7cnsuiWeDKHR44B_eP6N4ZX/view?usp=sharing"
                  target="_blank"
                  rel="noreferrer"
                  className="social-pill"
                >
                  Resume
                </a>
              </div>
            </motion.div>
          </div>

          {/* RIGHT: photo side */}
          <div className="col-lg-5 d-flex justify-content-lg-end justify-content-center">
            <motion.div
              className="profile-wrapper hero-photo-wrapper"
              initial={{ opacity: 0, x: 40, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              whileHover={{ y: -8, rotate: 1.2 }}
              style={{ y: heroImageY }}
            >
              <div className="gradient-border hero-ring">
                <picture>
                  <source srcSet="/images/Profile.avif" type="image/avif" />
                  <source srcSet="/images/Profile.webp" type="image/webp" />
                  <img
                    src="/images/Profile.webp"
                    alt="Syed Waleed Ahmed"
                    className="profile-img"
                    width="420"
                    height="420"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />
                </picture>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default Hero;
