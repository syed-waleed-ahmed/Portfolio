import Reveal from "./Reveal";
import { FaGithub } from "react-icons/fa";
import { projects } from "../data/projects";

const Projects = () => {
  return (
      <div className="container">
        <Reveal>
          <h2 className="section-title text-center mb-5">Projects</h2>
        </Reveal>

        <div className="row g-4 justify-content-center">
          {projects.map((project, idx) => (
            <div className="col-md-6 col-lg-4 d-flex" key={project.title}>
              <Reveal delay={0.06 * (idx + 1)} className="w-100">
                <div className="neo-card project-card h-100 p-4 d-flex flex-column">
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-start">
                      <h3 className="mb-1">{project.title}</h3>
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
                    <div className="text-accent card-subtitle-accent">
                      {project.role}
                    </div>
                    <div className="timeline-meta mb-3">{project.period}</div>
                  </div>

                  <p className="flex-grow-1 mb-3">{project.description}</p>

                  <p className="small text-muted mb-3">
                    <span className="fw-semibold text-accent">Highlight:</span>{" "}
                    {project.highlight}
                  </p>

                  <div className="d-flex flex-wrap gap-2 mt-auto">
                    {project.stack.map((tech) => (
                      <span key={tech} className="badge bg-dark border skill-badge">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
          ))}
        </div>
      </div>
  );
};

export default Projects;