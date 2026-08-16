// icon: a key, not a component - Interests.jsx maps it to an <svg>. Keeps this
// file free of JSX so it stays pure content.

export const roles = [
  {
    icon: "agent",
    title: "AI Engineer",
    line: "Agents, tool use, and the infrastructure that makes them dependable.",
  },
  {
    icon: "model",
    title: "ML Engineer",
    line: "Models trained, evaluated, and served like any other production service.",
  },
  {
    icon: "stack",
    title: "Full-Stack AI",
    line: "End to end: the model, the API, and the interface it is served through.",
  },
];

export const principles = [
  "Clean architecture",
  "Reproducible workflows",
  "Prototype to production",
];

// A "Currently Exploring" tile row used to sit below the principles, listing
// multi-agent systems, RAG, LLM eval, vision and MLOps. Every one of those is
// already claimed in the hero lead or in the Skills groups, so the row was the
// third statement of the same handful of terms. Removed rather than reworded:
// nothing was lost that the page does not say elsewhere.
