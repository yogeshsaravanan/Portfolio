// HeroLanding.jsx — Lusion homepage choreography
//
// Scroll story (pinned, scrubbed):
//   0%   : fluid zoomed IN (2.4x) · giant "YOGESHWARAN" fills bottom · "scroll to explore"
//   0→70%: fluid zooms OUT to 1.0 (camera pull-back) · name shrinks + flies to nav corner
//   40→100%: "ENGINEERING THE NEXT GENERATION." rises into the vacated space
//   ~90% : giant name fades out, real nav logo fades in (seamless handoff)
//
// Integration in Portfolio.jsx:
//   1. DELETE the entire shader useEffect, canvasRef, mouseRef, zoomRef, velRef
//      and the whole <main id="hero"> block.
//   2. Add id="navLogo" to your nav logo div:
//        <div id="navLogo" style={currentStyles.logo}>YOGESHWARAN <br/>SARAVANAN</div>
//   3. Render <HeroLanding theme={theme} /> where the old <main> was.
//
// gsap + ScrollTrigger required (already installed).

import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FRAG = `
precision highp float;
uniform float u_time;
uniform vec2 u_res;
uniform vec2 u_mouse;
uniform float u_zoom;
uniform float u_vel;

vec3 palette(float t, float accentMode) {
  vec3 a = vec3(0.02, 0.01, 0.01);
  vec3 b = mix(vec3(0.35,0.12,0.02), vec3(0.04,0.14,0.40), accentMode); // orange / blue
  vec3 c = vec3(1.0, 0.5, 0.1);
  vec3 d = vec3(0.0, 0.05, 0.08);
  return a + b * cos(6.28318 * (c * t + d));
}
uniform float u_accent;

float noise(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float smoothNoise(vec2 p){
  vec2 i = floor(p); vec2 f = fract(p);
  f = f*f*(3.0-2.0*f);
  float a = noise(i), b = noise(i+vec2(1.,0.)), c = noise(i+vec2(0.,1.)), d = noise(i+vec2(1.,1.));
  return mix(mix(a,b,f.x), mix(c,d,f.x), f.y);
}
float fbm(vec2 p){
  float v=0.0, amp=0.5, freq=1.0;
  for(int i=0;i<6;i++){ v += amp*smoothNoise(p*freq); amp*=0.5; freq*=2.1; }
  return v;
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 aspect = vec2(u_res.x/u_res.y, 1.0);

  // zoom centered on screen center (stable during scroll pull-back),
  // mouse only warps the fluid — it does NOT move the zoom anchor,
  // so the camera never jumps.
  vec2 center = vec2(0.5) * aspect;
  vec2 p = uv * aspect;
  p = (p - center) / max(u_zoom, 0.001) + center;   // never divide by zero

  vec2 m = u_mouse * aspect;
  float md = length(uv * aspect - m);
  float mouseWarp = exp(-md * 3.5) * (0.35 + u_vel * 0.6);

  float t = u_time * 0.18;
  vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2,1.3) + t));
  vec2 r = vec2(
    fbm(p + 4.0*q + vec2(1.7,9.2) + t*0.7 + mouseWarp),
    fbm(p + 4.0*q + vec2(8.3,2.8) + t*0.5 + mouseWarp)
  );
  float f = fbm(p + 4.0*r + mouseWarp);

  vec3 col = palette(f + 0.3*t, u_accent) * 1.8;

  float vig = 1.0 - smoothstep(0.3, 1.2, length((uv-0.5)*1.6));
  col *= vig * 0.85;

  gl_FragColor = vec4(col, 1.0);
}`;

const VERT = `attribute vec2 a_pos; void main(){ gl_Position = vec4(a_pos,0.,1.); }`;

export default function HeroLanding({ theme = "dark" }) {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const bigNameRef = useRef(null);
  const headlineRef = useRef(null);
  const badgeRef = useRef(null);
  const hintRef = useRef(null);

  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const velRef = useRef(0);
  const zoomRef = useRef({ current: 2.4, scrollTarget: 2.4, dive: 0 });

  /* ── WebGL fluid ─────────────────────────────────────────────────── */
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

    let lastX = 0.5, lastY = 0.5;
    const onMove = (e) => {
      const x = e.clientX / window.innerWidth;
      const y = 1.0 - e.clientY / window.innerHeight;
      velRef.current = Math.min(velRef.current + Math.hypot(x - lastX, y - lastY) * 8, 1.5);
      lastX = x; lastY = y;
      mouseRef.current = { x, y };
    };
    const pressIn = () => { zoomRef.current.dive = 0.8; };
    const pressOut = () => { zoomRef.current.dive = 0; };
    window.addEventListener("mousemove", onMove, { passive: true });
    canvas.addEventListener("pointerdown", pressIn);
    window.addEventListener("pointerup", pressOut);

    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
        console.error(gl.getShaderInfoLog(s));   // surfaces shader bugs instead of silent black
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
    const uTime = U("u_time"), uRes = U("u_res"), uMouse = U("u_mouse"),
          uZoom = U("u_zoom"), uVel = U("u_vel"), uAccent = U("u_accent");

    gl.uniform1f(uZoom, zoomRef.current.current);          // ← black-screen fix: never 0
    gl.uniform1f(uAccent, theme === "dark" ? 0.0 : 1.0);   // orange vs blue fluid

    const start = performance.now();
    let raf;
    const tick = () => {
      const z = zoomRef.current;
      const target = z.scrollTarget + z.dive;              // scroll camera + press dive
      z.current += (target - z.current) * 0.06;
      velRef.current *= 0.94;

      gl.uniform1f(uTime, (performance.now() - start) / 1000);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uMouse, mouseRef.current.x, mouseRef.current.y);
      gl.uniform1f(uZoom, z.current);
      gl.uniform1f(uVel, velRef.current);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("pointerup", pressOut);
      canvas.removeEventListener("pointerdown", pressIn);
    };
  }, [theme]);

  /* ── Scroll choreography ─────────────────────────────────────────── */
  useEffect(() => {
    const section = sectionRef.current;
    const bigName = bigNameRef.current;
    const navLogo = document.getElementById("navLogo");
    if (!section || !bigName) return;

    const ctx = gsap.context(() => {
      if (navLogo) gsap.set(navLogo, { opacity: 0 });   // hero name owns the brand at start

      /* function-based getters so resize/refresh recomputes the flight path */
      const flight = () => {
        const nameR = bigName.getBoundingClientRect();
        if (!navLogo) return { x: 0, y: 0, scale: 0.2 };
        const logoR = navLogo.getBoundingClientRect();
        return {
          x: logoR.left - nameR.left,
          y: logoR.top - nameR.top,
          scale: logoR.height / nameR.height,
        };
      };

      gsap.set(bigName, { transformOrigin: "left top", willChange: "transform" });
      gsap.set(headlineRef.current, { yPercent: 60, opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=160%",
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            // camera pull-back: 2.4 → 1.0 over the first 70% of scroll
            const p = Math.min(self.progress / 0.7, 1);
            zoomRef.current.scrollTarget = 2.4 - 1.4 * (1 - Math.pow(1 - p, 2));
          },
        },
      });

      /* name flies to the nav corner (0 → 0.7) */
      tl.to(bigName, {
        x: () => flight().x,
        y: () => flight().y,
        scale: () => flight().scale,
        ease: "power2.inOut",
        duration: 0.7,
      }, 0);

      /* scroll hint dies immediately */
      tl.to(hintRef.current, { opacity: 0, duration: 0.1 }, 0);

      /* headline rises slowly into the vacated space (0.4 → 1.0) */
      tl.to(badgeRef.current, { opacity: 1, y: 0, duration: 0.25 }, 0.4);
      tl.to(headlineRef.current, {
        yPercent: 0, opacity: 1,
        ease: "power2.out",
        duration: 0.6,
      }, 0.45);

      /* handoff: giant name out, real nav logo in (0.88 → 1.0) */
      tl.to(bigName, { opacity: 0, duration: 0.1 }, 0.88);
      if (navLogo) tl.to(navLogo, { opacity: 1, duration: 0.1 }, 0.9);
    }, section);

    return () => {
      const navLogoEl = document.getElementById("navLogo");
      if (navLogoEl) gsap.set(navLogoEl, { opacity: 1 });  // never leave the logo hidden
      ctx.revert();
    };
  }, []);

  const accent = theme === "dark" ? "#ff4d00" : "#0055ff";

  return (
    <main ref={sectionRef} id="hero" style={{
      position: "relative", width: "100%", height: "100vh",
      overflow: "hidden", background: "#080808",
    }}>
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />

      {/* headline — center-left, rises into view */}
      <div style={{
        position: "absolute", left: "4vw", right: "4vw",
        top: "38%",                              // ← "little above": sits upper-center, not bottom
        zIndex: 2, pointerEvents: "none",
      }}>
        <span ref={badgeRef} style={{
          display: "block", marginBottom: "1rem", opacity: 0, transform: "translateY(10px)",
          fontSize: "0.85rem", fontWeight: 700, letterSpacing: "3px",
          textTransform: "uppercase", color: accent,
        }}>
          Portfolio Protocol // Active
        </span>
        <div ref={headlineRef}>
          <h1 style={{
            fontSize: "clamp(2.5rem, 6vw, 6rem)", fontWeight: 900,
            textTransform: "uppercase", lineHeight: 0.95, letterSpacing: "-2px",
            margin: 0, color: "#fff",
          }}>
            ENGINEERING THE
          </h1>
          <h1 style={{
            fontSize: "clamp(2.5rem, 6vw, 6rem)", fontWeight: 900,
            textTransform: "uppercase", lineHeight: 0.95, letterSpacing: "-2px",
            margin: 0, color: accent,
          }}>
            NEXT GENERATION.
          </h1>
        </div>
      </div>

      {/* giant name — LUSION style, bottom, flies to nav corner on scroll */}
      <div ref={bigNameRef} style={{
        position: "absolute", left: "2vw", bottom: "2vh", zIndex: 3,
        fontSize: "clamp(3.5rem, 12.5vw, 13rem)", fontWeight: 900,
        letterSpacing: "-0.04em", lineHeight: 0.85, color: "#fff",
        textTransform: "uppercase", pointerEvents: "none", whiteSpace: "nowrap",
      }}>
        YOGESHWARAN
      </div>

      <div ref={hintRef} style={{
        position: "absolute", right: "4vw", bottom: "3vh", zIndex: 3,
        fontSize: "0.8rem", fontWeight: 700, letterSpacing: "3px",
        textTransform: "uppercase", color: "rgba(255,255,255,0.55)",
      }}>
        Scroll to explore
      </div>
    </main>
  );
}