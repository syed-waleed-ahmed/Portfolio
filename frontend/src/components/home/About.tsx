import Section from "@/components/ui/Section";
import { education } from "@/content/experience.ts";
import { familiarSkills, shownSkills } from "@/content/skills.ts";

export default function About() {
  return (
    <Section id="about" title="About" intro="How I work, where I studied, and the tools I can show you working code for.">
      <div className="about">
        <div className="about__story prose">
          <p>
            I treat a model call like any other dependency that can fail: it gets a timeout, a retry policy, a test with a
            fake, and an evaluation that runs before a change ships. The thesis is where that habit stuck. A reminder that
            silently never arrives is worse than having no reminder service at all.
          </p>
          <p>
            I came to software from electrical engineering, and a traineeship that moved me between an insurer&apos;s IT teams
            left me comfortable owning a system end to end, from the schema to the deploy.
          </p>
          <h3 className="subhead">How I work with AI tools</h3>
          <p>
            I use AI coding assistants, mostly Claude, for much of the implementation, this site included; commits written
            with one carry a co-author line, so the history shows where. What I answer for is the design, the evaluation and
            every claim on this page, and each case study says where its evidence is thin.
          </p>
        </div>

        <div className="about__side">
          <h3 className="subhead">Education</h3>
          <ol className="studies">
            {education.map((study) => (
              <li key={study.degree}>
                <p className="studies__degree">{study.degree}</p>
                <p>{study.institution}</p>
                <p className="meta">
                  {study.period}
                  {study.note && (
                    <>
                      <br />
                      {study.note}
                    </>
                  )}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="skills" aria-labelledby="skills-title">
        <h3 id="skills-title" className="subhead">
          Skills
        </h3>
        <p className="skills__intro">
          Split by evidence. The first list is used in something on this site you can run or read; the second I have
          used in coursework or as a trainee, with nothing here to inspect.
        </p>
        <dl className="skills__groups">
          {shownSkills.map((group) => (
            <div key={group.name} className="skills__group">
              <dt>{group.name}</dt>
              <dd>
                <ul className="tags">
                  {group.skills.map((skill) => (
                    <li key={skill}>{skill}</li>
                  ))}
                </ul>
                <p className="meta">{group.shownIn}</p>
              </dd>
            </div>
          ))}
          <div className="skills__group skills__group--familiar">
            <dt>Familiar, not shown here</dt>
            <dd>
              <ul className="tags">
                {familiarSkills.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </dd>
          </div>
        </dl>
      </div>
    </Section>
  );
}
