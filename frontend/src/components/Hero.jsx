// src/components/Hero.jsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import profileImg from "../assets/profile.jpg"; // <-- adjust path to your image

const exploreItems = [
  "Full-Stack AI Engineering",
  "LLMs & RAG Pipelines",
  "Multi-Agent Systems",
  "Intelligent Automation",
  "Data-Driven Problem Solving",
];

const Hero = () => {
  const [exploreIndex, setExploreIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setExploreIndex((i) => (i + 1) % exploreItems.length),
      2600
    );
    return () => clearInterval(id);
  }, []);

  return (
    <motion.section
      id="hero"
      className="hero-gradient hero-wrapper d-flex align-items-center"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <div className="container position-relative">
        {/* blurred glowing blobs */}
        <div className="hero-orbit hero-orbit-1" />
        <div className="hero-orbit hero-orbit-2" />
        <div className="hero-orbit hero-orbit-3" />

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
                I’m a Master’s student in Automation Engineering at the
                University of Bologna, specializing in{" "}
                <span className="fw-semibold">
                  AI, ML, Intelligent Automation
                </span>
                , and{" "}
                <span className="fw-semibold">LLM-driven workflows</span>. I
                build end-to-end AI systems that combine multi-agent
                orchestration, workflow automation, and data-driven decision
                making.
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
                <div className="hero-contact-pill hero-contact-pill-strong">
                  <span className="hero-contact-label">Email</span>
                  <a href="mailto:syedwaleedahmed9@gmail.com">
                    syedwaleedahmed9@gmail.com
                  </a>
                </div>

                <div className="hero-contact-pill hero-contact-pill-strong">
                  <span className="hero-contact-label">Phone</span>
                  {/* both numbers, each clickable */}
                  <a href="tel:+31687889345">+31 6 8788 9345</a>
                  <span className="mx-1">·</span>
                  <a href="tel:+393519609532">+39 351 960 9532</a>
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
                  href="https://x.com/Waleed_Dexter"
                  target="_blank"
                  rel="noreferrer"
                  className="social-pill"
                >
                  Twitter
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
            >
              <div className="gradient-border hero-ring">
                <img
                  src={profileImg}
                  alt="Syed Waleed Ahmed"
                  className="profile-img"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default Hero;
