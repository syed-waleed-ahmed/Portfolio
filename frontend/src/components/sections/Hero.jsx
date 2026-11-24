import Reveal from "@/components/ui/Reveal";
import { stats } from "@/data/about";
import { personalInfo } from "@/data/portfolio";
import "./Hero.css";

// Keep `sizes` in step with the portrait's rendered width in Hero.css, and the
// preload in index.html in step with both.
const PORTRAIT_SIZES =
  "(min-width: 120rem) 16.6vw, (min-width: 64rem) 320px, (min-width: 40rem) 148px, 64px";

// The first screen answers, in order: is this person available, who are they,
// what do they build, and what makes that credible. The figures close it, so
// the proof is on screen before the first scroll and the Projects section
// they come from is the next thing down.
//
// The greeting is the design. It is set as wide as its column, whatever the
// screen, so the one line the site is known by is also the largest thing on
// it; under it the statement runs in two tones, what I build in the heading
// colour and why it holds up in the soft one.
//
// It holds no buttons. A row of four stood under the lead (View projects,
// Resume, LinkedIn, GitHub) until 2026-11-23, when it was taken out: the dock
// at the foot of the same screen already carries all four, and the contact
// panel carries the last three again.
const Hero = () => (
  <section id="top" className="hero" aria-labelledby="hero-title" tabIndex={-1}>
    <div className="container hero__inner">
      {/* The stage is everything but the figures. On a window too short for
          both, it takes the first screen to itself: see Hero.css. */}
      <div className="hero__stage">
        <picture className="hero__portrait">
          <source
            type="image/avif"
            srcSet="/images/Profile-192.avif 192w, /images/Profile-320.avif 320w, /images/Profile.avif 680w, /images/Profile-840.avif 840w"
            sizes={PORTRAIT_SIZES}
          />
          <source
            type="image/webp"
            srcSet="/images/Profile-192.webp 192w, /images/Profile-320.webp 320w, /images/Profile.webp 680w, /images/Profile-840.webp 840w"
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

        <p className="hero__status">Open to AI and ML engineering roles</p>

        {/* A wrapper of its own because it is the title's size container:
            the greeting is sized in units of this box's width. */}
        <div className="hero__intro">
          <h1 id="hero-title" className="hero__title">
            hi, <span className="hero__name">{personalInfo.shortName}</span> here.
            <span className="hero__caret" aria-hidden="true" />
          </h1>
        </div>

        <div className="hero__body">
          <p className="hero__headline">
            I build multi-agent systems, RAG pipelines, and LLM workflow automation.
          </p>
          <div className="hero__detail">
            <p className="hero__lead">
              My focus is the work most demos leave out: evaluation,
              observability, and the engineering that turns a working prototype
              into something a team can rely on every day.
            </p>
            <p className="hero__note">
              Graduated from the University of Bologna in October 2026 with a
              Master&apos;s in Automation Engineering and a thesis built at
              MemorAIz S.r.l.
            </p>
          </div>
        </div>
      </div>

      {/* Each figure names the entry that backs it, and the content tests
          fail if that entry stops claiming it: see data/about.js. */}
      <Reveal as="ul" className="stats" aria-label="Selected results">
        {stats.map((stat) => (
          <li className="stat" key={stat.value + stat.source}>
            <span className="stat__value">{stat.value}</span>
            <span className="stat__label">{stat.label}</span>
            <span className="label stat__source">{stat.source}</span>
          </li>
        ))}
      </Reveal>
    </div>
  </section>
);

export default Hero;
