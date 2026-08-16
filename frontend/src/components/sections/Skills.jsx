import {
  FaBrain,
  FaChartLine,
  FaCode,
  FaServer,
  FaDatabase,
  FaCloud,
  FaTools,
} from "react-icons/fa";
import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";
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
      <SectionHeader icon={FaTools} title="Technical Skills">
        The tools and frameworks I work with day to day, grouped by where they
        apply.
      </SectionHeader>

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
