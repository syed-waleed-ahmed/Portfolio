import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";
import { approach, education, stats, targetRoles } from "@/data/about";
import "./About.css";

const About = () => (
  <div className="container">
    <SectionHeader id="about-title" title="About">
      Half full-stack engineer, half AI/ML. How I got here, and what I&apos;m
      working on now.
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

    {/* Story and education side by side, as they run to about the same
        height; the target roles span the full width underneath. */}
    <div className="about-grid">
      <Reveal className="about-story">
        <h3 className="card-title">Approach</h3>
        {approach.map((paragraph) => (
          <p key={paragraph.slice(0, 32)}>{paragraph}</p>
        ))}
      </Reveal>

      <Reveal as="section" className="card" aria-labelledby="education-title" delay={60}>
        <h3 id="education-title" className="card-title">
          Education
        </h3>
        <ol className="timeline">
          {education.map((entry) => (
            <li key={entry.degree} className="timeline__item">
              <p className="timeline__title">{entry.degree}</p>
              <p className="timeline__meta">{entry.school}</p>
              <p className="timeline__period">{entry.period}</p>
            </li>
          ))}
        </ol>
      </Reveal>

      <Reveal as="section" className="card about-roles" aria-labelledby="roles-title">
        <h3 id="roles-title" className="card-title">
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
