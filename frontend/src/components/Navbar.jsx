// src/components/Navbar.jsx
import React from "react";

const navLinks = [
  { target: "top", label: "Home" },          // scroll to top
  { target: "about", label: "About" },
  { target: "experience", label: "Experience" },
  { target: "projects", label: "Projects" },
  { target: "skills", label: "Skills" },
  { target: "interests", label: "Interests" },
  { target: "contact", label: "Contact" },
];

const Navbar = () => {
  const handleNavClick = (e, target) => {
    e.preventDefault(); // don't do normal link navigation / reload

    if (target === "top") {
      // Home: scroll to very top of the page
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Other sections: scroll to element with matching id
      const el = document.getElementById(target);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    // Make sure URL stays clean (no #hash)
    window.history.replaceState({}, "", window.location.pathname);
  };

  return (
    <nav className="navbar navbar-expand-md fixed-top glass-nav navbar-dark">
      <div className="container d-flex justify-content-center">
        {/* Toggler for mobile */}
        <button
          className="navbar-toggler border-0 shadow-none ms-auto"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
          aria-controls="mainNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div
          className="collapse navbar-collapse justify-content-center"
          id="mainNav"
        >
          <ul className="navbar-nav nav-pills gap-2">
            {navLinks.map((link) => (
              <li className="nav-item" key={link.label}>
                <a
                  href="/"
                  className="nav-link nav-link-pill"
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
