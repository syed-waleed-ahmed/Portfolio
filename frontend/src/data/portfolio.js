// Centralized portfolio constants. Edit here to update across the whole site.

export const personalInfo = {
  name: "Syed Waleed Ahmed",
  shortName: "Waleed", // the name the hero greets with
  // Beside the name in the masthead. The same title as the page <title> and
  // jobTitle in index.html: a change of role moves all three.
  role: "AI Software Engineer",
  location: "Bologna, Italy",
  email: "syedwaleedahmed9@gmail.com",
  resumeUrl:
    "https://drive.google.com/file/d/1aYYWTcgosEV3QP3r3O2Hlf3WqqRkBe_x/view?usp=sharing",
};

// The account scripts/fetch-github-activity.mjs reads. Matches socialLinks.github.
export const githubUsername = "syed-waleed-ahmed";

export const socialLinks = {
  linkedin: "https://www.linkedin.com/in/syed-waleed-ahmed/",
  github: "https://github.com/syed-waleed-ahmed",
  // This site's own source, linked from the footer.
  source: "https://github.com/syed-waleed-ahmed/Portfolio",
};

// Page sections below the hero, in order. The single source for the dock's
// links, the command palette's "Go to" entries, the <section> ids App.jsx
// renders, the heading each section is labelled by (`${id}-title`) and the
// number each one opens with.
//
// The order is the one a recruiter reads in: the work, where it was done,
// then the person and the full list of tools. Projects come first because
// the thesis project is the strongest thing on the page, and the figures in
// the hero point at it. About led the page until November 2026, which put
// two screens of narrative between the introduction and the first project.
export const sections = [
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
];
