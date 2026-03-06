export const projects = [
  {
    title: "Adversarial Training vs Domain Randomization",
    role: "Academic Project \u2022 Group",
    period: "2025 \u2013 2026",
    stack: ["PPO", "LSTM", "SAC", "OpenAI Gym"],
    description:
      "Benchmarked RL agent robustness in a modified Lunar Lander environment using adversarial self-play and domain randomization under visible and latent wind conditions.",
    highlight:
      "LSTM-PPO with latent disturbances achieved the highest robustness by inferring hidden wind through temporal memory.",
    github:
      "https://github.com/syed-waleed-ahmed/LunarLander_AdversaryLearning",
  },
  {
    title: "Adversarial Attacks & Defenses on CelebA",
    role: "Academic Project \u2022 Group",
    period: "2025 \u2013 2026",
    stack: ["ResNet-18", "FGSM", "PGD", "PyTorch"],
    description:
      "Studied adversarial robustness in face attribute classification using FGSM and PGD attacks on a pretrained ResNet-18, with FGSM adversarial training as defense.",
    highlight:
      "PGD drove accuracy to 0%; FGSM adversarial training defended only against FGSM, revealing the limits of single-attack defenses.",
    github:
      "https://github.com/syed-waleed-ahmed/celeba-adversarial-attacks-defenses",
  },
  {
    title: "Memoraiz Onboarding Assistant",
    role: "Testing Project",
    period: "2026",
    stack: ["Next.js", "Mastra", "OpenAI", "pgvector"],
    description:
      "Built an AI-powered onboarding platform with a split-screen conversational interface that auto-fills company profiles in real time using parallel LLM racing, hybrid caching, and streaming.",
    highlight:
      "Replaced manual form filling with an agent-driven workflow combining RAG retrieval, real-time canvas updates, and sub-second response times.",
    github: "https://github.com/syed-waleed-ahmed/memoraiz-onboarding",
  },
];
