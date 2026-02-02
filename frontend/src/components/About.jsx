import Reveal from "./Reveal";

const About = () => {
  return (
    <section id="about" className="section-wrapper">
      <div className="container">
        <Reveal>
          <h2 className="section-title text-center mb-5">
            About Me &amp; Education
          </h2>
        </Reveal>

        {/* Center the pair + equal height */}
        <div className="row g-4 align-items-stretch justify-content-center about-row">
          {/* About text card */}
          <div className="col-md-10 col-lg-6 d-flex">
            <Reveal delay={0.04} className="w-100">
              <div className="neo-card about-card flex-fill h-100 p-4 p-md-5">
                <p className="mb-3">
                  I am a Master’s student in Automation Engineering at the
                  University of Bologna, focusing on{" "}
                  <strong>Artificial Intelligence</strong> and{" "}
                  <strong>Machine Learning</strong>. My work revolves around{" "}
                  <strong>LLM engineering, Generative AI systems</strong>, and{" "}
                  <strong>intelligent automation</strong>.
                </p>
                <p className="mb-0">
                  I’m actively working on AI-driven automation projects,
                  including multi-agent systems and workflow automation tools
                  leveraging Groq LLMs, LangGraph, and ReAct-style reasoning.
                  I’ve built solutions for automating business workflows, AI
                  content generation, and predictive analytics.
                </p>
              </div>
            </Reveal>
          </div>

          {/* Education card */}
          <div className="col-md-10 col-lg-6 d-flex">
            <Reveal delay={0.08} className="w-100">
              <div className="neo-card about-card flex-fill h-100 p-4 p-md-5">
                <h3 className="mb-3 text-accent">Education</h3>
                <ul className="timeline mb-0">
                  <li className="mb-3">
                    <div className="fw-semibold">
                      Master in Automation Engineering
                    </div>
                    <div className="timeline-meta">
                      Alma Mater Studiorum – Università di Bologna, Italy
                      <br />
                      Sep 2024 – Present
                    </div>
                  </li>

                  <li className="mb-3">
                    <div className="fw-semibold">Erasmus+ Mobility</div>
                    <div className="timeline-meta">
                      University of Twente, Enschede, Netherlands
                      <br />
                      Sep 2025 – Jan 2026
                    </div>
                  </li>

                  <li>
                    <div className="fw-semibold">
                      Bachelor in Electrical Engineering
                    </div>
                    <div className="timeline-meta">
                      NED University of Engineering and Technology, Karachi,
                      Pakistan
                      <br />
                      Oct 2019 – Aug 2023 · CGPA: 3.46
                    </div>
                  </li>
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;