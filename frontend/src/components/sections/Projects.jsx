import { FaArrowRight, FaGithub, FaPlay } from "react-icons/fa";
import GitHubActivity from "@/components/sections/GitHubActivity";
import ExternalLink from "@/components/ui/ExternalLink";
import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";
import { projects } from "@/data/projects";
import "./Projects.css";

// Every picture in src/assets/projects, by file name, as the fingerprinted
// URL Vite gives it. The data modules stay plain data that Node can import,
// so a project names its picture and the files are resolved here.
const pictures = import.meta.glob("@/assets/projects/*.{avif,webp}", { eager: true, query: "?url", import: "default" });
const srcSet = (name, format) =>
  [480, 960].map((width) => `${pictures[`/src/assets/projects/${name}-${width}.${format}`]} ${width}w`).join(", ");

// The grid: three columns of at most 30rem, then two, then one.
const PICTURE_SIZES = "(min-width: 72rem) 30rem, (min-width: 44rem) 50vw, 100vw";

// Tells the card under the pointer where the pointer is, for the light
// Projects.css draws there. One listener on the grid, writing straight to the
// card's style: no state, so moving the mouse never re-renders anything, and
// React never renders these two properties, so it cannot overwrite them.
const trackPointer = (event) => {
  if (event.pointerType !== "mouse") return;
  const card = event.target.closest(".project-card");
  if (!card) return;
  const box = card.getBoundingClientRect();
  card.style.setProperty("--spot-x", `${event.clientX - box.left}px`);
  card.style.setProperty("--spot-y", `${event.clientY - box.top}px`);
};

const Projects = () => (
  <div className="container">
    <SectionHeader id="projects-title" title="Selected projects" label="Projects" variant="feature">
      Thesis, independent and university work across applied AI and robotics.
      Source code is linked wherever the repository is public, and a live demo
      wherever one runs.
    </SectionHeader>

    {/* The grid is also each card's row template (subgrid), so picture,
        context, title, description, highlight, stack and link line up across
        a row whatever length each card's text runs to. */}
    <ul className="project-grid" onPointerMove={trackPointer}>
      {/* No delay prop: the stagger depends on how many cards share a row,
          which only the CSS knows. See Projects.css. */}
      {projects.map((project) => (
        <Reveal as="li" key={project.title} className="project-card">
          {/* AVIF with a WebP fallback, as the hero's portrait has: a browser
              that cannot decode AVIF otherwise shows six broken-image icons,
              which is what WebKit's Windows build did. The <picture> is the
              card's grid item. Below the fold on every screen, so lazy, and
              width and height give the 2:1 box before the file arrives. */}
          <picture className="project-card__picture">
            <source type="image/avif" srcSet={srcSet(project.image, "avif")} sizes={PICTURE_SIZES} />
            <img
              className="project-card__image"
              src={pictures[`/src/assets/projects/${project.image}-960.webp`]}
              srcSet={srcSet(project.image, "webp")}
              sizes={PICTURE_SIZES}
              alt={project.imageAlt}
              width="960"
              height="480"
              loading="lazy"
              decoding="async"
            />
          </picture>
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
