// The command palette's entries and how a search ranks them. Pure data and
// functions, so the Node tests check the ranking and the browser tests check
// that the rendered dialog shows the same order.
import { education, experience } from "./content/experience.ts";
import { projects } from "./content/projects.ts";
import { PERSON, SECTIONS, SITE } from "./content/site.ts";
import { familiarSkills, shownSkills } from "./content/skills.ts";
import { caseStudyPath } from "./routes.ts";

export type CommandAction =
  | { kind: "section"; id: string }
  | { kind: "navigate"; href: string }
  | { kind: "open"; href: string }
  | { kind: "copy"; text: string };

export interface Command {
  id: string;
  label: string;
  keywords: string[];
  action: CommandAction;
}

export interface CommandGroup {
  // A stable slug, the group's React key.
  id: string;
  heading: string;
  items: Command[];
}

const SECTION_KEYWORDS: Record<string, string[]> = {
  experience: experience.flatMap((role) => [role.organization, role.title]),
  about: [
    ...education.map((study) => study.institution),
    ...shownSkills.flatMap((group) => group.skills),
    ...familiarSkills,
    "skills",
    "education",
  ],
  contact: ["email", "message", "hire"],
};

export const commandGroups: CommandGroup[] = [
  {
    id: "sections",
    heading: "Go to",
    items: [
      { id: "go-top", label: "Home", keywords: [], action: { kind: "section", id: "top" } },
      ...SECTIONS.map(({ id, label }) => ({ id: `go-${id}`, label, keywords: SECTION_KEYWORDS[id] ?? [], action: { kind: "section", id } as const })),
    ],
  },
  {
    id: "case-studies",
    heading: "Case studies",
    items: projects.map((project) => ({
      id: `case-${project.slug}`,
      label: project.title,
      keywords: [project.subtitle, ...project.stack],
      action: { kind: "navigate", href: caseStudyPath(project.slug) },
    })),
  },
  {
    id: "source-and-demos",
    heading: "Source and demos",
    items: projects.flatMap((project) => [
      ...(project.source.kind === "public"
        ? [{ id: `source-${project.slug}`, label: `${project.title} source`, keywords: ["github", "repository", "code"], action: { kind: "open", href: project.source.repository } as const }]
        : []),
      ...(project.demo
        ? [{ id: `demo-${project.slug}`, label: `${project.title} live demo`, keywords: ["demo", "deployment", "try"], action: { kind: "open", href: project.demo } as const }]
        : []),
    ]),
  },
  {
    id: "contact",
    heading: "Contact",
    items: [
      { id: "copy-email", label: "Copy email address", keywords: [PERSON.email, "mail"], action: { kind: "copy", text: PERSON.email } },
      { id: "resume", label: "Resume", keywords: ["cv", "pdf"], action: { kind: "open", href: PERSON.links.resume } },
      { id: "linkedin", label: "LinkedIn", keywords: [], action: { kind: "open", href: PERSON.links.linkedin } },
      { id: "github", label: "GitHub", keywords: [], action: { kind: "open", href: PERSON.links.github } },
      { id: "site-source", label: "This site's source", keywords: ["repository", "code"], action: { kind: "open", href: SITE.repository } },
      { id: "privacy", label: "Privacy", keywords: ["data", "cookies"], action: { kind: "navigate", href: "/privacy/" } },
    ],
  },
];

// How well an entry matches a search; 0 hides it. Every word must appear in
// the label or the keywords. A label match ranks first; among keyword matches
// a shorter keyword list ranks higher, so a project built on pgvector comes
// above the section that lists every skill. cmdk's default fuzzy score matched
// letters in order across long keyword lists, which matched almost anything.
export function scoreCommand(label: string, search: string, keywords: readonly string[] = []): number {
  const words = search.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 1;
  const lowerLabel = label.toLowerCase();
  const haystack = [lowerLabel, ...keywords.map((keyword) => keyword.toLowerCase())].join(" ");
  if (!words.every((word) => haystack.includes(word))) return 0;
  if (words.every((word) => lowerLabel.includes(word))) return 1;
  return 0.5 + 0.4 / Math.max(keywords.length, 1);
}

// The order the palette shows for a search: items by score within each group,
// groups by their best item. Ties keep the order above, as cmdk's stable sort
// does.
export function rankCommands(search: string): { group: CommandGroup; items: Command[] }[] {
  return commandGroups
    .map((group) => {
      const scored = group.items
        .map((item) => ({ item, score: scoreCommand(item.label, search, item.keywords) }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score);
      return { group, items: scored.map(({ item }) => item), best: scored[0]?.score ?? 0 };
    })
    .filter(({ items }) => items.length > 0)
    .sort((a, b) => b.best - a.best)
    .map(({ group, items }) => ({ group, items }));
}
