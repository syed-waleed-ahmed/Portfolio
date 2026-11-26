import { PORTRAIT } from "@/content/portrait.ts";
import { languageList, PERSON } from "@/content/site.ts";

// The first screen answers a recruiter's questions in order: who this is, what
// they build, the strongest evidence for it, and the practical facts (where,
// whether they need sponsorship, which languages). The greeting stays as the
// opening line; the heading says what the work is.
export default function Hero() {
  return (
    <section id="top" className="hero" aria-labelledby="hero-title" tabIndex={-1}>
      <div className="container hero__grid">
        <div className="hero__copy">
          <p className="hero__status">
            <span className="hero__dot" aria-hidden="true" />
            {PERSON.status}
          </p>

          <h1 id="hero-title" className="hero__title">
            <span className="hero__greeting">
              hi, {PERSON.shortName} here.
              <span className="hero__caret" aria-hidden="true" />
            </span>
            <span className="hero__claim">I build LLM applications and the backend systems that keep them reliable.</span>
          </h1>

          <p className="hero__lead">
            My MSc thesis at MemorAIz was RemindrAI: a multi-tenant reminder service that AI assistants embed, with retry-safe
            delivery over four channels and an agent that a prompt injection cannot point at another user&apos;s data. Each
            project below has a case study with its architecture, how it was evaluated, and what did not work.
          </p>
        </div>

        <picture className="hero__portrait">
          <source type="image/avif" srcSet={PORTRAIT.avif} sizes={PORTRAIT.sizes} />
          <source type="image/webp" srcSet={PORTRAIT.webp} sizes={PORTRAIT.sizes} />
          <img
            src={PORTRAIT.fallback}
            alt={`Portrait of ${PERSON.name}`}
            width={PORTRAIT.intrinsic}
            height={PORTRAIT.intrinsic}
            fetchPriority="high"
            decoding="async"
          />
        </picture>

        <dl className="hero__facts">
          <div>
            <dt>Based in</dt>
            <dd>{PERSON.location}</dd>
          </div>
          <div>
            <dt>Work authorisation</dt>
            <dd>{PERSON.workAuthorization}</dd>
          </div>
          <div>
            <dt>Languages</dt>
            <dd>{languageList}</dd>
          </div>
          <div>
            <dt>Education</dt>
            <dd>{PERSON.degree}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
