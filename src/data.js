  export const imageDeck = [
    { title: "On Track", angle: -24, xOffset: -180, yOffset: 60, img: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=400" },
    { title: "Team Strategy", angle: -12, xOffset: -90, yOffset: 20, img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=400" },
    { title: "Main Identity", angle: 0, xOffset: 0, yOffset: 0, img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400" },
    { title: "Media Day", angle: 12, xOffset: 90, yOffset: 20, img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400" },
    { title: "Community Hub", angle: 24, xOffset: 180, yOffset: 60, img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400" },
  ];

//   const skillsMatrix = [
//   {
//     category: "STRATEGY",
//     items: [
//       "Digital Experience Strategy",
//       "Technology Strategy",
//       "Creative Direction",
//       "Discovery",
//       "Research",
//     ],
//   },
//   {
//     category: "CREATIVE",
//     items: ["Art Direction", "UX/UI Design", "Motion Design", "Interactive Design", "Illustration"],
//   },
//   {
//     category: "TECH",
//     items: [
//       "WebGL Development",
//       "Front End Development",
//       "Unity / Unreal",
//       "Interactive Installations",
//       "AR and VR Experiences",
//     ],
//   },
//   {
//     category: "PRODUCTION",
//     items: [
//       "Procedural Modeling",
//       "3D Asset Creation",
//       "3D Optimization",
//       "Animation",
//       "3D Pipeline Development",
//     ],
//   },
// ];

  export const skillsMatrix = [
    {
      category: "Frontend Architecture",
      items: ["React ", "TypeScript ", "Redux Toolkit", "HTML5 Canvas"],
    },
    {
      category: "Backend & Systems",
      items: ["Python","Node.js","FastAPI", "Flask", "PostgreSQL", "MongoDB", "GraphDB","InfluxDB", "Redis Layers",],
    },
    {
      category: "Tools & Deployment",
      items: ["Git & CI/CD", "Docker","Kubernetes", "Figma","AWS" ],
    },
    {
      category: "AI/ML",
      items: ["LangChain", "OpenAI API", "RAG", "Pandas", "NumPy", "SciPy", "spaCy", "Matplotlib" ],
    },
    {
      category: "Automation & Testing",
      items: ["Selenium", "Robot Framework", " Cucumber/Behave", "Postman"],
    },
  ];

  export const projectsData = [
    {
      id: 1,
      indexString: "01 // INTERACTIVE ENGINE",
      title: "Aether Engine",
      role: "Lead Interactive Engineer",
      desc: "A node-based generative audio-visual synthesizer playground natively running in the browser with sub-12ms latency scaling loops.",
      challenges: "Synchronizing Canvas frame updates cleanly with the WebAudio API clock graph without memory bloating thread locks.",
      outcome: "Achieved seamless 60fps dynamic UI renders with over 400 connected audio oscillator processing nodes running concurrently.",
      tags: ["React", "Canvas", "TypeScript", "WebAudio"],
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
      live: "#",
      source: "#"
    },
    {
      id: 2,
      indexString: "02 // DATA ENGINE",
      title: "Chronos Dashboard",
      role: "Full-Stack Developer",
      desc: "Real-time analytics engine processing millions of active system tracking logs hourly.",
      challenges: "Optimizing highly nested database pooling queries running across intense aggregate tables.",
      outcome: "Reduced critical API query metrics latency by roughly 42% overall via Redis layers.",
      tags: ["Next.js", "PostgreSQL", "Tailwind"],
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
      live: "#",
      source: "#"
    },
    {
      id: 3,
      indexString: "03 // COGNITIVE WORKSPACE",
      title: "Lexicon AI",
      role: "Frontend Engineer",
      desc: "An interactive workspace playground for fine-tuning text models via visual context structures.",
      challenges: "Handling messy text-stream buffer edge cases safely inside reactive render cycles.",
      outcome: "Built an intuitive contextual workspace used internally by 3 separate production product teams.",
      tags: ["React", "OpenAI", "Framer Motion"],
      image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=600&q=80",
      live: "#",
      source: "#"
    },
    {
      id: 4,
      indexString: "04 // DESIGN SYSTEM",
      title: "Vapor UI",
      role: "Creative Technologist",
      desc: "A fully accessible, production hardware-accelerated components kit built around brutalist aesthetics.",
      challenges: "Ensuring WCAG color accessibility requirements passed without compromising harsh neon brand styling.",
      outcome: "Open-source toolkit crossing 1,200+ stars on GitHub within 4 months of initial release.",
      tags: ["CSS", "Design System", "Storybook"],
      image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80",
      live: "#",
      source: "#"
    }
  ];

  export const lifestyleEcosystem = [
    { area: "Sports & Vitality", desc: "Active cricket competitor and high-intensity physical performance preparation tracker." },
    { area: "Academics & Systems", desc: "Deep analytical study into algorithmic scaling patterns and modern layout frameworks." },
    { area: "Cinematics & Audio", desc: "Deconstructing modern cinematography pacing, lighting designs, and complex sci-fi lore structures." },
    { area: "Travel & Geography", desc: "Documenting routes, exploring multi-terrain regions, and gathering cross-cultural inspirations." },
    { area: "Books & Literature", desc: "Reviewing tech histories, technical infrastructure manuals, and behavioral optimization books." },
  ];