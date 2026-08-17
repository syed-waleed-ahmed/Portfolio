// Pure content, no JSX - About.jsx renders it (same pattern as interests.js).

// The section subtitle above these paragraphs already says "half full-stack
// engineer, half AI/ML", so the first line does not restate it - it goes
// straight to what that split changes about the work.
//
// This is the one card on the site written with any humour in it, and it is
// deliberately the only one: Experience, Projects and Skills are scanned for
// facts, and a joke in a bullet costs more than it earns. The register here is
// dry and self-deprecating rather than jokey - it lands as a person talking,
// which is the point, and it still says something true in every line.
//
// Three paragraphs rather than two also squares the card off against the
// Education timeline beside it, which used to leave a visible hole below this
// one on desktop.
export const approach = [
  "I build models the way I would build any other production service: real APIs, error handling, observability. The alternative is a notebook that runs beautifully on my laptop and nowhere else, and I have written enough of those to know better.",
  "A year rotating through cybersecurity, web development, and database administration means I can hand over a whole working system, rather than the ML half and a hopeful note about deployment.",
  "Most of the work goes on the unglamorous part: retries, idempotency, and whatever decides to fail at three in the morning. Nobody puts that in the demo. It is usually the reason the demo still works next week.",
];

// Every figure here is already claimed in Experience or Projects - this band
// aggregates them rather than adding new ones, because a recruiter skimming
// prose bullets never adds them up on their own. `source` is deliberate: an
// unattributed number reads as marketing, an attributed one is checkable.
// If a figure changes in experience.js or projects.js, change it here too.
//
// icon: a key, not a component - About.jsx maps it to a component so this file
// stays JSX-free.
export const stats = [
  {
    icon: "accuracy",
    value: "97.5%",
    label: "Item-match accuracy across six supermarket chains",
    source: "Fruugle",
  },
  {
    icon: "automation",
    value: "90%",
    label: "Manual effort removed by agent orchestration",
    source: "Multi-agent workflow",
  },
  {
    icon: "vision",
    value: "95%+",
    label: "Defect classification accuracy on the line",
    source: "Vision inspection",
  },
  {
    icon: "data",
    value: "100K+",
    label: "Records moved through ETL pipelines",
    source: "Jubilee Life Insurance",
  },
];

export const education = [
  {
    degree: "Master's in Automation Engineering",
    school: "Alma Mater Studiorum - Università di Bologna, Italy",
    period: "Sep 2024 - Present",
  },
  {
    degree: "Erasmus+ Mobility",
    school: "University of Twente, Enschede, Netherlands",
    period: "Sep 2025 - Jan 2026",
  },
  {
    degree: "Bachelor's in Electrical Engineering",
    school: "NED University of Engineering and Technology, Karachi, Pakistan",
    period: "Oct 2019 - Aug 2023 · CGPA: 3.46",
  },
];
