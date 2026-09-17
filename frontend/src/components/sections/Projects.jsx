import { FaArrowRight, FaGithub } from "react-icons/fa";
import ExternalLink from "@/components/ui/ExternalLink";
import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";
import { projects } from "@/data/projects";
import "./Projects.css";

const Projects = () => (
  <div className="container">
    <SectionHeader id="projects-title" title="Selected projects">
      Thesis, independent and university work across applied AI and robotics.
      Source code is linked wherever the repository is public.
    </SectionHeader>

    {/* The grid is also each card's row template (subgrid), so context,
        title, description, highlight, stack and link line up across a row
        whatever length each card's text runs to. */}
    <ul className="project-grid">
      {projects.map((project, index) => (
        <Reveal as="li" key={project.title} className="project-card" delay={(index % 2) * 60}>
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
          {project.github && (
            <div className="project-card__links">
              <ExternalLink href={project.github} className="text-link">
                <FaGithub aria-hidden="true" />
                View source
                <span className="visually-hidden"> for {project.title}</span>
                <FaArrowRight aria-hidden="true" className="project-card__arrow" />
              </ExternalLink>
            </div>
          )}
        </Reveal>
      ))}
    </ul>
  </div>
);

export default Projects;
