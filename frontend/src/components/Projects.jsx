import Reveal from "./Reveal";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";

const projects = [
  {
    title: "Adversarial Training vs Domain Randomization",
    role: "Academic Project \u2022 Group",
    period: "2025 \u2013 2026",
    stack: ["PPO", "LSTM", "SAC", "OpenAI Gym"],
    description:
      "Benchmarked RL agent robustness in a modified Lunar Lander environment using adversarial self-play and domain randomization under visible and latent wind conditions.",
    highlight:
      "LSTM-PPO with latent disturbances achieved the highest robustness by inferring hidden wind through temporal memory.",
    github: "https://github.com/syed-waleed-ahmed/LunarLander_AdversaryLearning",
  },
  {
    title: "Adversarial Attacks & Defenses on CelebA",
    role: "Academic Project \u2022 Group",
    period: "2025 \u2013 2026",
    stack: ["ResNet-18", "FGSM", "PGD", "PyTorch"],
    description:
      "Studied adversarial robustness in face attribute classification using FGSM and PGD attacks on a pretrained ResNet-18, with FGSM adversarial training as defense.",
    highlight:
      "PGD drove accuracy to 0%; FGSM adversarial training defended only against FGSM, revealing the limits of single-attack defenses.",
    github: "https://github.com/syed-waleed-ahmed/celeba-adversarial-attacks-defenses",
  },
  {
    title: "Memoraiz Onboarding Assistant",
    role: "Testing Project",
    period: "2026",
    stack: ["Next.js", "Mastra", "OpenAI", "pgvector"],
    description:
      "Built an AI-powered onboarding platform with a split-screen conversational interface that auto-fills company profiles in real time using parallel LLM racing, hybrid caching, and streaming.",
    highlight:
      "Replaced manual form filling with an agent-driven workflow combining RAG retrieval, real-time canvas updates, and sub-second response times.",
    github: "https://github.com/syed-waleed-ahmed/memoraiz-onboarding",
  },
];

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
                          rel="noreferrer"
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