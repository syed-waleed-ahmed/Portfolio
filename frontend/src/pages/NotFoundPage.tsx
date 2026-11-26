import { projects } from "@/content/projects.ts";
import { caseStudyPath } from "@/routes.ts";

export default function NotFoundPage() {
  return (
    <section className="container standalone" aria-labelledby="not-found-title">
      <p className="meta">404</p>
      <h1 id="not-found-title" className="standalone__title">
        This page does not exist.
      </h1>
      <p>
        The address may be mistyped, or the page may have moved. Try the <a href="/">home page</a>, or one of the case
        studies:
      </p>
      <ul className="standalone__list">
        {projects.map((project) => (
          <li key={project.slug}>
            <a href={caseStudyPath(project.slug)}>{project.title}</a>
          </li>
        ))}
      </ul>
    </section>
  );
}
