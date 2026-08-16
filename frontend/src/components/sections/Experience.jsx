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

        <div className="row g-4 align-items-stretch justify-content-center">
          {experiences.map((exp, idx) => {
            const Icon = ROLE_ICONS[exp.icon];
            return (
            <div className="col-md-6 col-lg-4 d-flex" key={exp.company}>
              <Reveal delay={0.04 * (idx + 1)} className="w-100">
                <div className="neo-card experience-card h-100 p-4">
                  {/* Icon tile beside the title rather than above it: the
                      titles run to two lines, and a stacked badge pushed the
                      three cards' company rules out of line with each other. */}
                  <div className="experience-head">
                    {Icon && (
                      <span className="experience-icon" aria-hidden="true">
                        <Icon />
                      </span>
                    )}
                    <div className="experience-head-text">
                      <h3 className="mb-1">{exp.title}</h3>
                      <div className="text-accent card-subtitle-accent">
                        {exp.company}
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

                  <ul className="mb-0">
                    {exp.bullets.map((bullet, bi) => (
                      <li key={bi}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>
            );
          })}
        </div>
      </div>
  );
};

export default Experience;
