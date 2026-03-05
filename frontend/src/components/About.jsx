import Reveal from "./Reveal";

const About = () => {
  return (
      <div className="container">
        <Reveal>
          <h2 className="section-title text-center mb-5">
            About Me &amp; Education
          </h2>
        </Reveal>

        <div className="row g-4 align-items-stretch justify-content-center">
          <div className="col-md-6 d-flex">
            <Reveal delay={0.04} className="w-100">
              <div className="neo-card about-card flex-fill h-100 p-4">
                <p className="mb-3">
                  I treat AI models the same way I treat any other software
                  component &mdash; they need clean interfaces, proper error
                  handling, and a deployment story. That mindset shapes every
                  system I build, from agent orchestration to data pipelines.
                </p>
                <p className="mb-3">
                  At <strong>MemorAIz</strong> I&apos;m turning my thesis into a
                  productized AI assistant platform with configurable agents,
                  module registries, and built-in observability. At{" "}
                  <strong>Fruugle</strong> I cluster and normalize 1M+
                  supermarket product records so a multimodal AI assistant can
                  do real-time price comparison.
                </p>
                <p className="mb-0">
                  Before that, I spent a year at <strong>Jubilee Life
                  Insurance</strong> rotating through cybersecurity, web
                  development, and database administration &mdash; which gave me
                  the breadth to wire full systems together, not just the ML
                  parts.
                </p>
              </div>
            </Reveal>
          </div>

          <div className="col-md-6 d-flex">
            <Reveal delay={0.08} className="w-100">
              <div className="neo-card about-card flex-fill h-100 p-4">
                <h3 className="mb-3 text-accent">Education</h3>
                <ul className="timeline mb-0">
                  <li className="mb-3">
                    <div className="fw-semibold">
                      Master&apos;s in Automation Engineering
                    </div>
                    <div className="timeline-meta">
                      Alma Mater Studiorum &ndash; Universit&agrave; di Bologna, Italy
                      <br />
                      Sep 2024 &ndash; Present
                    </div>
                  </li>

                  <li className="mb-3">
                    <div className="fw-semibold">Erasmus+ Mobility</div>
                    <div className="timeline-meta">
                      University of Twente, Enschede, Netherlands
                      <br />
                      Sep 2025 &ndash; Jan 2026
                    </div>
                  </li>

                  <li>
                    <div className="fw-semibold">
                      Bachelor&apos;s in Electrical Engineering
                    </div>
                    <div className="timeline-meta">
                      NED University of Engineering and Technology, Karachi,
                      Pakistan
                      <br />
                      Oct 2019 &ndash; Aug 2023 &middot; CGPA: 3.46
                    </div>
                  </li>
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
  );
};

export default About;