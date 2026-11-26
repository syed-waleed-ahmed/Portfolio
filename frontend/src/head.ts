// The <head> of each prerendered page, as an HTML string. The prerender puts it
// in place of <!--app-head--> in index.html; the client never renders it.
import { education } from "./content/experience.ts";
import { PORTRAIT } from "./content/portrait.ts";
import { projects } from "./content/projects.ts";
import { PERSON, SITE } from "./content/site.ts";
import { absoluteUrl, caseStudyPath, metaFor, type Route } from "./routes.ts";

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// "<" is escaped so no string in the data can end the script element early.
const jsonLd = (data: object) => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`;

const PERSON_ID = `${SITE.url}/#person`;
const WEBSITE_ID = `${SITE.url}/#website`;
const OG_IMAGE = `${SITE.url}/images/og-card.png`;

const person = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": PERSON_ID,
  name: PERSON.name,
  url: `${SITE.url}/`,
  image: `${SITE.url}${PORTRAIT.fallback}`,
  jobTitle: PERSON.title,
  email: `mailto:${PERSON.email}`,
  address: { "@type": "PostalAddress", addressLocality: "Bologna", addressCountry: "IT" },
  alumniOf: [
    { "@type": "CollegeOrUniversity", name: "University of Bologna", sameAs: "https://www.unibo.it/" },
    { "@type": "CollegeOrUniversity", name: "University of Twente", sameAs: "https://www.utwente.nl/" },
    { "@type": "CollegeOrUniversity", name: "NED University of Engineering and Technology", sameAs: "https://www.neduet.edu.pk/" },
  ],
  hasCredential: {
    "@type": "EducationalOccupationalCredential",
    name: education[0]!.degree,
    credentialCategory: "degree",
    recognizedBy: { "@type": "CollegeOrUniversity", name: "University of Bologna" },
  },
  // Only what the case studies on this site show.
  knowsAbout: [
    "Large Language Models",
    "LLM Evaluation",
    "Retrieval-Augmented Generation",
    "AI Agents",
    "Backend Engineering",
    "Multi-Tenant Systems",
    "Machine Learning",
    "TypeScript",
    "Python",
  ],
  knowsLanguage: PERSON.languages.map(({ name }) => name),
  sameAs: [PERSON.links.linkedin, PERSON.links.github, PERSON.links.huggingface],
};

function structuredData(route: Route): object[] {
  const meta = metaFor(route);
  switch (route.kind) {
    case "home":
      return [
        person,
        { "@context": "https://schema.org", "@type": "WebSite", "@id": WEBSITE_ID, name: PERSON.name, url: `${SITE.url}/`, inLanguage: "en", publisher: { "@id": PERSON_ID } },
        {
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          url: `${SITE.url}/`,
          name: meta.title,
          isPartOf: { "@id": WEBSITE_ID },
          mainEntity: { "@id": PERSON_ID },
          // Google's profile-page markup requires a full date-time.
          dateModified: `${SITE.updated}T00:00:00+01:00`,
        },
        {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `Case studies by ${PERSON.name}`,
          numberOfItems: projects.length,
          itemListElement: projects.map((project, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: absoluteUrl(caseStudyPath(project.slug)),
            name: project.title,
          })),
        },
      ];
    case "case-study": {
      const { project } = route;
      const work =
        project.source.kind === "public"
          ? { "@type": "SoftwareSourceCode", name: project.title, codeRepository: project.source.repository, programmingLanguage: project.languages }
          : { "@type": "CreativeWork", name: project.title };
      return [
        {
          "@context": "https://schema.org",
          "@type": "TechArticle",
          headline: `${project.title}: ${project.subtitle}`,
          description: project.summary,
          url: absoluteUrl(meta.path),
          author: { "@type": "Person", "@id": PERSON_ID, name: PERSON.name, url: `${SITE.url}/` },
          dateModified: `${SITE.updated}T00:00:00+01:00`,
          image: OG_IMAGE,
          about: work,
          inLanguage: "en",
        },
      ];
    }
    default:
      return [];
  }
}

export function renderHead(route: Route): string {
  const meta = metaFor(route);
  const url = absoluteUrl(meta.path);
  const tags = [
    `<title>${escapeHtml(meta.title)}</title>`,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    meta.indexable ? `<link rel="canonical" href="${url}" />` : `<meta name="robots" content="noindex" />`,
    `<meta property="og:type" content="${meta.type === "article" ? "article" : "website"}" />`,
    `<meta property="og:site_name" content="${escapeHtml(PERSON.name)}" />`,
    `<meta property="og:locale" content="en_GB" />`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${OG_IMAGE}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${escapeHtml(`${PERSON.name}, ${PERSON.title}`)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
  ];
  if (route.kind === "home") {
    // Fetched at the priority of the image it is: the portrait the hero shows.
    tags.push(
      `<link rel="preload" as="image" type="image/avif" imagesrcset="${PORTRAIT.avif}" imagesizes="${PORTRAIT.sizes}" fetchpriority="high" />`
    );
  }
  tags.push(...structuredData(route).map(jsonLd));
  return tags.join("\n    ");
}
