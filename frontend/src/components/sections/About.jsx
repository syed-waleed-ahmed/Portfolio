import { FaUserAstronaut, FaGraduationCap } from "react-icons/fa";
import Reveal from "@/components/ui/Reveal";
import { approach, stats, education } from "@/data/about";

const About = () => {
  return (
      <div className="container">
        <Reveal>
          <div className="section-header">
            <h2 className="section-title">About Me &amp; Education</h2>
            <p className="section-subtitle">
              Half full-stack engineer, half AI/ML. Here&apos;s a quick
              summary of how I got here and what I&apos;m working on now.
            </p>
          </div>
        </Reveal>

        {/* Full width above the two cards: it is the one thing in this section
            a recruiter can read in two seconds, so nothing should share the
            row with it. */}
        <Reveal delay={0.04}>
          <ul className="about-stats">
            {stats.map((stat) => (
              <li className="about-stat" key={stat.value + stat.label}>
                <span className="about-stat-value">{stat.value}</span>
                <span className="about-stat-label">{stat.label}</span>
                <span className="about-stat-source">{stat.source}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <div className="row g-4 align-items-stretch justify-content-center">
          <div className="col-md-6 d-flex">
            <Reveal delay={0.08} className="w-100">
              <div className="neo-card flex-fill h-100 p-4">
                <div className="card-heading">
                  <span className="card-heading-icon"><FaUserAstronaut /></span>
                  My Approach
                </div>
                {approach.map((para, i) => (
                  <p
                    key={para.slice(0, 24)}
                    className={i === approach.length - 1 ? "mb-0" : "mb-3"}
                  >
                    {para}
                  </p>
                ))}
              </div>
            </Reveal>
          </div>

          <div className="col-md-6 d-flex">
            <Reveal delay={0.12} className="w-100">
              <div className="neo-card flex-fill h-100 p-4 d-flex flex-column">
                <div className="card-heading">
                  <span className="card-heading-icon"><FaGraduationCap /></span>
                  Education
                </div>
                <ul className="timeline timeline-fill flex-grow-1 d-flex flex-column justify-content-between mb-0">
                  {education.map((entry) => (
                    <li key={entry.degree}>
                      <div className="fw-semibold">{entry.degree}</div>
                      <div className="timeline-meta">
                        {entry.school}
                        <br />
                        {entry.period}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
  );
};

export default About;
