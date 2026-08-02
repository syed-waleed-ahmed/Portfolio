import Reveal from "@/components/ui/Reveal";
import { FaGithub, FaBolt } from "react-icons/fa";
import { projects } from "@/data/projects";

const Projects = () => {
  return (
      <div className="container">
        <Reveal>
          <div className="section-header">
            <h2 className="section-title">Projects</h2>
            <p className="section-subtitle">
              AI/ML and robotics projects from work and study. Code I&apos;ve
              actually shipped or wrote a thesis around, not pitch-deck mockups.
            </p>
          </div>
        </Reveal>

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
              <article
                className={`neo-card project-card${
                  project.featured ? " project-card--featured" : ""
                }`}
              >
                <div className="project-body">
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

                  {/* Role and period on one line: the accent rule under the role
                      used to land on the date sitting right beneath it. */}
                  <p className="project-meta">
                    <span className="project-role">{project.role}</span>
                    <span className="project-meta-dot" aria-hidden="true" />
                    <span className="project-period">{project.period}</span>
                  </p>

                  <p className="project-description mb-0">
                    {project.description}
                  </p>
                </div>

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
