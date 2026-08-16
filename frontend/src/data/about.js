// Pure content, no JSX - About.jsx renders it (same pattern as interests.js).

// The section subtitle above these paragraphs already says "half full-stack
// engineer, half AI/ML", so the first line does not restate it - it goes
// straight to what that split changes about the work.
export const approach = [
  "I build models the way I would build any other production service, with proper APIs, error handling, and observability, rather than notebooks that only run on one machine.",
  "A year rotating through cybersecurity, web development, and database administration means I can deliver a complete system, not only the ML components.",
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
