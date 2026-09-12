export const projects = [
  {
    title: "RemindrAI: Embeddable Multi-Tenant Reminder Capability",
    role: "Master's Thesis · MemorAIz S.r.l.",
    stack: ["Next.js 16", "TypeScript", "Vercel AI SDK", "Mastra", "Turso / libSQL"],
    // The MemorAIz entry in experience.js carries the build, delivery, tenancy
    // and deployment facts. This card says what the system does and where the
    // model's authority stops, and the highlight states the adoption result,
    // so the two sections say different things about the same work.
    description:
      "A reminder and messaging service that AI assistants embed instead of rebuilding. An agent turns plain chat into reminders delivered over Email, WhatsApp, Telegram, and Discord, and each reminder's owner is pinned outside the model, so a prompt injection cannot retarget it.",
    highlight:
      "Its first tenant adopted it with a base URL and a token, holding no scheduler, queue, or provider secret.",
  },
  {
    title: "TIAGo: Autonomous Mapping, Navigation & Pick-and-Place",
    role: "Robotics Project · Master's",
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
    stack: ["LangChain", "Vector Search", "OpenAI", "Python"],
    github: "https://github.com/syed-waleed-ahmed/Self-Correcting-RAG",
    description:
      "A RAG pipeline built around retrieve, evaluate, and correct loops. It grades its own answers and re-retrieves whenever the evaluator flags low confidence, so responses stay grounded in the source documents rather than filling the gaps with invention.",
    highlight:
      "Closed the loop between retrieval and answer quality, cutting hallucinated outputs on ambiguous queries.",
  },
  {
    title: "Visual Inspection of Connecting Rods",
    role: "Academic Project · Master's",
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
    stack: ["Signal Processing", "TCP/IP", "UDP" ,"Networking", "C++"],
    description:
      "A time-series and ML pipeline that classifies network delay across LAN, WAN, and 4G environments. Built from captured latency traces, it flags the conditions that would destabilize a remote tele-robotic control loop before they cause failures.",
    highlight:
      "~25% improvement in control-loop stability under variable network conditions.",
  },
];
