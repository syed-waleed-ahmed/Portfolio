// Facts about the person and the site. Every page, the structured data, the
// sitemap and the social card read them from here, so each is stated once.
// Experience wording follows the current CVs, which are the source of truth
// for employment facts.

export const SITE = {
  url: "https://syedwaleedahmed.me",
  repository: "https://github.com/syed-waleed-ahmed/Portfolio",
  // The day the content was last reviewed. The sitemap, the ProfilePage
  // structured data and the footer show it.
  updated: "2026-11-25",
} as const;

export interface Language {
  name: string;
  level: "native" | "fluent" | "elementary";
}

export const PERSON = {
  name: "Syed Waleed Ahmed",
  // The name the greeting uses.
  shortName: "Waleed",
  title: "AI Software Engineer",
  location: "Bologna, Italy",
  email: "syedwaleedahmed9@gmail.com",
  status: "Open to AI, backend and ML engineering roles",
  // As stated on the CVs.
  workAuthorization: "No visa sponsorship required in Italy",
  languages: [
    { name: "English", level: "fluent" },
    { name: "Urdu", level: "native" },
    { name: "Italian", level: "elementary" },
  ] satisfies Language[],
  degree: "MSc Automation Engineering, University of Bologna, 2026",
  links: {
    github: "https://github.com/syed-waleed-ahmed",
    linkedin: "https://www.linkedin.com/in/syed-waleed-ahmed/",
    huggingface: "https://huggingface.co/syed-waleed-ahmed",
    // The AI Engineer CV, kept current on Google Drive.
    resume: "https://drive.google.com/file/d/1aYYWTcgosEV3QP3r3O2Hlf3WqqRkBe_x/view?usp=sharing",
  },
} as const;

export const languageList = PERSON.languages.map(({ name, level }) => `${name} (${level})`).join(", ");

// The sections of the home page, in order. The header, the command palette
// and the page itself read this list.
export const SECTIONS = [
  { id: "work", label: "Work" },
  { id: "experience", label: "Experience" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
] as const;
