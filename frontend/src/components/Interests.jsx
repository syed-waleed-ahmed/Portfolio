// src/components/Interests.jsx
import Reveal from "./Reveal";

const Interests = () => {
  return (
    <div className="container">
      <Reveal>
        <h2 className="section-title text-center mb-4">
          Interests in AI / ML & Automation
        </h2>
      </Reveal>

      <Reveal delay={0.08}>
        <div className="neo-card interests-card p-4 p-md-5">
          <div className="row g-4 align-items-start">
            {/* Left side: narrative */}
            <div className="col-lg-7">
              <h5 className="mb-3 interests-heading">
                Why I Care About Intelligent Automation
              </h5>
              <p>
                I’m particularly interested in how <strong>LLMs</strong> and{" "}
                <strong>Generative AI</strong> can power{" "}
                <strong>intelligent automation</strong> in real-world systems.
                This includes multi-agent orchestration, workflow automation,
                and AI-assisted decision-making.
              </p>
              <p className="mb-0">
                My work explores how AI can be embedded into both software
                workflows and engineering systems to create adaptive,
                data-driven solutions that continuously improve over time.
              </p>
            </div>

            {/* Right side: topics list */}
            <div className="col-lg-5">
              <div className="interests-side-box">
                <h6 className="mb-3 text-accent">Topics I’m Exploring</h6>
                <ul className="interests-list small mb-0">
                  <li>Multi-agent systems & AI-driven workflow automation</li>
                  <li>LLM engineering, ReAct-style reasoning and tool use</li>
                  <li>
                    Generative AI for content creation and campaign design
                  </li>
                  <li>
                    Predictive analytics and smart monitoring in automation
                  </li>
                  <li>
                    Bridging control systems with modern AI/ML pipelines
                  </li>
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
