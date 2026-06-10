import React, { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";

export default function Portfolio({ initialTheme = "dark" }) {
  const [theme, setTheme] = useState(initialTheme);
  const marqueeControls = useAnimation();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const imageDeck = [
    { title: "On Track", angle: -24, xOffset: -180, yOffset: 60, img: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=400" },
    { title: "Team Strategy", angle: -12, xOffset: -90, yOffset: 20, img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=400" },
    { title: "Main Identity", angle: 0, xOffset: 0, yOffset: 0, img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400" },
    { title: "Media Day", angle: 12, xOffset: 90, yOffset: 20, img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400" },
    { title: "Community Hub", angle: 24, xOffset: 180, yOffset: 60, img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400" },
  ];

  useEffect(() => {
    marqueeControls.start({
      x: ["0%", "-50%"],
      transition: { ease: "linear", duration: 25, repeat: Infinity },
    });
  }, [marqueeControls]);

  // 1. Segmented Skills Architecture Matrix
  const skillsMatrix = [
    {
      category: "Programming Languages",
      items: ["JavaScript (ES6+)", "TypeScript", "Python", "Java", "C++", "Go"],
    },
    {
      category: "Frontend Architecture",
      items: ["React.js", "Next.js", "HTML5 / CSS3", "Tailwind CSS", "Framer Motion", "Redux Toolkit"],
    },
    {
      category: "Backend & Storage",
      items: ["Node.js", "Express", "GraphQL", "PostgreSQL", "MongoDB", "Redis", "Docker"],
    },
  ];

  // 2. Fixed True Radial Overlapping Curve Arc Layout (Geometric Translation Matching Image)
  // const imageDeck = [
  //   { id: 1, rotation: -22, translateX: -160, translateY: 60, img: "https://via.placeholder.com/300x500/111/fff?text=On+Track" },
  //   { id: 2, rotation: -11, translateX: -80, translateY: 20, img: "https://via.placeholder.com/300x500/222/fff?text=Strategy" },
  //   { id: 3, rotation: 0, translateX: 0, translateY: 0, img: "https://via.placeholder.com/300x500/ff4d00/fff?text=Focus" },
  //   { id: 4, rotation: 11, translateX: 80, translateY: 20, img: "https://via.placeholder.com/300x500/333/fff?text=Media+Day" },
  //   { id: 5, rotation: 22, translateX: 160, translateY: 60, img: "https://via.placeholder.com/300x500/444/fff?text=Paddock" },
  // ];

  // 4. Multi-Dimensional Personal Ecosystems
  const lifestyleEcosystem = [
    { area: "Sports & Vitality", desc: "Active cricket competitor and high-intensity physical performance preparation tracker." },
    { area: "Academics & Systems", desc: "Deep analytical study into algorithmic scaling patterns and modern layout frameworks." },
    { area: "Cinematics & Audio", desc: "Deconstructing modern cinematography pacing, lighting designs, and complex sci-fi lore structures." },
    { area: "Travel & Geography", desc: "Documenting routes, exploring multi-terrain regions, and gathering cross-cultural inspirations." },
    { area: "Books & Literature", desc: "Reviewing tech histories, technical infrastructure manuals, and behavioral optimization books." },
  ];

  const currentStyles = theme === "dark" ? styles.dark : styles.light;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      style={currentStyles.body}
    >
      {/* NAVIGATION CONTROLLER WITH INTELLIGENT SYSTEM MATRIX TOGGLE */}
      <nav style={currentStyles.nav}>
        <div style={currentStyles.logo}>YOGESHWARAN <br></br>SARAVANAN</div>
        <div style={currentStyles.navLinks}>
          <a href="#skills" style={currentStyles.link}>Capabilities</a>
          <a href="#experience" style={currentStyles.link}>Timeline</a>
          <a href="#beyond" style={currentStyles.link}>On Socials</a>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            style={currentStyles.toggleButton}
          >
            Reality Matrix: {theme === "dark" ? "🔴 Red (Dark)" : "🔵 Blue (Light)"}
          </button>
        </div>
      </nav>

      {/* SECTION 1: HERO OVERVIEW */}
      <main style={currentStyles.main} id="hero">
        <span style={currentStyles.badge}>PORTFOLIO PROTOCOL // ACTIVE</span>
        <h1 style={currentStyles.h1}>ENGINEERING THE</h1>
        <h1 style={{ ...currentStyles.h1, color: "var(--accent)" }}>NEXT GENERATION.</h1>
        <p style={currentStyles.heroDesc}>
          Full-Stack developer architecting ultra-clean layouts, real-time data pipelines, and highly performant user interfaces. Focused on speed, accuracy, and structural code scaling.
        </p>
      </main>

      {/* CONTINUOUS KINETIC TICKER STRIP */}
      <div style={currentStyles.marqueeWrapper}>
        <motion.div animate={marqueeControls} style={currentStyles.marqueeContent}>
          <span className="stroke-text" style={currentStyles.marqueeText}>CORE TELEMETRY // PRODUCTION READY // CLEAN STACK //&nbsp;</span>
          <span className="stroke-text" style={currentStyles.marqueeText}>CORE TELEMETRY // PRODUCTION READY // CLEAN STACK //&nbsp;</span>
        </motion.div>
      </div>

      {/* NEW SECTION: SKILLS SEPARATED BY CATEGORIES */}
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

      {/* SECTION 2: WORK EXPERIENCE TIMELINE */}
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

      {/* SECTION 3: FEATURED PROJECTS MATRIX */}
      <section id="projects" style={currentStyles.section}>
        <div style={currentStyles.sectionHeader}>
          <span style={currentStyles.badge}>Showcase</span>
          <h2 style={currentStyles.h2}>Featured Engineering</h2>
        </div>
        <div style={currentStyles.grid}>
          <div style={currentStyles.card}>
            <span style={currentStyles.cardIndex}>01 // PIPELINE</span>
            <h3 style={currentStyles.cardTitle}>Apex Telemetry</h3>
            <p style={currentStyles.cardDesc}>A low-latency data streaming dashboard utilizing specialized socket managers for instant UI status tracking updates.</p>
            <div style={currentStyles.cardLinks}><a href="#" style={currentStyles.anchor}>Live Engine</a><a href="#" style={currentStyles.anchor}>Codebase</a></div>
          </div>
          <div style={currentStyles.card}>
            <span style={currentStyles.cardIndex}>02 // LAYOUT</span>
            <h3 style={currentStyles.cardTitle}>Kinetic CSS</h3>
            <p style={currentStyles.cardDesc}>An open-source performance library optimizing layout manipulation processing solely through hardware acceleration matrices.</p>
            <div style={currentStyles.cardLinks}><a href="#" style={currentStyles.anchor}>Live Engine</a><a href="#" style={currentStyles.anchor}>Codebase</a></div>
          </div>
        </div>
      </section>

      <section id="beyond" style={currentStyles.fanViewport}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <span style={currentStyles.badge}>Perspective Layout</span>
          <h2 style={currentStyles.h2}>On Socials</h2>
        </div>

        <div style={currentStyles.arcViewport}>
          {imageDeck.map((card, idx) => {
            const isHovered = hoveredIdx === idx;
            const centerIndex = Math.floor(imageDeck.length / 2);
            
            // Layout Math modeling Lando's true overlapping card structure
            const baseZIndex = 10 + (idx <= centerIndex ? idx : imageDeck.length - idx);
            const computedTransform = `
              translateX(${card.xOffset}px)
              translateY(${isHovered ? card.yOffset - 40 : card.yOffset}px)
              rotate(${isHovered ? 0 : card.angle}deg)
              scale(${isHovered ? 1.15 : 1})
            `;

            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{
                  ...currentStyles.fanCard,
                  backgroundImage: `url(${card.img})`,
                  transform: computedTransform,
                  zIndex: isHovered ? 200 : baseZIndex,
                  boxShadow: isHovered ? "0 40px 80px rgba(0,0,0,0.6)" : "0 15px 35px rgba(0,0,0,0.3)",
                }}
              >
                <div style={{
                  ...currentStyles.cardLabel,
                  opacity: isHovered ? 1 : 0,
                  transform: `translateY(${isHovered ? 0 : 10}px)`
                }}>
                  {card.title}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* NEW SECTION: DETAILED PERSONAL INTEREST BRIDGES */}
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

      {/* SECTION 5: OPEN SOURCE AND TELEMETRY */}
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

      {/* THE FOOTER CALL-TO-ACTION */}
      <footer style={currentStyles.footer}>
        <h2 style={{ fontSize: "3rem", fontWeight: 900, textTransform: "uppercase" }}>Ready to Optimize?</h2>
        <a href="https://linkedin.com/in/YOUR-PROFILE" target="_blank" rel="noreferrer" style={currentStyles.bigButton}>
          Establish LinkedIn Sync Connection
        </a>
      </footer>

      <style>{`
        html { scroll-behavior: smooth; }
        .stroke-text { 
          color: transparent; 
          -webkit-text-stroke: 1px ${theme === "dark" ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.15)"}; 
        }
      `}</style>
    </motion.div>
  );
}

// 🌓 DUAL CORE ARCHITECTURE STYLES MAP (NO EXTERNAL CSS DEPENDENCIES)
const baseStyles = {
  nav: { position: "fixed", top: 0, width: "100%", padding: "2rem 4rem", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 1000, boxSizing: "border-box" },
  logo: { fontWeight: 900, letterSpacing: "-1px" },
  navLinks: { display: "flex", gap: "2rem", alignItems: "center" },
  link: { textDecoration: "none", textTransform: "uppercase", fontSize: "0.85rem", fontWeight: 600, transition: "color 0.2s" },
  main: { maxWidth: "1200px", margin: "0 auto", padding: "14rem 2rem 6rem 2rem", minHeight: "65vh", display: "flex", flexDirection: "column", justifyContent: "center" },
  badge: { fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "3px", marginBottom: "1rem", display: "block" },
  h1: { fontSize: "clamp(3rem, 7vw, 6rem)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.95, letterSpacing: "-2px", margin: 0 },
  heroDesc: { marginTop: "2rem", fontSize: "1.35rem", maxWidth: "600px", lineHeight: 1.5 },
  marqueeWrapper: { padding: "1.5rem 0", overflow: "hidden", display: "flex", whiteSpace: "nowrap" },
  marqueeContent: { display: "flex" },
  marqueeText: { fontSize: "clamp(2rem, 4vw, 4rem)", fontWeight: 900, textTransform: "uppercase", paddingRight: "2rem" },
  section: { maxWidth: "1200px", margin: "0 auto", padding: "8rem 2rem" },
  sectionHeader: { marginBottom: "4rem", textAlign: "left" },
  h2: { fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 900, textTransform: "uppercase", margin: 0, letterSpacing: "-1px" },
  
  // Skills Blueprint Design Block
  skillsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" },
  skillsCard: { padding: "2.5rem", borderRadius: "16px", border: "1px solid" },
  skillsGroupTitle: { fontSize: "1.25rem", textTransform: "uppercase", fontWeight: 800, margin: "0 0 1.5rem 0" },
  tagWrapper: { display: "flex", flexWrap: "wrap", gap: "0.5rem" },
  skillTag: { padding: "0.4rem 0.8rem", borderRadius: "8px", fontSize: "0.85rem", fontWeight: 600 },

  // Experience Structural Blocks
  timelineContainer: { display: "flex", flexDirection: "column", gap: "4rem" },
  timelineItem: { display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem", paddingTop: "2rem" },
  timelineMeta: { display: "flex", flexDirection: "column", gap: "0.5rem" },
  timelineDate: { fontSize: "1.15rem", fontWeight: 700 },
  timelineCompany: { fontSize: "1.25rem", fontWeight: 800, textTransform: "uppercase" },
  timelineRole: { fontSize: "1.75rem", fontWeight: 800, textTransform: "uppercase", margin: "0 0 1rem 0" },
  timelineBody: { fontSize: "1.05rem", lineHeight: 1.6, margin: 0 },

  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "2.5rem" },
  card: { borderRadius: "16px", padding: "3rem", minHeight: "350px", display: "flex", flexDirection: "column", justifyContnet: "space-between", border: "1px solid" },
  cardIndex: { fontFamily: "monospace", fontSize: "0.9rem", fontWeight: 700 },
  cardTitle: { fontSize: "2rem", fontWeight: 800, textTransform: "uppercase", margin: "1.5rem 0 0.5rem 0" },
  cardDesc: { lineHeight: 1.5, marginBottom: "2rem", fontSize: "1rem" },
  cardLinks: { display: "flex", gap: "2rem", marginTop: "auto" },
  anchor: { fontSize: "0.9rem", textTransform: "uppercase", fontWeight: 700, textDecoration: "none", paddingBottom: "2px" },

  // TRUE GEOMETRIC FAN SYSTEM DISPLAY
  fanViewport: { position: "relative", width: "100%", display: "flex", justifyContent: "center", height: "600px", marginTop: "2rem"},
  fanContainer: { position: "relative", width: "100%", maxWidth: "400px", height: "100%" },
  fanCard: { position: "absolute", bottom: "40px", left: "50%", marginLeft: "-120px", width: "240px", height: "380px", borderRadius: "24px", backgroundSize: "cover", backgroundPosition: "center", transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s, z-index 0.5s", cursor: "pointer" },
  // arcViewport: { position: "relative",justifyContent: "center", width: "100%", maxWidth: "800px", height: "520px", display: "flex", justifyContent: "center", alignItems: "flex-end", marginTop: "2rem" },
  // Diverse Interests Blocks
  lifestyleGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2.5rem" },
  lifestyleItem: { borderTop: "1px solid", paddingTop: "1.5rem" },
  lifestyleTitle: { fontSize: "1.25rem", fontWeight: 800, textTransform: "uppercase", margin: "0 0 0.5rem 0" },
  lifestyleText: { fontSize: "1rem", lineHeight: 1.5, margin: 0 },

  ossBlock: { borderRadius: "16px", padding: "4rem", display: "flex", flexWrap: "wrap", gap: "3rem", border: "1px solid" },
  metricsBox: { display: "flex", gap: "3rem", minWidth: "280px" },
  metricNum: { fontSize: "3.5rem", fontWeight: 900, lineHeight: 1 },
  metricLabel: { fontSize: "0.8rem", textTransform: "uppercase", color: "#666", marginTop: "0.5rem", fontWeight: 700 },
  footer: { padding: "8rem 2rem", textAlign: "center" },
  bigButton: { display: "inline-block", padding: "1.25rem 3rem", borderRadius: "40px", fontWeight: 800, textTransform: "uppercase", textDecoration: "none", letterSpacing: "1px", marginTop: "2rem" },
};

// Explicit Styling Mappings for Light & Dark Realities
export const styles = {
  dark: {
    ...baseStyles,
    body: { ...baseStyles.body, backgroundColor: "#080808", color: "#ffffff", "--accent": "#ff4d00" },
    nav: { ...baseStyles.nav, background: "linear-gradient(to bottom, #080808 50%, transparent)" },
    link: { ...baseStyles.link, color: "#777" },
    toggleButton: { background: "#111", border: "1px solid #ff4d00", color: "#ff4d00", padding: "0.5rem 1.2rem", borderRadius: "20px", cursor: "pointer", fontWeight: 700, fontSize: "0.8rem" },
    badge: { ...baseStyles.badge, color: "#ff4d00" },
    heroDesc: { ...baseStyles.heroDesc, color: "#888" },
    marqueeWrapper: { ...baseStyles.marqueeWrapper, background: "#111", borderTop: "1px solid #222", borderBottom: "1px solid #222" },
    marqueeText: { ...baseStyles.marqueeText, color: "#fff" },
    skillsCard: { ...baseStyles.skillsCard, background: "#111", borderColor: "#222" },
    skillsGroupTitle: { ...baseStyles.skillsGroupTitle, color: "#fff" },
    skillTag: { ...baseStyles.skillTag, background: "#1f1f1f", color: "#aaa" },
    timelineItem: { ...baseStyles.timelineItem, borderTop: "1px solid #222" },
    timelineDate: { ...baseStyles.timelineDate, color: "#ff4d00" },
    timelineCompany: { ...baseStyles.timelineCompany, color: "#fff" },
    timelineRole: { ...baseStyles.timelineRole, color: "#fff" },
    timelineBody: { ...baseStyles.timelineBody, color: "#888" },
    card: { ...baseStyles.card, background: "#111", borderColor: "#222" },
    cardIndex: { ...baseStyles.cardIndex, color: "#444" },
    cardTitle: { ...baseStyles.cardTitle, color: "#fff" },
    cardDesc: { ...baseStyles.cardDesc, color: "#888" },
    anchor: { ...baseStyles.anchor, color: "#fff", borderBottom: "1px solid #ff4d00" },
    fanCard: { ...baseStyles.fanCard, border: "3px solid #111" },
    lifestyleItem: { ...baseStyles.lifestyleItem, borderColor: "#222" },
    lifestyleTitle: { ...baseStyles.lifestyleTitle, color: "#ff4d00" },
    lifestyleText: { ...baseStyles.lifestyleText, color: "#888" },
    ossBlock: { ...baseStyles.ossBlock, background: "#111", borderColor: "#222" },
    metricNum: { ...baseStyles.metricNum, color: "#ff4d00" },
    footer: { ...baseStyles.footer, background: "linear-gradient(to top, #111, transparent)" },
    bigButton: { ...baseStyles.bigButton, background: "#fff", color: "#000" },
  },
  light: {
    ...baseStyles,
    body: { ...baseStyles.body, backgroundColor: "#f8f9fa", color: "#111827", "--accent": "#0055ff" },
    nav: { ...baseStyles.nav, background: "linear-gradient(to bottom, #f8f9fa 50%, transparent)" },
    link: { ...baseStyles.link, color: "#6b7280" },
    toggleButton: { background: "#fff", border: "1px solid #0055ff", color: "#0055ff", padding: "0.5rem 1.2rem", borderRadius: "20px", cursor: "pointer", fontWeight: 700, fontSize: "0.8rem" },
    badge: { ...baseStyles.badge, color: "#0055ff" },
    heroDesc: { ...baseStyles.heroDesc, color: "#4b5563" },
    marqueeWrapper: { ...baseStyles.marqueeWrapper, background: "#f3f4f6", borderTop: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb" },
    marqueeText: { ...baseStyles.marqueeText, color: "#111827" },
    skillsCard: { ...baseStyles.skillsCard, background: "#fff", borderColor: "#e5e7eb" },
    skillsGroupTitle: { ...baseStyles.skillsGroupTitle, color: "#111827" },
    skillTag: { ...baseStyles.skillTag, background: "#f3f4f6", color: "#4b5563" },
    timelineItem: { ...baseStyles.timelineItem, borderTop: "1px solid #e5e7eb" },
    timelineDate: { ...baseStyles.timelineDate, color: "#0055ff" },
    timelineCompany: { ...baseStyles.timelineCompany, color: "#111827" },
    timelineRole: { ...baseStyles.timelineRole, color: "#111827" },
    timelineBody: { ...baseStyles.timelineBody, color: "#4b5563" },
    card: { ...baseStyles.card, background: "#fff", borderColor: "#e5e7eb" },
    cardIndex: { ...baseStyles.cardIndex, color: "#9ca3af" },
    cardTitle: { ...baseStyles.cardTitle, color: "#111827" },
    cardDesc: { ...baseStyles.cardDesc, color: "#4b5563" },
    anchor: { ...baseStyles.anchor, color: "#111827", borderBottom: "1px solid #0055ff" },
    fanCard: { ...baseStyles.fanCard, border: "3px solid #fff" },
    lifestyleItem: { ...baseStyles.lifestyleItem, borderColor: "#e5e7eb" },
    lifestyleTitle: { ...baseStyles.lifestyleTitle, color: "#0055ff" },
    lifestyleText: { ...baseStyles.lifestyleText, color: "#4b5563" },
    ossBlock: { ...baseStyles.ossBlock, background: "#fff", borderColor: "#e5e7eb" },
    metricNum: { ...baseStyles.metricNum, color: "#0055ff" },
    footer: { ...baseStyles.footer, background: "linear-gradient(to top, #f3f4f6, transparent)" },
    bigButton: { ...baseStyles.bigButton, background: "#111827", color: "#fff" },
  }
};