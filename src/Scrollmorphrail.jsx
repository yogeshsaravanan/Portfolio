/**
 * ScrollMorphIcon.jsx · v5.1 (Fixed DPR Scope)
 */

import { useEffect, useRef } from "react";

const ICON = 130;
const EDGE_PARTICLES = 45;
const STAGES = 6;

const BASE = (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.BASE_URL) || "/";
const stageUrl = (n) => `${BASE}/morph/STAGE${n}.png`;

const THEME = {
  dark:  { accent: "rgba(255,80,0,", star: "rgba(255,255,255," },
  light: { accent: "rgba(0,85,255,", star: "rgba(100,140,220," },
};

const smooth = (t) => t * t * (3 - 2 * t);

export default function ScrollMorphIcon({ theme = "dark", startId = "skills" }) {
  const canvasRef = useRef(null);
  const imgsRef = useRef([]);
  const maskRef = useRef(null);
  const readyRef = useRef(false);
  const rafRef = useRef(null);
  const progRef = useRef(0);
  const visibleRef = useRef(0);
  const lastStageRef = useRef(0);
  const burstRef = useRef(0);
  const particlesRef = useRef([]);
  const pal = THEME[theme] || THEME.dark;

  useEffect(() => {
    if (theme !== "dark") return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    // Declared inside the effect securely
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    
    canvas.width = ICON * dpr; 
    canvas.height = ICON * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let cancelled = false;

    const mask = document.createElement("canvas");
    mask.width = ICON; 
    mask.height = ICON;
    const mctx = mask.getContext("2d");
    const grad = mctx.createRadialGradient(ICON / 2, ICON / 2, ICON * 0.15, ICON / 2, ICON / 2, ICON * 0.48);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.75, "rgba(255,255,255,0.9)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    mctx.fillStyle = grad;
    mctx.fillRect(0, 0, ICON, ICON);
    maskRef.current = mask;

    const buf = document.createElement("canvas");
    buf.width = ICON; buf.height = ICON;
    const bctx = buf.getContext("2d");

    Promise.all(
      Array.from({ length: STAGES }, (_, i) =>
        new Promise((res) => {
          const img = new Image();
          img.onload = () => res(img);
          img.onerror = () => res(null);
          img.src = stageUrl(i + 1);
        })
      )
    ).then((imgs) => { 
      if (!cancelled) { 
        imgsRef.current = imgs; 
        readyRef.current = true; 
      } 
    });

    particlesRef.current = Array.from({ length: EDGE_PARTICLES }, () => ({
      x: 0.5 + (Math.random() - 0.5) * 0.7, 
      y: 0.5 + (Math.random() - 0.5) * 0.7,
      vx: (Math.random() - 0.5) * 0.002, 
      vy: (Math.random() - 0.5) * 0.002,
      seed: Math.random() * 6.28,
    }));

    const computeProgress = () => {
      const startEl = document.getElementById(startId);
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const startY = startEl ? (startEl.getBoundingClientRect().top + window.scrollY) : window.innerHeight;
      const y = window.scrollY;
      
      if (y < startY - window.innerHeight * 0.3) {
        visibleRef.current = Math.max(visibleRef.current - 0.05, 0);
        return;
      }
      visibleRef.current = Math.min(visibleRef.current + 0.05, 1);
      const span = Math.max(docH - startY, 1);
      progRef.current = Math.min(Math.max((y - startY) / span, 0), 1);
    };

    window.addEventListener("scroll", computeProgress, { passive: true });
    window.addEventListener("resize", computeProgress, { passive: true });
    computeProgress();

    const tick = () => {
      rafRef.current = requestAnimationFrame(tick);
      
      ctx.clearRect(0, 0, ICON * dpr, ICON * dpr);
      if (!readyRef.current || visibleRef.current <= 0.001) return;

      const vis = visibleRef.current;
      const p = progRef.current;
      const fStage = p * (STAGES - 1);
      const s0 = Math.min(Math.floor(fStage), STAGES - 2);
      const s1 = s0 + 1;
      const blendRaw = fStage - s0;
      const blend = smooth(blendRaw);

      const nearest = Math.round(fStage);
      if (nearest !== lastStageRef.current) { 
        burstRef.current = 1; 
        lastStageRef.current = nearest; 
      }
      burstRef.current = Math.max(burstRef.current - 0.02, 0);
      const energy = Math.max(burstRef.current, 1 - Math.abs(blendRaw - 0.5) * 2) * 0.5;

      const imgs = imgsRef.current;

      bctx.clearRect(0, 0, ICON, ICON);
      bctx.globalCompositeOperation = "source-over";
      
      const drawImg = (img, alpha) => {
        if (!img || alpha <= 0.01) return;
        const r = Math.min(ICON / img.width, ICON / img.height) * 0.75;
        const w = img.width * r, h = img.height * r;
        bctx.globalAlpha = alpha;
        bctx.drawImage(img, (ICON - w) / 2, (ICON - h) / 2, w, h);
      };

      drawImg(imgs[s0], 1 - blend);
      drawImg(imgs[s1], blend);

      const now = performance.now();
      const parts = particlesRef.current;
      bctx.globalCompositeOperation = "screen";
      
      for (let i = 0; i < parts.length; i++) {
        const pt = parts[i];
        pt.x += pt.vx; pt.y += pt.vy;
        
        if (pt.x < 0.1 || pt.x > 0.9) pt.vx *= -1;
        if (pt.y < 0.1 || pt.y > 0.9) pt.vy *= -1;
        
        const tw = 0.4 + 0.6 * Math.sin(now * 0.0025 + pt.seed);
        const a = (0.12 + energy * 0.4) * tw;
        
        bctx.globalAlpha = a;
        bctx.fillStyle = i % 3 === 0 ? pal.accent + "1)" : pal.star + "1)";
        const sz = 1.2 + energy * 1.2;
        bctx.fillRect(pt.x * ICON, pt.y * ICON, sz, sz);
      }
      
      bctx.globalAlpha = 1;
      bctx.globalCompositeOperation = "destination-in";
      bctx.drawImage(maskRef.current, 0, 0);
      
      bctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = vis;
      ctx.drawImage(buf, 0, 0);
      ctx.globalAlpha = 1;
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("scroll", computeProgress);
      window.removeEventListener("resize", computeProgress);
    };
  }, [theme, startId, pal]); // Removed dpr from dependencies

  if (theme !== "dark") return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "fixed",
        top: "50%",
        right: "32px",
        transform: "translateY(-50%)",
        width: `${ICON}px`,
        height: `${ICON}px`,
        pointerEvents: "none",
        zIndex: 999,
      }}
    />
  );
}