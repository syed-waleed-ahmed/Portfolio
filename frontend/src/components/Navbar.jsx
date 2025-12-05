// src/components/Navbar.jsx
import React from "react";

const navLinks = [
  { href: "#about", label: "About" },
  { href: "#experience", label: "Experience" },
  { href: "#projects", label: "Projects" },
  { href: "#skills", label: "Skills" },
  { href: "#interests", label: "Interests" },
  { href: "#contact", label: "Contact" },
];

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-md fixed-top glass-nav">
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
              <li className="nav-item" key={link.href}>
                <a href={link.href} className="nav-link nav-link-pill">
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
