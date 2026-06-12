// Portfolio.jsx
import React, { useEffect, useState, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import { styles } from "./PortfolioStyles";
import ProjectSection from "./ProjectSection";
import { imageDeck, skillsMatrix, projectsData, lifestyleEcosystem } from "./data";
import SkillMatrixCards from "./Skillmatrixcards";
import SkillDeck from "./skilldeck";
// import HeroLanding from "./HeroLanding";
import HeroCinematic from "./Herocinematic";

export default function Portfolio({ initialTheme = "dark" }) {
  // const canvasRef = useRef(null);
  // const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const zoomRef = useRef({ current: 1, target: 1 });
  const velRef = useRef(0);


  const [theme, setTheme] = useState(initialTheme);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [activeProject, setActiveProject] = useState(null);
  const [formStatus, setFormStatus] = useState("idle");
  const [isMobile, setIsMobile] = useState(false);
  const marqueeControls = useAnimation();

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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={currentStyles.body}>
      <nav style={currentStyles.nav}>
        <div id="navLogo" style={currentStyles.logo}>YOGESHWARAN <br />SARAVANAN</div>
        <div style={currentStyles.navLinks}>
          <a href="#skills" style={currentStyles.link}>Capabilities</a>
          <a href="#projects" style={currentStyles.link}>Production</a>
          <a href="#contact" style={currentStyles.link}>Transmission</a>
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} style={currentStyles.toggleButton}>
            Matrix: {theme === "dark" ? "🔴 Red" : "🔵 Blue"}
          </button>
        </div>
      </nav>

      <HeroCinematic theme={theme} />


      <div style={currentStyles.marqueeWrapper}>
        <motion.div animate={marqueeControls} style={currentStyles.marqueeContent}>
          <span className="stroke-text" style={currentStyles.marqueeText}>CORE TELEMETRY // PRODUCTION READY // </span>
          <span className="stroke-text" style={currentStyles.marqueeText}>CORE TELEMETRY // PRODUCTION READY // </span>
        </motion.div>
      </div>

      {/* <section id="skills" style={currentStyles.skillssection}> */}
        <SkillMatrixCards skillsMatrix={skillsMatrix} currentStyles={currentStyles} theme={theme} />
      {/* </section> */}

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