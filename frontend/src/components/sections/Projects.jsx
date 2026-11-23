import { FaArrowRight, FaGithub, FaPlay } from "react-icons/fa";
import ExternalLink from "@/components/ui/ExternalLink";
import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";
import GitHubActivity from "@/components/widgets/GitHubActivity";
import { projects } from "@/data/projects";
import "./Projects.css";

// Every picture in src/assets/projects, by file name, as the fingerprinted
// URL Vite gives it. The data modules stay plain data that Node can import,
// so a project names its picture and the files are resolved here.
const pictures = import.meta.glob("@/assets/projects/*.{avif,webp}", { eager: true, query: "?url", import: "default" });
const srcSet = (name, format) =>
  [480, 960].map((width) => `${pictures[`/src/assets/projects/${name}-${width}.${format}`]} ${width}w`).join(", ");

// A picture's rendered width, which is its card's width less the card's 1px
// borders and the well's padding on each side (Projects.css). The container
// is 90vw + 16px wide from a 35rem screen until it stops at 92rem, on a
// 101rem screen, and the grid's gap is 0.75rem. Past 120rem everything
// follows the root font, which scales with the screen (base.css), so the
// widths become shares of the viewport again.
//
// The grid gives the cards three widths, so there are three lists. Measured
// within 2px at 22 widths from 320 to 2560px. Keep them in step with the
// container, the gutter, the grid's columns and the well's padding: a wrong
// one makes browsers download the wrong file, and nothing tests it.
const ONE_ACROSS = "calc(90vw - 18px)";
const TWO_ACROSS = "calc(45vw - 32px)";
// One card across, down to the narrowest phone: under 35rem the gutter stops
// shrinking with the screen and holds at 1.25rem.
const PHONE = `(min-width: 35rem) ${ONE_ACROSS}, calc(100vw - 74px)`;
const PICTURE_SIZES = {
  // The featured card: its picture takes half of it from 64rem.
  featured: `(min-width: 120rem) 34.1vw, (min-width: 101rem) 40.9rem, (min-width: 64rem) calc(45vw - 74px), ${PHONE}`,
  // The second and third cards: two across on a desktop. On a tablet the
  // second runs across both columns and the third starts the pairs.
  half: (alone) =>
    `(min-width: 120rem) 34.6vw, (min-width: 101rem) 41.5rem, (min-width: 72rem) calc(45vw - 64px), (min-width: 44rem) ${alone ? ONE_ACROSS : TWO_ACROSS}, ${PHONE}`,
  // The last three: three across on a desktop, two on a tablet.
  third: `(min-width: 120rem) 23.4vw, (min-width: 101rem) 28rem, (min-width: 72rem) calc(30vw - 37px), (min-width: 44rem) ${TWO_ACROSS}, ${PHONE}`,
};
const sizesFor = (index) => {
  if (index === 0) return PICTURE_SIZES.featured;
  return index < 3 ? PICTURE_SIZES.half(index === 1) : PICTURE_SIZES.third;
};

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
    <SectionHeader id="projects-title" title="Selected projects">
      Thesis and independent work across applied AI: agents, retrieval,
      evaluation and fine-tuning. Source code is linked wherever the
      repository is public, and a live demo wherever one runs.
    </SectionHeader>

    {/* One list, three weights: the featured project across the full width
        with its picture beside its text, then two cards, then three. The
        grid is also each card's row template (subgrid), so picture, title,
        description, highlight, stack and link line up across a row whatever
        length each card's text runs to. */}
    <ul className="project-grid" onPointerMove={trackPointer}>
      {/* No delay prop: the stagger depends on how many cards share a row,
          which only the CSS knows. See Projects.css. */}
      {projects.map((project, index) => (
        <Reveal
          as="li"
          key={project.title}
          className={project.featured ? "project-card project-card--featured" : "project-card"}
        >
          {/* AVIF with a WebP fallback, as the hero's portrait has: a browser
              that cannot decode AVIF otherwise shows six broken-image icons,
              which is what WebKit's Windows build did. The <picture> is the
              card's grid item and the well the image sits in. Below the fold
              on every screen, so lazy, and width and height give the 2:1 box
              before the file arrives. */}
          <picture className="project-card__picture">
            <source type="image/avif" srcSet={srcSet(project.image, "avif")} sizes={sizesFor(index)} />
            <img
              className="project-card__image"
              src={pictures[`/src/assets/projects/${project.image}-960.webp`]}
              srcSet={srcSet(project.image, "webp")}
              sizes={sizesFor(index)}
              alt={project.imageAlt}
              width="960"
              height="480"
              loading="lazy"
              decoding="async"
            />
          </picture>
          {/* Only the featured card says where it was built. On the other
              five the line read "Independent Project" five times; the
              section's subtitle says it once. */}
          {project.featured && <p className="project-card__context">{project.role}</p>}
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
