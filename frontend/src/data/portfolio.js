// Centralized portfolio constants. Edit here to update across the whole site.

export const personalInfo = {
  name: "Syed Waleed Ahmed",
  shortName: "Waleed", // the name the hero greets with
  location: "Bologna, Italy",
  email: "syedwaleedahmed9@gmail.com",
  resumeUrl:
    "https://drive.google.com/file/d/1vTuQEyENVeon6ZWjjAvD-Qu3o-KdnlS2/view?usp=sharing",
};

export const socialLinks = {
  linkedin: "https://www.linkedin.com/in/syed-waleed-ahmed/",
  github: "https://github.com/syed-waleed-ahmed",
  // This site's own source, linked from the footer.
  source: "https://github.com/syed-waleed-ahmed/Portfolio",
};

// Page sections below the hero, in order. The single source for the navbar
// links, the <section> ids App.jsx renders and the heading each section is
// labelled by (`${id}-title`).
export const sections = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
];
