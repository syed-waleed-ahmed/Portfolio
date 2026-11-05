// The command palette's entries, built from the other data modules so a new
// section, project or skill reaches the palette without being listed twice.
//
// `action` says what selecting an entry does with `target`:
//   scroll  jump to the section whose id is `target`
//   open    open the URL in a new tab
//   copy    copy the text to the clipboard
//
// `keywords` are matched by the search but not shown, which is what makes a
// search for "FAISS" find the RAG project and "Kafka" find the Skills section.
import { experiences } from "./experience.js";
import { personalInfo, sections, socialLinks } from "./portfolio.js";
import { projects } from "./projects.js";
import { skillGroups } from "./skills.js";

const SECTION_KEYWORDS = {
  experience: experiences.map((entry) => entry.company),
  skills: skillGroups.flatMap((group) => group.tags),
};

// How well an entry matches a search; 0 hides it. Every word has to appear, in
// the label or the keywords.
//
// This replaces cmdk's default fuzzy score, which matches letters in sequence
// across the whole keyword list. Over the Skills entry's long list that matched
// nearly anything, so "copy email" selected Skills and Enter went there instead.
//
// A label match ranks first. Among keyword matches a shorter list ranks higher,
// so the project built with FAISS comes above the section listing every skill.
export const scoreCommand = (label, search, keywords = []) => {
  const words = search.toLowerCase().split(/\s+/).filter(Boolean);
  const lowerLabel = label.toLowerCase();
  const haystack = [lowerLabel, ...keywords.map((keyword) => keyword.toLowerCase())].join(" ");
  if (!words.every((word) => haystack.includes(word))) return 0;
  if (words.every((word) => lowerLabel.includes(word))) return 1;
  return 0.5 + 0.4 / keywords.length;
};

export const commandGroups = [
  {
    heading: "Go to",
    items: [
      { id: "go-top", label: "Home", action: "scroll", target: "top" },
      ...sections.map(({ id, label }) => ({
        id: `go-${id}`,
        label,
        keywords: SECTION_KEYWORDS[id],
        action: "scroll",
        target: id,
      })),
    ],
  },
  {
    heading: "Projects",
    // A project with no public repository has nowhere to open, so its entry
    // goes to the section that describes it.
    items: projects.map((project, index) => ({
      id: `project-${index}`,
      label: project.title,
      keywords: [...project.stack, project.role],
      action: project.github ? "open" : "scroll",
      target: project.github ?? "projects",
    })),
  },
  {
    heading: "Contact",
    items: [
      {
        id: "copy-email",
        label: "Copy email address",
        keywords: [personalInfo.email, "mail"],
        action: "copy",
        target: personalInfo.email,
      },
      { id: "resume", label: "Resume", keywords: ["CV"], action: "open", target: personalInfo.resumeUrl },
      { id: "linkedin", label: "LinkedIn", action: "open", target: socialLinks.linkedin },
      { id: "github", label: "GitHub", action: "open", target: socialLinks.github },
      { id: "source", label: "This site's source", keywords: ["repository"], action: "open", target: socialLinks.source },
    ],
  },
];
