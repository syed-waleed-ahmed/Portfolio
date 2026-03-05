import Reveal from "./Reveal";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";

const projects = [
  {
    title: "Multi-Agent AI Marketing Workflow",
    role: "Self-Paced Project",
    period: "2025",
    stack: ["Groq API", "LangGraph", "ReAct", "Python"],
    description:
      "Engineered a multi-agent AI workflow to automate campaign creation from a simple product brief, including trend analysis, copywriting and final content assembly.",
    highlight:
      "Designed a modular, reusable architecture for future channels and formats.",
    github: "https://github.com/syed-waleed-ahmed",
  },
  {
    title: "Delay Classification for Tele-Robotic System",
    role: "Academic Project \u2022 Group Lead",
    period: "2022 \u2013 2023",
    stack: ["C++", "Signal Processing", "Networking"],
    description:
      "Analyzed and classified delays in teleoperation over LAN, WAN and 4G networks to improve stability and reliability of remote robotic systems.",
    highlight:
      "Combined data analysis, system modelling and performance evaluation for robust insights.",
    github: "https://github.com/syed-waleed-ahmed",
  },
  {
    title: "Visual Inspection of Motorcycle Connecting Rods",
    role: "Academic Project",
    period: "2024",
    stack: ["OpenCV", "Python", "Automation"],
    description:
      "Developed a vision-based inspection system for dimensional analysis and automated sorting of connecting rods using feature and hole-count based classification.",
    highlight:
      "Enabled automated quality inspection and robotic sorting between rod types.",
    github: "https://github.com/syed-waleed-ahmed",
  },
];

const Projects = () => {
  return (
      <div className="container">
        <Reveal>
          <h2 className="section-title text-center mb-5">Projects</h2>
        </Reveal>

        <div className="row g-4">
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
                          rel="noreferrer"
                          className="project-link-icon"
                          aria-label={`View ${project.title} on GitHub`}
                        >
                          <FaGithub />
                        </a>
                      )}
                    </div>
                    <div className="text-accent small card-subtitle-accent">
                      {project.role}
                    </div>
                    <div className="timeline-meta mt-1">{project.period}</div>
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