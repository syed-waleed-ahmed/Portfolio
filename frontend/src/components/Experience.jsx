import Reveal from "./Reveal";

const Experience = () => {
  return (
    <section id="experience" className="section-wrapper">
      <div className="container">
        <Reveal>
          <h2 className="section-title text-center mb-5">
            Professional Experience
          </h2>
        </Reveal>

        <div className="row g-4 align-items-stretch">
          {/* Tech Trainee */}
          <div className="col-md-4 d-flex">
            <Reveal delay={0.04} className="w-100">
              <div className="neo-card experience-card h-100 p-4">
                <h3 className="mb-1">Tech Trainee</h3>
                <p className="text-accent mb-1">Jubilee Life Insurance</p>
                <p className="timeline-meta mb-3">Jan 2024 – Oct 2024</p>

                <ul className="mb-0">
                  <li>
                    Completed a 12-month rotational tech program across data,
                    development, networking and governance.
                  </li>
                  <li>
                    Designed, optimized and administered SQL databases and BI
                    dashboards.
                  </li>
                  <li>
                    Built dynamic web apps with HTML, CSS, JS, PHP, .NET ASP
                    Core, React and MySQL.
                  </li>
                  <li>
                    Monitored and analyzed security events using IBM QRadar,
                    SIEM and SOAR.
                  </li>
                </ul>
              </div>
            </Reveal>
          </div>

          {/* Application Engineer */}
          <div className="col-md-4 d-flex">
            <Reveal delay={0.08} className="w-100">
              <div className="neo-card experience-card h-100 p-4">
                <h3 className="mb-1">Application Engineer</h3>
                <p className="text-accent mb-1">
                  Britlite Engineering Company
                </p>
                <p className="timeline-meta mb-3">Oct 2023 – Dec 2023</p>

                <ul className="mb-0">
                  <li>
                    Developed product expertise in cables, networking items,
                    earthing, lighting, transformers, AVR and VFDs.
                  </li>
                  <li>
                    Prepared technical proposals, quotations and detailed
                    reports for complex electrical solutions.
                  </li>
                </ul>
              </div>
            </Reveal>
          </div>

          {/* Electrical Engineering Intern */}
          <div className="col-md-4 d-flex">
            <Reveal delay={0.12} className="w-100">
              <div className="neo-card experience-card h-100 p-4">
                <h3 className="mb-1">Electrical Engineering Intern</h3>
                <p className="text-accent mb-1">
                  Pakistan Civil Aviation Authority
                </p>
                <p className="timeline-meta mb-3">Apr 2023 – May 2023</p>

                <ul className="mb-0">
                  <li>
                    Supported operation &amp; maintenance of HVAC plants, LV
                    distribution and airfield lighting systems.
                  </li>
                  <li>
                    Applied analytical troubleshooting to optimize reliability
                    and performance.
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

export default Experience;
