// ProjectSection.jsx
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { imageDeck,skillsMatrix,projectsData,lifestyleEcosystem } from "./data";

export default function ProjectSection({ projectsData, activeProject, setActiveProject, currentStyles, theme }) {
  return (
    <section id="projects" style={currentStyles.section}>
      <div style={currentStyles.sectionHeader}>
        <span style={currentStyles.badge}>Showcase</span>
        <h2 style={currentStyles.h2}>Featured Engineering</h2>
      </div>
      <div style={currentStyles.grid}>
        {projectsData.map((project) => (
          <div 
            key={project.id} 
            style={{ ...currentStyles.card, cursor: "pointer" }}
            onClick={() => setActiveProject(project)}
          >
            <span style={currentStyles.cardIndex}>{project.indexString}</span>
            <h3 style={currentStyles.cardTitle}>{project.title}</h3>
            <p style={currentStyles.cardDesc}>{project.desc}</p>
            <div style={currentStyles.cardLinks} onClick={(e) => e.stopPropagation()}>
              <span style={{ ...currentStyles.anchor, color: "var(--accent)" }}>Analyze Metrics &rarr;</span>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {activeProject && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setActiveProject(null)}
            style={currentStyles.modalBlurOverlay}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={currentStyles.modalCardWindow}
            >
              <button onClick={() => setActiveProject(null)} style={currentStyles.modalCloseBtn}>✕ Close</button>
              <div style={currentStyles.modalHeroBanner}>
                <img src={activeProject.image} alt={activeProject.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ padding: "2rem" }}>
                <h3 style={{ fontSize: "2rem", fontWeight: 900, textTransform: "uppercase", margin: 0 }}>{activeProject.title}</h3>
                <p style={{ color: "var(--accent)", fontWeight: 700, margin: "0.5rem 0 1.5rem 0", fontSize: "0.9rem", textTransform: "uppercase" }}>{activeProject.role}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  <div>
                    <h4 style={currentStyles.modalSectionLabel}>Architecture Overview</h4>
                    <p style={{ color: theme === "dark" ? "#D4D4D4" : "#4B5563", lineHeight: 1.5, margin: 0 }}>{activeProject.desc}</p>
                  </div>
                  <div>
                    <h4 style={currentStyles.modalSectionLabel}>Technical Challenges</h4>
                    <p style={{ color: theme === "dark" ? "#D4D4D4" : "#4B5563", lineHeight: 1.5, margin: 0 }}>{activeProject.challenges}</p>
                  </div>
                </div>
                <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
                  <a href={activeProject.live} target="_blank" rel="noreferrer" style={currentStyles.modalBtnFilled}>Live Deployment</a>
                  <a href={activeProject.source} target="_blank" rel="noreferrer" style={currentStyles.modalBtnOutline}>Source Code</a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}