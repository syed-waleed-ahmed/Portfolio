import Reveal from "./Reveal";
import { skillGroups } from "../data/skills";

const Skills = () => {
  return (
    <div className="container">
      <Reveal>
        <div className="section-header">
          <span className="section-eyebrow">Toolbox</span>
          <h2 className="section-title">Skills</h2>
          <p className="section-subtitle">
            What I actually reach for day-to-day, grouped by where I use it.
          </p>
        </div>
      </Reveal>

      <div className="row g-4 justify-content-center">
        {skillGroups.map((group, gi) => (
          <div className="col-md-6 col-lg-4 d-flex" key={group.title}>
            <Reveal delay={gi * 0.05} className="w-100">
              <div className="neo-card skill-card h-100 p-4">
                <h3 className="mb-3">{group.title}</h3>
                <div className="d-flex flex-wrap gap-2">
                  {group.tags.map((tag) => (
                    <span key={tag} className="skill-badge">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Skills;
