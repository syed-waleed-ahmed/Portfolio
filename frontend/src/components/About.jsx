import Reveal from "./Reveal";

const About = () => {
  return (
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
                  I think the best AI work happens when you stop treating models
                  as magic and start treating them as components in a system.
                  That mindset drives everything I build &mdash; from multi-agent
                  orchestration layers to production data pipelines.
                </p>
                <p className="mb-3">
                  Right now I&apos;m productizing a modular AI assistant platform
                  at <strong>MemorAIz</strong> (thesis) and building clustering
                  pipelines over 1&nbsp;M+ product records at <strong>Fruugle</strong>.
                  Before that I shipped web apps, SIEM dashboards, and BI
                  reports during a year-long IT rotational programme.
                </p>
                <p className="mb-0">
                  When I&apos;m not writing code I&apos;m usually exploring new
                  papers on agentic architectures, solving problems on LeetCode,
                  or figuring out how to make the next pipeline a little more
                  fault-tolerant.
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
                      Bachelor in Electrical Engineering
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