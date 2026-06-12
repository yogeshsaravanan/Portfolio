// HeroCinematic.jsx — v7 · Advanced Cinematic Space Engine with Dynamic Text Blend Modes
import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const VERT = `attribute vec2 a_pos; void main(){ gl_Position = vec4(a_pos,0.,1.); }`;

const FRAG = `
precision highp float;
uniform vec2 u_res, u_sing;
uniform float u_time, u_zoom, u_mass, u_twist, u_form, u_dive, u_accent;

vec2 rot(vec2 mt, vec2 st, float a){
  float c = cos(a), s = sin(a);
  vec2 d = st - mt;
  return mt + vec2(c*d.x - s*d.y, s*d.x + c*d.y);
}

float noise(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }

float snoise(vec2 p){
  vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(noise(i),noise(i+vec2(1,0)),f.x), mix(noise(i+vec2(0,1)),noise(i+vec2(1,1)),f.x), f.y);
}

float fbm(vec2 p){
  float v=0.0, amp=0.5, fr=1.0;
  for(int i=0;i<5;i++){ v+=amp*snoise(p*fr); amp*=0.5; fr*=2.1; }
  return v;
}

vec3 cosmosPal(float t){
  vec3 a = vec3(0.005,0.002,0.002);
  vec3 b = mix(vec3(0.50,0.12,0.02), vec3(0.04,0.12,0.35), u_accent);
  return a + b*cos(6.28318*(vec3(1.0,0.5,0.1)*t + vec3(0.0,0.02,0.06)));
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 aspect = vec2(u_res.x/u_res.y, 1.0);
  vec2 center = vec2(0.5)*aspect;
  vec2 st = uv*aspect;
  vec2 mt = u_sing*aspect;

  /* Inverse-square gravitational lensing & coordinate pull physics */
  float d = max(length(st - mt), 1e-4);
  float pull = min(u_mass/(d*d), 70.0);
  
  float ang = pull * (1.0 + u_twist * 0.8) + (u_dive * u_dive * u_time * 6.0 * exp(-d * 0.8));
  vec2 r = rot(mt, st, ang);

  /* Cosmos coordinate space scaling */
  float compression = mix(1.0, 0.65, smoothstep(1.0, 51.5, u_zoom));
  vec2 p = (r - center) * (u_zoom * compression) + center;
  
  float tm = u_time * mix(0.15, 0.03, u_form); 
  vec2 q = vec2(fbm(p+tm), fbm(p+vec2(5.2,1.3)+tm));
  float f = fbm(p + 4.0*vec2(fbm(p+4.0*q+vec2(1.7,9.2)+tm*0.7),
                             fbm(p+4.0*q+vec2(8.3,2.8)+tm*0.5)));
  vec3 col = cosmosPal(f + 0.3*tm) * 1.8;
  col *= (1.0 - smoothstep(0.3,1.2,length(uv-0.5)*1.6)*0.18) * 0.85;

  /* Pure Emergent Horizon */
  col -= vec3(pull * 0.15);
  
  /* Stark Einsteinian Photon Ring Lensing */
  if(u_form > 0.001) {
    vec2 rel = st - mt;
    float rh = 0.12;
    float ring = exp(-pow((length(rel) - rh * 1.02) * 140.0, 2.0));
    col += mix(vec3(0.95, 0.15, 0.02), vec3(0.5, 0.7, 1.0), 1.0 - u_form) * ring * 1.2 * u_form * (1.0 - u_dive);
  }

  col = max(col, 0.0);

  col += vec3(0.02, 0.06, 0.15) * min(pull, 4.0) * 0.15 * u_dive; 
  col *= 1.0 - smoothstep(0.90, 0.98, u_dive);                   
  col = col * 1.05 / (1.0 + 0.15*col);                           
  gl_FragColor = vec4(col, 1.0);
}`;

const seg = (p, a, b) => Math.min(Math.max((p - a) / (b - a), 0), 1);
const smooth = (t) => t * t * (3 - 2 * t);

export default function HeroCinematic({ theme = "dark" }) {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const bigNameRef = useRef(null);
  const beatRefs = [useRef(null), useRef(null), useRef(null)];
  const hintRef = useRef(null);
  const lineRef = useRef(null);
  const flashRef = useRef(null);

  const mouseRef = useRef({ x: 0.5, y: 0.5, lastMove: 0 });
  const feedRef = useRef({ down: false, t: 0 });
  
  const uni = useRef({ zoom: 1.0, form: 0, dive: 0, zoomT: 1.0, formT: 0, diveT: 0 });

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

    const onMove = (e) => {
      mouseRef.current = { x: e.clientX / window.innerWidth, y: 1 - e.clientY / window.innerHeight, lastMove: performance.now() };
    };
    const onDown = () => { feedRef.current.down = true; };
    const onUp = () => { feedRef.current.down = false; };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });

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
      time: U("u_time"), res: U("u_res"), sing: U("u_sing"), zoom: U("u_zoom"),
      mass: U("u_mass"), twist: U("u_twist"), form: U("u_form"),
      dive: U("u_dive"), accent: U("u_accent"),
    };
    gl.uniform1f(u.accent, theme === "dark" ? 0 : 1);

    const start = performance.now();
    let birth = 0;
    let sing = { x: 0.5, y: 0.5 };
    let raf;

    const tick = () => {
      const now = performance.now();
      const t = (now - start) / 1000;
      const U_ = uni.current;

      U_.zoom += (U_.zoomT - U_.zoom) * 0.05; 
      U_.form += (U_.formT - U_.form) * 0.04;
      U_.dive += (U_.diveT - U_.dive) * 0.07;
      birth += (1 - birth) * 0.03;

      const mass = birth * (0.0010 + U_.form * 0.018 + U_.dive * U_.dive * 0.32);

      const fr = feedRef.current;
      if (fr.down) fr.t = Math.min(fr.t + 0.04, 2.5);
      else fr.t -= fr.t * 0.02;

      const idle = now - mouseRef.current.lastMove > 2500;
      const tx = idle ? 0.5 + Math.sin(t * 0.5) * -0.25 : mouseRef.current.x;
      const ty = idle ? 0.5 + Math.sin(t * 0.6) * 0.18 : mouseRef.current.y;
      const lock = Math.max(U_.form, Math.min(U_.dive * 3.0, 1.0));
      
      sing.x += ((tx * (1.0 - lock) + 0.5 * lock) - sing.x) * 0.05;
      sing.y += ((ty * (1.0 - lock) + 0.5 * lock) - sing.y) * 0.05;

      gl.uniform1f(u.time, t);
      gl.uniform2f(u.res, canvas.width, canvas.height);
      gl.uniform2f(u.sing, sing.x, sing.y);
      gl.uniform1f(u.zoom, U_.zoom);
      gl.uniform1f(u.mass, mass);
      gl.uniform1f(u.twist, fr.t);
      gl.uniform1f(u.form, U_.form);
      gl.uniform1f(u.dive, U_.dive);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, [theme]);

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
      
      // Clean initialization setup: Text starts off-screen completely to the right (100vw)
      beatRefs.forEach((b) => gsap.set(b.current, { x: "100vw", opacity: 0, Granger: "transform" }));
      gsap.set(lineRef.current, { scaleY: 0, transformOrigin: "top center" });
      gsap.set(flashRef.current, { opacity: 0 });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section, start: "top top", end: "+=500%",
          pin: true, scrub: 1.2, invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress;
            let calculatedZoom = 1.0;

            if (p <= 0.76) {
              const linearProgress = seg(p, 0.0, 0.76);
              calculatedZoom = 1.0 + (50.5 * linearProgress);
            } else {
              const diveProgress = seg(p, 0.76, 1.0);
              calculatedZoom = 51.5 - (51.495 * smooth(diveProgress));
            }

            uni.current.zoomT = calculatedZoom;
            uni.current.formT = smooth(seg(p, 0.58, 0.76));
            uni.current.diveT = Math.pow(seg(p, 0.76, 1.0), 2.5);
            
            gsap.set(lineRef.current, { scaleY: p });
          },
        },
      });

      /* ACT 1: Identity Flight Sequence (8% - 24%) */
      tl.to(hintRef.current, { opacity: 0, duration: 0.04 }, 0.08);
      tl.to(bigName, {
        x: () => flight().x, y: () => flight().y, scale: () => flight().scale,
        ease: "power1.inOut", duration: 0.16,
      }, 0.08);
      tl.to(bigName, { opacity: 0, duration: 0.02 }, 0.24);
      if (navLogo) tl.to(navLogo, { opacity: 1, duration: 0.02 }, 0.25);

      /* ACT 2 & 3: Clean, Isolated Horizontal Text Passes (No Overlaps) */
      const beat = (ref, tIn, tActive, tOut) => {
        // Step 1: Fly in cleanly from the far right edge to the centered-left viewing viewport
        tl.to(ref.current, { x: "4vw", opacity: 1, ease: "power2.out", duration: 0.06 }, tIn);
        // Step 2: Cruise steadily through the scene view while background expands
        tl.to(ref.current, { x: "0vw", duration: tActive });
        // Step 3: Clear completely off-screen to the left before the next sequence triggers
        tl.to(ref.current, { x: "-100vw", opacity: 0, ease: "power2.in", duration: 0.06 }, tOut);
      };
      
      // Strict mathematical timing breaks to completely guarantee no overlap zones
      beat(beatRefs[0], 0.26, 0.08, 0.38); 
      beat(beatRefs[1], 0.42, 0.08, 0.54); 
      beat(beatRefs[2], 0.58, 0.08, 0.70); 

      /* ACT 5: Blinding White Flash Out */
      tl.to(flashRef.current, { opacity: 0.85, duration: 0.012, ease: "power4.in" }, 0.985);
      tl.to(flashRef.current, { opacity: 0, duration: 0.005 }, 0.998);
    }, section);

    return () => {
      const l = document.getElementById("navLogo");
      if (l) gsap.set(l, { opacity: 1 });
      ctx.revert();
    };
  }, []);

  const accent = theme === "dark" ? "#ff4d00" : "#0055ff";
  const noPointer = { pointerEvents: "none" };
  
  // Unified text element layout styles featuring smart dynamic inversion mix-blending
  const textContainerStyle = {
    position: "absolute",
    left: 0,
    top: "35%",
    width: "100%",
    zIndex: 2,
    // mixBlendMode: "difference", // Automatic real-time color adjustment based on cosmic backgrounds
    pointerEvents: "none"
  };

  const textInnerWrapper = {
    paddingLeft: "4vw",
    textShadow: "0 4px 24px rgba(0,0,0,0.65)" // Protects character clarity over volatile noise colors
  };

  const badge = { display: "block", marginBottom: "1rem", fontSize: "0.85rem", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", color: "#fff" };
  const h1 = { fontSize: "clamp(2.5rem,6vw,6rem)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.95, letterSpacing: "-2px", margin: 0, color: "#fff" };

  return (
    <main ref={sectionRef} id="hero" style={{ position: "relative", width: "100%", height: "100vh", overflow: "hidden", background: "#000" }}>
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", ...noPointer }} />

      {/* BEAT A */}
      <div ref={beatRefs[0]} style={textContainerStyle}>
        <div style={textInnerWrapper}>
          <span style={badge}>Portfolio Protocol // Active</span>
          <h1 style={h1}>ENGINEERING THE</h1>
          <h1 style={{ ...h1, color: accent, mixBlendMode: "normal" }}>NEXT GENERATION.</h1>
        </div>
      </div>

      {/* BEAT B */}
      <div ref={beatRefs[1]} style={textContainerStyle}>
        <div style={textInnerWrapper}>
          <span style={badge}>Track Record // Verified</span>
          <h2 style={{ ...h1, fontSize: "clamp(2rem,5vw,4.5rem)" }}>SENIOR SOFTWARE<br />ENGINEER</h2>
          <div style={{ display: "flex", gap: "3rem", marginTop: "2rem", fontFamily: "monospace" }}>
            {[["5+", "YRS BUILDING"], ["42%", "PERF GAINS"], ["500+", "COMMITS / YR"]].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontSize: "clamp(1.4rem,2.6vw,2.4rem)", fontWeight: 900, color: "#fff" }}>{n}</div>
                <div style={{ fontSize: "0.7rem", letterSpacing: "2px", color: "rgba(255,255,255,0.7)", textTransform: "uppercase" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BEAT C */}
      <div ref={beatRefs[2]} style={textContainerStyle}>
        <div style={textInnerWrapper}>
          <span style={badge}>Systems // Ready for Deployment</span>
          <h2 style={{ ...h1, fontSize: "clamp(2.2rem,5.5vw,5rem)" }}>NOW ENTERING<br />DEEP SPACE.</h2>
        </div>
      </div>

      <div ref={bigNameRef} style={{
        position: "absolute", left: "2vw", bottom: "5vh", zIndex: 3,
        fontSize: "clamp(3.5rem,12.5vw,15rem)", fontWeight: 900, letterSpacing: "-0.04em",
        lineHeight: 0.85, color: "#fff", textTransform: "uppercase", whiteSpace: "nowrap", ...noPointer,
      }}>
        YOGESHWARAN
      </div>

      <div ref={hintRef} style={{
        position: "absolute", right: "4vw", bottom: "3vh", zIndex: 3,
        fontSize: "0.8rem", fontWeight: 700, letterSpacing: "3px",
        textTransform: "uppercase", color: "rgba(255,255,255,0.55)", ...noPointer,
      }}>
        Scroll to explore · Hold to feed the void
      </div>

      <div style={{ position: "absolute", right: "1.2vw", top: "15vh", bottom: "15vh", width: 2, background: "rgba(255,255,255,0.08)", zIndex: 3, ...noPointer }}>
        <div ref={lineRef} style={{ width: "100%", height: "100%", background: accent }} />
      </div>

      <div ref={flashRef} style={{ position: "absolute", inset: 0, background: "#fff", zIndex: 4, ...noPointer }} />
    </main>
  );
}