import { LuArrowRight } from "react-icons/lu";
import Section from "@/components/ui/Section";
import { experience } from "@/content/experience.ts";
import { projectBySlug } from "@/content/projects.ts";
import { caseStudyPath } from "@/routes.ts";

export default function Experience() {
  return (
    <Section id="experience" title="Experience" intro="Internships and a traineeship, most recent first, in the same words as my CV.">
      <ol className="roles">
        {experience.map((role) => (
          <li key={role.organization} className="role">
            <div className="role__head">
              <h3 className="role__title">{role.title}</h3>
              <p className="role__org">{role.organization}</p>
              <p className="meta">
                {role.period}
                <br />
                {role.location}
              </p>
            </div>
            <div className="role__body">
              <ul className="role__bullets">
                {role.bullets.map((bullet) => (
                  <li key={bullet.slice(0, 48)}>{bullet}</li>
                ))}
              </ul>
              {role.caseStudy && (
                <p>
                  <a href={caseStudyPath(role.caseStudy)}>
                    Case study<span className="visually-hidden">: {projectBySlug(role.caseStudy)?.title}</span>
                    <LuArrowRight className="icon" aria-hidden="true" />
                  </a>
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
