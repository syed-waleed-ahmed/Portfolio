import { useEffect, useRef, useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import ExternalLink from "@/components/ui/ExternalLink";
import SectionLink from "@/components/ui/SectionLink";
import { personalInfo, sections } from "@/data/portfolio";
import "./Navbar.css";

// Matches the breakpoint in Navbar.css where the inline links collapse.
const DESKTOP_QUERY = "(min-width: 48rem)";

const Navbar = () => {
  const [activeId, setActiveId] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef(null);

  // Highlight the section occupying the upper-middle of the viewport.
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
    for (const { id } of sections) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    // The hero is not in the nav, so reaching it clears the highlight.
    const hero = document.getElementById("top");
    const heroObserver = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setActiveId(null),
      { rootMargin: "-35% 0px -60% 0px" }
    );
    if (hero) heroObserver.observe(hero);
    return () => {
      observer.disconnect();
      heroObserver.disconnect();
    };
  }, []);

  // While the mobile menu is open: Escape or a click outside the header closes
  // it, and widening past the breakpoint resets it so it cannot reappear
  // stale when the window narrows again.
  useEffect(() => {
    if (!menuOpen) return;
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const close = () => setMenuOpen(false);
    const onKeyDown = (e) => {
      if (e.key !== "Escape") return;
      close();
      headerRef.current?.querySelector(".site-nav__toggle")?.focus();
    };
    const onPointerDown = (e) => {
      if (!headerRef.current?.contains(e.target)) close();
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    desktop.addEventListener("change", close);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
      desktop.removeEventListener("change", close);
    };
  }, [menuOpen]);

  return (
    <header ref={headerRef} className="site-header" data-menu-open={menuOpen}>
      <nav className="site-nav container" aria-label="Primary">
        <SectionLink to="top" className="site-nav__brand" onClick={() => setMenuOpen(false)}>
          {personalInfo.name}
        </SectionLink>

        <button
          type="button"
          className="site-nav__toggle"
          aria-controls="primary-menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <FaTimes aria-hidden="true" /> : <FaBars aria-hidden="true" />}
          <span className="visually-hidden">Menu</span>
        </button>

        <div id="primary-menu" className="site-nav__menu">
          <ul className="site-nav__links">
            {sections.map(({ id, label }) => (
              <li key={id}>
                <SectionLink
                  to={id}
                  className="site-nav__link"
                  aria-current={activeId === id ? "true" : undefined}
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </SectionLink>
              </li>
            ))}
          </ul>
          <ExternalLink href={personalInfo.resumeUrl} className="btn btn--secondary btn--sm site-nav__resume">
            Resume
          </ExternalLink>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
