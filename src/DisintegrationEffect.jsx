/**
 * DisintegrationEffect.jsx
 *
 * An optimized Thanos-snap LinkedIn profile card intro for portfolios.
 * Explodes instantly from all directions uniformly with maximized particle density.
 */

import { useEffect, useRef, useState, useCallback } from "react";

// ─── Tuneable constants ────────────────────────────────────────────────────────
const MAX_PARTICLES_HIGH  = 25_000;  // Maximized density cap for high-end desktop units
const MAX_PARTICLES_LOW   = 25_000;  // High density safeguard for mobile allocations
const PARTICLE_STEP_HIGH  = 1;       // 1 = Captures every single pixel row & column
const PARTICLE_STEP_LOW   = 2;       // 2 = Dense cross-sampling for mobile devices
const DECAY_BASE          = 0.008;
const DECAY_RAND          = 0.012;

// Omnidirectional kinetic physics config (Symmetric blast layout)
const VELOCITY_SPREAD     = 3.2;     // True multi-directional explosive speed multiplier
const GRAVITY             = 0.008;    // Slightly reduced gravity for a light, suspended drift
const SHIMMER_CHANCE      = 0.045;   // Fraction of gold shimmer particles

// ─── Float32Array field layout (10 floats per particle) ───────────────────────
const FIELDS = 10;
const F_X=0, F_Y=1, F_VX=2, F_VY=3, F_LIFE=4, F_DECAY=5, F_DELAY=6, F_R=7, F_G=8, F_B=9;

// ─── Card geometry painter ────────────────────────────────────────────────────
function paintCard(w, h) {
  const oc = document.createElement("canvas");
  oc.width  = w;
  oc.height = h;
  const c = oc.getContext("2d");

  const BANNER_H   = Math.round(h * 0.21);
  const RADIUS     = 10;

  // Card background
  c.fillStyle = "#1b1f23";
  roundRect(c, 0, 0, w, h, RADIUS);
  c.fill();

  // Banner gradient
  const bannerGrad = c.createLinearGradient(0, 0, w, BANNER_H);
  bannerGrad.addColorStop(0, "#0a66c2");
  bannerGrad.addColorStop(0.5, "#004182");
  bannerGrad.addColorStop(1, "#001b4f");
  c.fillStyle = bannerGrad;
  roundRectTop(c, 0, 0, w, BANNER_H, RADIUS);
  c.fill();

  // Banner subtle diagonal pattern
  c.save();
  c.rect(0, 0, w, BANNER_H);
  c.clip();
  c.strokeStyle = "rgba(255,255,255,0.07)";
  c.lineWidth = 1;
  for (let i = -h; i < w + h; i += 14) {
    c.beginPath(); c.moveTo(i, 0); c.lineTo(i + BANNER_H, BANNER_H); c.stroke();
  }
  c.restore();

  // Avatar circle
  const avCX = Math.round(w * 0.13) + 20;
  const avCY = BANNER_H + Math.round(h * 0.085);
  const avR  = Math.round(w * 0.093);

  // Open-to-work gradient ring
  const ringGrad = c.createLinearGradient(avCX - avR - 3, avCY, avCX + avR + 3, avCY);
  ringGrad.addColorStop(0, "#56d364");
  ringGrad.addColorStop(1, "#0a66c2");
  c.fillStyle = ringGrad;
  c.beginPath(); c.arc(avCX, avCY, avR + 3, 0, Math.PI * 2); c.fill();

  // Avatar border
  c.fillStyle = "#1b1f23";
  c.beginPath(); c.arc(avCX, avCY, avR + 1, 0, Math.PI * 2); c.fill();

  // Avatar fill
  c.fillStyle = "#283037";
  c.beginPath(); c.arc(avCX, avCY, avR - 1, 0, Math.PI * 2); c.fill();

  // Avatar initials
  c.fillStyle = "#e0e8ef";
  c.font = `bold ${Math.round(avR * 0.75)}px Inter, system-ui, sans-serif`;
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.fillText("YN", avCX, avCY);

  // Text rows below avatar
  const textX   = Math.round(w * 0.06);
  const textTop = avCY + avR + Math.round(h * 0.04);
  const lineH   = Math.round(h * 0.048);

  // Name bar
  c.fillStyle = "#e8ecef";
  c.fillRect(textX, textTop, Math.round(w * 0.55), Math.round(lineH * 0.75));

  // Headline bar
  c.fillStyle = "#4a5560";
  c.fillRect(textX, textTop + lineH, Math.round(w * 0.8), Math.round(lineH * 0.5));
  c.fillRect(textX, textTop + lineH * 1.65, Math.round(w * 0.6), Math.round(lineH * 0.5));

  // Stats row
  c.fillStyle = "#1e4976";
  c.fillRect(textX, textTop + lineH * 2.6, Math.round(w * 0.22), Math.round(lineH * 0.45));
  c.fillRect(textX + Math.round(w * 0.26), textTop + lineH * 2.6, Math.round(w * 0.2), Math.round(lineH * 0.45));

  // Divider
  const divY = textTop + lineH * 3.6;
  c.fillStyle = "#243040";
  c.fillRect(textX, divY, w - textX * 2, 1);

  // Skill chips
  const chipY   = divY + Math.round(h * 0.025);
  const chipH   = Math.round(h * 0.038);
  const chipR   = chipH / 2;
  const chips   = [0.16, 0.22, 0.18, 0.15, 0.21];
  let chipCursor = textX;
  for (const cw of chips) {
    const chipW = Math.round(w * cw);
    if (chipCursor + chipW > w - textX) break;
    c.fillStyle = "rgba(112,181,249,0.13)";
    roundRect(c, chipCursor, chipY, chipW, chipH, chipR);
    c.fill();
    c.strokeStyle = "rgba(112,181,249,0.22)";
    c.lineWidth = 0.8;
    c.stroke();
    chipCursor += chipW + 6;
  }

  // Button
  const btnY  = chipY + chipH + Math.round(h * 0.025);
  const btnH  = Math.round(h * 0.058);
  const btnW  = w - textX * 2;
  const btnGrad = c.createLinearGradient(textX, 0, textX + btnW, 0);
  btnGrad.addColorStop(0, "#c8860a");
  btnGrad.addColorStop(0.5, "#d4a017");
  btnGrad.addColorStop(1, "#c8860a");
  c.fillStyle = btnGrad;
  roundRect(c, textX, btnY, btnW, btnH, btnH / 2);
  c.fill();

  return c.getImageData(0, 0, w, h);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function roundRectTop(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function DisintegrationEffect({ onComplete }) {
  const [phase, setPhase]     = useState("card"); 
  const cardRef                = useRef(null);
  const canvasRef              = useRef(null);
  const rafRef                 = useRef(null);
  const bufRef                 = useRef(null);       
  const countRef               = useRef(0);
  const shimmerRef             = useRef(null);       

  const isLowPerf = () =>
    window.innerWidth < 768 ||
    (navigator.hardwareConcurrency != null && navigator.hardwareConcurrency <= 4);

  const startSnap = useCallback(() => {
    if (phase !== "card" || !cardRef.current || !canvasRef.current) return;

    setPhase("snapping");

    const card      = cardRef.current;
    const canvas    = canvasRef.current;
    const ctx       = canvas.getContext("2d");
    const dpr       = window.devicePixelRatio || 1;
    const rect      = card.getBoundingClientRect();
    const cRect     = canvas.getBoundingClientRect();

    canvas.width  = cRect.width  * dpr;
    canvas.height = cRect.height * dpr;
    ctx.scale(dpr, dpr);

    const W = Math.round(rect.width);
    const H = Math.round(rect.height);

    const offX = rect.left - cRect.left;
    const offY = rect.top  - cRect.top;

    const low  = isLowPerf();
    const step = low ? PARTICLE_STEP_LOW : PARTICLE_STEP_HIGH;
    const cap  = low ? MAX_PARTICLES_LOW : MAX_PARTICLES_HIGH;

    const imgData = paintCard(W, H);
    const px      = imgData.data;

    let eligible = 0;
    for (let y = 0; y < H; y += step) {
      for (let x = 0; x < W; x += step) {
        if (px[((y * W) + x) * 4 + 3] > 10) eligible++;
      }
    }

    const total     = Math.min(eligible, cap);
    const keepRatio = total / eligible;

    const buf      = new Float32Array(total * FIELDS);
    const shimmer  = new Uint8Array(total);
    let   count    = 0;

    for (let y = 0; y < H && count < total; y += step) {
      for (let x = 0; x < W && count < total; x += step) {
        const i = ((y * W) + x) * 4;
        if (px[i + 3] <= 10) continue;
        if (Math.random() > keepRatio) continue;

        const base  = count * FIELDS;
        buf[base + F_X]     = offX + x;
        buf[base + F_Y]     = offY + y;

        // FIX: Pure uniform multi-directional explosion vector (Random angle 0 to 2*PI)
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * VELOCITY_SPREAD;
        
        buf[base + F_VX]    = Math.cos(angle) * speed;
        buf[base + F_VY]    = Math.sin(angle) * speed;
        
        buf[base + F_LIFE]  = 1.0;
        buf[base + F_DECAY] = DECAY_BASE + Math.random() * DECAY_RAND;
        
        // FIX: Set delay vector strictly to 0 for instant universal explosion execution
        buf[base + F_DELAY] = 0; 
        
        buf[base + F_R]     = px[i];
        buf[base + F_G]     = px[i + 1];
        buf[base + F_B]     = px[i + 2];
        shimmer[count]      = Math.random() < SHIMMER_CHANCE ? 1 : 0;
        count++;
      }
    }

    bufRef.current     = buf;
    shimmerRef.current = shimmer;
    countRef.current   = count;

    // CRITICAL FIX: Sudden instant removal of DOM card block container visibility
    card.style.display = "none";

    const animate = () => {
      ctx.clearRect(0, 0, cRect.width, cRect.height);

      const b    = bufRef.current;
      const sh   = shimmerRef.current;
      const n    = countRef.current;
      let alive  = false;

      // Ultra high-velocity native unrolled for loop execution pass
      for (let idx = 0; idx < n; idx++) {
        const base = idx * FIELDS;

        const life = b[base + F_LIFE];
        if (life <= 0) continue;
        alive = true;

        // Physics implementation
        b[base + F_VY] += GRAVITY;
        b[base + F_X]  += b[base + F_VX];
        b[base + F_Y]  += b[base + F_VY];
        b[base + F_LIFE] = life - b[base + F_DECAY];

        // Particle size reduction over time
        const currentSize = Math.max(0.4, 1.4 * life);
        const alpha = life * (sh[idx] === 1 ? (0.6 + Math.random() * 0.8) : 1);
        if (alpha <= 0.01) continue;

        if (sh[idx] === 1) {
          const g = 160 + Math.floor(Math.random() * 95);
          ctx.fillStyle = `rgba(${g},${Math.floor(g * 0.75)},30,${alpha.toFixed(3)})`;
        } else {
          ctx.fillStyle = `rgba(${b[base+F_R]|0},${b[base+F_G]|0},${b[base+F_B]|0},${alpha.toFixed(3)})`;
        }

        ctx.fillRect(b[base + F_X], b[base + F_Y], currentSize, currentSize);
      }

      if (alive) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, cRect.width, cRect.height);
        setPhase("done");
        onComplete?.();
      }
    };

    rafRef.current = requestAnimationFrame(animate);
  }, [phase, onComplete]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div style={s.root}>
      <canvas ref={canvasRef} style={s.canvas} />
      <div style={s.vignette} />

      <div
        ref={cardRef}
        style={{
          ...s.card,
          opacity: phase === "snapping" ? 0 : 1,
        }}
      >
        {/* Banner */}
        <div style={s.banner}>
          <div style={s.bannerPattern} />
          <div style={s.avatarRing}>
            <div style={s.avatarInner}>YS</div>
          </div>
        </div>

        {/* Body */}
        <div style={s.body}>
          <div style={s.name}>Yogeshwaran Sarvanan</div>
          <div style={s.headline}>
            Full-Stack Developer
          </div>
          <div style={s.location}>
            Bengaluru, Karnataka, India ·{" "}
            <span style={s.locationLink}>Contact info</span>
          </div>

          <div style={s.stats}>
            {/* <span style={s.stat}><strong style={s.statNum}>2,847</strong> followers</span>
            <span style={s.statDot}>·</span> */}
            <span style={s.stat}><strong style={s.statNum}>500+</strong> connections</span>
          </div>

          <div style={s.mutual}>
            <div style={s.mutualAvatars}>
              {["RK", "AS", "PM"].map((init, i) => (
                <div key={init} style={{ ...s.mutualAvatar, marginLeft: i === 0 ? 0 : -6 }}>
                  {init}
                </div>
              ))}
            </div>
            <span style={s.mutualText}>Rahul K., Anita S. and 14 mutual connections</span>
          </div>

          <div style={s.actions}>
            <button style={s.btnPrimary}>Connect</button>
            <button style={s.btnSecondary}>Message</button>
            {/* <button style={s.btnMore}>· · ·</button> */}
          </div>

          <div style={s.divider} />

          <div style={s.chips}>
            {["Python","React", "Node.js", "API"].map(skill => (
              <span key={skill} style={s.chip}>{skill}</span>
            ))}
          </div>

          <div style={s.divider} />

          <button
            style={s.snapBtn}
            onClick={startSnap}
            disabled={phase === "snapping"}
          >
            Enter Portfolio
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  root: {
    position: "fixed",
    inset: 0,
    backgroundColor: "#0a0c0f",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
    overflow: "hidden",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },
  canvas: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: 20,
  },
  vignette: {
    position: "absolute",
    inset: 0,
    background: "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.72) 100%)",
    pointerEvents: "none",
    zIndex: 5,
  },
  card: {
    position: "relative",
    zIndex: 10,
    width: "100%",
    maxWidth: 540,
    backgroundColor: "#1b1f23",
    borderRadius: 10,
    border: "1px solid #2d3740",
    overflow: "visible",
    boxShadow: "0 28px 56px -12px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.04)",
  },
  banner: {
    height: 120,
    background: "linear-gradient(135deg, #0a66c2 0%, #004182 50%, #001b4f 100%)",
    borderRadius: "10px 10px 0 0",
    position: "relative",
    overflow: "hidden",
  },
  bannerPattern: {
    position: "absolute",
    inset: 0,
    backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.06) 0, rgba(255,255,255,0.06) 1px, transparent 0, transparent 50%)",
    backgroundSize: "12px 12px",
  },
  avatarRing: {
    position: "absolute",
    bottom: 5,
    left: 20,
    width: 96,
    height: 96,
    borderRadius: "50%",
    padding: 3,
    background: "linear-gradient(135deg, #56d364, #0a66c2)",
    zIndex: 2,
  },
  avatarInner: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    backgroundColor: "#283037",
    border: "3px solid #1b1f23",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "1.1rem",
    letterSpacing: "0.04em",
    color: "#e0e8ef",
  },
  body: {
    padding: "18px 20px 20px",
  },
  name: {
    fontSize: "1.15rem",
    fontWeight: 700,
    color: "#e8ecef",
    lineHeight: 1.2,
  },
  headline: {
    fontSize: "0.82rem",
    color: "#b0bcc6",
    marginTop: 4,
    lineHeight: 1.5,
  },
  location: {
    fontSize: "0.76rem",
    color: "#7a8a96",
    marginTop: 6,
  },
  locationLink: {
    color: "#70b5f9",
    cursor: "pointer",
  },
  stats: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    flexWrap: "wrap",
  },
  stat: {
    fontSize: "0.76rem",
    color: "#7a8a96",
  },
  statNum: {
    color: "#70b5f9",
    fontWeight: 600,
  },
  statDot: {
    color: "#3d4d58",
    fontSize: "0.76rem",
  },
  mutual: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    marginTop: 10,
  },
  mutualAvatars: {
    display: "flex",
    flexShrink: 0,
  },
  mutualAvatar: {
    width: 20,
    height: 20,
    borderRadius: "50%",
    backgroundColor: "#374147",
    border: "1.5px solid #1b1f23",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.48rem",
    fontWeight: 700,
    color: "#aeb8c0",
  },
  mutualText: {
    fontSize: "0.72rem",
    color: "#8a96a0",
  },
  actions: {
    display: "flex",
    gap: 8,
    marginTop: 14,
    flexWrap: "wrap",
  },
  btnPrimary: {
    backgroundColor: "#70b5f9",
    color: "#0d1117",
    fontWeight: 700,
    fontSize: "0.84rem",
    padding: "6px 18px",
    borderRadius: 9999,
    border: "none",
    cursor: "pointer",
  },
  btnSecondary: {
    backgroundColor: "transparent",
    color: "#70b5f9",
    fontWeight: 600,
    fontSize: "0.84rem",
    padding: "6px 18px",
    borderRadius: 9999,
    border: "1.5px solid #70b5f9",
    cursor: "pointer",
  },
  btnMore: {
    backgroundColor: "transparent",
    color: "#9199a1",
    fontSize: "0.84rem",
    padding: "6px 12px",
    borderRadius: 9999,
    border: "1.5px solid #38434f",
    cursor: "pointer",
    letterSpacing: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#243040",
    margin: "14px 0",
  },
  chips: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
  },
  chip: {
    fontSize: "0.7rem",
    color: "#8ab4d4",
    backgroundColor: "rgba(112,181,249,0.1)",
    border: "1px solid rgba(112,181,249,0.2)",
    borderRadius: 9999,
    padding: "3px 10px",
  },
  snapBtn: {
    width: "100%",
    background: "linear-gradient(90deg, #b8730a, #d4a017, #b8730a)",
    backgroundSize: "200% 100%",
    color: "#0d0600",
    fontWeight: 800,
    fontSize: "0.9rem",
    padding: "10px",
    borderRadius: 9999,
    border: "none",
    cursor: "pointer",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
};