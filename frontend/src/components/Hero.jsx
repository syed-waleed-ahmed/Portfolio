// src/components/Hero.jsx
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const exploreItems = [
  "Full-Stack AI Engineering",
  "LLMs & RAG Pipelines",
  "Multi-Agent Systems",
  "Intelligent Automation",
  "Data-Driven Problem Solving",
];

const Hero = () => {
  const prefersReducedMotion = useReducedMotion();
  const [exploreIndex, setExploreIndex] = useState(0);
  const [canHover, setCanHover] = useState(false);

  // Rotate "Currently exploring" text (cheap + fine)
  useEffect(() => {
    if (prefersReducedMotion) return;
    const id = setInterval(() => {
      setExploreIndex((i) => (i + 1) % exploreItems.length);
    }, 2600);
    return () => clearInterval(id);
  }, [prefersReducedMotion]);

  // Only enable hover animation on devices that actually support hover
  useEffect(() => {
    const mq = window.matchMedia?.("(hover: hover)");
    const update = () => setCanHover(Boolean(mq?.matches));
    update();
    mq?.addEventListener?.("change", update);
    return () => mq?.removeEventListener?.("change", update);
  }, []);

  const currentExplore = useMemo(
    () => exploreItems[exploreIndex],
    [exploreIndex]
  );

  const sectionInitial = prefersReducedMotion ? false : { opacity: 0, y: 30 };
  const sectionAnimate = prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 };

  const leftInitial = prefersReducedMotion ? false : { opacity: 0, x: -40 };
  const leftAnimate = prefersReducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 };

  const rightInitial = prefersReducedMotion
    ? false
    : { opacity: 0, x: 40, scale: 0.92 };
  const rightAnimate = prefersReducedMotion
    ? { opacity: 1 }
    : { opacity: 1, x: 0, scale: 1 };

  return (
    <motion.section
      id="hero"
      className="hero-gradient hero-wrapper d-flex align-items-center"
      initial={sectionInitial}
      animate={sectionAnimate}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <div className="container position-relative">
        {/* Keep orbits, but avoid scroll-linked JS transforms */}
        <div className="hero-orbit hero-orbit-1" />
        <div className="hero-orbit hero-orbit-2" />
        <div className="hero-orbit hero-orbit-3" />

        <div className="row align-items-center g-5">
          {/* LEFT */}
          <div className="col-lg-7">
            <motion.div
              initial={leftInitial}
              animate={leftAnimate}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h1 className="display-4 fw-bold hero-title mb-3">
                Hi, I'm <span className="gradient-text">Syed Waleed Ahmed</span>
              </h1>

              <p className="hero-lead mb-4">
                Master’s student in Automation Engineering at the University of Bologna,
                specializing in{" "}
                <span className="fw-semibold">AI, ML, Intelligent Automation</span>, and{" "}
                <span className="fw-semibold">LLM-driven workflows</span>. I build end-to-end
                AI systems that combine multi-agent orchestration, workflow automation, and
                data-driven decision making.
              </p>

              <div className="d-flex align-items-center gap-2 mb-3 hero-explore-row">
                <span className="text-muted small">Currently exploring</span>
                <div className="explore-pill">
                  <span className="explore-dot" />
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={currentExplore}
                      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
                      animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                      exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
                      transition={{ duration: 0.35 }}
                    >
                      {currentExplore}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </div>

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
                  href="https://drive.google.com/file/d/1hruWE4BEDn-XTiSIkGzVKoKEmpOvHu9d/view?usp=sharing"
                  target="_blank"
                  rel="noreferrer"
                  className="social-pill"
                >
                  Resume
                </a>
              </div>
            </motion.div>
          </div>

          {/* RIGHT */}
          <div className="col-lg-5 d-flex justify-content-lg-end justify-content-center">
            <motion.div
              className="profile-wrapper hero-photo-wrapper"
              initial={rightInitial}
              animate={rightAnimate}
              transition={{ duration: 0.9, ease: "easeOut" }}
              // only hover-animate when it makes sense
              whileHover={
                !prefersReducedMotion && canHover ? { y: -8, rotate: 1.2 } : undefined
              }
            >
              <div className="gradient-border hero-ring">
                <picture>
                  <source type="image/avif" srcSet="/images/Profile.avif" />
                  <source type="image/webp" srcSet="/images/Profile.webp" />
                  <img
                    src="/images/Profile.webp"
                    alt="Syed Waleed Ahmed"
                    className="profile-img"
                    width="460"
                    height="460"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                    style={{ objectFit: "cover" }}
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