import {
  FaBriefcase,
  FaBrain,
  FaChartLine,
  FaLayerGroup,
  FaRegCalendarAlt,
  FaMapMarkerAlt,
} from "react-icons/fa";
import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";
import { experiences } from "@/data/experience";

// Maps the icon key from experience.js to a component, so the data file stays
// JSX-free (same pattern as Skills.jsx).
const ROLE_ICONS = {
  ai: FaBrain,
  ml: FaChartLine,
  stack: FaLayerGroup,
};

const Experience = () => {
  return (
      <div className="container">
        <SectionHeader icon={FaBriefcase} title="Professional Experience">
          The roles I&apos;ve held and the systems I built in each one.
        </SectionHeader>

        {/* A CSS grid rather than Bootstrap columns, for the same reason as
            Projects: subgrid lets the three cards share row tracks, so the
            meta row and the bullet list start on the same line across a row
            however many lines the job title above them runs to. */}
        <div className="experience-grid">
          {experiences.map((exp, idx) => {
            const Icon = ROLE_ICONS[exp.icon];
            return (
              <Reveal
                key={exp.company}
                delay={0.04 * (idx + 1)}
                className="experience-cell"
              >
                <article className="neo-card experience-card">
                  {/* Icon on the left with the title and company stacked
                      beside it, dates and location on their own row below.
                      Title and company stay in one block so the company sits
                      tight under the title rather than a full grid gap clear
                      of it. */}
                  <div className="experience-head">
                    {Icon && (
                      <span className="experience-icon" aria-hidden="true">
                        <Icon />
                      </span>
                    )}
                    <div className="experience-head-text">
                      <h3 className="experience-title">{exp.title}</h3>
                      <div className="experience-company">
                        <span className="text-accent card-subtitle-accent">
                          {exp.company}
                        </span>
                      </div>
                    </div>
                  </div>

                  <ul className="experience-meta">
                    <li>
                      <FaRegCalendarAlt aria-hidden="true" />
                      {exp.period}
                    </li>
                    <li>
                      <FaMapMarkerAlt aria-hidden="true" />
                      {exp.location}
                    </li>
                  </ul>

                  <ul className="experience-bullets mb-0">
                    {exp.bullets.map((bullet, bi) => (
                      <li key={bi}>{bullet}</li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
  );
};

export default Experience;
