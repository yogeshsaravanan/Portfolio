// ProjectSection.jsx
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function ProjectSection({ projectsData, activeProject, setActiveProject, currentStyles, theme }) {
  const [hovered, setHovered] = useState(null);
  const accent = theme === "dark" ? "#ff4d00" : "#0055ff";
  const muted = theme === "dark" ? "#888" : "#4b5563";

  return (
    <section id="projects" style={currentStyles.section}>
      <div style={currentStyles.sectionHeader}>
        <span style={currentStyles.badge}>Showcase</span>
        <h2 style={currentStyles.h2}>Featured Engineering</h2>
      </div>

      <div style={currentStyles.grid}>
        {projectsData.map((project, i) => {
          const isHover = hovered === project.id;
          // pull the leading number out of the indexString ("01 // ..." → "01")
          const numeral = (project.indexString || "").trim().split(/\s|\/\//)[0] || String(i + 1).padStart(2, "0");

          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => setActiveProject(project)}
              onMouseEnter={() => setHovered(project.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                ...currentStyles.card,
                position: "relative",
                overflow: "hidden",
                cursor: "pointer",
                transform: isHover ? "translateY(-8px)" : "translateY(0)",
                boxShadow: isHover
                  ? `0 24px 60px ${theme === "dark" ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.18)"}`
                  : "0 0 0 rgba(0,0,0,0)",
                transition: "transform 0.5s cubic-bezier(0.16,1,0.3,1), box-shadow 0.5s",
              }}
            >
              {/* SIGNATURE: giant faint index numeral behind the content */}
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  top: "-2.5rem",
                  right: "-0.5rem",
                  fontSize: "11rem",
                  fontWeight: 900,
                  lineHeight: 1,
                  letterSpacing: "-0.05em",
                  color: isHover ? accent : (theme === "dark" ? "#ffffff" : "#111827"),
                  opacity: isHover ? 0.10 : 0.045,
                  transition: "opacity 0.5s, color 0.5s",
                  pointerEvents: "none",
                  fontFamily: "inherit",
                }}
              >
                {numeral}
              </span>

              {/* faint project image bleeding in on hover */}
              {project.image && (
                <div
                  style={{
                    position: "absolute", inset: 0,
                    backgroundImage: `url(${project.image})`,
                    backgroundSize: "cover", backgroundPosition: "center",
                    opacity: isHover ? 0.20 : 0,
                    transition: "opacity 0.6s",
                    pointerEvents: "none",
                  }}
                />
              )}

              <div style={{ position: "relative", zIndex: 1 }}>
                <span style={{ ...currentStyles.cardIndex, color: isHover ? accent : currentStyles.cardIndex.color, transition: "color 0.4s" }}>
                  {project.indexString}
                </span>
                <h3 style={currentStyles.cardTitle}>{project.title}</h3>
                <p style={currentStyles.cardDesc}>{project.desc}</p>
              </div>

              <div style={{ ...currentStyles.cardLinks, position: "relative", zIndex: 1 }} onClick={(e) => e.stopPropagation()}>
                <span style={{
                  ...currentStyles.anchor,
                  color: accent,
                  display: "inline-flex", alignItems: "center", gap: "0.4rem",
                  transform: isHover ? "translateX(4px)" : "translateX(0)",
                  transition: "transform 0.4s",
                }}>
                  View Source <span style={{ fontSize: "1.1em" }}>&rarr;</span>
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {activeProject && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setActiveProject(null)}
            style={currentStyles.modalBlurOverlay}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="project-modal"
              style={currentStyles.modalCardWindow}
            >
              <button onClick={() => setActiveProject(null)} style={currentStyles.modalCloseBtn}>✕ Close</button>

              {/* HEADER: image + accent tint + title + role + tags, one unit */}
              <div style={{ position: "relative", width: "100%", height: "320px", overflow: "hidden" }}>
                <motion.img
                  src={activeProject.image}
                  alt={activeProject.title}
                  initial={{ scale: 1.12 }} animate={{ scale: 1 }}
                  transition={{ duration: 1.4, ease: "easeOut" }}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                {/* accent tint — unifies any photo with the brand */}
                <div style={{
                  position: "absolute", inset: 0,
                  background: accent, mixBlendMode: "multiply", opacity: 0.22, pointerEvents: "none",
                }} />
                {/* readability gradient up from the bottom */}
                <div style={{
                  position: "absolute", inset: 0,
                  background: `linear-gradient(to top, ${theme === "dark" ? "#111" : "#fff"} 4%, transparent 65%)`,
                }} />
                {/* title block + tags pinned in the header */}
                <div style={{ position: "absolute", left: "2rem", right: "2rem", bottom: "1.4rem" }}>
                  <motion.h3
                    initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.5 }}
                    style={{ fontSize: "2rem", fontWeight: 900, textTransform: "uppercase", margin: 0, color: theme === "dark" ? "#fff" : "#111827" }}
                  >
                    {activeProject.title}
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.22, duration: 0.5 }}
                    style={{ color: theme === "dark" ? "#fff" : "#fff", fontWeight: 700, margin: "0.35rem 0 0.85rem 0", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "1px", opacity: 0.95 }}
                  >
                    {activeProject.role}
                  </motion.p>
                  {activeProject.tags && (
                    <motion.div
                      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}
                    >
                      {activeProject.tags.map((t) => (
                        <span key={t} style={{
                          fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
                          fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.04em",
                          padding: "0.3rem 0.65rem", borderRadius: "6px", textTransform: "uppercase",
                          color: "#fff", background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)",
                          border: "1px solid rgba(255,255,255,0.25)",
                        }}>
                          {t}
                        </span>
                      ))}
                    </motion.div>
                  )}
                </div>
              </div>

              {/* BODY: numbered sections with accent left-border */}
              <div style={{ padding: "2.25rem 2rem 2rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
                  {[
                    ["01", "Architecture Overview", activeProject.desc],
                    ["02", "Technical Challenges", activeProject.challenges],
                    ["03", "Outcome", activeProject.outcome],
                  ].filter(([, , body]) => body).map(([num, label, body], i) => (
                    <motion.div
                      key={num}
                      initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 + i * 0.08, duration: 0.5 }}
                      style={{ paddingLeft: "1rem", borderLeft: `2px solid ${accent}` }}
                    >
                      <h4 style={{ ...currentStyles.modalSectionLabel, display: "flex", alignItems: "baseline", gap: "0.6rem" }}>
                        <span style={{ fontFamily: "ui-monospace, monospace", opacity: 0.6 }}>{num}</span>
                        {label}
                      </h4>
                      <p style={{ color: theme === "dark" ? "#D4D4D4" : "#4B5563", lineHeight: 1.55, margin: 0 }}>{body}</p>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  style={{ marginTop: "2rem" }}
                >
                  <a href={activeProject.source} target="_blank" rel="noreferrer" style={currentStyles.modalBtnOutline}>
                    View Source Code &rarr;
                  </a>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* thin themed scrollbar for the modal */}
      <style>{`
        .project-modal { scrollbar-width: thin; scrollbar-color: ${accent} transparent; }
        .project-modal::-webkit-scrollbar { width: 6px; }
        .project-modal::-webkit-scrollbar-track { background: transparent; }
        .project-modal::-webkit-scrollbar-thumb { background: ${accent}; border-radius: 3px; }
      `}</style>
    </section>
  );
}