// HeroCinematic.jsx — the full scroll film (replaces HeroLanding)
//
// Beats (pin = 400% scroll):
//   0–10%   Arrival: zoomed-in cosmos (2.4x), giant name, scroll hint
//   10–25%  Zoom step 1 (2.4→1.6) + name flies to nav corner
//   25–45%  Headline enters from LEFT, parks (readable hold) · zoom step 2 (1.6→1.0)
//   45–65%  Headline exits RIGHT (fast) · EXPERIENCE+stats enter LEFT, park, exit RIGHT
//   65–75%  All text gone · cosmos condenses into a calm, slow, small circle
//   75–95%  BLACK-HOLE DIVE: expo-in acceleration + radial light-bending swirl
//   95–100% Swallowed: flash → black → pin releases into next section
//
// Integration (Portfolio.jsx):
//   - <HeroCinematic theme={theme} />  replaces <HeroLanding/>
//   - nav logo keeps id="navLogo"
//   - nav stays fixed/zIndex 1000 → always clickable (hero overlays are pointerEvents:none)

import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const VERT = `attribute vec2 a_pos; void main(){ gl_Position = vec4(a_pos,0.,1.); }`;

const FRAG = `
precision highp float;
uniform float u_time, u_zoom, u_vel, u_accent, u_condense, u_dive;
uniform vec2 u_res, u_mouse;

vec3 palette(float t){
  vec3 a = vec3(0.02,0.01,0.01);
  vec3 b = mix(vec3(0.35,0.12,0.02), vec3(0.04,0.14,0.40), u_accent);
  vec3 c = vec3(1.0,0.5,0.1);
  vec3 d = vec3(0.0,0.05,0.08);
  return a + b*cos(6.28318*(c*t+d));
}
float noise(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float smoothNoise(vec2 p){
  vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(noise(i),noise(i+vec2(1,0)),f.x), mix(noise(i+vec2(0,1)),noise(i+vec2(1,1)),f.x), f.y);
}
float fbm(vec2 p){
  float v=0.0, amp=0.5, fr=1.0;
  for(int i=0;i<6;i++){ v+=amp*smoothNoise(p*fr); amp*=0.5; fr*=2.1; }
  return v;
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 aspect = vec2(u_res.x/u_res.y, 1.0);
  vec2 center = vec2(0.5)*aspect;
  vec2 pa = uv*aspect;
  vec2 rel = pa - center;
  float rad = length(rel);

  /* ---- base cosmos (with gentle pre-dive swirl) ---- */
  float dive2 = u_dive*u_dive;
  float swirl = dive2 * 4.0 * exp(-rad*2.5);
  float cs = cos(swirl), sn = sin(swirl);
  vec2 relS = mat2(cs,-sn,sn,cs) * rel;
  float suck = 1.0 + dive2*8.0;
  vec2 p = ((center+relS) - center)/max(u_zoom*suck,0.001) + center;

  float t = u_time * mix(0.18, 0.035, u_condense);
  vec2 m = u_mouse*aspect;
  float md = length(uv*aspect - m);
  float mouseWarp = exp(-md*3.5)*(0.35 + u_vel*0.6)*(1.0-u_condense);

  vec2 q = vec2(fbm(p+t), fbm(p+vec2(5.2,1.3)+t));
  vec2 r2 = vec2(fbm(p+4.0*q+vec2(1.7,9.2)+t*0.7+mouseWarp),
                 fbm(p+4.0*q+vec2(8.3,2.8)+t*0.5+mouseWarp));
  float f = fbm(p+4.0*r2+mouseWarp);
  vec3 col = palette(f + 0.3*t) * 1.8;

  float vig = 1.0 - smoothstep(0.3, 1.2, length((uv-0.5)*1.6));
  col *= vig*0.85;

  /* ---- condense to calm disc ---- */
  float maskR = mix(1.6, 0.16, u_condense);
  float edge  = mix(0.8, 0.035, u_condense);
  float mask  = 1.0 - smoothstep(maskR-edge, maskR, rad);
  float rim = smoothstep(maskR, maskR-edge*0.5, rad) * smoothstep(maskR-edge*2.0, maskR-edge*0.5, rad);
  col = col*mask + palette(0.6)*rim*u_condense*1.4;

  /* ---- TUNNEL: fly-through wormhole during the dive ---- */
  float ang = atan(rel.y, rel.x);
  float fwd = u_time*0.4 + dive2*34.0;                 // forward speed accelerates
  vec2 tuv = vec2(ang*0.477 + dive2*2.0,               // walls twist as you fall
                  0.30/(rad+0.05) + fwd);              // 1/r = tube projection
  float walls = fbm(tuv*3.0);
  vec3 tunnel = palette(walls + fwd*0.04) * (0.9 + 0.5/(rad*7.0+0.25));
  float streak = smoothNoise(vec2(ang*9.0, fwd*2.2));  // light streaks racing past
  tunnel += palette(0.72) * streak * 0.8 / (rad*6.0+0.45);
  tunnel *= smoothstep(0.0, 0.10, rad);                // black void dead-center

  col = mix(col, tunnel, smoothstep(0.12, 0.55, u_dive));

  /* ---- swallow ---- */
  col *= 1.0 - smoothstep(0.93, 1.0, u_dive);
  gl_FragColor = vec4(col, 1.0);
}`;

/* segment helper: 0→1 across [a,b] of total progress */
const seg = (p, a, b) => Math.min(Math.max((p - a) / (b - a), 0), 1);

export default function HeroCinematic({ theme = "dark" }) {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const bigNameRef = useRef(null);
  const headlineRef = useRef(null);
  const beat2Ref = useRef(null);
  const hintRef = useRef(null);
  const lineRef = useRef(null);
  const flashRef = useRef(null);

  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const velRef = useRef(0);
  const uni = useRef({ zoom: 2.4, condense: 0, dive: 0 });

  /* ── WebGL ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas.getContext("webgl");
    if (!gl) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    let lx = 0.5, ly = 0.5;
    const onMove = (e) => {
      const x = e.clientX / window.innerWidth, y = 1 - e.clientY / window.innerHeight;
      velRef.current = Math.min(velRef.current + Math.hypot(x - lx, y - ly) * 8, 1.5);
      lx = x; ly = y;
      mouseRef.current = { x, y };
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s));
      return s;
    };
    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog); gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const U = (n) => gl.getUniformLocation(prog, n);
    const u = {
      time: U("u_time"), res: U("u_res"), mouse: U("u_mouse"), zoom: U("u_zoom"),
      vel: U("u_vel"), accent: U("u_accent"), condense: U("u_condense"), dive: U("u_dive"),
    };
    gl.uniform1f(u.zoom, uni.current.zoom);                   // never 0 → no black screen
    gl.uniform1f(u.accent, theme === "dark" ? 0 : 1);

    const start = performance.now();
    let raf;
    const tick = () => {
      velRef.current *= 0.94;
      gl.uniform1f(u.time, (performance.now() - start) / 1000);
      gl.uniform2f(u.res, canvas.width, canvas.height);
      gl.uniform2f(u.mouse, mouseRef.current.x, mouseRef.current.y);
      gl.uniform1f(u.zoom, uni.current.zoom);
      gl.uniform1f(u.vel, velRef.current);
      gl.uniform1f(u.condense, uni.current.condense);
      gl.uniform1f(u.dive, uni.current.dive);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, [theme]);

  /* ── Scroll film ───────────────────────────────────────────────────── */
  useEffect(() => {
    const section = sectionRef.current;
    const bigName = bigNameRef.current;
    const navLogo = document.getElementById("navLogo");
    if (!section || !bigName) return;

    const ctx = gsap.context(() => {
      if (navLogo) gsap.set(navLogo, { opacity: 0 });

      const flight = () => {
        const n = bigName.getBoundingClientRect();
        if (!navLogo) return { x: 0, y: 0, scale: 0.2 };
        const l = navLogo.getBoundingClientRect();
        return { x: l.left - n.left, y: l.top - n.top, scale: l.height / n.height };
      };

      gsap.set(bigName, { transformOrigin: "left top", willChange: "transform" });
      gsap.set(headlineRef.current, { x: "14vw", opacity: 0, willChange: "transform" });
      gsap.set(beat2Ref.current, { x: "14vw", opacity: 0, willChange: "transform" });
      gsap.set(lineRef.current, { scaleY: 0, transformOrigin: "top center" });
      gsap.set(flashRef.current, { opacity: 0 });

      /* timeline duration 1 == 100% of the pin; positions == beat percentages */
      const tl = gsap.timeline({
  defaults: { ease: "none" },
  scrollTrigger: {
    trigger: section,
    start: "top top",
    end: "+=450%",                 // more room = slower everything
    pin: true,
    scrub: 1.2,                    // heavier lag = smoother, weightier
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      const p = self.progress;
      const z1 = seg(p, 0.08, 0.24);
      const z2 = seg(p, 0.46, 0.60);
      uni.current.zoom =
        2.4 - 0.8 * (1 - Math.pow(1 - z1, 2)) - 0.6 * (1 - Math.pow(1 - z2, 2));
      uni.current.condense = seg(p, 0.78, 0.86);
      uni.current.dive = Math.pow(seg(p, 0.86, 0.985), 3);
      gsap.set(lineRef.current, { scaleY: p });
    },
  },
});

tl.to(hintRef.current, { opacity: 0, duration: 0.04 }, 0.08);
tl.to(bigName, {
  x: () => flight().x, y: () => flight().y, scale: () => flight().scale,
  ease: "power1.inOut", duration: 0.16,
}, 0.08);
tl.to(bigName, { opacity: 0, duration: 0.02 }, 0.24);
if (navLogo) tl.to(navLogo, { opacity: 1, duration: 0.02 }, 0.25);

/* headline: enter RIGHT→center (slow), long hold, exit LEFT */
tl.to(headlineRef.current, { x: 0, opacity: 1, ease: "power2.out", duration: 0.09 }, 0.26);
tl.to(headlineRef.current, { x: "-55vw", opacity: 0, ease: "power2.in", duration: 0.10 }, 0.46);

/* beat 2: enters ONLY after headline is fully gone (0.56) — zero overlap */
tl.to(beat2Ref.current, { x: 0, opacity: 1, ease: "power2.out", duration: 0.09 }, 0.58);
tl.to(beat2Ref.current, { x: "-55vw", opacity: 0, ease: "power2.in", duration: 0.09 }, 0.70);

tl.to(flashRef.current, { opacity: 0.9, duration: 0.012, ease: "power3.in" }, 0.985);
tl.to(flashRef.current, { opacity: 0, duration: 0.015 }, 0.997);

      /* Beat 1→2: name flight + hint out (10–25%) */
    }, section);

    return () => {
      const l = document.getElementById("navLogo");
      if (l) gsap.set(l, { opacity: 1 });
      ctx.revert();
    };
  }, []);

  const accent = theme === "dark" ? "#ff4d00" : "#0055ff";
  const noPointer = { pointerEvents: "none" };   // nav stays clickable above everything

  return (
    <main ref={sectionRef} id="hero" style={{
      position: "relative", width: "100%", height: "100vh",
      overflow: "hidden", background: "#000",
    }}>
      <canvas ref={canvasRef} style={{
        position: "absolute", inset: 0, width: "100%", height: "100%", ...noPointer,
      }} />

      {/* Beat 3 — headline (center-left) */}
      <div ref={headlineRef} style={{ position: "absolute", left: "4vw", top: "36%", zIndex: 2, ...noPointer }}>
        <span style={{
          display: "block", marginBottom: "1rem", fontSize: "0.85rem", fontWeight: 700,
          letterSpacing: "3px", textTransform: "uppercase", color: accent,
        }}>Portfolio Protocol // Active</span>
        <h1 style={{ fontSize: "clamp(2.5rem,6vw,6rem)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.95, letterSpacing: "-2px", margin: 0, color: "#fff" }}>
          ENGINEERING THE
        </h1>
        <h1 style={{ fontSize: "clamp(2.5rem,6vw,6rem)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.95, letterSpacing: "-2px", margin: 0, color: accent }}>
          NEXT GENERATION.
        </h1>
      </div>

      {/* Beat 4 — experience + telemetry */}
      <div ref={beat2Ref} style={{ position: "absolute", left: "4vw", top: "34%", zIndex: 2, ...noPointer }}>
        <span style={{
          display: "block", marginBottom: "1rem", fontSize: "0.85rem", fontWeight: 700,
          letterSpacing: "3px", textTransform: "uppercase", color: accent,
        }}>Track Record // Verified</span>
        <h2 style={{ fontSize: "clamp(2rem,5vw,4.5rem)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.95, letterSpacing: "-2px", margin: 0, color: "#fff" }}>
          SENIOR SOFTWARE<br />ENGINEER
        </h2>
        <div style={{ display: "flex", gap: "3rem", marginTop: "2rem", fontFamily: "monospace" }}>
          {[["5+", "YRS BUILDING"], ["42%", "PERF GAINS"], ["500+", "COMMITS / YR"]].map(([n, l]) => (
            <div key={l}>
              <div style={{ fontSize: "clamp(1.4rem,2.6vw,2.4rem)", fontWeight: 900, color: accent }}>{n}</div>
              <div style={{ fontSize: "0.7rem", letterSpacing: "2px", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Beat 1 — giant name */}
      <div ref={bigNameRef} style={{
        position: "absolute", left: "2vw", bottom: "2vh", zIndex: 3,
        fontSize: "clamp(3.5rem,12.5vw,13rem)", fontWeight: 900, letterSpacing: "-0.04em",
        lineHeight: 0.85, color: "#fff", textTransform: "uppercase", whiteSpace: "nowrap", ...noPointer,
      }}>
        YOGESHWARAN
      </div>

      <div ref={hintRef} style={{
        position: "absolute", right: "4vw", bottom: "3vh", zIndex: 3,
        fontSize: "0.8rem", fontWeight: 700, letterSpacing: "3px",
        textTransform: "uppercase", color: "rgba(255,255,255,0.55)", ...noPointer,
      }}>
        Scroll to explore
      </div>

      {/* scroll progress line — right edge */}
      <div style={{ position: "absolute", right: "1.2vw", top: "15vh", bottom: "15vh", width: 2, background: "rgba(255,255,255,0.08)", zIndex: 3, ...noPointer }}>
        <div ref={lineRef} style={{ width: "100%", height: "100%", background: accent }} />
      </div>

      {/* swallow flash */}
      <div ref={flashRef} style={{ position: "absolute", inset: 0, background: "#fff", zIndex: 4, ...noPointer }} />
    </main>
  );
}