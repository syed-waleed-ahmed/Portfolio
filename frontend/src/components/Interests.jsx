import Reveal from "./Reveal";

const Interests = () => {
  return (
      <div className="container">
        <Reveal>
          <h2 className="section-title text-center mb-5">
            Interests &amp; What I&apos;m Looking For
          </h2>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="neo-card p-4">
            <div className="row g-4 align-items-start">
              <div className="col-lg-7">
                <h3 className="mb-3 interests-heading">
                  Where I Want to Go Next
                </h3>
                <p>
                  I&apos;m drawn to teams that ship AI into production &mdash;
                  not just prototype it. Whether that&apos;s an{" "}
                  <strong>AI engineer</strong> role building agent frameworks, a{" "}
                  <strong>data/ML engineer</strong> position wiring up scalable
                  pipelines, or a <strong>full-stack AI</strong> seat where I own
                  the model <em>and</em> the interface, I want to be in the room
                  where systems go from notebook to user.
                </p>
                <p className="mb-0">
                  I care about clean architecture, reproducible workflows, and
                  closing the gap between &ldquo;it works on my machine&rdquo;
                  and &ldquo;it works in production for 10k users.&rdquo;
                </p>
              </div>

              <div className="col-lg-5">
                <h3 className="mb-3 text-accent">
                  Topics I&apos;m Exploring
                </h3>
                <ul className="interests-list mb-0">
                  <li>Agentic architectures &amp; tool-use patterns</li>
                  <li>Multimodal RAG &amp; retrieval pipelines</li>
                  <li>Large-scale data clustering &amp; ETL</li>
                  <li>LLM evaluation, guardrails &amp; observability</li>
                  <li>End-to-end ML deployment on cloud</li>
                </ul>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
  );
};

export default Interests;