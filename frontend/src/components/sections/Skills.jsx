import { LuChevronDown } from "react-icons/lu";
import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";
import { coreSkills, skillGroups, skillIcons } from "@/data/skills";
// no-inline: <use> needs a real URL to hang the fragment on, and no browser
// follows one into a data: URI.
import spriteUrl from "@/assets/skill-icons.svg?no-inline";

// A tag naming a product carries its mark, drawn from one sprite file the
// browser fetches once and caches, so the marks cost the entry bundle and the
// prerendered HTML a <use> each rather than three dozen sets of path data.
// The mark is decoration: the name beside it is the name.
const Mark = ({ tag }) =>
  skillIcons[tag] ? (
    <svg className="tag__icon" aria-hidden="true" focusable="false">
      <use href={`${spriteUrl}#${skillIcons[tag]}`} />
    </svg>
  ) : null;

const TOTAL = skillGroups.flatMap((group) => group.tags).length;

// Two parts. First the ten skills the work above is built on, each with the
// project or role that shows it: what a reader should take away, with the
// evidence beside the claim. Then the full inventory as a definition list,
// one group per row, the group name the term and its tools the description,
// which reads as a reference table and scans top to bottom in one pass.
// Sixty-two tags of equal weight said nothing about which ten mattered.
//
// On a phone the inventory sits in a disclosure (.more in components.css),
// shut: the ten are the answer and the sixty-two are the reference. From a
// tablet up it is simply open.
const Skills = () => (
  <div className="container">
    <SectionHeader id="skills-title" title="Skills">
      The ten the work above is built on, each with where it was used, then
      the full inventory by where it applies.
    </SectionHeader>

    <Reveal as="ul" className="core" aria-label="Core skills">
      {coreSkills.map(({ name, proof }) => (
        <li key={name} className="core__item">
          <span className="core__name">
            <Mark tag={name} />
            {name}
          </span>
          <span className="core__proof">{proof}</span>
        </li>
      ))}
    </Reveal>

    <details className="more">
      <summary>
        The full inventory, {TOTAL} skills by area
        <LuChevronDown aria-hidden="true" />
      </summary>
      <Reveal as="dl" className="skills">
        {skillGroups.map((group) => (
          <div key={group.title} className="skills__row">
            <dt className="skills__group">{group.title}</dt>
            <dd>
              <ul className="tag-list">
                {group.tags.map((tag) => (
                  <li key={tag} className="tag">
                    <Mark tag={tag} />
                    {tag}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        ))}
      </Reveal>
    </details>
  </div>
);

export default Skills;
