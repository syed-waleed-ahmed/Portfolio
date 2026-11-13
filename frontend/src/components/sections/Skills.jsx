import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";
import { skillGroups, skillIcons } from "@/data/skills";
// no-inline: <use> needs a real URL to hang the fragment on, and no browser
// follows one into a data: URI.
import spriteUrl from "@/assets/skill-icons.svg?no-inline";
import "./Skills.css";

// A definition list, one group per row: the group name is the term and its
// tools the description. Reads as a reference table rather than a wall of
// cards, and scans top to bottom in one pass.
//
// A tag naming a product carries its mark, drawn from one sprite file the
// browser fetches once and caches, so the marks cost the entry bundle and the
// prerendered HTML a <use> each rather than three dozen sets of path data.
// The mark is decoration: the tag's text is its name.
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
                  {skillIcons[tag] && (
                    <svg className="tag__icon" aria-hidden="true" focusable="false">
                      <use href={`${spriteUrl}#${skillIcons[tag]}`} />
                    </svg>
                  )}
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
