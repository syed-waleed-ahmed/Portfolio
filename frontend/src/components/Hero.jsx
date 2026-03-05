// src/components/Hero.jsx
import { useEffect, useMemo, useState } from "react";
import {
  FaEnvelope,
  FaPhoneAlt,
  FaWhatsapp,
  FaLinkedinIn,
  FaGithub,
  FaFileAlt,
} from "react-icons/fa";
import { SiLeetcode } from "react-icons/si";

const exploreItems = [
  "Agentic AI Systems",
  "Multimodal RAG Pipelines",
  "Multi-Agent Orchestration",
  "LLM Engineering & Tool Use",
  "Data Intelligence Pipelines",
];

const Hero = () => {
  const [exploreIndex, setExploreIndex] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (mq?.matches) return;
    const id = setInterval(() => {
      setExploreIndex((i) => (i + 1) % exploreItems.length);
    }, 2600);
    return () => clearInterval(id);
  }, []);

  const currentExplore = useMemo(
    () => exploreItems[exploreIndex],
    [exploreIndex]
  );
  return (
    <section
      id="hero"
      className="hero-gradient hero-wrapper d-flex align-items-center hero-entrance"
    >
      <div className="container position-relative">
        <div className="hero-orbit hero-orbit-1" />
        <div className="hero-orbit hero-orbit-2" />
        <div className="hero-orbit hero-orbit-3" />

        <div className="row align-items-center g-5">
          <div className="col-lg-7">
            <div className="hero-slide-left">
              <h1 className="display-4 fw-bold hero-title mb-3">
                Hi, I'm <span className="gradient-text">Syed Waleed Ahmed</span>
              </h1>

              <p className="hero-lead mb-4">
                AI Engineer building production-grade agentic AI systems. Master's
                student in Automation Engineering at the University of Bologna,
                specializing in{" "}
                <span className="fw-semibold">Multimodal RAG, LLM orchestration</span>, and{" "}
                <span className="fw-semibold">intelligent automation</span>. I turn messy data
                and complex workflows into reliable, deployed applications.
              </p>

              <div className="d-flex flex-wrap align-items-center gap-2 mb-3 hero-explore-row">
                <span className="text-muted small">Currently exploring</span>
                <div className="explore-pill">
                  <span className="explore-dot" />
                  <span className="explore-cycle-text" key={currentExplore}>
                    {currentExplore}
                  </span>
                </div>
              </div>

              <div className="d-flex flex-wrap gap-2 hero-links-row">
                <a
                  href="mailto:syedwaleedahmed9@gmail.com"
                  className="hero-pill"
                >
                  <FaEnvelope className="hero-pill-icon" />
                  Email
                </a>
                <a
                  href="tel:+393519609532"
                  className="hero-pill"
                >
                  <FaPhoneAlt className="hero-pill-icon" />
                  +39 351 960 9532
                </a>
                <a
                  href="https://wa.me/393519609532"
                  target="_blank"
                  rel="noreferrer"
                  className="hero-pill"
                >
                  <FaWhatsapp className="hero-pill-icon" />
                  WhatsApp
                </a>
              </div>

              <div className="d-flex flex-wrap gap-2 hero-links-row">
                <a
                  href="https://www.linkedin.com/in/syed-waleed-ahmed/"
                  target="_blank"
                  rel="noreferrer"
                  className="hero-pill"
                >
                  <FaLinkedinIn className="hero-pill-icon" />
                  LinkedIn
                </a>
                <a
                  href="https://github.com/syed-waleed-ahmed"
                  target="_blank"
                  rel="noreferrer"
                  className="hero-pill"
                >
                  <FaGithub className="hero-pill-icon" />
                  GitHub
                </a>
                <a
                  href="https://leetcode.com/u/syed-waleed-ahmed/"
                  target="_blank"
                  rel="noreferrer"
                  className="hero-pill"
                >
                  <SiLeetcode className="hero-pill-icon" />
                  LeetCode
                </a>
                <a
                  href="https://drive.google.com/file/d/1hruWE4BEDn-XTiSIkGzVKoKEmpOvHu9d/view?usp=sharing"
                  target="_blank"
                  rel="noreferrer"
                  className="hero-pill hero-pill-accent"
                >
                  <FaFileAlt className="hero-pill-icon" />
                  Resume
                </a>
              </div>
            </div>
          </div>

          <div className="col-lg-5 d-flex justify-content-lg-end justify-content-center">
            <div className="profile-wrapper hero-photo-wrapper hero-slide-right">
              <div className="gradient-border hero-ring">
                <picture>
                  <source type="image/avif" srcSet="/images/Profile.avif" />
                  <source type="image/webp" srcSet="/images/Profile.webp" />
                  <img
                    src="/images/Profile.webp"
                    alt="Syed Waleed Ahmed"
                    className="profile-img"
                    width="300"
                    height="300"
                    sizes="(max-width: 768px) 240px, 300px"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />
                </picture>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;