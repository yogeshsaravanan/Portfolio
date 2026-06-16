/**
 * DisintegrationEffect.jsx · v2
 *
 * Landing intro: a polished LinkedIn-style profile card. On "Enter Portfolio"
 * (or automatically after 3s), the card disintegrates Thanos-snap style into
 * ~8,000 depth-cued particles that drift up and dissolve into a COSMOS starfield,
 * which holds as the background and hands off to the portfolio (onComplete).
 *
 * PERFORMANCE: 2D canvas, ≤8k particles, depth cues for fake-3D, NO per-particle
 * string building (batched fillStyle + globalAlpha), DPR capped. Smooth on mobile.
 *
 * AUTO-SNAP: fires 3s after mount if the user hasn't clicked, so every visitor
 * sees the effect. During those 3s we preload so the hand-off is instant.
 */

import { useEffect, useRef, useState, useCallback } from "react";

// ─── Tuneables ────────────────────────────────────────────────────────────────
const MAX_PARTICLES   = 25000;        // hard cap (was 25k — far lighter, still dense)
const MAX_PARTICLES_LOW = 7500;      // mobile / low-core cap
const DECAY_BASE      = 0.006;
const DECAY_RAND      = 0.010;
const VELOCITY_SPREAD = 3.0;
const GRAVITY         = -0.010;      // negative → particles drift UP (snap rises)
const DEPTH_RANGE     = 1.8;         // z spread for fake-3D scaling
const SHIMMER_CHANCE  = 0.05;
const AUTO_SNAP_MS    = 5000;        // auto-snap after 3s of no interaction
const COSMOS_STARS    = 220;         // starfield that forms as particles fade

// Float32 layout (12 floats/particle): x,y,vx,vy,z,vz,life,decay,r,g,b,sz
const F = 12;
const X=0,Y=1,VX=2,VY=3,Z=4,VZ=5,LIFE=6,DECAY=7,R=8,G=9,B=10,SZ=11;

// ─── Card painter (offscreen, sampled into particles) ──────────────────────────
function paintCard(w, h) {
  const oc = document.createElement("canvas");
  oc.width = w; oc.height = h;
  const c = oc.getContext("2d");
  const BANNER_H = Math.round(h * 0.30);
  const RADIUS = 12;

  c.fillStyle = "#1b1f23";
  roundRect(c, 0, 0, w, h, RADIUS); c.fill();

  // banner gradient
  const bg = c.createLinearGradient(0, 0, w, BANNER_H);
  bg.addColorStop(0, "#0a66c2"); bg.addColorStop(0.5, "#004182"); bg.addColorStop(1, "#001b4f");
  c.fillStyle = bg;
  roundRectTop(c, 0, 0, w, BANNER_H, RADIUS); c.fill();

  // banner diagonal sheen
  c.save(); c.rect(0, 0, w, BANNER_H); c.clip();
  c.strokeStyle = "rgba(255,255,255,0.06)"; c.lineWidth = 1;
  for (let i = -h; i < w + h; i += 14) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i + BANNER_H, BANNER_H); c.stroke(); }
  c.restore();

  // avatar
  const avCX = Math.round(w * 0.16), avCY = BANNER_H + Math.round(h * 0.02), avR = Math.round(w * 0.10);
  const ring = c.createLinearGradient(avCX - avR, avCY, avCX + avR, avCY);
  ring.addColorStop(0, "#56d364"); ring.addColorStop(1, "#0a66c2");
  c.fillStyle = ring; c.beginPath(); c.arc(avCX, avCY, avR + 4, 0, 7); c.fill();
  c.fillStyle = "#1b1f23"; c.beginPath(); c.arc(avCX, avCY, avR + 1, 0, 7); c.fill();
  c.fillStyle = "#283037"; c.beginPath(); c.arc(avCX, avCY, avR - 1, 0, 7); c.fill();
  c.fillStyle = "#e0e8ef"; c.font = `bold ${Math.round(avR * 0.8)}px Inter, sans-serif`;
  c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("YS", avCX, avCY);

  const tx = Math.round(w * 0.06), top = avCY + avR + Math.round(h * 0.03), lh = Math.round(h * 0.05);
  c.textAlign = "left";
  // name
  c.fillStyle = "#e8ecef"; c.font = `700 ${Math.round(h*0.038)}px Inter, sans-serif`;
  c.fillText("Yogeshwaran Saravanan", tx, top);
  // headline
  c.fillStyle = "#b0bcc6"; c.font = `${Math.round(h*0.026)}px Inter, sans-serif`;
  c.fillText("Full-Stack Developer · Real-Time Systems", tx, top + lh);
  // location
  c.fillStyle = "#7a8a96"; c.font = `${Math.round(h*0.022)}px Inter, sans-serif`;
  c.fillText("Bengaluru, Karnataka, India", tx, top + lh * 1.7);
  // connections
  c.fillStyle = "#70b5f9"; c.font = `600 ${Math.round(h*0.022)}px Inter, sans-serif`;
  c.fillText("500+ connections", tx, top + lh * 2.5);

  // button
  const btnY = top + lh * 3.2, btnH = Math.round(h * 0.06), btnW = w - tx * 2;
  const btn = c.createLinearGradient(tx, 0, tx + btnW, 0);
  btn.addColorStop(0, "#c8860a"); btn.addColorStop(0.5, "#d4a017"); btn.addColorStop(1, "#c8860a");
  c.fillStyle = btn; roundRect(c, tx, btnY, btnW, btnH, btnH / 2); c.fill();

  return c.getImageData(0, 0, w, h);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
}
function roundRectTop(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
}

export default function DisintegrationEffect({ onComplete }) {
  const [phase, setPhase] = useState("card");
  const cardRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const bufRef = useRef(null);
  const shimmerRef = useRef(null);
  const countRef = useRef(0);
  const starsRef = useRef(null);
  const autoTimerRef = useRef(null);

  const isLow = () => window.innerWidth < 768 || (navigator.hardwareConcurrency || 8) <= 4;

  const startSnap = useCallback(() => {
    if (phase !== "card" || !cardRef.current || !canvasRef.current) return;
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    setPhase("snapping");

    const card = cardRef.current, canvas = canvasRef.current, ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const rect = card.getBoundingClientRect(), cRect = canvas.getBoundingClientRect();
    canvas.width = cRect.width * dpr; canvas.height = cRect.height * dpr;
    ctx.scale(dpr, dpr);

    const W = Math.round(rect.width), H = Math.round(rect.height);
    const offX = rect.left - cRect.left, offY = rect.top - cRect.top;
    const cap = isLow() ? MAX_PARTICLES_LOW : MAX_PARTICLES;

    const img = paintCard(W, H).data;

    // choose a step that yields ≤ cap particles
    let eligible = 0;
    for (let i = 3; i < img.length; i += 4) if (img[i] > 10) eligible++;
    const step = Math.max(1, Math.ceil(Math.sqrt(eligible / cap)));

    const buf = new Float32Array(cap * F);
    const shimmer = new Uint8Array(cap);
    let count = 0;
    for (let y = 0; y < H && count < cap; y += step) {
      for (let x = 0; x < W && count < cap; x += step) {
        const i = (y * W + x) * 4;
        if (img[i + 3] <= 10) continue;
        const b = count * F;
        buf[b+X] = offX + x; buf[b+Y] = offY + y;
        const ang = Math.random() * 6.2832, spd = Math.random() * VELOCITY_SPREAD;
        buf[b+VX] = Math.cos(ang) * spd;
        buf[b+VY] = Math.sin(ang) * spd - 0.6;        // bias slightly upward
        buf[b+Z]  = (Math.random() - 0.5) * DEPTH_RANGE;   // fake depth
        buf[b+VZ] = (Math.random() - 0.5) * 0.04;
        buf[b+LIFE] = 1; buf[b+DECAY] = DECAY_BASE + Math.random() * DECAY_RAND;
        buf[b+R] = img[i]; buf[b+G] = img[i+1]; buf[b+B] = img[i+2];
        buf[b+SZ] = 1 + Math.random() * 0.6;
        shimmer[count] = Math.random() < SHIMMER_CHANCE ? 1 : 0;
        count++;
      }
    }
    bufRef.current = buf; shimmerRef.current = shimmer; countRef.current = count;

    // pre-build the cosmos starfield (forms as particles fade)
    const stars = new Float32Array(COSMOS_STARS * 4); // x,y,baseAlpha,twinklePhase
    for (let i = 0; i < COSMOS_STARS; i++) {
      stars[i*4]   = Math.random() * cRect.width;
      stars[i*4+1] = Math.random() * cRect.height;
      stars[i*4+2] = 0.3 + Math.random() * 0.7;
      stars[i*4+3] = Math.random() * 6.28;
    }
    starsRef.current = stars;

    card.style.display = "none";

    const cx = cRect.width / 2, cy = cRect.height / 2;
    let t0 = performance.now();
    let cosmosAlpha = 0;

    const animate = (now) => {
      const dt = Math.min((now - t0) / 16.67, 2); t0 = now;
      ctx.clearRect(0, 0, cRect.width, cRect.height);

      // cosmos fades in as the snap progresses
      cosmosAlpha = Math.min(cosmosAlpha + 0.006 * dt, 1);
      if (cosmosAlpha > 0.01) {
        // soft nebula wash
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, cRect.width * 0.7);
        grad.addColorStop(0, `rgba(40,18,10,${(0.5*cosmosAlpha).toFixed(2)})`);
        grad.addColorStop(1, `rgba(5,4,8,${cosmosAlpha.toFixed(2)})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, cRect.width, cRect.height);
        // stars
        const stars = starsRef.current;
        for (let i = 0; i < COSMOS_STARS; i++) {
          const tw = 0.5 + 0.5 * Math.sin(now * 0.002 + stars[i*4+3]);
          ctx.globalAlpha = stars[i*4+2] * tw * cosmosAlpha;
          ctx.fillStyle = "#fff";
          const sz = stars[i*4+2] * 1.6;
          ctx.fillRect(stars[i*4], stars[i*4+1], sz, sz);
        }
        ctx.globalAlpha = 1;
      }

      const b = bufRef.current, sh = shimmerRef.current, n = countRef.current;
      let alive = false;

      // PASS 1: normal particles (batched — no per-particle string building)
      // We bucket alpha into the globalAlpha and draw; color set via fillStyle
      // only when it changes is overkill, so we accept per-particle fillStyle but
      // avoid toFixed/template churn by using integer rgb + globalAlpha.
      for (let idx = 0; idx < n; idx++) {
        const base = idx * F;
        const life = b[base+LIFE];
        if (life <= 0) continue;
        alive = true;
        // physics
        b[base+VY] += GRAVITY * dt;
        b[base+X]  += b[base+VX] * dt;
        b[base+Y]  += b[base+VY] * dt;
        b[base+Z]  += b[base+VZ] * dt;
        b[base+LIFE] = life - b[base+DECAY] * dt;

        // fake-3D: depth scales size + alpha (nearer = bigger/brighter)
        const depthScale = 1 + b[base+Z] * 0.4;
        const size = Math.max(0.4, b[base+SZ] * life * depthScale);
        let alpha = life * (0.6 + 0.4 * depthScale);
        if (alpha <= 0.02) continue;
        if (alpha > 1) alpha = 1;

        ctx.globalAlpha = alpha;
        if (sh[idx]) {
          const g = 180 + ((idx * 37) % 70);
          ctx.fillStyle = `rgb(${g},${(g*0.72)|0},30)`;
        } else {
          ctx.fillStyle = `rgb(${b[base+R]|0},${b[base+G]|0},${b[base+B]|0})`;
        }
        ctx.fillRect(b[base+X], b[base+Y], size, size);
      }
      ctx.globalAlpha = 1;

      if (alive || cosmosAlpha < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        // hold the cosmos briefly, fade the dark overlay out, THEN hand off —
        // so it dissolves into the (dark) portfolio instead of cutting to white
        if (!canvas.dataset.fading) {
          canvas.dataset.fading = "1";
          setTimeout(() => {
            const root = canvas.parentElement;
            if (root) { root.style.transition = "opacity 0.6s ease"; root.style.opacity = "0"; }
            setTimeout(() => { setPhase("done"); onComplete?.(); }, 600);
          }, 400);
        }
        rafRef.current = requestAnimationFrame(animate);   // keep drawing during hold+fade
      }
    };
    rafRef.current = requestAnimationFrame(animate);
  }, [phase, onComplete]);

  // auto-snap after 3s if user hasn't clicked
  useEffect(() => {
    autoTimerRef.current = setTimeout(() => { startSnap(); }, AUTO_SNAP_MS);
    return () => { if (autoTimerRef.current) clearTimeout(autoTimerRef.current); };
  }, [startSnap]);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  if (phase === "done") return null;

  return (
    <div style={s.root}>
      <canvas ref={canvasRef} style={s.canvas} />
      <div style={s.vignette} />

      <div ref={cardRef} style={{ ...s.card, opacity: phase === "snapping" ? 0 : 1, transition: "opacity 0.15s" }}>
        <div style={s.banner}>
          <div style={s.bannerPattern} />
          <div style={s.avatarRing}><div style={s.avatarInner}>YS</div></div>
        </div>
        <div style={s.body}>
          <div style={s.name}>Yogeshwaran Saravanan <span style={s.verified}>✓</span></div>
          <div style={s.headline}>Full-Stack Developer · Real-Time Systems</div>
          <div style={s.location}>Bengaluru, Karnataka, India · <span style={s.locationLink}>Contact info</span></div>
          <div style={s.stats}><span style={s.stat}><strong style={s.statNum}>500+</strong> connections</span></div>
          <div style={s.mutual}>
            <div style={s.mutualAvatars}>
              {["RK","AS","PM"].map((init,i) => (<div key={init} style={{...s.mutualAvatar, marginLeft: i===0?0:-6}}>{init}</div>))}
            </div>
            <span style={s.mutualText}>Rahul K., Anita S. and 14 mutual connections</span>
          </div>
          <div style={s.actions}>
            <button style={s.btnPrimary}>Connect</button>
            <button style={s.btnSecondary}>Message</button>
          </div>
          <div style={s.divider} />
          <div style={s.chips}>{["Python","React","Flask","WebSockets"].map(k => (<span key={k} style={s.chip}>{k}</span>))}</div>
          <div style={s.divider} />
          <button style={s.snapBtn} onClick={startSnap} disabled={phase === "snapping"}>Enter Portfolio</button>
          <div style={s.hint}>Auto-entering in a moment…</div>
        </div>
      </div>
    </div>
  );
}

const s = {
  root: { position: "fixed", inset: 0, backgroundColor: "#0a0c0f", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", overflow: "hidden", fontFamily: "'Inter', system-ui, sans-serif", zIndex: 9999 },
  canvas: { position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 20 },
  vignette: { position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.72) 100%)", pointerEvents: "none", zIndex: 5 },
  card: { position: "relative", zIndex: 10, width: "100%", maxWidth: 540, backgroundColor: "#1b1f23", borderRadius: 12, border: "1px solid #2d3740", overflow: "hidden", boxShadow: "0 28px 56px -12px rgba(0,0,0,0.9)" },
  banner: { height: 130, background: "linear-gradient(135deg, #0a66c2 0%, #004182 50%, #001b4f 100%)", borderRadius: "12px 12px 0 0", position: "relative", overflow: "hidden" },
  bannerPattern: { position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.06) 0, rgba(255,255,255,0.06) 1px, transparent 0, transparent 50%)", backgroundSize: "12px 12px" },
  avatarRing: { position: "absolute", bottom: -36, left: 24, width: 104, height: 104, borderRadius: "50%", padding: 3, background: "linear-gradient(135deg, #56d364, #0a66c2)", zIndex: 2 },
  avatarInner: { width: "100%", height: "100%", borderRadius: "50%", backgroundColor: "#283037", border: "3px solid #1b1f23", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "1.5rem", letterSpacing: "0.04em", color: "#e0e8ef" },
  body: { padding: "48px 22px 22px" },
  name: { fontSize: "1.3rem", fontWeight: 700, color: "#e8ecef", lineHeight: 1.2, display: "flex", alignItems: "center", gap: 6 },
  verified: { display: "inline-flex", alignItems: "center", justifyContent: "center", width: 18, height: 18, borderRadius: "50%", background: "#70b5f9", color: "#0d1117", fontSize: "0.7rem", fontWeight: 900 },
  headline: { fontSize: "0.9rem", color: "#b0bcc6", marginTop: 5, lineHeight: 1.5 },
  location: { fontSize: "0.8rem", color: "#7a8a96", marginTop: 6 },
  locationLink: { color: "#70b5f9", cursor: "pointer" },
  stats: { display: "flex", alignItems: "center", gap: 6, marginTop: 10 },
  stat: { fontSize: "0.8rem", color: "#7a8a96" },
  statNum: { color: "#70b5f9", fontWeight: 600 },
  mutual: { display: "flex", alignItems: "center", gap: 7, marginTop: 10 },
  mutualAvatars: { display: "flex", flexShrink: 0 },
  mutualAvatar: { width: 22, height: 22, borderRadius: "50%", backgroundColor: "#374147", border: "1.5px solid #1b1f23", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.5rem", fontWeight: 700, color: "#aeb8c0" },
  mutualText: { fontSize: "0.74rem", color: "#8a96a0" },
  actions: { display: "flex", gap: 8, marginTop: 16 },
  btnPrimary: { backgroundColor: "#70b5f9", color: "#0d1117", fontWeight: 700, fontSize: "0.86rem", padding: "7px 20px", borderRadius: 9999, border: "none", cursor: "pointer" },
  btnSecondary: { backgroundColor: "transparent", color: "#70b5f9", fontWeight: 600, fontSize: "0.86rem", padding: "7px 20px", borderRadius: 9999, border: "1.5px solid #70b5f9", cursor: "pointer" },
  divider: { height: 1, backgroundColor: "#243040", margin: "16px 0" },
  chips: { display: "flex", gap: 6, flexWrap: "wrap" },
  chip: { fontSize: "0.72rem", color: "#8ab4d4", backgroundColor: "rgba(112,181,249,0.1)", border: "1px solid rgba(112,181,249,0.2)", borderRadius: 9999, padding: "4px 11px" },
  snapBtn: { width: "100%", background: "linear-gradient(90deg, #b8730a, #d4a017, #b8730a)", color: "#0d0600", fontWeight: 800, fontSize: "0.92rem", padding: "12px", borderRadius: 9999, border: "none", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase" },
  hint: { textAlign: "center", fontSize: "0.7rem", color: "#5a6670", marginTop: 10, letterSpacing: "0.05em" },
};