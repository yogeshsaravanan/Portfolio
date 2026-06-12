/**
 * SkillDeck.jsx — Lusion-style "Area of Expertise" card deck
 *
 * CPU-ONLY rendering strategy:
 *   - Zero WebGL / Canvas. Pure CSS 3D transforms (compositor-accelerated,
 *     no GPU shader work, no rAF paint loops).
 *   - GSAP only mutates transform/opacity (never layout properties),
 *     so there are no reflows during scroll.
 *   - All animation is ref-driven. React never re-renders during scroll.
 *
 * Install:  npm install gsap
 * Usage:    <SkillDeck skillsMatrix={skillsMatrix} theme={theme} />
 */

import React, { useRef, useEffect, useMemo } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ────────────────────────────────────────────────────────────────────────
   PALETTES
──────────────────────────────────────────────────────────────────────── */
const PALETTES = {
  light: {
    stageBg: "#0055ff",
    cardFrontBg: "#0055ff",
    line: "rgba(255,255,255,0.92)",
    lineSoft: "rgba(255,255,255,0.30)",
    backBg: "#ffffff",
    backText: "#101014",
    backMuted: "#52525b",
    divider: "rgba(16,16,20,0.18)",
    headline: "#ffffff",
    shadow: "rgba(0,15,80,0.45)",
    glow: "none",
  },
  dark: {
    stageBg: "#0c0608",
    cardFrontBg: "#120a0d",
    line: "#ff4d00",
    lineSoft: "rgba(255,77,0,0.35)",
    backBg: "#ffffff",
    backText: "#101014",
    backMuted: "#52525b",
    divider: "rgba(16,16,20,0.18)",
    headline: "#ffffff",
    shadow: "rgba(0,0,0,0.65)",
    glow: "0 0 18px rgba(255,77,0,0.35)",
  },
};

/* ────────────────────────────────────────────────────────────────────────
   CARD FRONT — monoline vector pattern (inline SVG, scales freely)
──────────────────────────────────────────────────────────────────────── */
function CardFrontSVG({ icon, pal }) {
  return (
    <svg viewBox="0 0 130 188" style={{ width: "100%", height: "100%", display: "block" }}>
      <rect width="130" height="188" rx="10" fill={pal.cardFrontBg} />
      <rect x="6" y="6" width="118" height="176" rx="8" fill="none" stroke={pal.line} strokeWidth="1.5" />
      <rect x="13" y="13" width="104" height="162" rx="6" fill="none" stroke={pal.lineSoft} strokeWidth="0.8" />
      <text x="14" y="28" fill={pal.line} fontSize="11" fontWeight="700" fontFamily="monospace">{icon}</text>
      <g transform="rotate(180,116,168)">
        <text x="112" y="173" fill={pal.line} fontSize="11" fontWeight="700" fontFamily="monospace">{icon}</text>
      </g>
      <polygon points="65,50 92,94 65,138 38,94" fill="none" stroke={pal.line} strokeWidth="1.1" />
      <polygon points="65,61 84,94 65,127 46,94" fill="none" stroke={pal.lineSoft} strokeWidth="0.8" />
      <circle cx="65" cy="94" r="19" fill={pal.cardFrontBg} stroke={pal.line} strokeWidth="1.4" />
      <text x="65" y="99.5" fill={pal.line} fontSize="15" fontWeight="800" textAnchor="middle" fontFamily="monospace">{icon}</text>
      <line x1="38" y1="34" x2="92" y2="34" stroke={pal.lineSoft} strokeWidth="0.7" />
      <line x1="46" y1="40" x2="84" y2="40" stroke={pal.lineSoft} strokeWidth="0.5" />
      <line x1="38" y1="154" x2="92" y2="154" stroke={pal.lineSoft} strokeWidth="0.7" />
      <line x1="46" y1="148" x2="84" y2="148" stroke={pal.lineSoft} strokeWidth="0.5" />
      <polygon points="65,20 70,26 65,32 60,26" fill="none" stroke={pal.line} strokeWidth="0.8" />
      <polygon points="65,156 70,162 65,168 60,162" fill="none" stroke={pal.line} strokeWidth="0.8" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
──────────────────────────────────────────────────────────────────────── */
export default function SkillDeck({ skillsMatrix = [], theme = "dark" }) {
  const pal = PALETTES[theme] || PALETTES.dark;
  const N = skillsMatrix.length;

  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const headlineRef = useRef(null);
  const cardRefs = useRef([]);
  const innerRefs = useRef([]);
  const shadowRefs = useRef([]);

  /* Stable per-card "hand-dealt" jitter so re-renders don't reshuffle */
  const jitter = useMemo(
    () => skillsMatrix.map(() => (Math.random() - 0.5) * 3),
    [N] // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => {
    const stage = stageRef.current;
    const section = sectionRef.current;
    if (!stage || !section || N === 0) return;

    /* Runtime bounding-box calculator — all geometry derives from this */
    const computeLayout = () => {
      const W = stage.offsetWidth;
      const isMobile = W < 768;
      const cardW = isMobile ? Math.max(86, W * 0.22) : Math.min(170, W * 0.13);
      const cardH = cardW * 1.45;
      const gap = isMobile ? cardW * 0.18 : cardW * 0.32;
      const spacing = cardW + gap;
      const tiltMax = isMobile ? 7 : 14;      // gentler 3D on mobile
      const arcDrop = isMobile ? 14 : 38;     // outer cards sit lower
      return { W, isMobile, cardW, cardH, spacing, tiltMax, arcDrop };
    };

    const ctx = gsap.context(() => {
      let L = computeLayout();

      /* Apply card dimensions (one-time layout write, outside scroll loop) */
      const sizeCards = () => {
        L = computeLayout();
        cardRefs.current.forEach((el) => {
          if (!el) return;
          el.style.width = L.cardW + "px";
          el.style.height = L.cardH + "px";
        });
      };
      sizeCards();

      /* Per-card target pose in the fanned state */
      const pose = (i) => {
        const c = (N - 1) / 2;
        const off = i - c;                       // -2..+2 for 5 cards
        const norm = c === 0 ? 0 : off / c;      // -1..+1
        return {
          x: off * L.spacing,
          y: Math.abs(norm) * L.arcDrop,         // arc: center high, edges low
          rz: norm * L.tiltMax + jitter[i],      // outward slant + jitter
        };
      };

      /* Initial stacked state */
      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.set(el, {
          x: (i - (N - 1) / 2) * 2.5,
          y: 0,
          rotationZ: jitter[i] * 0.6,
          willChange: "transform",
          force3D: true,
        });
        gsap.set(innerRefs.current[i], { rotationY: 0, willChange: "transform", force3D: true });
        gsap.set(shadowRefs.current[i], { opacity: 0.25, scaleX: 0.7 });
      });
      gsap.set(headlineRef.current, { yPercent: 0 });

      /* Master scrubbed timeline */
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=180%",
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,   // recompute poses on resize/refresh
        },
      });

      /* Headline drifts up and out as the deck takes the stage */
      tl.to(headlineRef.current, { yPercent: -28, opacity: 0.18, ease: "none", duration: 1 }, 0);

      cardRefs.current.forEach((el, i) => {
        if (!el) return;

        /* Phase 1 — fan out (0 → 1) */
        tl.to(el, {
          x: () => pose(i).x,
          y: () => pose(i).y,
          rotationZ: () => pose(i).rz,
          ease: "power2.out",
          duration: 1,
        }, 0);

        /* Shadow widens + softens as card lifts into place */
        tl.to(shadowRefs.current[i], {
          opacity: 0.55,
          scaleX: 1,
          ease: "power2.out",
          duration: 1,
        }, 0);

        /* Phase 2 — simultaneous flip (0.85 → 1.85), slight overlap for polish */
        tl.to(innerRefs.current[i], {
          rotationY: 180,
          ease: "power2.inOut",
          duration: 1,
        }, 0.85);
      });

      /* Resize: re-size cards; invalidateOnRefresh re-reads pose() functions */
      const onResize = () => { sizeCards(); ScrollTrigger.refresh(); };
      window.addEventListener("resize", onResize, { passive: true });

      return () => window.removeEventListener("resize", onResize);
    }, section);

    /* Full cleanup — kills timeline, ScrollTrigger, pin spacers */
    return () => ctx.revert();
  }, [N, theme, jitter]);

  /* ── styles (static objects, no re-creation cost worth optimizing further) ── */
  const S = {
    section: {
      position: "relative",
      width: "100%",
      minHeight: "100vh",
      background: pal.stageBg,
      overflow: "hidden",
    },
    stage: {
      position: "relative",
      width: "100%",
      height: "100vh",
      perspective: "1600px",
      perspectiveOrigin: "50% 42%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    headline: {
      position: "absolute",
      top: "7vh",
      left: "4vw",
      right: "4vw",
      margin: 0,
      color: pal.headline,
      fontSize: "clamp(2.6rem, 9vw, 8.5rem)",
      fontWeight: 900,
      textTransform: "uppercase",
      letterSpacing: "-1px",
      lineHeight: 0.92,
      pointerEvents: "none",
      zIndex: 1,
    },
    cardContainer: {
      position: "absolute",
      transformStyle: "preserve-3d",
      zIndex: 2,
    },
    shadow: {
      position: "absolute",
      left: "8%",
      right: "8%",
      bottom: "-9%",
      height: "10%",
      borderRadius: "50%",
      background: pal.shadow,
      filter: "blur(10px)",
      transform: "translateZ(-1px)",
      pointerEvents: "none",
    },
    inner: {
      position: "relative",
      width: "100%",
      height: "100%",
      transformStyle: "preserve-3d",
    },
    face: {
      position: "absolute",
      inset: 0,
      borderRadius: 12,
      backfaceVisibility: "hidden",
      WebkitBackfaceVisibility: "hidden",
      overflow: "hidden",
    },
    back: {
      transform: "rotateY(180deg)",
      background: pal.backBg,
      display: "flex",
      flexDirection: "column",
      padding: "9% 10%",
      boxShadow: theme === "dark" ? PALETTES.dark.glow : "none",
    },
    backRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
    backTitle: {
      fontSize: "clamp(9px, 0.85vw, 13px)",
      fontWeight: 800,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      color: pal.backText,
      lineHeight: 1.1,
      margin: 0,
    },
    backIcon: {
      fontSize: "clamp(11px, 1vw, 16px)",
      fontWeight: 900,
      color: pal.backText,
      fontFamily: "monospace",
      lineHeight: 1,
    },
    skill: {
      fontSize: "clamp(7.5px, 0.7vw, 10.5px)",
      fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
      color: pal.backMuted,
      padding: "5% 0",
      margin: 0,
      lineHeight: 1.25,
      borderBottom: `1px dashed ${pal.divider}`,
    },
  };

  return (
    <section ref={sectionRef} style={S.section} id="skills">
      <div ref={stageRef} style={S.stage}>
        <h2 ref={headlineRef} style={S.headline}>
          Area of<br />Expertise
        </h2>

        {skillsMatrix.map((cluster, i) => {
          const icon = cluster.category.charAt(0).toUpperCase();
          return (
            <div
              key={i}
              ref={(el) => (cardRefs.current[i] = el)}
              style={S.cardContainer}
            >
              <div ref={(el) => (shadowRefs.current[i] = el)} style={S.shadow} />
              <div ref={(el) => (innerRefs.current[i] = el)} style={S.inner}>
                <div style={S.face}>
                  <CardFrontSVG icon={icon} pal={pal} />
                </div>
                <div style={{ ...S.face, ...S.back }}>
                  <div style={S.backRow}>
                    <p style={S.backTitle}>{cluster.category}</p>
                    <span style={S.backIcon}>{icon}</span>
                  </div>
                  <div style={{ flex: 1, marginTop: "6%" }}>
                    {cluster.items.map((skill, s) => (
                      <p key={s} style={S.skill}>{skill}</p>
                    ))}
                  </div>
                  <div style={{ ...S.backRow, transform: "rotate(180deg)", marginTop: "6%" }}>
                    <p style={{ ...S.backTitle, fontSize: "clamp(7px,0.65vw,10px)" }}>{cluster.category}</p>
                    <span style={{ ...S.backIcon, fontSize: "clamp(9px,0.8vw,12px)" }}>{icon}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   INTEGRATION (Portfolio.jsx):

   import SkillDeck from "./SkillDeck";
   ...
   // Replace your current <section id="skills"> block with:
   <SkillDeck skillsMatrix={skillsMatrix} theme={theme} />

   Notes:
   - theme="light" → cobalt #0055ff stage, white-line cards
   - theme="dark"  → velvet dark stage, #ff4d00 neon strokes + glow
   - Works with your existing skillsMatrix data shape unchanged.
   - 3 cards or 5 cards — geometry auto-adapts (poses derive from N).
──────────────────────────────────────────────────────────────────────── */