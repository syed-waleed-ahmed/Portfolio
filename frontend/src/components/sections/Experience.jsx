import { LuChevronDown } from "react-icons/lu";
import Monogram from "@/components/ui/Monogram";
import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";
import { experiences } from "@/data/experience";
import "./Experience.css";

// One expandable row per role, so the whole career reads as a timeline at a
// glance and the detail is a click away. The most recent role starts open, which
// keeps real content on the page for anyone who never clicks.
//
// Native <details>: it works without JavaScript, the bullets are in the
// prerendered HTML for crawlers, and find-in-page opens a closed row to show a
// match. It is deliberately not exclusive (no `name`), so a reader can hold two
// roles open and compare them. React sets `open` once and never again, since
// nothing here re-renders, so it does not fight the reader's own toggling.
const Experience = () => (
  <div className="container">
    <SectionHeader id="experience-title" title="Experience">
      The roles I&apos;ve held and the systems I built in each one.
    </SectionHeader>

    <ol className="experience-list">
      {experiences.map((role, index) => (
        <Reveal as="li" key={role.company} delay={index * 40}>
          <details className="experience" open={index === 0}>
            <summary className="experience__summary">
              <Monogram name={role.company} />
              <h3 className="experience__title">{role.title}</h3>
              <span className="experience__company">{role.company}</span>
              <span className="experience__period">{role.period}</span>
              <span className="experience__location">{role.location}</span>
              <LuChevronDown className="experience__chevron" aria-hidden="true" />
            </summary>
            <ul className="experience__bullets">
              {role.bullets.map((bullet) => (
                <li key={bullet.slice(0, 40)}>{bullet}</li>
              ))}
            </ul>
          </details>
        </Reveal>
      ))}
    </ol>
  </div>
);

export default Experience;
