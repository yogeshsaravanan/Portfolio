// Portfolio.jsx
import React, { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { styles } from "./PortfolioStyles";
import ProjectSection from "./ProjectSection";

export default function Portfolio({ initialTheme = "dark" }) {
  const [theme, setTheme] = useState(initialTheme);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [activeProject, setActiveProject] = useState(null);
  const [formStatus, setFormStatus] = useState("idle");
  const [isMobile, setIsMobile] = useState(false);
  const marqueeControls = useAnimation();

  // 📱 Detect screen dimensions dynamically to safely rescale translation math matrices
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    marqueeControls.start({
      x: ["0%", "-50%"],
      transition: { ease: "linear", duration: 25, repeat: Infinity },
    });
  }, [marqueeControls]);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setFormStatus("loading");
    setTimeout(() => { setFormStatus("success"); e.target.reset(); }, 1200);
  };

  const currentStyles = theme === "dark" ? styles.dark : styles.light;
  const mobileScaler = isMobile ? 0.35 : 1; // Downscales translation offsets on mobile devices smoothly

  // (Keep your data arrays: imageDeck, skillsMatrix, projectsData, lifestyleEcosystem here...)

  const imageDeck = [
    { title: "On Track", angle: -24, xOffset: -180, yOffset: 60, img: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=400" },
    { title: "Team Strategy", angle: -12, xOffset: -90, yOffset: 20, img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=400" },
    { title: "Main Identity", angle: 0, xOffset: 0, yOffset: 0, img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400" },
    { title: "Media Day", angle: 12, xOffset: 90, yOffset: 20, img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400" },
    { title: "Community Hub", angle: 24, xOffset: 180, yOffset: 60, img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400" },
  ];

  const skillsMatrix = [
    {
      category: "Frontend Architecture",
      items: ["React / Next.js (90%)", "TypeScript (85%)", "TailwindCSS (95%)", "Redux Toolkit", "HTML5 Canvas", "Framer Motion"],
    },
    {
      category: "Backend & Systems",
      items: ["Node.js / Express (80%)", "GraphQL / APIs (75%)", "PostgreSQL (70%)", "MongoDB", "Redis Layers"],
    },
    {
      category: "Tools & Deployment",
      items: ["Git & CI/CD (88%)", "Docker (65%)", "Figma (75%)", "Vercel Optimization", "Webpack"],
    },
  ];

  const projectsData = [
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

  const lifestyleEcosystem = [
    { area: "Sports & Vitality", desc: "Active cricket competitor and high-intensity physical performance preparation tracker." },
    { area: "Academics & Systems", desc: "Deep analytical study into algorithmic scaling patterns and modern layout frameworks." },
    { area: "Cinematics & Audio", desc: "Deconstructing modern cinematography pacing, lighting designs, and complex sci-fi lore structures." },
    { area: "Travel & Geography", desc: "Documenting routes, exploring multi-terrain regions, and gathering cross-cultural inspirations." },
    { area: "Books & Literature", desc: "Reviewing tech histories, technical infrastructure manuals, and behavioral optimization books." },
  ];


  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={currentStyles.body}>
      <nav style={currentStyles.nav}>
        <div style={currentStyles.logo}>YOGESHWARAN <br />SARAVANAN</div>
        <div style={currentStyles.navLinks}>
          <a href="#skills" style={currentStyles.link}>Capabilities</a>
          <a href="#projects" style={currentStyles.link}>Production</a>
          <a href="#contact" style={currentStyles.link}>Transmission</a>
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} style={currentStyles.toggleButton}>
            Matrix: {theme === "dark" ? "🔴 Red" : "🔵 Blue"}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main style={currentStyles.main} id="hero">
        <span style={currentStyles.badge}>PORTFOLIO PROTOCOL // ACTIVE</span>
        <h1 style={currentStyles.h1}>ENGINEERING THE</h1>
        <h1 style={{ ...currentStyles.h1, color: "var(--accent)" }}>NEXT GENERATION.</h1>
      </main>

      {/* Ticker Strip */}
      <div style={currentStyles.marqueeWrapper}>
        <motion.div animate={marqueeControls} style={currentStyles.marqueeContent}>
          <span className="stroke-text" style={currentStyles.marqueeText}>CORE TELEMETRY // PRODUCTION READY // </span>
          <span className="stroke-text" style={currentStyles.marqueeText}>CORE TELEMETRY // PRODUCTION READY // </span>
        </motion.div>
      </div>

      <section id="skills" style={currentStyles.section}>
        <div style={currentStyles.sectionHeader}>
          <span style={currentStyles.badge}>Infrastructure Matrix</span>
          <h2 style={currentStyles.h2}>Technical Capabilities</h2>
        </div>
        <div style={currentStyles.skillsGrid}>
          {skillsMatrix.map((cluster, idx) => (
            <div key={idx} style={currentStyles.skillsCard}>
              <h3 style={currentStyles.skillsGroupTitle}>{cluster.category}</h3>
              <div style={currentStyles.tagWrapper}>
                {cluster.items.map((skill, sIdx) => (
                  <span key={sIdx} style={currentStyles.skillTag}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>


      <section id="experience" style={currentStyles.section}>
        <div style={currentStyles.sectionHeader}>
          <span style={currentStyles.badge}>Track Record</span>
          <h2 style={currentStyles.h2}>Professional Timeline</h2>
        </div>
        
        <div style={currentStyles.timelineContainer}>
          <div style={currentStyles.timelineItem}>
            <div style={currentStyles.timelineMeta}>
              <span style={currentStyles.timelineDate}>2024 — PRESENT</span>
              <span style={currentStyles.timelineCompany}>Tech Core Systems</span>
            </div>
            <div style={currentStyles.timelineContent}>
              <h3 style={currentStyles.timelineRole}>Senior Software Engineer</h3>
              <p style={currentStyles.timelineBody}>
                Optimized frontend application load times by 42% utilizing strategic component decoupling and caching engines. Led a team of 4 engineers delivering enterprise pipeline control interfaces.
              </p>
            </div>
          </div>

          <div style={currentStyles.timelineItem}>
            <div style={currentStyles.timelineMeta}>
              <span style={currentStyles.timelineDate}>2022 — 2024</span>
              <span style={currentStyles.timelineCompany}>Nexus Digital Lab</span>
            </div>
            <div style={currentStyles.timelineContent}>
              <h3 style={currentStyles.timelineRole}>Full-Stack Developer</h3>
              <p style={currentStyles.timelineBody}>
                Architected microservice integrations handling millions of concurrent requests. Built layout asset engines using reactive frameworks to streamline multi-platform deployments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Render Subsystem Modular Layer */}
      <ProjectSection 
        projectsData={projectsData} activeProject={activeProject} 
        setActiveProject={setActiveProject} currentStyles={currentStyles} theme={theme} 
      />

      {/* Fan Viewport Component Perspective Layout */}
      <section id="beyond" style={currentStyles.fanViewport}>
        <div style={currentStyles.arcViewport}>
          {imageDeck.map((card, idx) => {
            const isHovered = hoveredIdx === idx;
            const centerIndex = Math.floor(imageDeck.length / 2);
            const baseZIndex = 10 + (idx <= centerIndex ? idx : imageDeck.length - idx);
            const computedTransform = `
              translateX(${card.xOffset * mobileScaler}px)
              translateY(${isHovered ? card.yOffset - 40 : card.yOffset}px)
              rotate(${isHovered ? 0 : card.angle * mobileScaler}deg)
              scale(${isHovered ? 1.15 : isMobile ? 0.8 : 1})
            `;
            return (
              <div
                key={idx} onMouseEnter={() => setHoveredIdx(idx)} onMouseLeave={() => setHoveredIdx(null)}
                style={{ ...currentStyles.fanCard, backgroundImage: `url(${card.img})`, transform: computedTransform, zIndex: isHovered ? 200 : baseZIndex }}
              />
            );
          })}
        </div>
      </section>

      <section style={currentStyles.section}>
        <div style={currentStyles.sectionHeader}>
          <span style={currentStyles.badge}>Human Factor</span>
          <h2 style={currentStyles.h2}>Interests & Core Focal Points</h2>
        </div>
        <div style={currentStyles.lifestyleGrid}>
          {lifestyleEcosystem.map((item, index) => (
            <div key={index} style={currentStyles.lifestyleItem}>
              <h3 style={currentStyles.lifestyleTitle}>{item.area}</h3>
              <p style={currentStyles.lifestyleText}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="oss" style={currentStyles.section}>
        <div style={currentStyles.sectionHeader}>
          <span style={currentStyles.badge}>Ecosystem Engagement</span>
          <h2 style={currentStyles.h2}>Open Source Contributions</h2>
        </div>
        <div style={currentStyles.ossBlock}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: "1.75rem", fontWeight: 800, textTransform: "uppercase" }}>Global Upstream Commits</h3>
            <p style={{ color: "var(--text-muted)", marginTop: "1rem", lineHeight: 1.5 }}>
              Actively optimizing package architecture overhead metrics, submitting performance tuning adjustments to critical libraries, and engineering robust, developer-centric documentation pipelines.
            </p>
          </div>
          <div style={currentStyles.metricsBox}>
            <div><div style={currentStyles.metricNum}>500+</div><div style={currentStyles.metricLabel}>Contributions This Year</div></div>
            <div><div style={currentStyles.metricNum}>12</div><div style={currentStyles.metricLabel}>PRs Merged Upstream</div></div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" style={currentStyles.section}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <form onSubmit={handleContactSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <input type="text" required style={currentStyles.formInput} placeholder="Identification Name" />
            <textarea rows={5} required style={currentStyles.formTextarea} placeholder="Transmission Payload..." />
            <button type="submit" style={currentStyles.formButton}>
              {formStatus === "idle" ? "Send Secure Transmission" : "Processing Payload..."}
            </button>
          </form>
        </div>
      </section>

      <footer style={currentStyles.footer}>
        <a href="#" style={currentStyles.bigButton}>Establish LinkedIn Sync Connection</a>
      </footer>

      {/* 📱 Injected Responsive Media Matrix style overrides */}
      <style>{`
        html { scroll-behavior: smooth; }
        .stroke-text { 
          color: transparent; 
          -webkit-text-stroke: 1px ${theme === "dark" ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.15)"}; 
        }
        @media (max-width: 768px) {
          :root {
            --grid-columns-skills: 1fr;
            --grid-columns-projects: 1fr;
            --timeline-cols: 1fr;
            --nav-padding: 1rem 1.5rem;
            --nav-dir: column;
            --nav-gap: 0.75rem;
            --hero-padding: 10rem 1.5rem 4rem 1.5rem;
            --section-padding: 4rem 1.5rem;
            --fan-height: 500px;
            --oss-dir: column;
            --oss-padding: 2rem;
            --btn-font: 0.85rem;
          }
        }
      `}</style>
    </motion.div>
  );
}