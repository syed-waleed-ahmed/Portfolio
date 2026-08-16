export const projects = [
  {
    title: "RemindrAI: Portable Multi-Channel Reminder Service",
    role: "Master's Thesis · MemorAIz S.r.l.",
    period: "2026",
    stack: ["Next.js 16", "TypeScript", "Vercel AI SDK", "Mastra", "Turso / libSQL", "Server Components"],
    // Marks the centrepiece card. Projects.jsx gives it the gradient rule.
    featured: true,
    description:
      "My Master's thesis: a multi-tenant reminder and memory service assistants adopt instead of rebuilding. An agent schedules from plain chat across Email, WhatsApp, Telegram, and Discord; a database-owned engine delivers under failure. A server-rendered console runs plans, quotas and GDPR.",
    highlight:
      "Live on an EU-pinned stack and published as a one-line Mastra capability, with the H-FARM Student Assistant as first production tenant.",
  },
  {
    title: "TIAGo: Autonomous Mapping, Navigation & Pick-and-Place",
    role: "Robotics Project · Master's",
    period: "Apr 2026 - Jul 2026",
    stack: ["ROS 2 Humble", "Nav2 / SLAM", "ArUco", "Gazebo", "Python"],
    github: "https://github.com/syed-waleed-ahmed/tiago-autonomous-pick-and-place",
    description:
      "A TIAGo mobile manipulator that maps an unknown indoor space on its own, then recovers where it is from a random start pose, finds two workstations by their ArUco markers, and carries two cubes between them in a required order. It runs end to end with no teleoperation, one launch command per task.",
    highlight:
      "No map coordinates in the source: every station and cube pose is discovered from markers at runtime, so the mission moves to a new world unchanged.",
  },
  {
    title: "Multi-Agent AI Workflow System",
    role: "AI/ML Project",
    period: "2025 - 2026",
    stack: ["Python", "LangGraph", "Groq", "OpenAI"],
    github: "https://github.com/syed-waleed-ahmed/Multi-Agent-Workflow",
    description:
      "A multi-agent system that automates marketing campaign generation. Specialized agents for research, copy, brief, and QA coordinate through a shared workflow, replacing what used to be a multi-day manual process and keeping quality consistent across runs.",
    highlight:
      "Cut manual effort by 90% through role-based agent orchestration with structured handoffs.",
  },
  {
    title: "Self-Correcting RAG Pipeline",
    role: "AI/ML Project",
    period: "2025 - 2026",
    stack: ["LangChain", "Vector Search", "OpenAI", "Python"],
    github: "https://github.com/syed-waleed-ahmed/Self-Correcting-RAG",
    description:
      "A RAG pipeline with retrieve → evaluate → correct loops. It grades its own answers and re-retrieves whenever the evaluator flags low confidence, instead of hallucinating its way through, so responses stay grounded in the source documents.",
    highlight:
      "Closed the loop between retrieval and answer quality, cutting hallucinated outputs on ambiguous queries.",
  },
  {
    title: "Visual Inspection of Connecting Rods",
    role: "Academic Project · Master's",
    period: "Oct 2024 - Jan 2025",
    stack: ["Computer Vision", "OpenCV", "Python", "scikit-learn"],
    github:
      "https://github.com/syed-waleed-ahmed/Visual-Inspection-of-Motorcycle-Connecting-Rods",
    description:
      "A computer-vision classification system that inspects motorcycle connecting rods for defects on the production line. It replaced a slow manual step, flagging faulty parts automatically from camera images before they moved downstream.",
    highlight:
      "95%+ classification accuracy with ~80% less manual inspection time on the floor.",
  },
  {
    title: "Delay Classification for Tele-Robotic Systems",
    role: "Bachelor's Thesis",
    period: "Oct 2022 - Aug 2023",
    stack: ["Signal Processing", "TCP/IP", "UDP" ,"Networking", "C++"],
    description:
      "A time-series and ML pipeline that classifies network delay across LAN, WAN, and 4G environments. Built from captured latency traces, it flags the conditions that would destabilize a remote tele-robotic control loop before they cause failures.",
    highlight:
      "~25% improvement in control-loop stability under variable network conditions.",
  },
];
