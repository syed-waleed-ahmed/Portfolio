import Monogram from "@/components/ui/Monogram";
import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";
import { approach, education, stats, targetRoles } from "@/data/about";
import "./About.css";

const About = () => (
  <div className="container">
    <SectionHeader id="about-title" title="About">
      Half full-stack engineer, half AI/ML. How I got here, and what I&apos;m
      looking for next.
    </SectionHeader>

    {/* Figures first: they are the part of this section a reader can take in
        at a glance, and each one names the entry below that backs it. */}
    <Reveal as="ul" className="stats" aria-label="Selected results">
      {stats.map((stat) => (
        <li className="stat" key={stat.value + stat.source}>
          <span className="stat__value">{stat.value}</span>
          <span className="stat__label">{stat.label}</span>
          <span className="stat__source">{stat.source}</span>
        </li>
      ))}
    </Reveal>

    <div className="about-flow">
      <Reveal className="about-story">
        <h3 className="subhead">Approach</h3>
        {approach.map((paragraph) => (
          <p key={paragraph.slice(0, 32)}>{paragraph}</p>
        ))}
      </Reveal>

      <Reveal as="section" aria-labelledby="education-title">
        <h3 id="education-title" className="subhead">
          Education
        </h3>
        <ol className="schools">
          {education.map((entry) => (
            <li key={entry.degree} className="school">
              <Monogram name={entry.school} />
              <div>
                <p className="school__degree">{entry.degree}</p>
                <p className="school__name">{entry.school}</p>
              </div>
              <p className="school__period">{entry.period}</p>
            </li>
          ))}
        </ol>
      </Reveal>

      <Reveal as="section" className="about-roles" aria-labelledby="roles-title">
        <h3 id="roles-title" className="subhead">
          Roles I&apos;m targeting
        </h3>
        <dl className="roles">
          {targetRoles.map((role) => (
            <div key={role.title} className="roles__item">
              <dt>{role.title}</dt>
              <dd>{role.line}</dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </div>
  </div>
);

export default About;
