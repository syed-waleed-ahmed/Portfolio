// Pure content, no JSX - About.jsx renders it (same pattern as interests.js).

export const approach = [
  "My background is split between full-stack engineering and AI/ML. That mix shapes how I work: I build models the way I'd build any other service, with proper APIs, error handling, and observability. Not notebooks that only run on my machine.",
  "A year rotating through cybersecurity, web development, and database administration means I can wire up a whole system, not only the ML parts.",
];

// Every figure here is already claimed in Experience or Projects - this band
// aggregates them rather than adding new ones, because a recruiter skimming
// prose bullets never adds them up on their own. `source` is deliberate: an
// unattributed number reads as marketing, an attributed one is checkable.
// If a figure changes in experience.js or projects.js, change it here too.
export const stats = [
  {
    value: "97.5%",
    label: "Item-match accuracy across six supermarket chains",
    source: "Fruugle",
  },
  {
    value: "90%",
    label: "Manual effort removed by agent orchestration",
    source: "Multi-agent workflow",
  },
  {
    value: "95%+",
    label: "Defect classification accuracy on the line",
    source: "Vision inspection",
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
