// Portfolio.jsx
import React, { useEffect, useState, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import { styles } from "./PortfolioStyles";
import ProjectSection from "./ProjectSection";
import { imageDeck, skillsMatrix, projectsData, lifestyleEcosystem } from "./data";
import SkillMatrixCards from "./Skillmatrixcards";
import SkillDeck from "./skilldeck";

export default function Portfolio({ initialTheme = "dark" }) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas.getContext("webgl");
    if (!gl) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMouse = (e) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: 1.0 - e.clientY / window.innerHeight,
      };
    };
    window.addEventListener("mousemove", handleMouse);

    const vert = `
    attribute vec2 a_pos;
    void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
  `;

    const frag = `
    precision highp float;
    uniform float u_time;
    uniform vec2 u_res;
    uniform vec2 u_mouse;

    vec3 palette(float t) {
      // Your brand: deep black → dark orange glow
      vec3 a = vec3(0.02, 0.01, 0.01);
      vec3 b = vec3(0.35, 0.12, 0.02);
      vec3 c = vec3(1.0, 0.5, 0.1);
      vec3 d = vec3(0.0, 0.05, 0.08);
      return a + b * cos(6.28318 * (c * t + d));
    }

    float noise(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    float smoothNoise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      float a = noise(i);
      float b = noise(i + vec2(1.0, 0.0));
      float c = noise(i + vec2(0.0, 1.0));
      float d = noise(i + vec2(1.0, 1.0));
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    float fbm(vec2 p) {
      float v = 0.0; float amp = 0.5; float freq = 1.0;
      for (int i = 0; i < 6; i++) {
        v += amp * smoothNoise(p * freq);
        amp *= 0.5; freq *= 2.1;
      }
      return v;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_res;
      vec2 aspect = vec2(u_res.x / u_res.y, 1.0);
      vec2 p = uv * aspect;

      // Mouse influence — fluid warp
      vec2 m = u_mouse * aspect;
      float md = length(p - m);
      float mouseWarp = exp(-md * 3.5) * 0.35;

      float t = u_time * 0.18;

      // Layered fluid domain warping
      vec2 q = vec2(
        fbm(p + vec2(0.0, 0.0) + t),
        fbm(p + vec2(5.2, 1.3) + t)
      );
      vec2 r = vec2(
        fbm(p + 4.0 * q + vec2(1.7, 9.2) + t * 0.7 + mouseWarp),
        fbm(p + 4.0 * q + vec2(8.3, 2.8) + t * 0.5 + mouseWarp)
      );

      float f = fbm(p + 4.0 * r + mouseWarp);

      // Color mapping
      vec3 col = palette(f + 0.3 * t);

      // Darken significantly — you want atmosphere, not screensaver
      col *= 1.8;

      // Subtle vignette
      float vig = 1.0 - smoothstep(0.3, 1.2, length((uv - 0.5) * 1.6));
      col *= vig * 0.85;

      // Bottom fade so text sits on clean dark ground
      // col *= smoothstep(0.0, 0.35, uv.y);

      gl_FragColor = vec4(col, 1.0);
    }
  `;

    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };

    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vert));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, frag));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const loc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes = gl.getUniformLocation(prog, "u_res");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");

    let start = performance.now();
    let raf;
    const tick = () => {
      const t = (performance.now() - start) / 1000;
      gl.uniform1f(uTime, t);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uMouse, mouseRef.current.x, mouseRef.current.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouse);
    };
  }, []);


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

      <main style={{ ...currentStyles.main, position: "relative", overflow: "hidden", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "0 4rem 8rem" }} id="hero">


        <canvas ref={canvasRef} style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          zIndex: 0,
        }} />

        {/* Text */}
        <div style={{ position: "relative", zIndex: 2 }}>
          <motion.span initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }} style={currentStyles.badge}>
            PORTFOLIO PROTOCOL // ACTIVE
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }} style={currentStyles.h1}>
            ENGINEERING THE
          </motion.h1>
          <motion.h1 initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{ ...currentStyles.h1, color: "var(--accent)" }}>
            NEXT GENERATION.
          </motion.h1>
        </div>
      </main>

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