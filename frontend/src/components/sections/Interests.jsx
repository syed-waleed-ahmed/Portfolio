import { FaRobot, FaChartLine, FaLayerGroup, FaCompass } from "react-icons/fa";
import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";
import { roles, principles } from "@/data/interests";

// Maps the icon keys from interests.js to components, so the data file stays
// JSX-free (same pattern as Skills.jsx).
const ROLE_ICONS = {
  agent: FaRobot,
  model: FaChartLine,
  stack: FaLayerGroup,
};

const Interests = () => {
  return (
    <div className="container">
      <SectionHeader icon={FaCompass} title="Interests & Career Focus">
        The roles I&apos;m targeting, and the principles I work by.
      </SectionHeader>

      <Reveal>
        <p className="interests-eyebrow">Target Roles</p>
      </Reveal>

      <div className="row g-4 justify-content-center">
        {roles.map((role, i) => {
          const Icon = ROLE_ICONS[role.icon];
          return (
            <div className="col-md-6 col-lg-4 d-flex" key={role.title}>
              <Reveal delay={0.05 * (i + 1)} className="w-100">
                <div className="neo-card role-card h-100 p-4">
                  {Icon && (
                    <span className="role-icon" aria-hidden="true">
                      <Icon />
                    </span>
                  )}
                  <h3 className="mb-2">{role.title}</h3>
                  <p className="role-line mb-0">{role.line}</p>
                </div>
              </Reveal>
            </div>
          );
        })}
      </div>

      <Reveal delay={0.2}>
        <ul className="principle-row">
          {principles.map((principle) => (
            <li className="principle-chip" key={principle}>
              {principle}
            </li>
          ))}
        </ul>
      </Reveal>
    </div>
  );
};

export default Interests;
