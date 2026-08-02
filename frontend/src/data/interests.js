// icon: a key, not a component - Interests.jsx maps it to an <svg>. Keeps this
// file free of JSX so it stays pure content.

export const roles = [
  {
    icon: "agent",
    title: "AI Engineer",
    line: "Agents, tool use, and the plumbing that makes them dependable.",
  },
  {
    icon: "model",
    title: "ML Engineer",
    line: "Models trained, evaluated, and served like any other production service.",
  },
  {
    icon: "stack",
    title: "Full-Stack AI",
    line: "End to end: the model, the API, and the interface someone clicks on.",
  },
];

export const principles = [
  "Clean architecture",
  "Reproducible workflows",
  "Prototype → production",
];

export const topics = [
  { icon: "agents", label: "Multi-agent systems" },
  { icon: "rag", label: "RAG & retrieval quality" },
  { icon: "eval", label: "LLM eval & observability" },
  { icon: "vision", label: "Vision & multimodal" },
  { icon: "mlops", label: "MLOps & deployment" },
];
