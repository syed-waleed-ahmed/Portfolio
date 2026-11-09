import { useEffect, useState } from "react";
import { FaGithub, FaLinkedinIn } from "react-icons/fa";
import {
  LuBriefcase,
  LuFileText,
  LuFolderGit2,
  LuHouse,
  LuMail,
  LuUserRound,
  LuWrench,
} from "react-icons/lu";
import CommandMenu from "@/components/layout/CommandMenu";
import ExternalLink from "@/components/ui/ExternalLink";
import SectionLink from "@/components/ui/SectionLink";
import { personalInfo, sections, socialLinks } from "@/data/portfolio";
import "./Dock.css";

// Section labels and order come from data/portfolio.js. Only the icon lives
// here, with a fallback so a section added there cannot break the dock.
const SECTION_ICONS = {
  about: LuUserRound,
  experience: LuBriefcase,
  projects: LuFolderGit2,
  skills: LuWrench,
  contact: LuMail,
};

const HOME = { id: "top", label: "Home", Icon: LuHouse };
const PAGE_LINKS = [
  HOME,
  ...sections.map(({ id, label }) => ({ id, label, Icon: SECTION_ICONS[id] ?? LuFolderGit2 })),
];

// Floating navigation, on every screen size. It replaces both the sticky top bar
// and the mobile menu, which also puts every section within a thumb's reach on a
// phone, and the Home item replaces the separate back-to-top button.
//
// Every navigation item is a real link with an accessible name, in the
// prerendered HTML, so it works before hydration; only the Search button needs
// JavaScript. The hover magnification and tooltips are CSS: see Dock.css.
const Dock = () => {
  const [activeId, setActiveId] = useState(HOME.id);

  // Mark the section occupying the upper-middle of the viewport.
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: "-35% 0px -60% 0px" }
    );
    for (const { id } of PAGE_LINKS) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div className="reading-progress" aria-hidden="true" />
      <div className="dock-shell">
        <nav className="dock" aria-label="Primary">
          <ul className="dock__list">
            {PAGE_LINKS.map(({ id, label, Icon }) => (
              <li key={id} className="dock__item">
                <SectionLink
                  to={id}
                  className="dock__link"
                  aria-label={label}
                  aria-current={activeId === id ? "true" : undefined}
                >
                  <Icon aria-hidden="true" />
                  <span className="dock__tooltip" aria-hidden="true">
                    {label}
                  </span>
                </SectionLink>
              </li>
            ))}

            <li className="dock__divider" aria-hidden="true" />

            <li className="dock__item dock__item--wide-only">
              <CommandMenu />
            </li>

            {/* LinkedIn and GitHub drop out on a phone: the hero and the contact
                section both carry them, and seven items is what fits a thumb. */}
            <li className="dock__item dock__item--wide-only">
              <ExternalLink href={socialLinks.linkedin} className="dock__link" aria-label="LinkedIn">
                <FaLinkedinIn aria-hidden="true" />
                <span className="dock__tooltip" aria-hidden="true">
                  LinkedIn
                </span>
              </ExternalLink>
            </li>
            <li className="dock__item dock__item--wide-only">
              <ExternalLink href={socialLinks.github} className="dock__link" aria-label="GitHub">
                <FaGithub aria-hidden="true" />
                <span className="dock__tooltip" aria-hidden="true">
                  GitHub
                </span>
              </ExternalLink>
            </li>
            <li className="dock__item">
              <ExternalLink href={personalInfo.resumeUrl} className="dock__link" aria-label="Resume">
                <LuFileText aria-hidden="true" />
                <span className="dock__tooltip" aria-hidden="true">
                  Resume
                </span>
              </ExternalLink>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Dock;
