import type { ReactNode } from "react";
import { FaGithub } from "react-icons/fa";
import { LuArrowLeft, LuArrowRight, LuExternalLink } from "react-icons/lu";
import ExternalLink from "@/components/ui/ExternalLink";
import Pipeline from "@/components/ui/Pipeline";
import { projects, type Project } from "@/content/projects.ts";
import { caseStudyPath } from "@/routes.ts";

export interface CaseSection {
  id: string;
  title: string;
  content: ReactNode;
}

interface Props {
  project: Project;
  // The figures a reader should leave with, each stated with its caveat.
  glance: { label: string; value: string }[];
  // What the author did, said plainly.
  role: string;
  sections: CaseSection[];
}

// The layout every case study shares: a header with the facts a reviewer
// checks first, a contents list that stays in view on a desktop, then the
// sections. The order of sections is the case study's own, but each has a
// problem, the architecture, decisions, evaluation and limitations.
export default function CaseStudy({ project, glance, role, sections }: Props) {
  const index = projects.findIndex((p) => p.slug === project.slug);
  const next = projects[(index + 1) % projects.length];

  return (
    <article className="case" aria-labelledby="case-title">
      <header className="case__header">
        <div className="container case__header-inner">
          <p className="case__crumb">
            <a href="/#work">
              <LuArrowLeft className="icon" aria-hidden="true" />
              All work
            </a>
          </p>
          <p className="meta">
            {project.context} · {project.period}
          </p>
          <h1 id="case-title" className="case__title">
            {project.title}
            <span className="case__subtitle">{project.subtitle}</span>
          </h1>
          <p className="case__summary">{project.summary}</p>
          <Pipeline steps={project.pipeline} label={`How ${project.title} works, in order`} />

          <dl className="case__facts">
            <div>
              <dt>My role</dt>
              <dd>{role}</dd>
            </div>
            <div>
              <dt>Stack</dt>
              <dd>{project.stack.join(", ")}</dd>
            </div>
            <div>
              <dt>Links</dt>
              <dd>
                <ul className="link-row">
                  {project.source.kind === "public" ? (
                    <li>
                      <ExternalLink href={project.source.repository}>
                        <FaGithub className="icon" aria-hidden="true" />
                        Source
                      </ExternalLink>
                    </li>
                  ) : (
                    <li className="link-row__note">{project.source.note}</li>
                  )}
                  {project.demo && (
                    <li>
                      <ExternalLink href={project.demo}>
                        <LuExternalLink className="icon" aria-hidden="true" />
                        Live demo
                      </ExternalLink>
                    </li>
                  )}
                </ul>
              </dd>
            </div>
          </dl>
        </div>
      </header>

      <div className="container case__layout">
        <nav className="case__toc" aria-label="On this page">
          <p className="meta">On this page</p>
          <ol>
            <li>
              <a href="#at-a-glance">At a glance</a>
            </li>
            {sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`}>{section.title}</a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="case__body">
          <section id="at-a-glance" className="case__section" aria-labelledby="at-a-glance-title" tabIndex={-1}>
            <h2 id="at-a-glance-title">At a glance</h2>
            <dl className="glance">
              {glance.map((item) => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {sections.map((section) => (
            <section key={section.id} id={section.id} className="case__section" aria-labelledby={`${section.id}-title`} tabIndex={-1}>
              <h2 id={`${section.id}-title`}>{section.title}</h2>
              {section.content}
            </section>
          ))}

          {next && next.slug !== project.slug && (
            <p className="case__next">
              <span className="meta">Next case study</span>
              <a href={caseStudyPath(next.slug)}>
                {next.title}: {next.subtitle}
                <LuArrowRight className="icon" aria-hidden="true" />
              </a>
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
