import { FaGithub } from "react-icons/fa";
import { LuArrowRight, LuExternalLink } from "react-icons/lu";
import ExternalLink from "@/components/ui/ExternalLink";
import Pipeline from "@/components/ui/Pipeline";
import Section from "@/components/ui/Section";
import { projects, type Project } from "@/content/projects.ts";
import { caseStudyPath } from "@/routes.ts";

function ProjectLinks({ project }: { project: Project }) {
  return (
    <ul className="link-row">
      <li>
        <a href={caseStudyPath(project.slug)}>
          Case study<span className="visually-hidden">: {project.title}</span>
          <LuArrowRight className="icon" aria-hidden="true" />
        </a>
      </li>
      {project.source.kind === "public" ? (
        <li>
          <ExternalLink href={project.source.repository}>
            <FaGithub className="icon" aria-hidden="true" />
            Source<span className="visually-hidden"> of {project.title}</span>
          </ExternalLink>
        </li>
      ) : (
        <li className="link-row__note">{project.source.note}</li>
      )}
      {project.demo && (
        <li>
          <ExternalLink href={project.demo}>
            <LuExternalLink className="icon" aria-hidden="true" />
            Live demo<span className="visually-hidden"> of {project.title}</span>
          </ExternalLink>
        </li>
      )}
    </ul>
  );
}

export default function Work() {
  const [featured, ...rest] = projects;
  if (!featured) return null;

  return (
    <Section
      id="work"
      title="Selected work"
      intro="Six projects, each with a case study: the problem, the architecture, how it was evaluated, and what it does not do yet."
    >
      <article className="feature" aria-labelledby="feature-title">
        <p className="meta">
          {featured.context} · {featured.period}
        </p>
        <h3 id="feature-title" className="feature__title">
          {featured.title}
          <span className="feature__subtitle">{featured.subtitle}</span>
        </h3>
        <p className="feature__summary">{featured.summary}</p>
        <Pipeline steps={featured.pipeline} label={`How ${featured.title} works, in order`} />
        <dl className="notes">
          <div>
            <dt>Key decision</dt>
            <dd>{featured.decision}</dd>
          </div>
          <div>
            <dt>Evidence</dt>
            <dd>{featured.evidence}</dd>
          </div>
        </dl>
        <ProjectLinks project={featured} />
      </article>

      <ol className="projects">
        {rest.map((project) => (
          <li key={project.slug} className="project">
            <div className="project__head">
              <p className="meta">{project.period}</p>
              <h3 className="project__title">
                {project.title}
              </h3>
              <p className="project__subtitle">{project.subtitle}</p>
              <ProjectLinks project={project} />
            </div>
            <div className="project__body">
              <p>{project.summary}</p>
              <Pipeline steps={project.pipeline} label={`How ${project.title} works, in order`} />
              <p className="project__evidence">
                <span className="meta">Result</span> {project.evidence}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
