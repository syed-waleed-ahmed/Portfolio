import Reveal from "./Reveal";

const Experience = () => {
  return (
      <div className="container">
        <Reveal>
          <h2 className="section-title text-center mb-5">
            Professional Experience
          </h2>
        </Reveal>

        <div className="row g-4 align-items-stretch">
          {/* Thesis Student */}
          <div className="col-md-6 col-lg-4 d-flex">
            <Reveal delay={0.04} className="w-100">
              <div className="neo-card experience-card h-100 p-4">
                <h3 className="mb-1">Thesis Student</h3>
                <p className="text-accent mb-1">MemorAIz</p>
                <p className="timeline-meta mb-3">Feb 2026 &ndash; Present &middot; Bologna, Italy</p>

                <ul className="mb-0">
                  <li>
                    Productizing a modular AI assistant platform with
                    configurable agents that orchestrate reusable UI-based
                    AI modules (function + micro-experience widgets).
                  </li>
                  <li>
                    Designed agent configuration schemas, module interfaces,
                    and a module registry/versioning strategy to enable
                    new solutions through configuration instead of bespoke code.
                  </li>
                  <li>
                    Built the orchestration layer for multi-step agent &harr;
                    module &harr; UI flows with routing, retries/fallbacks,
                    and observability hooks (traces, latency, failure tracking).
                  </li>
                  <li>
                    Shipped the first productized MVP and an internal
                    &ldquo;dogfooding&rdquo; assistant to stress-test
                    configuration, module UX, and orchestration robustness.
                  </li>
                  <li>
                    Implemented governance features (human-in-the-loop approvals,
                    guardrails, role/permission boundaries) and a lightweight
                    evaluation suite with scenario-based regression tests and
                    quality metrics per workflow.
                  </li>
                </ul>
              </div>
            </Reveal>
          </div>

          {/* Data Clustering & AI Model Intern */}
          <div className="col-md-6 col-lg-4 d-flex">
            <Reveal delay={0.08} className="w-100">
              <div className="neo-card experience-card h-100 p-4">
                <h3 className="mb-1">Data Clustering &amp; AI Model Intern</h3>
                <p className="text-accent mb-1">Fruugle</p>
                <p className="timeline-meta mb-3">Jan 2026 &ndash; Present &middot; Riga, Latvia (Remote)</p>

                <ul className="mb-0">
                  <li>
                    Analyzed and preprocessed massive product and pricing datasets
                    (1M+ records) from multiple supermarket sources for a
                    multimodal AI-powered e-grocery assistant.
                  </li>
                  <li>
                    Built data clustering and grouping pipelines (K-means, DBSCAN,
                    hierarchical) to create comparable product segments for
                    real-time price comparison.
                  </li>
                  <li>
                    Collaborated with AI engineers to support multimodal model
                    training across text, image, and numerical data.
                  </li>
                  <li>
                    Optimized algorithms for product similarity and recommendation
                    logic using data normalization and feature extraction.
                  </li>
                  <li>
                    Visualized cluster insights to help business and product teams
                    understand pricing patterns.
                  </li>
                </ul>
              </div>
            </Reveal>
          </div>

          {/* Tech Trainee */}
          <div className="col-md-6 col-lg-4 d-flex">
            <Reveal delay={0.12} className="w-100">
              <div className="neo-card experience-card h-100 p-4">
                <h3 className="mb-1">Tech Trainee</h3>
                <p className="text-accent mb-1">Jubilee Life Insurance Co. Ltd.</p>
                <p className="timeline-meta mb-3">Dec 2023 &ndash; Oct 2024 &middot; Karachi, Pakistan</p>

                <ul className="mb-0">
                  <li>
                    Completed a 12-month rotational program across IT domains
                    including networking, cybersecurity, web development, and
                    database administration.
                  </li>
                  <li>
                    Managed threat monitoring and incident response using IBM
                    QRadar (SIEM, SOAR, PAM); implemented IT governance and
                    compliance frameworks.
                  </li>
                  <li>
                    Built dynamic web applications using HTML/CSS, JavaScript,
                    PHP, .NET ASP Core, React, and MySQL.
                  </li>
                  <li>
                    Designed databases, stored procedures, SSRS reports, and
                    Power BI dashboards for data-driven decision-making.
                  </li>
                  <li>
                    Customized SharePoint and CRM solutions for workflow
                    automation and cross-team collaboration.
                  </li>
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
  );
};

export default Experience;