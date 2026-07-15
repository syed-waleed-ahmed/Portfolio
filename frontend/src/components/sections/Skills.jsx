import {
  FaBrain,
  FaChartLine,
  FaCode,
  FaServer,
  FaDatabase,
  FaCloud,
} from "react-icons/fa";
import Reveal from "@/components/ui/Reveal";
import { skillGroups } from "@/data/skills";

// Maps the icon key from skills.js to a component, so the data file stays JSX-free.
const GROUP_ICONS = {
  ai: FaBrain,
  ml: FaChartLine,
  code: FaCode,
  web: FaServer,
  data: FaDatabase,
  cloud: FaCloud,
};

const Skills = () => {
  return (
    <div className="container">
      <Reveal>
        <div className="section-header">
          <h2 className="section-title">Skills</h2>
          <p className="section-subtitle">
            What I actually reach for day-to-day, grouped by where I use it.
          </p>
        </div>
      </Reveal>

      <div className="row g-4 justify-content-center">
        {skillGroups.map((group, gi) => {
          const Icon = GROUP_ICONS[group.icon];
          return (
          <div className="col-md-6 col-lg-4 d-flex" key={group.title}>
            <Reveal delay={gi * 0.05} className="w-100">
              <div className="neo-card skill-card h-100 p-4 d-flex flex-column">
                <h3 className="mb-3">
                  {Icon && (
                    <span className="card-heading-icon" aria-hidden="true">
                      <Icon />
                    </span>
                  )}
                  {group.title}
                </h3>
                <div className="d-flex flex-wrap gap-2 flex-grow-1 align-content-center">
                  {group.tags.map((tag) => (
                    <span key={tag} className="skill-badge">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
          );
        })}
      </div>
    </div>
  );
};

export default Skills;
