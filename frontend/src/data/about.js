// Pure content, no JSX - About.jsx renders it.

// This is the one block on the site written with any humour in it, and it is
// deliberately the only one: Experience, Projects and Skills are scanned for
// facts. The register is dry rather than jokey, and every line still says
// something true.
export const approach = [
  "I build models the way I would build any other production service: real APIs, error handling, observability. The alternative is a notebook that runs beautifully on my laptop and nowhere else, and I have written enough of those to know better.",
  "A year rotating through cybersecurity, web development, and database administration means I can hand over a whole working system, rather than the ML half and a hopeful note about deployment.",
  "Most of the work goes on the unglamorous part: retries, idempotency, and whatever decides to fail at three in the morning. Nobody puts that in the demo. It is usually the reason the demo still works next week.",
];

// Every figure here is already claimed in experience.js or projects.js - this
// band aggregates them rather than adding new ones. `source` is deliberate: an
// attributed number is checkable against the section below it.
// test/data.test.js fails the build if a value stops appearing in its source
// entry, so change both together.
//
// Only figures traceable to a record are listed. "90% manual effort removed"
// and "95%+ defect classification" were dropped in September 2026: neither
// appears in the Multi-Agent Workflow or connecting-rod repositories, and the
// connecting-rod project measures dimensions rather than classifying defects.
export const stats = [
  {
    value: "985",
    label: "Automated tests across the thesis service, its console and its first tenant",
    source: "RemindrAI",
  },
  {
    value: "97.5%",
    label: "Item-match accuracy across six supermarket chains, against a 95% target",
    source: "Fruugle",
  },
  {
    value: "99.5%",
    label: "Product-category accuracy across 16 classes",
    source: "Fruugle",
  },
  {
    value: "100K+",
    label: "Records moved through ETL pipelines",
    source: "Jubilee Life Insurance",
  },
];

export const education = [
  {
    degree: "Master's in Automation Engineering",
    school: "Alma Mater Studiorum - Università di Bologna, Italy",
    period: "Sep 2024 - Oct 2026 (expected)",
  },
  {
    degree: "Erasmus+ Mobility",
    school: "University of Twente, Enschede, Netherlands",
    period: "Sep 2025 - Jan 2026",
  },
  {
    degree: "Bachelor's in Electrical Engineering",
    school: "NED University of Engineering and Technology, Karachi, Pakistan",
    period: "Oct 2019 - Aug 2023",
  },
];

// The roles this portfolio is aimed at. Moved here from the former Interests
// section, which also carried three generic principle chips ("Clean
// architecture" and so on) that said nothing the rest of the page does not.
export const targetRoles = [
  {
    title: "AI Engineer",
    line: "Agents, tool use, and the infrastructure that makes them dependable.",
  },
  {
    title: "ML Engineer",
    line: "Models trained, evaluated, and served like any other production service.",
  },
  {
    title: "Full-Stack AI Engineer",
    line: "End to end: the model, the API, and the interface it is served through.",
  },
];
