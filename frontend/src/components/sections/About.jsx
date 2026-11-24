import Monogram from "@/components/ui/Monogram";
import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";
import { approach, education, targetRoles } from "@/data/about";

// The person behind the work above: how I build, where I studied and what I
// am looking for. The figures that used to open this section are in the hero
// now, on the first screen.
const About = () => (
  <div className="container">
    <SectionHeader id="about-title" title="About">
      Half full-stack engineer, half AI/ML. How I got here, and what I&apos;m
      looking for next.
    </SectionHeader>

    <div className="about-flow">
      <Reveal className="about-story">
        <h3 className="subhead">Approach</h3>
        {approach.map((paragraph) => (
          <p key={paragraph.slice(0, 32)}>{paragraph}</p>
        ))}
      </Reveal>

      {/* Education and the target roles share the second column, so it runs
          as long as the story beside it. Education alone ended half way
          down and left the rest of the column empty. */}
      <div className="about-side">
        <Reveal as="section" aria-labelledby="education-title">
          <h3 id="education-title" className="subhead">
            Education
          </h3>
          <ol className="timeline">
            {education.map((entry) => (
              <li key={entry.degree} className="school">
                <Monogram name={entry.school} />
                <div>
                  <p className="school__degree">{entry.degree}</p>
                  <p className="school__name">{entry.school}</p>
                </div>
                <p className="label school__period">{entry.period}</p>
              </li>
            ))}
          </ol>
        </Reveal>

        <Reveal as="section" aria-labelledby="roles-title">
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
  </div>
);

export default About;
