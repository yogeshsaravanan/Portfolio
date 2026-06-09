import React, { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";

export default function Portfolio() {
  const marqueeControls = useAnimation();
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    marqueeControls.start({
      x: ["0%", "-50%"],
      transition: { ease: "linear", duration: 25, repeat: Infinity },
    });
  }, [marqueeControls]);

  // Mock Photo Array matching your uploaded visual style (Replace with your actual hosted image paths)
  const imageDeck = [
    { id: 1, rotation: -20, translateY: 40, img: "https://via.placeholder.com/300x500/111/fff?text=Event+1" },
    { id: 2, rotation: -12, translateY: 15, img: "https://via.placeholder.com/300x500/222/fff?text=Hackathon" },
    { id: 3, rotation: -4, translateY: 0, img: "https://via.placeholder.com/300x500/ff4d00/fff?text=Speaking" },
    { id: 4, rotation: 4, translateY: 0, img: "https://via.placeholder.com/300x500/333/fff?text=Keynote" },
    { id: 5, rotation: 12, translateY: 15, img: "https://via.placeholder.com/300x500/444/fff?text=Community" },
    { id: 6, rotation: 20, translateY: 40, img: "https://via.placeholder.com/300x500/555/fff?text=Unwind" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      style={styles.body}
    >
      {/* FIXED NAVIGATION TRACKER */}
      <nav style={styles.nav}>
        <div style={styles.logo}>SYSTEM // ARCHITECT</div>
        <div style={styles.navLinks}>
          <a href="#experience" style={styles.link}>Experience</a>
          <a href="#projects" style={styles.link}>Projects</a>
          <a href="#beyond" style={styles.link}>Beyond Code</a>
          <a href="#oss" style={styles.link}>Contributions</a>
        </div>
      </nav>

      {/* SECTION 1: HERO OVERVIEW */}
      <main style={styles.main} id="hero">
        <span style={styles.badge}>PORTFOLIO PROTOCOL // ACTIVE</span>
        <h1 style={styles.h1}>ENGINEERING THE</h1>
        <h1 style={{ ...styles.h1, color: "var(--accent)" }}>NEXT GENERATION.</h1>
        <p style={styles.heroDesc}>
          Full-Stack developer architecting ultra-clean layouts, real-time data pipelines, and highly performant user interfaces. Focused on speed, accuracy, and structural code scaling.
        </p>
      </main>

      {/* CONTINUOUS KINETIC TICKER STRIP */}
      <div style={styles.marqueeWrapper}>
        <motion.div animate={marqueeControls} style={styles.marqueeContent}>
          <span className="stroke-text" style={styles.marqueeText}>CORE TELEMETRY // PRODUCTION READY // CLEAN STACK //&nbsp;</span>
          <span className="stroke-text" style={styles.marqueeText}>CORE TELEMETRY // PRODUCTION READY // CLEAN STACK //&nbsp;</span>
        </motion.div>
      </div>

      {/* SECTION 2: WORK EXPERIENCE TIMELINE */}
      <section id="experience" style={styles.section}>
        <div style={styles.sectionHeader}>
          <span style={styles.badge}>Track Record</span>
          <h2 style={styles.h2}>Professional Timeline</h2>
        </div>
        
        <div style={styles.timelineContainer}>
          {/* Job Item 1 */}
          <div style={styles.timelineItem}>
            <div style={styles.timelineMeta}>
              <span style={styles.timelineDate}>2024 — PRESENT</span>
              <span style={styles.timelineCompany}>Tech Core Systems</span>
            </div>
            <div style={styles.timelineContent}>
              <h3 style={styles.timelineRole}>Senior Software Engineer</h3>
              <p style={styles.timelineBody}>
                Optimized frontend application load times by 42% utilizing strategic component decoupling and caching engines. Led a team of 4 engineers delivering enterprise pipeline control interfaces.
              </p>
            </div>
          </div>

          {/* Job Item 2 */}
          <div style={styles.timelineItem}>
            <div style={styles.timelineMeta}>
              <span style={styles.timelineDate}>2022 — 2024</span>
              <span style={styles.timelineCompany}>Nexus Digital Lab</span>
            </div>
            <div style={styles.timelineContent}>
              <h3 style={styles.timelineRole}>Full-Stack Developer</h3>
              <p style={styles.timelineBody}>
                Architected microservice integrations handling millions of concurrent requests. Built layout asset engines using reactive frameworks to streamline multi-platform deployments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: FEATURED PROJECTS MATRIX */}
      <section id="projects" style={styles.section}>
        <div style={styles.sectionHeader}>
          <span style={styles.badge}>Showcase</span>
          <h2 style={styles.h2}>Featured Engineering</h2>
        </div>
        <div style={styles.grid}>
          <div style={styles.card}>
            <span style={styles.cardIndex}>01 // PIPELINE</span>
            <h3 style={styles.cardTitle}>Apex Telemetry</h3>
            <p style={styles.cardDesc}>A low-latency data streaming dashboard utilizing specialized socket managers for instant UI status tracking updates.</p>
            <div style={styles.cardLinks}><a href="#" style={styles.anchor}>Live Engine</a><a href="#" style={styles.anchor}>Codebase</a></div>
          </div>
          <div style={styles.card}>
            <span style={styles.cardIndex}>02 // LAYOUT</span>
            <h3 style={styles.cardTitle}>Kinetic CSS</h3>
            <p style={styles.cardDesc}>An open-source performance library optimizing layout manipulation processing solely through hardware acceleration matrices.</p>
            <div style={styles.cardLinks}><a href="#" style={styles.anchor}>Live Engine</a><a href="#" style={styles.anchor}>Codebase</a></div>
          </div>
        </div>
      </section>

      {/* SECTION 4: THE LANDO-STYLE "BEYOND THE CODE" IMAGE FAN DECK */}
      <section id="beyond" style={{ ...styles.section, textAlign: "center", overflow: "hidden" }}>
        <div style={{ ...styles.sectionHeader, textAlign: "center" }}>
          <span style={styles.badge}>Lifestyle Grid</span>
          <h2 style={styles.h2}>On Socials // Perspective</h2>
        </div>
        
        {/* Interactive Fan Container */}
        <div style={styles.fanWrapper}>
          <div style={styles.fanContainer}>
            {imageDeck.map((card, idx) => {
              const isHovered = hoveredCard === card.id;
              return (
                <div
                  key={card.id}
                  onMouseEnter={() => setHoveredCard(card.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    ...styles.fanCard,
                    backgroundImage: `url(${card.img})`,
                    transform: `
                      translateX(${(idx - (imageDeck.length - 1) / 2) * 55}px) 
                      rotate(${isHovered ? 0 : card.rotation}deg) 
                      translateY(${isHovered ? -30 : card.translateY}px)
                      scale(${isHovered ? 1.12 : 1})
                    `,
                    zIndex: isHovered ? 100 : idx,
                    boxShadow: isHovered ? "0 30px 60px rgba(0,0,0,0.8)" : "0 15px 30px rgba(0,0,0,0.4)",
                  }}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 5: OPEN SOURCE AND TELEMETRY */}
      <section id="oss" style={styles.section}>
        <div style={styles.sectionHeader}>
          <span style={styles.badge}>Ecosystem Engagement</span>
          <h2 style={styles.h2}>Open Source Contributions</h2>
        </div>
        <div style={styles.ossBlock}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: "1.75rem", fontWeight: 800, textTransform: "uppercase" }}>Global Upstream Commits</h3>
            <p style={{ color: "#888", marginTop: "1rem", lineHeight: 1.5 }}>
              Actively optimizing package architecture overhead metrics, submitting performance tuning adjustments to critical libraries, and engineering robust, developer-centric documentation pipelines.
            </p>
          </div>
          <div style={styles.metricsBox}>
            <div><div style={styles.metricNum}>500+</div><div style={styles.metricLabel}>Contributions This Year</div></div>
            <div><div style={styles.metricNum}>12</div><div style={styles.metricLabel}>PRs Merged Upstream</div></div>
          </div>
        </div>
      </section>

      {/* THE FOOTER CALL-TO-ACTION */}
      <footer style={styles.footer}>
        <h2 style={{ fontSize: "3rem", fontWeight: 900, textTransform: "uppercase" }}>Ready to Optimize?</h2>
        <a href="https://linkedin.com/in/YOUR-PROFILE" target="_blank" rel="noreferrer" style={styles.bigButton}>
          Establish LinkedIn Sync Connection
        </a>
      </footer>

      {/* Global Style Tags */}
      <style>{`
        :root { --bg: #080808; --surface: #111111; --accent: #ff4d00; --text: #ffffff; }
        html { scroll-behavior: smooth; }
        .stroke-text { color: transparent; -webkit-text-stroke: 1px rgba(255, 255, 255, 0.15); }
      `}</style>
    </motion.div>
  );
}

// Master Structural Styles Object (Pure CSS)
const styles = {
  body: { backgroundColor: "#080808", color: "#ffffff", minHeight: "100vh", fontFamily: "system-ui, sans-serif" },
  nav: { position: "fixed", top: 0, width: "100%", padding: "2rem 4rem", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 200, boxSizing: "border-box", background: "linear-gradient(to bottom, #080808 40%, transparent)" },
  logo: { fontWeight: 900, letterSpacing: "-1px" },
  navLinks: { display: "flex", gap: "2rem" },
  link: { color: "#888", textDecoration: "none", textTransform: "uppercase", fontSize: "0.85rem", fontWeight: 600 },
  main: { maxWidth: "1200px", margin: "0 auto", padding: "14rem 2rem 6rem 2rem", minHeight: "70vh", display: "flex", flexDirection: "column", justifyContent: "center" },
  badge: { color: "#ff4d00", fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "3px", marginBottom: "1rem", display: "block" },
  h1: { fontSize: "clamp(3rem, 7vw, 6rem)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.95, letterSpacing: "-2px", margin: 0 },
  heroDesc: { color: "#888", marginTop: "2rem", fontSize: "1.35rem", maxWidth: "600px", lineHeight: 1.5 },
  marqueeWrapper: { background: "#111", borderTop: "1px solid #222", borderBottom: "1px solid #222", padding: "1.5rem 0", overflow: "hidden", display: "flex", whiteSpace: "nowrap" },
  marqueeContent: { display: "flex" },
  marqueeText: { fontSize: "clamp(2rem, 4vw, 4rem)", fontWeight: 900, textTransform: "uppercase", paddingRight: "2rem" },
  section: { maxWidth: "1200px", margin: "0 auto", padding: "8rem 2rem", borderBottom: "1px solid #161616" },
  sectionHeader: { marginBottom: "4rem", textAlign: "left" },
  h2: { fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 900, textTransform: "uppercase", margin: 0, letterSpacing: "-1px" },
  
  // Timeline Architectural Styling Elements
  timelineContainer: { display: "flex", flexDirection: "column", gap: "4rem", position: "relative" },
  timelineItem: { display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem", borderTop: "1px solid #222", paddingTop: "2rem" },
  timelineMeta: { display: "flex", flexDirection: "column", gap: "0.5rem" },
  timelineDate: { fontSize: "1.15rem", fontWeight: 700, color: "#ff4d00" },
  timelineCompany: { fontSize: "1.25rem", fontWeight: 800, textTransform: "uppercase" },
  timelineRole: { fontSize: "1.75rem", fontWeight: 800, textTransform: "uppercase", margin: "0 0 1rem 0", color: "#fff" },
  timelineBody: { color: "#888", fontSize: "1.05rem", lineHeight: 1.6, margin: 0 },
  
  // Feature Cards Grid Styling Matrix
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "2.5rem" },
  card: { background: "#111", border: "1px solid #222", borderRadius: "16px", padding: "3rem", minHeight: "350px", display: "flex", flexDirection: "column", justifyContnet: "space-between" },
  cardIndex: { fontFamily: "monospace", color: "#444", fontSize: "0.9rem", fontWeight: 700 },
  cardTitle: { fontSize: "2rem", fontWeight: 800, textTransform: "uppercase", margin: "1.5rem 0 0.5rem 0" },
  cardDesc: { color: "#888", lineHeight: 1.5, marginBottom: "2rem", fontSize: "1rem" },
  cardLinks: { display: "flex", gap: "2rem", marginTop: "auto" },
  anchor: { color: "#fff", fontSize: "0.9rem", textTransform: "uppercase", fontWeight: 700, textDecoration: "none", borderBottom: "1px solid #ff4d00", paddingBottom: "2px" },
  
  // LANDO FAN DECK STYLING LAYER
  fanWrapper: { position: "relative", width: "100%", display: "flex", justifyContent: "center", height: "550px", marginTop: "4rem", boxSizing: "border-box" },
  fanContainer: { display: "flex", position: "relative", width: "100%", maxWidth: "600px", justifyContent: "center" },
  fanCard: { position: "absolute", bottom: "40px", width: "260px", height: "420px", borderRadius: "20px", backgroundSize: "cover", backgroundPosition: "center", border: "3px solid #111", transition: "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.45s, z-index 0.45s", cursor: "pointer", originY: 1.0 },
  
  // OSS & Telemetry Segment
  ossBlock: { background: "#111", borderRadius: "16px", border: "1px solid #222", padding: "4rem", display: "flex", flexWrap: "wrap", gap: "3rem" },
  metricsBox: { display: "flex", gap: "3rem", minWidth: "280px" },
  metricNum: { fontSize: "3.5rem", fontWeight: 900, color: "#ff4d00", lineHeight: 1 },
  metricLabel: { fontSize: "0.8rem", textTransform: "uppercase", color: "#666", marginTop: "0.5rem", fontWeight: 700, tracking: "1px" },
  
  footer: { padding: "8rem 2rem", textAlign: "center", background: "linear-gradient(to top, #111, transparent)" },
  bigButton: { display: "inline-block", background: "#fff", color: "#000", padding: "1.25rem 3rem", borderRadius: "40px", fontWeight: 800, textTransform: "uppercase", textDecoration: "none", letterSpacing: "1px", marginTop: "2rem", transition: "transform 0.2s" },
};