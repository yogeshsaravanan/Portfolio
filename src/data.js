export const imageDeck = [
  { title: "On Track", angle: -24, xOffset: -180, yOffset: 60, img: import.meta.env.BASE_URL + "/IMG1.jpg"  },
  { title: "Team Strategy", angle: -12, xOffset: -90, yOffset: 20, img: import.meta.env.BASE_URL + "/IMG2.png" },
  { title: "Main Identity", angle: 0, xOffset: 0, yOffset: 0, img: import.meta.env.BASE_URL + "/IMG3.png" },
  { title: "Media Day", angle: 12, xOffset: 90, yOffset: 20, img: import.meta.env.BASE_URL + "/IMG4.png" },
  { title: "Community Hub", angle: 24, xOffset: 180, yOffset: 60, img: import.meta.env.BASE_URL + "/IMG5.png" },
];

export const skillsMatrix = [
  {
    category: "Frontend Architecture",
    items: ["React ", "TypeScript ", "Redux Toolkit", "HTML5 Canvas"],
  },
  {
    category: "Backend & Systems",
    items: ["Python", "Node.js", "FastAPI", "Flask", "PostgreSQL", "MongoDB", "GraphDB", "InfluxDB", "Redis Layers",],
  },
  {
    category: "Tools & Deployment",
    items: ["Git & CI/CD", "Docker", "Kubernetes", "Figma", "AWS"],
  },
  {
    category: "AI/ML",
    items: ["LangChain", "OpenAI API", "RAG", "Pandas", "NumPy", "SciPy", "spaCy", "Matplotlib"],
  },
  {
    category: "Automation & Testing",
    items: ["Selenium", "Robot Framework", " Cucumber/Behave", "Postman"],
  },
];

export const projectsData = [
  {
    id: 1,
    indexString: "01 // REAL-TIME TELEMETRY",
    title: "F1 Telemetry Stream",
    role: "Full Stack Developer",
    desc: "A live telemetry platform that streams and analyzes Formula 1 car data in real time — speed, throttle, braking, and tyre metrics rendered as the lap unfolds.",
    challenges: "Sustaining low-latency WebSocket streaming of high-frequency sensor data without dropping frames or overwhelming the browser render loop.",
    outcome: "Delivered sub-second live visualizations with InfluxDB time-series storage, enabling lap-by-lap performance analysis across multiple concurrent data channels.",
    tags: ["React", "Flask", "WebSockets", "InfluxDB"],
    image: import.meta.env.BASE_URL + "/f1.jpg",
    live: "#",
    source: "https://github.com/yogeshsaravanan/F1-Telemetry"
  },
  {
    id: 2,
    indexString: "02 // AVIATION SYSTEMS",
    title: "Flight Tracking System",
    role: "Full Stack Developer",
    desc: "A real-time flight tracking and monitoring application visualizing live aircraft position, status, and route data on an interactive map.",
    challenges: "Ingesting and reconciling continuous live position updates while keeping the map and data views perfectly in sync under heavy update frequency.",
    outcome: "Built a responsive tracking interface with live data acquisition and visualization, giving operators an accurate real-time picture of active flights.",
    tags: ["React", "Flask", "WebSockets", "Mapping"],
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80",
    live: "#",
    source: "https://github.com/yogeshsaravanan/FlightTraking"
  },
  {
    id: 3,
    indexString: "03 // LOW-CODE PLATFORM",
    title: "Dynamic Form Builder",
    role: "Full Stack Developer",
    desc: "A low-code / no-code platform for visually building dynamic forms and workflows — drag, configure, and deploy data-capture interfaces without writing code.",
    challenges: "Designing a flexible schema engine that renders arbitrary form structures reactively while validating and persisting varied data shapes safely.",
    outcome: "Enabled non-developers to create and ship production forms independently, cutting form turnaround from days to minutes.",
    tags: ["React", "Python", "Dynamic Schema", "REST APIs"],
    image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=1200&q=80",
    live: "#",
    source: "#"
  },
  {
    id: 4,
    indexString: "04 // AI / RAG",
    title: "Document Q&A Engine",
    role: "Full Stack Developer",
    desc: "A retrieval-augmented Q&A app — upload PDFs and ask questions in natural language, getting grounded answers with citations back to the exact source passages.",
    challenges: "Chunking and embedding documents for accurate retrieval, then keeping the LLM's answers faithful to the source material instead of hallucinating.",
    outcome: "Delivered a chat interface that answers from your own documents with traceable citations, turning static PDFs into a searchable, conversational knowledge base.",
    tags: ["React", "Flask", "Embeddings", "LLM"],
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80",
    live: "#",
    source: "https://github.com/yogeshsaravanan/rag-pipeline"
  }
];

export const lifestyleEcosystem = [
  { area: "Sports & Vitality", desc: "Active cricket competitor and high-intensity physical performance preparation tracker." },
  { area: "Academics & Systems", desc: "Deep analytical study into algorithmic scaling patterns and modern layout frameworks." },
  { area: "Cinematics & Audio", desc: "Deconstructing modern cinematography pacing, lighting designs, and complex sci-fi lore structures." },
  { area: "Travel & Geography", desc: "Documenting routes, exploring multi-terrain regions, and gathering cross-cultural inspirations." },
  { area: "Books & Literature", desc: "Reviewing tech histories, technical infrastructure manuals, and behavioral optimization books." },
];