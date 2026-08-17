import Reveal from "@/components/ui/Reveal";
import { FaGithub, FaBolt, FaLaptopCode } from "react-icons/fa";
import SectionHeader from "@/components/ui/SectionHeader";
import { projects } from "@/data/projects";

const Projects = () => {
  return (
      <div className="container">
        <SectionHeader icon={FaLaptopCode} title="Selected Projects">
          AI/ML and robotics work from industry and research. Every project
          here was built and shipped, or written up as a thesis.
        </SectionHeader>

        {/* A CSS grid rather than Bootstrap columns, so the cards can share row
            tracks via subgrid. That is what keeps the insight block and the tag
            row on the same line across a row, whatever the description length. */}
        <div className="projects-grid">
          {projects.map((project, idx) => (
            <Reveal
              key={project.title}
              delay={0.06 * (idx + 1)}
              className="project-cell"
            >
              <article className="neo-card project-card">
                {/* Title and role are separate bands, not one block. Bundled,
                    a card with a one-line title sat its role tight underneath
                    while its two-line neighbours sat theirs lower, so the roles
                    never lined up across a row. */}
                <div className="project-head">
                  <h3 className="mb-0">{project.title}</h3>
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="project-link-icon"
                      aria-label={`View ${project.title} on GitHub`}
                    >
                      <FaGithub />
                    </a>
                  )}
                </div>

                <p className="project-meta mb-0">{project.role}</p>

                <p className="project-description mb-0">
                  {project.description}
                </p>

                {/* The word "Highlight:" repeated down every card was noise;
                    the icon carries it visually, the label stays for SRs. */}
                <p className="project-highlight mb-0">
                  <span className="project-highlight-icon" aria-hidden="true">
                    <FaBolt />
                  </span>
                  <span className="visually-hidden">Highlight: </span>
                  {project.highlight}
                </p>

                <div className="project-stack">
                  {project.stack.map((tech) => (
                    <span key={tech} className="skill-badge">
                      {tech}
                    </span>
                  ))}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
  );
};

export default Projects;
