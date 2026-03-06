import Reveal from "./Reveal";
import { experiences } from "../data/experience";

const Experience = () => {
  return (
      <div className="container">
        <Reveal>
          <h2 className="section-title text-center mb-5">
            Professional Experience
          </h2>
        </Reveal>

        <div className="row g-4 align-items-stretch justify-content-center">
          {experiences.map((exp, idx) => (
            <div className="col-md-6 col-lg-4 d-flex" key={exp.company}>
              <Reveal delay={0.04 * (idx + 1)} className="w-100">
                <div className="neo-card experience-card h-100 p-4">
                  <h3 className="mb-1">{exp.title}</h3>
                  <div className="text-accent mb-1 card-subtitle-accent">
                    {exp.company}
                  </div>
                  <div className="timeline-meta mb-3">{exp.period}</div>

                  <ul className="mb-0">
                    {exp.bullets.map((bullet, bi) => (
                      <li key={bi}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>
          ))}
        </div>
      </div>
  );
};

export default Experience;
