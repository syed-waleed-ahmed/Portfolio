// src/components/Navbar.jsx
import React, { useEffect, useState } from "react";

const navLinks = [
  { target: "top", label: "Home" },
  { target: "about", label: "About" },
  { target: "experience", label: "Experience" },
  { target: "projects", label: "Projects" },
  { target: "skills", label: "Skills" },
  { target: "interests", label: "Interests" },
  { target: "contact", label: "Contact" },
];

const sectionIds = ["hero", "about", "experience", "projects", "skills", "interests", "contact"];

const Navbar = () => {
  const [activeSection, setActiveSection] = useState("top");
  const [menuOpen, setMenuOpen] = useState(false);

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
  const closeMobileMenu = () => {
    const navbarCollapse = document.getElementById("mainNav");
    if (!navbarCollapse) return;

    setMenuOpen(false);

    if (navbarCollapse.classList.contains("show")) {
      // ✅ No optional chaining (better iOS/Safari compatibility)
      const bs = window.bootstrap;

      if (bs && bs.Collapse) {
        const instance = bs.Collapse.getInstance(navbarCollapse);
        if (instance) instance.hide();
        else navbarCollapse.classList.remove("show");
      } else {
        navbarCollapse.classList.remove("show");
      }
    }
  };

  const handleNavClick = (e, target) => {
    e.preventDefault();

    closeMobileMenu();

    // Scroll
    if (target === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const el = document.getElementById(target);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    // keep URL clean
    window.history.replaceState({}, "", window.location.pathname);
  };

  return (
    <nav className="navbar navbar-expand-md fixed-top glass-nav navbar-dark">
      <div className="container">
        <button
          className={`navbar-toggler border-0 shadow-none ms-auto hamburger${menuOpen ? " open" : ""}`}
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
          aria-controls="mainNav"
          aria-expanded={menuOpen}
          aria-label="Toggle navigation"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>

        <div className="collapse navbar-collapse justify-content-center" id="mainNav">
          <ul className="navbar-nav nav-pills gap-2">
            {navLinks.map((link) => (
              <li className="nav-item" key={link.label}>
                <a
                  href="#"
                  className={`nav-link nav-link-pill${
                    activeSection === link.target ? " active" : ""
                  }`}
                  onClick={(e) => handleNavClick(e, link.target)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
