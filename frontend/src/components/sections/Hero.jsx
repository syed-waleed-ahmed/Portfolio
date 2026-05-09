import { useEffect, useMemo, useState } from "react";
import { FaEnvelope, FaFileAlt, FaLinkedinIn, FaGithub } from "react-icons/fa";
import { personalInfo, socialLinks, exploreItems } from "@/data/portfolio";

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

  const scrollToContact = (e) => {
    e.preventDefault();
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section
      id="hero"
      className="hero-gradient hero-wrapper d-flex align-items-center hero-entrance"
    >
      <div className="container position-relative">
        <div className="hero-orbit hero-orbit-1" />
        <div className="hero-orbit hero-orbit-2" />

        <div className="row align-items-center g-5">
          <div className="col-lg-7">
            <div className="hero-slide-left">
              <span className="hero-role-badge">AI Engineer · Multi-Agent &amp; RAG Systems</span>

              <h1 className="fw-bold hero-title mb-3">
                Hi, I&apos;m <span className="gradient-text">{personalInfo.name}</span>
              </h1>

              <p className="hero-lead mb-4">
                AI Engineer working on{" "}
                <span className="fw-semibold">multi-agent systems</span>,{" "}
                <span className="fw-semibold">RAG pipelines</span>, and{" "}
                <span className="fw-semibold">LLM workflow automation</span>. I
                care about the parts most demos skip: evaluation, observability,
                and the engineering between a working prototype and something a
                real team can use every day.
              </p>

              <p className="hero-sub-lead mb-4">
                Master&apos;s in Automation Engineering at the University of
                Bologna, with an Erasmus semester at the University of Twente.
              </p>

              <div className="d-flex flex-wrap align-items-center gap-2 mb-4 hero-explore-row">
                <span className="text-muted small">Currently exploring</span>
                <div className="explore-pill">
                  <span className="explore-dot" />
                  <span className="explore-cycle-text" key={currentExplore}>
                    {currentExplore}
                  </span>
                </div>
              </div>

              <div className="hero-cta-row">
                <a href="#contact" className="hero-cta-primary" onClick={scrollToContact}>
                  <FaEnvelope />
                  Let&apos;s connect
                </a>
                <a
                  href={personalInfo.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hero-cta-secondary"
                >
                  <FaFileAlt />
                  View Resume
                </a>
                <a
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hero-cta-icon"
                  aria-label="LinkedIn"
                >
                  <FaLinkedinIn />
                </a>
                <a
                  href={socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hero-cta-icon"
                  aria-label="GitHub"
                >
                  <FaGithub />
                </a>
              </div>
            </div>
          </div>

          <div className="col-lg-5 d-flex justify-content-lg-end justify-content-center">
            <div className="profile-wrapper hero-photo-wrapper hero-slide-right">
              <div className="hero-ring">
                <picture>
                  <source type="image/avif" srcSet="/images/Profile.avif" />
                  <source type="image/webp" srcSet="/images/Profile.webp" />
                  <img
                    src="/images/Profile.webp"
                    alt={personalInfo.name}
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
