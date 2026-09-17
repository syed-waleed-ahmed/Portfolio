import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";
import { experiences } from "@/data/experience";
import "./Experience.css";

// One role per row, dates and place in a narrow column beside the detail -
// the layout a CV uses, and for the same reason: bullets get a full reading
// measure instead of three narrow columns side by side.
const Experience = () => (
  <div className="container">
    <SectionHeader id="experience-title" title="Experience">
      The roles I&apos;ve held and the systems I built in each one.
    </SectionHeader>

    <ol className="experience-list">
      {experiences.map((role) => (
        <Reveal as="li" key={role.company} className="experience">
          <div className="experience__meta">
            <p className="experience__period">{role.period}</p>
            <p className="experience__location">{role.location}</p>
          </div>
          <article className="experience__body">
            <h3 className="experience__title">{role.title}</h3>
            <p className="experience__company">{role.company}</p>
            <ul className="experience__bullets">
              {role.bullets.map((bullet) => (
                <li key={bullet.slice(0, 40)}>{bullet}</li>
              ))}
            </ul>
          </article>
        </Reveal>
      ))}
    </ol>
  </div>
);

export default Experience;
