import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";
import { skillGroups } from "@/data/skills";
import "./Skills.css";

// A definition list, one group per row: the group name is the term and its
// tools the description. Reads as a reference table rather than a wall of
// cards, and scans top to bottom in one pass.
const Skills = () => (
  <div className="container">
    <SectionHeader id="skills-title" title="Skills">
      The tools and frameworks I work with, grouped by where they apply.
    </SectionHeader>

    <Reveal as="dl" className="skills">
      {skillGroups.map((group) => (
        <div key={group.title} className="skills__row">
          <dt className="skills__group">{group.title}</dt>
          <dd>
            <ul className="tag-list">
              {group.tags.map((tag) => (
                <li key={tag} className="tag">
                  {tag}
                </li>
              ))}
            </ul>
          </dd>
        </div>
      ))}
    </Reveal>
  </div>
);

export default Skills;
