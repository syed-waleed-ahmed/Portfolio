import {
  FaRobot,
  FaChartLine,
  FaLayerGroup,
  FaSitemap,
  FaSearchPlus,
  FaChartBar,
  FaEye,
  FaInfinity,
} from "react-icons/fa";
import Reveal from "@/components/ui/Reveal";
import { roles, principles, topics } from "@/data/interests";

// Maps the icon keys from interests.js to components, so the data file stays
// JSX-free (same pattern as Skills.jsx).
const ROLE_ICONS = {
  agent: FaRobot,
  model: FaChartLine,
  stack: FaLayerGroup,
};

const TOPIC_ICONS = {
  agents: FaSitemap,
  rag: FaSearchPlus,
  eval: FaChartBar,
  vision: FaEye,
  mlops: FaInfinity,
};

const Interests = () => {
  return (
    <div className="container">
      <Reveal>
        <div className="section-header">
          <h2 className="section-title">Interests &amp; Career Focus</h2>
          <p className="section-subtitle">
            The roles I&apos;m aiming for, how I like to work, and what
            I&apos;m digging into right now.
          </p>
        </div>
      </Reveal>

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

      <Reveal delay={0.24}>
        <p className="interests-eyebrow">Currently Exploring</p>
      </Reveal>

      <Reveal delay={0.28}>
        <ul className="topic-grid">
          {topics.map((topic) => {
            const Icon = TOPIC_ICONS[topic.icon];
            return (
              <li className="topic-tile" key={topic.label}>
                {Icon && (
                  <span className="topic-icon" aria-hidden="true">
                    <Icon />
                  </span>
                )}
                {topic.label}
              </li>
            );
          })}
        </ul>
      </Reveal>
    </div>
  );
};

export default Interests;
