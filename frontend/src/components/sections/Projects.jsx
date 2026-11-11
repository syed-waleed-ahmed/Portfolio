import { FaArrowRight, FaGithub, FaPlay } from "react-icons/fa";
import GitHubActivity from "@/components/sections/GitHubActivity";
import ExternalLink from "@/components/ui/ExternalLink";
import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";
import { projects } from "@/data/projects";
import "./Projects.css";

const Projects = () => (
  <div className="container">
    <SectionHeader id="projects-title" title="Selected projects" label="Projects" variant="feature">
      Thesis, independent and university work across applied AI and robotics.
      Source code is linked wherever the repository is public.
    </SectionHeader>

    {/* The grid is also each card's row template (subgrid), so context,
        title, description, highlight, stack and link line up across a row
        whatever length each card's text runs to. */}
    <ul className="project-grid">
      {/* No delay prop: the stagger depends on how many cards share a row,
          which only the CSS knows. See Projects.css. */}
      {projects.map((project) => (
        <Reveal as="li" key={project.title} className="project-card">
          <p className="project-card__context">{project.role}</p>
          <h3 className="project-card__title">{project.title}</h3>
          <p className="project-card__description">{project.description}</p>
          <p className="project-card__highlight">
            <span className="visually-hidden">Highlight: </span>
            {project.highlight}
          </p>
          <ul className="tag-list" aria-label="Technologies">
            {project.stack.map((tech) => (
              <li key={tech} className="tag">
                {tech}
              </li>
            ))}
          </ul>
          {/* The last subgrid row. A card with no public repository fills it
              with `sourceNote` instead of a link: the row is shared by every
              card in the grid row, so leaving it empty left the card with a
              band of blank surface its neighbours did not have. A running
              deployment adds a second link beside the source. */}
          {(project.github || project.sourceNote) && (
            <div className="project-card__links">
              {project.github ? (
                <>
                  <ExternalLink href={project.github} className="text-link">
                    <FaGithub aria-hidden="true" />
                    View source
                    <span className="visually-hidden"> for {project.title}</span>
                    <FaArrowRight aria-hidden="true" className="project-card__arrow" />
                  </ExternalLink>
                  {project.demo && (
                    <ExternalLink href={project.demo} className="text-link">
                      <FaPlay aria-hidden="true" />
                      Live demo
                      <span className="visually-hidden"> of {project.title}</span>
                      <FaArrowRight aria-hidden="true" className="project-card__arrow" />
                    </ExternalLink>
                  )}
                </>
              ) : (
                <p className="project-card__source-note">{project.sourceNote}</p>
              )}
            </div>
          )}
        </Reveal>
      ))}
    </ul>

    <GitHubActivity />
  </div>
);

export default Projects;
