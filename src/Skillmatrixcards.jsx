// SkillMatrixCards.jsx — Lusion-grade upgrade (same props, drop-in)
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* Card front SVG — unchanged from your version, trimmed for brevity */
function CardFrontSVG({ icon, primaryColor, theme }) {
  const strokeAccent = theme === "dark" ? "#ffffff" : "rgba(255,255,255,0.88)";
  const patternAccent = theme === "dark" ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.22)";
  return (
    <svg viewBox="0 0 130 188" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect width="130" height="188" rx="10" fill={primaryColor} />
      <rect x="6" y="6" width="118" height="176" rx="8" fill="none" stroke={strokeAccent} strokeWidth="1.5" />
      <rect x="14" y="14" width="102" height="160" rx="6" fill="none" stroke={patternAccent} strokeWidth="0.8" />
      <text x="13" y="26" fill="white" fontSize="11" fontWeight="700" fontFamily="sans-serif">{icon}</text>
      <text x="117" y="175" fill="white" fontSize="11" fontWeight="700" fontFamily="sans-serif" transform="rotate(180,117,170)">{icon}</text>
      <polygon points="65,52 90,94 65,136 40,94" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" />
      <polygon points="65,62 82,94 65,126 48,94" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" />
      <circle cx="65" cy="94" r="18" fill={primaryColor} stroke={strokeAccent} strokeWidth="1.5" />
      <text x="65" y="99" fill="white" fontSize="14" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">{icon}</text>
      <line x1="40" y1="35" x2="90" y2="35" stroke="rgba(255,255,255,0.28)" strokeWidth="0.7" />
      <line x1="45" y1="40" x2="85" y2="40" stroke="rgba(255,255,255,0.14)" strokeWidth="0.7" />
      <line x1="40" y1="153" x2="90" y2="153" stroke="rgba(255,255,255,0.28)" strokeWidth="0.7" />
      <line x1="45" y1="148" x2="85" y2="148" stroke="rgba(255,255,255,0.14)" strokeWidth="0.7" />
      <polygon points="65,20 70,26 65,32 60,26" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="0.8" />
      <polygon points="65,156 70,162 65,168 60,162" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="0.8" />
    </svg>
  );
}

function SkillCard({ category, items, cardRef, innerRef, shadowRef, theme, onHover }) {
  const icon = category.charAt(0).toUpperCase();
  const dynamicAccent = theme === "dark" ? "#ff4d00" : "#0055ff";
  return (
    <div
      ref={cardRef}
      style={S.cardContainer}
      onMouseMove={onHover.move}
      onMouseLeave={onHover.leave}
    >
      {/* animated ground shadow — separate layer so it can scale independently */}
      <div ref={shadowRef} style={S.groundShadow} />
      <div ref={innerRef} style={S.cardInner}>
        <div style={{ ...S.cardFront, background: dynamicAccent, borderColor: theme === "dark" ? "#fff" : "rgba(255,255,255,0.88)" }}>
          <CardFrontSVG icon={icon} primaryColor={dynamicAccent} theme={theme} />
        </div>
        <div style={{ ...S.cardBack, border: theme === "dark" ? "2px solid #fff" : "1.5px solid #e5e5e5" }}>
          <div style={S.backHeader}>
            <span style={S.backTitle}>{category}</span>
            <span style={{ ...S.backIcon, color: dynamicAccent }}>✦</span>
          </div>
          <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            {items.map((skill, i) => (
              <div key={i}>
                <p style={S.skillItem}>{skill}</p>
                {i < items.length - 1 && <hr style={S.divider} />}
              </div>
            ))}
          </div>
          <div style={{ ...S.backHeader, transform: "rotate(180deg)", marginTop: 8 }}>
            <span style={{ ...S.backTitle, fontSize: 10 }}>{category}</span>
            <span style={{ ...S.backIcon, fontSize: 13, color: dynamicAccent }}>✦</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SkillMatrixCards({ skillsMatrix, currentStyles, theme }) {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const headlineRef = useRef(null);
  const cardRefs = useRef([]);
  const innerRefs = useRef([]);
  const shadowRefs = useRef([]);
  const revealedRef = useRef(false);   // hover tilt only after the flip

  cardRefs.current = skillsMatrix.map((_, i) => cardRefs.current[i] || null);
  innerRefs.current = skillsMatrix.map((_, i) => innerRefs.current[i] || null);
  shadowRefs.current = skillsMatrix.map((_, i) => shadowRefs.current[i] || null);

  /* Lusion move: the stage owns a bold brand surface, not the page bg */
  const stageBg = theme === "dark" ? "#0c0608" : "#0055ff";
  const headlineColor = theme === "dark" ? "rgba(255,255,255,0.95)" : "#ffffff";

  useEffect(() => {
    const N = skillsMatrix.length;
    const stage = stageRef.current;
    if (!stage) return;

    const ctx = gsap.context(() => {
      const getSpreadX = (i) => {
        const W = stage.offsetWidth;
        const spacing = W < 768 ? Math.min(W / (N + 1), 75) : 275;
        return i * spacing - (spacing * (N - 1)) / 2;
      };
      const getRotationZ = (i) => (i - (N - 1) / 2) * 7;

      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.set(el, { x: (i - (N - 1) / 2) * 3, y: 0, z: i * 2, rotationZ: 0, willChange: "transform", force3D: true });
        gsap.set(innerRefs.current[i], { rotationY: 0, willChange: "transform" });
        gsap.set(shadowRefs.current[i], { opacity: 0.18, scaleX: 0.55, transformOrigin: "50% 50%" });
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=200%",
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => { revealedRef.current = self.progress > 0.75; },
        },
      });

      /* Headline: scales up slightly and dims as the deck takes the stage */
      tl.to(headlineRef.current, { scale: 1.06, opacity: 0.16, yPercent: -10, ease: "none", duration: 1.4 }, 0);

      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        /* Phase 1 — fan out (your geometry, kept) */
        tl.to(el, {
          x: () => getSpreadX(i),
          y: Math.abs(i - (N - 1) / 2) * 8,
          z: 0,
          rotationZ: getRotationZ(i),
          duration: 1,
          ease: "power2.out",
        }, 0);

        /* Shadow grows + deepens as the card travels — sells the studio light */
        tl.to(shadowRefs.current[i], { opacity: 0.5, scaleX: 1, duration: 1, ease: "power2.out" }, 0);

        /* Phase 2 — STAGGERED flip: hand-dealt cascade, left to right */
        tl.to(innerRefs.current[i], {
          rotationY: 180,
          duration: 1,
          ease: "power2.inOut",
        }, 0.45 + i * 0.07);

        /* Shadow tightens at flip — card "settles" */
        tl.to(shadowRefs.current[i], { opacity: 0.35, scaleX: 0.88, duration: 0.5, ease: "power2.out" }, 0.95 + i * 0.07);
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [skillsMatrix, theme]);

  /* Magnetic hover tilt — active only after reveal, transform-only, no re-render */
  const makeHover = (i) => ({
    move: (e) => {
      if (!revealedRef.current) return;
      const el = cardRefs.current[i];
      const r = el.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(innerRefs.current[i], { rotationY: 180 + nx * -10, rotationX: ny * 8, duration: 0.4, ease: "power2.out", overwrite: "auto" });
      gsap.to(el, { scale: 1.04, duration: 0.4, ease: "power2.out", overwrite: "auto" });
    },
    leave: () => {
      if (!revealedRef.current) return;
      gsap.to(innerRefs.current[i], { rotationY: 180, rotationX: 0, duration: 0.6, ease: "power3.out", overwrite: "auto" });
      gsap.to(cardRefs.current[i], { scale: 1, duration: 0.6, ease: "power3.out", overwrite: "auto" });
    },
  });

  return (
    <section ref={sectionRef} style={{ ...S.section,  transition: "background-color 0.4s ease" }}>
      <div style={S.stickyStage} ref={stageRef}>

        {/* Massive Lusion-scale headline BEHIND the deck */}
        <div ref={headlineRef} style={{ position: "absolute", top: "8vh", width: "100%", textAlign: "center", zIndex: 1, pointerEvents: "none" }}>
          <span style={{ ...currentStyles.badge, color: theme === "dark" ? "#ff4d00" : "rgba(255,255,255,0.75)" }}>
            Infrastructure Matrix
          </span>
          <h2 style={{
            fontSize: "clamp(3rem, 8.5vw, 8rem)",
            fontWeight: 900, textTransform: "uppercase",
            margin: 0, letterSpacing: "-2px", lineHeight: 0.92,
            color: headlineColor
          }}>
            Technical<br />Capabilities
          </h2>
        </div>

        {skillsMatrix.map((cluster, i) => (
          <SkillCard
            key={i}
            category={cluster.category}
            items={cluster.items}
            theme={theme}
            onHover={makeHover(i)}
            cardRef={(el) => (cardRefs.current[i] = el)}
            innerRef={(el) => (innerRefs.current[i] = el)}
            shadowRef={(el) => (shadowRefs.current[i] = el)}
          />
        ))}

        {/* <p style={{
          position: "absolute", bottom: "5vh", width: "100%", textAlign: "center",
          color: theme === "dark" ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.55)",
          fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "3px", fontWeight: 700, margin: 0,
        }}>
          Scroll to deal
        </p> */}
      </div>
    </section>
  );
}

const CARD_W = 240;
const CARD_H = 340;

const S = {
  section: { width: "100%", minHeight: "100vh" },
  stickyStage: {
    position: "sticky", top: 0, width: "100%", height: "100vh",
    display: "flex", alignItems: "center", justifyContent: "center",
    perspective: "2000px", perspectiveOrigin: "50% 40%", overflow: "hidden",
  },
  cardContainer: {
    position: "absolute", width: CARD_W, height: CARD_H,
    transformStyle: "preserve-3d", willChange: "transform",
    top: "calc(50% + 60px)", transform: "translateY(-50%)",
    zIndex: 2, cursor: "pointer",
  },
  groundShadow: {
    position: "absolute", left: "6%", right: "6%", bottom: "-7%", height: "9%",
    borderRadius: "50%", background: "rgba(0,0,0,0.55)",
    filter: "blur(12px)", pointerEvents: "none", transform: "translateZ(-1px)",
  },
  cardInner: { position: "relative", width: "100%", height: "100%", transformStyle: "preserve-3d" },
  cardFront: {
    position: "absolute", inset: 0, borderRadius: 20,
    backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", overflow: "hidden",
  },
  cardBack: {
    position: "absolute", inset: 0, borderRadius: 20,
    backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
    transform: "rotateY(180deg)", display: "flex", flexDirection: "column",
    padding: "26px 22px", overflow: "hidden",
    background: "#ffffff", color: "#111827",
  },
  backHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  backTitle: { fontSize: 13, fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase", lineHeight: 1.1 },
  backIcon: { fontSize: 16, fontWeight: 900, lineHeight: 1 },
  skillItem: { fontSize: 13, fontWeight: 700, padding: "10px 0", letterSpacing: "-0.01em", lineHeight: 1.4, margin: 0 },
  divider: { border: "none", borderTop: "1px dashed rgba(0,0,0,0.12)", margin: 0 },
};