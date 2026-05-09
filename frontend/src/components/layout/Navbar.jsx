import { useEffect, useState } from "react";
import { navLinks, sectionIds } from "@/data/portfolio";

const Navbar = () => {
  const [activeSection, setActiveSection] = useState("top");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;

    const observers = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(id === "hero" ? "top" : id);
          }
        },
        { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
      );

      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((obs) => obs.disconnect());
  }, []);

  const handleNavClick = (e, target) => {
    e.preventDefault();
    setMenuOpen(false);

    if (target === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const el = document.getElementById(target);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    window.history.replaceState({}, "", window.location.pathname);
  };

  return (
    <nav className={`site-nav${scrolled ? " is-scrolled" : ""}`}>
      <div className="site-nav-inner container">
        <a
          href="#"
          className="site-nav-brand"
          onClick={(e) => handleNavClick(e, "top")}
          aria-label="Home"
        >
          <span className="site-nav-brand-mark" aria-hidden="true">SW</span>
          <span className="site-nav-brand-text">Syed Waleed Ahmed</span>
        </a>

        <button
          type="button"
          className={`site-nav-toggle${menuOpen ? " is-open" : ""}`}
          aria-controls="primary-menu"
          aria-expanded={menuOpen}
          aria-label="Toggle navigation"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="site-nav-toggle-line" />
          <span className="site-nav-toggle-line" />
          <span className="site-nav-toggle-line" />
        </button>

        <ul
          id="primary-menu"
          className={`site-nav-list${menuOpen ? " is-open" : ""}`}
        >
          {navLinks.map((link) => (
            <li key={link.label}>
              <a
                href="#"
                className={`site-nav-link${
                  activeSection === link.target ? " is-active" : ""
                }`}
                onClick={(e) => handleNavClick(e, link.target)}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
