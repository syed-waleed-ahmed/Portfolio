import { FaEnvelope, FaFileAlt, FaLinkedinIn, FaGithub } from "react-icons/fa";
import { personalInfo, socialLinks } from "@/data/portfolio";

const Hero = () => {
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
        <div className="row align-items-center g-5">
          {/* Photo sits left on desktop, but after the copy once stacked, so the
              headline still leads on mobile. */}
          <div className="col-lg-5 order-2 order-lg-1 d-flex justify-content-center justify-content-lg-start">
            <div className="profile-wrapper hero-photo-wrapper hero-slide-left">
              <div className="hero-ring">
                <picture>
                  <source type="image/avif" srcSet="/images/Profile.avif" />
                  <source type="image/webp" srcSet="/images/Profile.webp" />
                  <img
                    src="/images/Profile.webp"
                    alt={personalInfo.name}
                    className="profile-img"
                    width="680"
                    height="680"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />
                </picture>
              </div>
            </div>
          </div>

          <div className="col-lg-7 order-1 order-lg-2">
            <div className="hero-slide-right">
              <h1 className="hero-title mb-4">
                hi, <span className="gradient-text">{personalInfo.shortName}</span> here.
                <span className="hero-cursor" aria-hidden="true" />
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

              <p className="hero-sub-lead mb-5">
                Master&apos;s in Automation Engineering at the University of
                Bologna, with an Erasmus semester at the University of Twente.
              </p>

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
        </div>
      </div>
    </section>
  );
};

export default Hero;
