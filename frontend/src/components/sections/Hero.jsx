import { FaArrowRight, FaGithub, FaLinkedinIn } from "react-icons/fa";
import ExternalLink from "@/components/ui/ExternalLink";
import SectionLink from "@/components/ui/SectionLink";
import { personalInfo, socialLinks } from "@/data/portfolio";
import "./Hero.css";

// Keep `sizes` in step with the portrait's rendered width in Hero.css, and the
// preload in index.html in step with both.
const PORTRAIT_SIZES = "(min-width: 60rem) 288px, 88px";

const Hero = () => (
  <section id="top" className="hero" aria-labelledby="hero-title" tabIndex={-1}>
    <div className="container hero__inner">
      <picture className="hero__portrait">
        <source
          type="image/avif"
          srcSet="/images/Profile-320.avif 320w, /images/Profile.avif 680w"
          sizes={PORTRAIT_SIZES}
        />
        <source
          type="image/webp"
          srcSet="/images/Profile-320.webp 320w, /images/Profile.webp 680w"
          sizes={PORTRAIT_SIZES}
        />
        <img
          src="/images/Profile.webp"
          alt={`Portrait of ${personalInfo.name}`}
          width="680"
          height="680"
          fetchPriority="high"
          decoding="async"
        />
      </picture>

      <div className="hero__content">
        <h1 id="hero-title" className="hero__title">
          hi, <span className="hero__name">{personalInfo.shortName}</span> here.
          <span className="hero__caret" aria-hidden="true" />
        </h1>
        <p className="hero__headline">
          I build multi-agent systems, RAG pipelines, and LLM workflow automation.
        </p>
        <p className="hero__lead">
          My focus is the work most demos leave out: evaluation, observability,
          and the engineering that turns a working prototype into something a
          team can rely on every day.
        </p>
        <p className="hero__note">
          Finishing a Master&apos;s in Automation Engineering at the University
          of Bologna in October 2026, with a thesis built at MemorAIz S.r.l.
        </p>

        <div className="hero__actions">
          <SectionLink to="projects" className="btn btn--primary">
            View projects
            <FaArrowRight aria-hidden="true" />
          </SectionLink>
          <ExternalLink href={personalInfo.resumeUrl} className="btn btn--secondary">
            Resume
          </ExternalLink>
          {/* Grouped so the two icons wrap to a new line together rather
              than leaving one stranded on a narrow phone. */}
          <span className="hero__social">
            <ExternalLink href={socialLinks.linkedin} className="btn btn--icon" aria-label="LinkedIn">
              <FaLinkedinIn aria-hidden="true" />
            </ExternalLink>
            <ExternalLink href={socialLinks.github} className="btn btn--icon" aria-label="GitHub">
              <FaGithub aria-hidden="true" />
            </ExternalLink>
          </span>
        </div>
      </div>
    </div>
  </section>
);

export default Hero;
