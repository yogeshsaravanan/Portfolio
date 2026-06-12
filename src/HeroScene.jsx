/**
 * HeroScene.jsx — cinematic "Engineering the Next Generation" landing
 *
 * Visual recipe (Lusion about-page mood, zero WebGL):
 *   - Layered SVG terrain (valley walls left/right) with mouse parallax
 *   - Central volumetric light column built from stacked radial gradients
 *   - ~60 drifting dust particles — pure CSS keyframe animations
 *     (compositor-only: zero JavaScript per frame, zero canvas, zero rAF loop)
 *   - Static film-grain overlay (inline SVG noise, painted once)
 *   - Massive split typography bottom-left / bottom-right
 *
 * CPU budget: after initial paint, the ONLY recurring work is
 * compositor transform updates. No layout, no repaint, no JS ticking.
 *
 * Usage (replace your current <main id="hero">):
 *   <HeroScene theme={theme} />
 */

import React, { useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";

export default function HeroScene({ theme = "dark" }) {
  const sceneRef = useRef(null);
  const farRef = useRef(null);    // far terrain  (slow parallax)
  const nearRef = useRef(null);   // near terrain (fast parallax)
  const lightRef = useRef(null);  // light column (subtle drift)

  const accent = theme === "dark" ? "#ff4d00" : "#0055ff";

  /* Particle field — random once, stable across renders */
  const particles = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        left: 30 + Math.random() * 40,            // clustered near the light column
        top: 5 + Math.random() * 60,
        size: Math.random() * 2.2 + 0.8,
        dur: 6 + Math.random() * 10,
        delay: -Math.random() * 16,
        drift: (Math.random() - 0.5) * 60,
        bright: Math.random() * 0.55 + 0.2,
      })),
    []
  );

  /* Mouse parallax — gsap.quickTo = pre-compiled tween, transform-only */
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const farX = gsap.quickTo(farRef.current, "x", { duration: 1.2, ease: "power3.out" });
    const farY = gsap.quickTo(farRef.current, "y", { duration: 1.2, ease: "power3.out" });
    const nearX = gsap.quickTo(nearRef.current, "x", { duration: 0.9, ease: "power3.out" });
    const nearY = gsap.quickTo(nearRef.current, "y", { duration: 0.9, ease: "power3.out" });
    const lightX = gsap.quickTo(lightRef.current, "x", { duration: 1.6, ease: "power3.out" });

    const onMove = (e) => {
      const nx = e.clientX / window.innerWidth - 0.5;   // -0.5 .. 0.5
      const ny = e.clientY / window.innerHeight - 0.5;
      farX(nx * -14); farY(ny * -8);
      nearX(nx * -34); nearY(ny * -16);
      lightX(nx * 22);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const mono = (l) => `hsl(220, 12%, ${l}%)`; // cold steel monochrome ramp

  const S = {
    hero: {
      position: "relative",
      width: "100%",
      minHeight: "100vh",
      overflow: "hidden",
      background:
        "linear-gradient(180deg, #050507 0%, #0a0b0f 45%, #14161c 100%)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-end",
    },
    layer: { position: "absolute", inset: 0, pointerEvents: "none" },
    h1: {
      fontSize: "clamp(2.4rem, 5.8vw, 5.6rem)",
      fontWeight: 900,
      textTransform: "uppercase",
      lineHeight: 0.95,
      letterSpacing: "-2px",
      margin: 0,
      color: "#f2f3f5",
    },
  };

  return (
    <main ref={sceneRef} style={S.hero} id="hero">

      {/* ── Volumetric light column ─────────────────────────────────── */}
      <div ref={lightRef} style={S.layer}>
        {/* sky glow at the source */}
        <div style={{
          position: "absolute", left: "50%", top: "-12%",
          width: "60vmin", height: "60vmin", transform: "translateX(-50%)",
          background: "radial-gradient(circle, rgba(235,240,250,0.55) 0%, rgba(200,210,230,0.18) 35%, transparent 70%)",
        }} />
        {/* the beam */}
        <div style={{
          position: "absolute", left: "50%", top: 0, height: "78%",
          width: "26vmin", transform: "translateX(-50%)",
          background: "linear-gradient(180deg, rgba(230,236,248,0.34) 0%, rgba(210,220,240,0.10) 55%, transparent 100%)",
          clipPath: "polygon(38% 0, 62% 0, 100% 100%, 0 100%)",
        }} />
        {/* ground pool where the beam lands */}
        <div style={{
          position: "absolute", left: "50%", bottom: "8%",
          width: "70vmin", height: "16vmin", transform: "translateX(-50%)",
          background: "radial-gradient(ellipse, rgba(220,228,244,0.30) 0%, rgba(190,200,225,0.08) 45%, transparent 72%)",
        }} />
      </div>

      {/* ── Dust particles (pure CSS, compositor-only) ──────────────── */}
      <div style={S.layer}>
        {particles.map((p) => (
          <span
            key={p.id}
            style={{
              position: "absolute",
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: `rgba(225,232,246,${p.bright})`,
              animation: `heroDrift ${p.dur}s ease-in-out ${p.delay}s infinite alternate`,
              "--dx": `${p.drift}px`,
              willChange: "transform, opacity",
            }}
          />
        ))}
      </div>

      {/* ── Far terrain (slow parallax) ─────────────────────────────── */}
      <div ref={farRef} style={{ ...S.layer, top: "auto", height: "62%", bottom: "-2%" }}>
        <svg viewBox="0 0 1440 500" preserveAspectRatio="xMidYMax slice"
          style={{ width: "104%", height: "100%", marginLeft: "-2%", display: "block" }}>
          <path d="M0,500 L0,150 L90,205 L170,120 L260,230 L350,180 L430,290 L520,260 L560,330 L520,500 Z" fill={mono(9)} />
          <path d="M1440,500 L1440,120 L1350,190 L1270,110 L1180,225 L1090,170 L1010,280 L930,255 L880,340 L920,500 Z" fill={mono(9)} />
          {/* ridge highlights — thin strokes catching the light */}
          <path d="M0,150 L90,205 L170,120 L260,230 L350,180 L430,290" fill="none" stroke={mono(34)} strokeWidth="1.2" opacity="0.5" />
          <path d="M1440,120 L1350,190 L1270,110 L1180,225 L1090,170 L1010,280" fill="none" stroke={mono(34)} strokeWidth="1.2" opacity="0.5" />
        </svg>
      </div>

      {/* ── Near terrain (fast parallax) ────────────────────────────── */}
      <div ref={nearRef} style={{ ...S.layer, top: "auto", height: "46%", bottom: "-4%" }}>
        <svg viewBox="0 0 1440 380" preserveAspectRatio="xMidYMax slice"
          style={{ width: "108%", height: "100%", marginLeft: "-4%", display: "block" }}>
          <path d="M0,380 L0,140 L120,210 L230,130 L340,250 L420,220 L470,310 L420,380 Z" fill={mono(5)} />
          <path d="M1440,380 L1440,130 L1310,215 L1200,140 L1090,260 L1010,230 L960,320 L1010,380 Z" fill={mono(5)} />
          <path d="M0,140 L120,210 L230,130 L340,250 L420,220" fill="none" stroke={mono(26)} strokeWidth="1.4" opacity="0.6" />
          <path d="M1440,130 L1310,215 L1200,140 L1090,260 L1010,230" fill="none" stroke={mono(26)} strokeWidth="1.4" opacity="0.6" />
          {/* scattered ground rocks */}
          <polygon points="600,360 615,344 634,352 628,368 606,370" fill={mono(13)} />
          <polygon points="836,350 848,338 864,346 858,360 840,361" fill={mono(11)} />
          <polygon points="712,372 720,364 731,368 728,377 715,378" fill={mono(15)} />
        </svg>
      </div>

      {/* ── HUD crosses (Lusion detail) ─────────────────────────────── */}
      <div style={S.layer}>
        {[["6%", "46%"], ["28%", "44%"], ["50%", "46%"], ["72%", "44%"], ["94%", "46%"]].map(([l, t], i) => (
          <span key={i} style={{
            position: "absolute", left: l, top: t,
            color: "rgba(220,228,244,0.28)", fontSize: 14, fontWeight: 300,
            fontFamily: "monospace",
          }}>+</span>
        ))}
      </div>

      {/* ── Film grain (static, painted once) ───────────────────────── */}
      <div style={{
        ...S.layer, opacity: 0.05,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }} />

      {/* ── Typography ──────────────────────────────────────────────── */}
      <div style={{
        position: "relative", zIndex: 3,
        display: "flex", justifyContent: "space-between", alignItems: "flex-end",
        flexWrap: "wrap", gap: "1.5rem",
        padding: "0 4vw 6vh",
      }}>
        <div>
          <motion.span
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            style={{
              display: "block", marginBottom: "1.2rem",
              fontSize: "0.8rem", fontWeight: 700, letterSpacing: "3px",
              textTransform: "uppercase", color: accent,
            }}
          >
            Portfolio Protocol // Active
          </motion.span>
          {["ENGINEERING", "THE NEXT", "GENERATION."].map((line, i) => (
            <div key={i} style={{ overflow: "hidden" }}>
              <motion.h1
                initial={{ y: "110%" }} animate={{ y: "0%" }}
                transition={{ duration: 1, delay: 0.35 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                style={{ ...S.h1, color: i === 2 ? accent : S.h1.color }}
              >
                {line}
              </motion.h1>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "right", maxWidth: "34ch" }}>
          {["CRAFTING SCALABLE", "DIGITAL SYSTEMS"].map((line, i) => (
            <div key={i} style={{ overflow: "hidden" }}>
              <motion.p
                initial={{ y: "110%" }} animate={{ y: "0%" }}
                transition={{ duration: 1, delay: 0.7 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  margin: 0, fontSize: "clamp(1.1rem, 2.4vw, 2.2rem)",
                  fontWeight: 300, fontStyle: "italic", letterSpacing: "-0.5px",
                  lineHeight: 1.08, color: "rgba(235,239,247,0.85)",
                  textTransform: "uppercase",
                }}
              >
                {line}
              </motion.p>
            </div>
          ))}
        </div>
      </div>

      {/* keyframes for the dust drift */}
      <style>{`
        @keyframes heroDrift {
          from { transform: translate3d(0, 0, 0); opacity: 0.15; }
          50%  { opacity: 1; }
          to   { transform: translate3d(var(--dx, 30px), -90px, 0); opacity: 0.1; }
        }
        @media (max-width: 768px) {
          #hero h1 { letter-spacing: -1px; }
        }
        @media (prefers-reduced-motion: reduce) {
          #hero span { animation: none !important; }
        }
      `}</style>
    </main>
  );
}