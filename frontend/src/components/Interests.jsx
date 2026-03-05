// src/components/Interests.jsx
import Reveal from "./Reveal";

const Interests = () => {
  return (
      <div className="container">
        <Reveal>
          <h2 className="section-title text-center mb-4">
            Interests in AI / ML &amp; Automation
          </h2>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="neo-card interests-card p-4 p-md-5">
            <div className="row g-4 align-items-start">
              <div className="col-lg-7">
                <h3 className="mb-3 interests-heading h5">
                  Why I Care About Intelligent Automation
                </h3>
                <p>
                  I&apos;m especially interested in roles and collaborations
                  involving <strong>agentic systems</strong>,{" "}
                  <strong>applied machine learning</strong>,{" "}
                  <strong>data intelligence pipelines</strong>, and{" "}
                  <strong>AI product development</strong>. My focus is on
                  building systems where AI isn&apos;t just a demo &mdash;
                  it&apos;s deployed, monitored, and continuously improved.
                </p>
                <p className="mb-0">
                  Previously, I built automated ETL workflows, analytics
                  dashboards, and business automation tools, improving
                  performance and reducing manual effort through system design.
                </p>
              </div>

              <div className="col-lg-5">
                <div className="interests-side-box">
                  <h4 className="mb-3 text-accent h6">Topics I&apos;m Exploring</h4>
                  <ul className="interests-list small mb-0">
                    <li>Agentic systems &amp; configurable AI assistants</li>
                    <li>Multimodal RAG &amp; LLM orchestration pipelines</li>
                    <li>Large-scale data preprocessing &amp; clustering</li>
                    <li>Product similarity &amp; recommendation engines</li>
                    <li>Full-stack development for AI-powered tools</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
  );
};

export default Interests;