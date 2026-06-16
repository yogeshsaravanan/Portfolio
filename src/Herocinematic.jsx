// ============================================================================
//  HeroCinematic.jsx  ·  v12  ·  mobile-ready + performance-optimised
//
//  PERFORMANCE FIXES (why v11 hung / ate RAM):
//   · render at a CAPPED resolution (devicePixelRatio clamped, mobile downscaled)
//     — the fragment shader is heavy (fbm ×9/pixel); fewer pixels = huge win
//   · FBM octaves reduced on mobile (5 → 3) via a compile-time #define
//   · the GL canvas PAUSES when the hero scrolls off-screen (IntersectionObserver)
//     — no wasted GPU once you're past the hero, so the project modal opens snappy
//   · text texture only redraws on beat change (already), at capped size
//
//  MOBILE LAYOUT FIXES:
//   · text sizes + wrapping tuned for narrow screens (no clipped headlines)
//   · the giant name + its flight target recomputed for mobile nav position
//
//  SECTION MAP:  §1 CONFIG · §2 VERT · §3 FRAG · §4 math · §5 TextEngine
//                §6 Component (6a refs · 6b GL · 6c loop · 6d timeline · 6e markup)
// ============================================================================

import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import K2Reveal from "./K2Reveal";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// ============================================================================
//  §1 · CONFIG
// ============================================================================
const isMobile = () => typeof window !== "undefined" && window.innerWidth < 768;

const CONFIG = {
  pinLength: "+=1800%",
  scrub: 1,

  // resolution scale: 1 = native. We cap DPR and downscale on mobile.
  maxDPR: 1.6,                 // never render above 1.6× even on 3× phones
  mobileScale: 0.7,            // mobile renders at 70% then CSS upscales (smooth)

  zoom: { start: 1.0, max: 50.0, suckEnd: 0.04, outEnd: 0.72 },

  win: {
    flightIn: 0.08, flightOut: 0.22, navTakeover: 0.23,
    beatA: [0.26, 0.44], beatB: [0.46, 0.62], beatC: [0.64, 0.80],
    travel: 0.035, formStart: 0.50, formEnd: 0.72, suckStart: 0.72,
  },

  ease: { uZoom: 0.05, uForm: 0.04, uDive: 0.075, uShift: 0.12, sing: 0.05, birth: 0.03 },
  ring: { radius: 0.115, sharp: 150.0, soft: 11.0, gain: 0.85 },
  tunnel: { rings: 7.0, ringSpeed: 3.0, shafts: 22.0, throatGlow: 1.6 },

  font: {
    family: "Archivo",
    url: "https://fonts.gstatic.com/s/archivo/v19/k3k6o8UDI-1M0wlSV9XAw6lQkqWY8Q82sJaRE-NWIDdgffTTNDNZ9xdp.woff2",
    cssHref: "https://fonts.googleapis.com/css2?family=Archivo:wght@400;700;900&display=swap",
  },
};

const THEME = {
  dark: { accent: "#ff4d00", glAccent: 0.0 },
  light: { accent: "#0055ff", glAccent: 1.0 },
};

// ============================================================================
//  §2 · VERTEX SHADER
// ============================================================================
const VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main(){
  v_uv = a_pos * 0.5 + 0.5;
  v_uv.y = 1.0 - v_uv.y;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

// ============================================================================
//  §3 · FRAGMENT SHADER  (FBM_OCTAVES injected per device for performance)
// ============================================================================
const makeFrag = (octaves) => `
precision highp float;

varying vec2 v_uv;
uniform vec2  u_res;
uniform vec2  u_sing;
uniform float u_time, u_zoom, u_mass, u_twist, u_form, u_dive, u_accent;
uniform sampler2D u_textTex;
uniform float u_textAlpha, u_textShift;

#define PI 3.14159265359
#define FBM_OCTAVES ${octaves}

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float vnoise(vec2 p){
  vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y);
}
float fbm(vec2 p){
  float v=0.0, amp=0.5, fr=1.0;
  for(int i=0;i<FBM_OCTAVES;i++){ v+=amp*vnoise(p*fr); amp*=0.5; fr*=2.1; }
  return v;
}
vec3 cosmosPal(float t){
  vec3 a = vec3(0.005,0.002,0.002);
  vec3 b = mix(vec3(0.50,0.12,0.02), vec3(0.04,0.12,0.35), u_accent);
  return a + b*cos(6.28318*(vec3(1.0,0.5,0.1)*t + vec3(0.0,0.02,0.06)));
}
vec2 rot(vec2 pivot, vec2 p, float a){
  float c=cos(a), s=sin(a); vec2 d=p-pivot;
  return pivot + vec2(c*d.x - s*d.y, s*d.x + c*d.y);
}

void main(){
  vec2 uv     = gl_FragCoord.xy / u_res;
  vec2 aspect = vec2(u_res.x/u_res.y, 1.0);
  vec2 center = vec2(0.5)*aspect;
  vec2 st     = uv*aspect;
  vec2 mt     = u_sing*aspect;

  vec2 rel = st - mt;
  float d  = max(length(rel), 1e-4);

  float pull = min(u_mass/(d*d), 70.0);
  vec2 dir   = rel / d;
  vec2 bent  = st - dir * pull * 0.045;
  bent = rot(mt, bent, pull * u_twist * 0.10);

  float dive = u_dive;
  if(dive > 0.001){
    vec2 cd = bent - center; float cl = max(length(cd),1e-4); float ca = atan(cd.y,cd.x);
    float throat = mix(1.0, 0.30/(cl+0.18), smoothstep(0.0,1.0,dive));
    ca += sin(u_time*0.6 + cl*3.0)*0.10*dive*dive;
    cd = vec2(cos(ca),sin(ca))*cl*throat; bent = center + cd;
  }

  vec2 p = (bent - center) * u_zoom + center;
  float tm = u_time * mix(0.15, 0.06, dive);
  vec2 q = vec2(fbm(p+tm), fbm(p+vec2(5.2,1.3)+tm));
  float f = fbm(p + 4.0*vec2(fbm(p+4.0*q+vec2(1.7,9.2)+tm*0.7),
                             fbm(p+4.0*q+vec2(8.3,2.8)+tm*0.5)));
  vec3 bg = cosmosPal(f + 0.3*tm) * 1.8;

  if(dive > 0.02){
    vec2 cd = bent - center; float cl = max(length(cd),1e-4); float ca = atan(cd.y,cd.x);
    float depth = 1.0/(cl+0.06);
    float ringPhase = depth*${CONFIG.tunnel.rings.toFixed(1)} - (u_time*${CONFIG.tunnel.ringSpeed.toFixed(1)} + dive*14.0);
    float rings = pow(0.5+0.5*sin(ringPhase*PI*2.0), 3.0);
    float shafts = pow(0.5+0.5*sin(ca*${CONFIG.tunnel.shafts.toFixed(1)} + depth*1.5), 4.0);
    vec3 wallCol = cosmosPal(depth*0.15 + u_time*0.05);
    float wallLit = (rings*0.8 + shafts*0.4)*smoothstep(0.02,0.30,cl);
    vec3 tube = wallCol*(0.4 + 1.6*wallLit);
    float throatGlow = ${CONFIG.tunnel.throatGlow.toFixed(1)}*exp(-cl*7.0);
    vec3 glowCol = mix(vec3(1.0,0.9,0.78), mix(vec3(1.0,0.55,0.2),vec3(0.5,0.7,1.0),u_accent), 0.4);
    tube += glowCol*throatGlow;
    tube *= 1.0 - smoothstep(0.32,0.85,cl)*0.6;
    bg = mix(bg, tube, smoothstep(0.05,0.55,dive));
  }

  // bg *= (1.0 - smoothstep(0.30,1.20,length(uv-0.5)*1.6)*0.18)*0.85;
  float bloom = smoothstep(0.82, 0.95, dive);            // 0→1 the burst
  float settle = smoothstep(0.95, 1.0, dive);            // 0→1 fade to section
  // expanding light from the vanishing point
  float fromCenter = 1.0 - smoothstep(0.0, mix(0.15, 1.4, bloom), length(uv-0.5)*1.6);
  vec3 flashCol = mix(vec3(1.0,0.95,0.88), vec3(1.0), u_accent);   // warm(dark) / pure(light)
  bg = mix(bg, flashCol, bloom * fromCenter);
  bg = mix(bg, flashCol, bloom * 0.6);                   // overall wash so edges bloom too
  // settle to the exact Capabilities section colour
  vec3 sectionCol = mix(vec3(0.047,0.024,0.031), vec3(0.0,0.333,1.0), u_accent); // #0c0608 / #0055ff
  bg = mix(bg, sectionCol, settle);

  float rh = ${CONFIG.ring.radius}*u_zoom;
  float sigma = mix(${CONFIG.ring.sharp.toFixed(1)}, ${CONFIG.ring.soft.toFixed(1)}, smoothstep(0.0,0.6,dive));
  float rr = rh*(1.0+dive*2.6);
  float ring = exp(-pow((d-rr)*sigma, 2.0));
  float ringVis = u_form*(0.55+0.45*(1.0-dive));
  vec3 ringHot = mix(vec3(1.0,0.95,0.88), mix(vec3(1.0,0.55,0.25),vec3(0.55,0.75,1.0),u_accent), 0.5);
  bg += ringHot*ring*${CONFIG.ring.gain}*ringVis;

  bg += vec3(0.02,0.06,0.15)*min(pull,4.0)*0.12*dive;
  bg *= 1.0 - smoothstep(0.86,1.0,dive);
  bg = bg*1.06/(1.0+0.16*bg);

  vec3 finalCol = bg;
  vec2 tuv = vec2(v_uv.x - u_textShift, v_uv.y);
  if(tuv.x > 0.0 && tuv.x < 1.0){
    vec4 glyph = texture2D(u_textTex, tuv);
    if(glyph.a > 0.004){
      bool wantsAccent = (glyph.r > 0.5 && glyph.g < 0.5);
      vec3 accentCol = mix(vec3(1.0,0.30,0.0), vec3(0.0,0.33,1.0), u_accent);
      float bgMatch = (u_accent < 0.5) ? smoothstep(0.22,0.50,bg.r) : smoothstep(0.22,0.50,bg.b);
      vec3 accentResolved = mix(accentCol, vec3(1.0), bgMatch);
      vec3 whiteResolved  = mix(vec3(1.0), vec3(0.92), smoothstep(0.6,0.9,bg.r));
      vec3 textCol = wantsAccent ? accentResolved : whiteResolved;
      finalCol = mix(finalCol, textCol, glyph.a*u_textAlpha);
    }
  }
  gl_FragColor = vec4(finalCol, 1.0);
}`;

// ============================================================================
//  §4 · MATH HELPERS
// ============================================================================
const seg = (p, a, b) => Math.min(Math.max((p - a) / (b - a), 0), 1);
const smooth = (t) => t * t * (3 - 2 * t);
const logZoom = (t, start, max) => start * Math.exp(smooth(t) * Math.log(max / start));

// ============================================================================
//  §5 · TEXT ENGINE  (mobile-aware sizing + wrapping)
// ============================================================================
class TextEngine {
  constructor(gl) {
    this.gl = gl;
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.tex = gl.createTexture();
    this.ready = false; this.lastKey = ""; this.mobile = isMobile();
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    this._loadFont();
  }
  async _loadFont() {
    try {
      const ff = new FontFace(CONFIG.font.family, `url(${CONFIG.font.url})`, { weight: "900" });
      await ff.load(); document.fonts.add(ff); this.ready = true; this.lastKey = "";
    } catch { this.ready = true; }
  }
  resize(w, h) {
    // supersample 2× on desktop, 1.5× on mobile (sharp but lighter)
    this.mobile = isMobile();
    const s = this.mobile ? 1.5 : 2;
    this.canvas.width = Math.max(2, Math.floor(w * s));
    this.canvas.height = Math.max(2, Math.floor(h * s));
    this.lastKey = "";
  }
  _heavy(txt, x, y, sizePx, spacing, accent) {
    const { ctx } = this;
    const fam = this.ready ? CONFIG.font.family : "Arial, sans-serif";
    ctx.font = `900 ${sizePx}px ${fam}`; ctx.lineJoin = "round";
    let cx = x;
    for (const ch of txt) {
      const col = accent ? "rgb(255,0,0)" : "rgb(255,255,255)";
      ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineWidth = sizePx * 0.03;
      ctx.fillText(ch, cx, y); ctx.strokeText(ch, cx, y);
      cx += ctx.measureText(ch).width + spacing;
    }
  }
  _badge(txt, x, y, sizePx) {
    const { ctx } = this;
    const fam = this.ready ? CONFIG.font.family : "Arial, sans-serif";
    ctx.font = `700 ${sizePx}px ${fam}`; ctx.fillStyle = "rgb(255,255,255)";
    let cx = x;
    for (const ch of txt) { ctx.fillText(ch, cx, y); cx += ctx.measureText(ch).width + sizePx * 0.16; }
  }
  draw(beat) {
    const key = beat + (this.ready ? "1" : "0") + (this.mobile ? "m" : "d");
    if (key === this.lastKey) return;
    this.lastKey = key;
    const { ctx, canvas } = this;
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.textBaseline = "alphabetic";

    const padX = W * (this.mobile ? 0.07 : 0.05);
    const topY = H * (this.mobile ? 0.34 : 0.42);
    // MOBILE: smaller headline + tighter line height so nothing clips
    const big = Math.floor(H * (this.mobile ? 0.062 : 0.12));
    const small = Math.floor(H * (this.mobile ? 0.014 : 0.018));
    const lh = big * 1.05;
    const sp = big * -0.02;

    if (beat === "A") {
      // this._badge("PORTFOLIO PROTOCOL // ACTIVE", padX, topY - big * 0.7, small);
      this._heavy("ENGINEERING", padX, topY + big, big, sp, false);
      this._heavy("THE NEXT", padX, topY + big + lh, big, sp, false);
      this._heavy("GENERATION.", padX, topY + big + lh * 2, big, sp, true);
    } else if (beat === "B") {
      // this._badge("TRACK RECORD // VERIFIED", padX, topY - big * 0.7, small);
      this._heavy("SENIOR", padX, topY + big, big * 0.9, sp, false);
      this._heavy("SOFTWARE", padX, topY + big + lh * 0.9, big * 0.9, sp, false);
      this._heavy("ENGINEER", padX, topY + big + lh * 1.8, big * 0.9, sp, true);
      const stats = [["5+", "YRS"], ["500+", "COMMITS"]];
      const fam = this.ready ? CONFIG.font.family : "Arial, sans-serif";
      let sx = padX; const sy = topY + big + lh * 2.85;
      const gap = this.mobile ? W * 0.27 : W * 0.18;
      stats.forEach(([n, l]) => {
        ctx.font = `900 ${big * 0.42}px ${fam}`; ctx.fillStyle = "rgb(255,0,0)"; ctx.fillText(n, sx, sy);
        ctx.font = `700 ${small * 0.9}px ${fam}`; ctx.fillStyle = "rgb(255,255,255)"; ctx.fillText(l, sx, sy + small * 1.8);
        sx += gap;
      });
    } else if (beat === "C") {
      // this._badge("SYSTEMS // READY", padX, topY - big * 0.7, small);
      this._heavy("OPEN TO ", padX, topY + big, big, sp, false);
      this._heavy(" TO ", padX, topY + big + lh, big, sp, false);
      this._heavy("BUILDING NEXT..", padX, topY + big + lh * 2, big, sp, true);
    }
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
  }
}

// ============================================================================
//  §6 · COMPONENT
// ============================================================================
export default function HeroCinematic({ theme = "dark" }) {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const bigNameRef = useRef(null);
  const hintRef = useRef(null);
  const lineRef = useRef(null);
  const lockCleanupRef = useRef(null);

  const mouseRef = useRef({ x: 0.5, y: 0.5, lastMove: 0 });
  const feedRef = useRef({ down: false, t: 0 });
  const visibleRef = useRef(true);     // pause rendering when hero off-screen
  const arrivalRef = useRef(null);

  const S = useRef({
    zoom: CONFIG.zoom.start, form: 0, dive: 0, shift: 0,
    zoomT: CONFIG.zoom.start, formT: 0, diveT: 0, shiftT: 0,
    textAlpha: 0, beat: "A",
  });

  const pal = THEME[theme] || THEME.dark;

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false, powerPreference: "high-performance" });
    if (!gl) return;

    if (!document.querySelector("link[data-hero-font]")) {
      const l = document.createElement("link");
      l.rel = "stylesheet"; l.href = CONFIG.font.cssHref; l.setAttribute("data-hero-font", "1");
      document.head.appendChild(l);
    }

    const text = new TextEngine(gl);

    // —— resolution-capped resize: the core performance fix ——
    const resize = () => {
      const cssW = canvas.offsetWidth, cssH = canvas.offsetHeight;
      const mob = isMobile();
      const dpr = Math.min(window.devicePixelRatio || 1, CONFIG.maxDPR);
      const scale = (mob ? CONFIG.mobileScale : 1) * dpr;
      // render buffer (smaller than CSS size) — CSS stretches it back up smoothly
      canvas.width = Math.max(2, Math.floor(cssW * scale));
      canvas.height = Math.max(2, Math.floor(cssH * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
      text.resize(canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    // —— pause the GPU when hero is off-screen (frees main thread for modals) ——
    const io = new IntersectionObserver(
      ([e]) => { visibleRef.current = e.isIntersecting; },
      { threshold: 0.01 }
    );
    io.observe(canvas);

    const onMove = (e) => { mouseRef.current = { x: e.clientX / window.innerWidth, y: 1 - e.clientY / window.innerHeight, lastMove: performance.now() }; };
    const onDown = () => { feedRef.current.down = true; };
    const onUp = () => { feedRef.current.down = false; };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });

    const compile = (type, src) => {
      const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error("Shader:", gl.getShaderInfoLog(s));
      return s;
    };
    const prog = gl.createProgram();
    // mobile gets 3 FBM octaves, desktop 5 — the single biggest GPU saving
    const octaves = isMobile() ? 3 : 5;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, makeFrag(octaves)));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) console.error("Link:", gl.getProgramInfoLog(prog));
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(aPos); gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const U = (n) => gl.getUniformLocation(prog, n);
    const u = {
      res: U("u_res"), sing: U("u_sing"), time: U("u_time"), zoom: U("u_zoom"),
      mass: U("u_mass"), twist: U("u_twist"), form: U("u_form"), dive: U("u_dive"),
      accent: U("u_accent"), textTex: U("u_textTex"), textAlpha: U("u_textAlpha"), textShift: U("u_textShift"),
    };
    gl.uniform1f(u.accent, pal.glAccent);
    gl.uniform1i(u.textTex, 0);

    const start = performance.now();
    let birth = 0, sing = { x: 0.5, y: 0.5 }, raf;
    let lastFrame = 0;
    const frameInterval = isMobile() ? 1000 / 40 : 0;   // cap mobile at 40fps (smoother battery/heat)

    const tick = (nowRAF) => {
      raf = requestAnimationFrame(tick);

      // skip drawing entirely when hero isn't on screen
      if (!visibleRef.current) return;
      // mobile frame cap
      if (frameInterval && nowRAF - lastFrame < frameInterval) return;
      lastFrame = nowRAF;

      const now = performance.now(), t = (now - start) / 1000, st = S.current;

      st.zoom += (st.zoomT - st.zoom) * CONFIG.ease.uZoom;
      st.form += (st.formT - st.form) * CONFIG.ease.uForm;
      st.dive += (st.diveT - st.dive) * CONFIG.ease.uDive;
      st.shift += (st.shiftT - st.shift) * CONFIG.ease.uShift;
      birth += (1 - birth) * CONFIG.ease.birth;

      const mass = birth * (0.0012 + st.form * 0.014 + st.dive * st.dive * 0.30);

      const fr = feedRef.current;
      if (fr.down) fr.t = Math.min(fr.t + 0.04, 2.5); else fr.t -= fr.t * 0.02;

      const idle = now - mouseRef.current.lastMove > 2500;
      const tx = idle ? 0.5 + Math.sin(t * 0.5) * -0.22 : mouseRef.current.x;
      const ty = idle ? 0.5 + Math.sin(t * 0.6) * 0.16 : mouseRef.current.y;
      const lock = Math.max(st.form, Math.min(st.dive * 3, 1));
      sing.x += ((tx * (1 - lock) + 0.5 * lock) - sing.x) * CONFIG.ease.sing;
      sing.y += ((ty * (1 - lock) + 0.5 * lock) - sing.y) * CONFIG.ease.sing;

      text.draw(st.beat);

      gl.uniform2f(u.res, canvas.width, canvas.height);
      gl.uniform2f(u.sing, sing.x, sing.y);
      gl.uniform1f(u.time, t);
      gl.uniform1f(u.zoom, st.zoom);
      gl.uniform1f(u.mass, mass);
      gl.uniform1f(u.twist, fr.t);
      gl.uniform1f(u.form, st.form);
      gl.uniform1f(u.dive, st.dive);
      gl.uniform1f(u.textAlpha, st.textAlpha);
      gl.uniform1f(u.textShift, st.shift);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, text.tex);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      // free GPU resources explicitly (helps RAM)
      gl.deleteProgram(prog); gl.deleteBuffer(buf); gl.deleteTexture(text.tex);
    };
  }, [theme]);

  // —— 6d · master timeline + MANUAL scroll-end locking ——
  //  NO `snap` on the ScrollTrigger. The scrubbed timeline drives the visuals;
  //  when the user STOPS scrolling we animate the *scroll position itself* to
  //  the nearest lock with one gsap.to(window,{scrollTo}). Only one controller
  //  ever moves the page → the scrub/snap tug-of-war (the bounce) cannot occur.
  useEffect(() => {
    const section = sectionRef.current;
    const bigName = bigNameRef.current;
    const navLogo = document.getElementById("navLogo");
    if (!section || !bigName) return;

    // beat lock positions, as fractions of the timeline progress
    const LOCKS = [0, 0.33, 0.51, 0.67, 1.0];

    const ctx = gsap.context(() => {
      if (navLogo) gsap.set(navLogo, { opacity: 0 });
      const flight = () => {
        const n = bigName.getBoundingClientRect();
        // mobile (or no nav logo) → fly to TOP-CENTER, small wordmark
        if (isMobile() || !navLogo) {
          const s = 0.30, sw = n.width * s;
          return { x: (window.innerWidth - sw) / 2 - n.left, y: window.innerHeight * 0.05 - n.top, scale: s };
        }
        const l = navLogo.getBoundingClientRect();
        return { x: l.left - n.left, y: l.top - n.top, scale: l.height / n.height };
      };
      gsap.set(bigName, { transformOrigin: "left top", willChange: "transform" });
      gsap.set(lineRef.current, { scaleY: 0, transformOrigin: "top center" });

      const W = CONFIG.win;

      // ---- the scrubbed timeline: VISUALS ONLY, no snap ----
      let stRef = null;
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section, start: "top top", end: CONFIG.pinLength,
          pin: true, scrub: CONFIG.scrub, invalidateOnRefresh: true,
          onRefresh: (self) => { stRef = self; },
          onUpdate: (self) => {
            stRef = self;
            const p = self.progress, st = S.current;
            const out = seg(p, 0.0, CONFIG.zoom.outEnd);
            const zoomOut = logZoom(out, CONFIG.zoom.start, CONFIG.zoom.max);
            const suck = Math.pow(seg(p, W.suckStart, 1.0), 2.3);
            st.zoomT = zoomOut * (1 - suck) + CONFIG.zoom.suckEnd * suck;
            st.formT = smooth(seg(p, W.formStart, W.formEnd));
            st.diveT = suck;

            const evalBeat = ([tin, tout]) => {
              const tv = W.travel;
              const inP = seg(p, tin, tin + tv), outP = seg(p, tout - tv, tout);
              const alpha = smooth(inP) * (1 - smooth(outP));
              const shift = 0.5 * (1 - smooth(inP)) - 0.5 * smooth(outP);
              return { alpha, shift };
            };
            const A = evalBeat(W.beatA), B = evalBeat(W.beatB), C = evalBeat(W.beatC);
            if (A.alpha >= B.alpha && A.alpha >= C.alpha) { st.beat = "A"; st.textAlpha = A.alpha; st.shiftT = A.shift; }
            else if (B.alpha >= C.alpha) { st.beat = "B"; st.textAlpha = B.alpha; st.shiftT = B.shift; }
            else { st.beat = "C"; st.textAlpha = C.alpha; st.shiftT = C.shift; }

            gsap.set(lineRef.current, { scaleY: p });

            const arrival = smooth(seg(p, 0.9999, 1));
            gsap.set(arrivalRef.current, { opacity: arrival });
          },
        },
      });

      tl.to(hintRef.current, { opacity: 0, duration: 0.04 }, W.flightIn);
      tl.to(bigName, {
        x: () => flight().x, y: () => flight().y, scale: () => flight().scale,
        ease: "power2.inOut", duration: W.flightOut - W.flightIn,
      }, W.flightIn);
      tl.to(bigName, { opacity: 0, duration: 0.02 }, W.flightOut);
      if (navLogo) tl.to(navLogo, { opacity: 1, duration: 0.03 }, W.navTakeover);
      tl.to({}, { duration: 1 }, 1.0);

      // ---- MANUAL LOCK ENGINE ----
      // Convert a timeline-progress lock (0..1) to an absolute scroll Y, then
      // tween the window there once scrolling has stopped.
      let scrollEndTimer = null;
      let locking = false;

      const progressToScrollY = (prog) => {
        if (!stRef) return null;
        // ScrollTrigger gives us the pixel range the pin spans:
        return stRef.start + (stRef.end - stRef.start) * prog;
      };

      const nearestLock = (prog) => {
        let best = LOCKS[0], bd = Infinity;
        for (const v of LOCKS) { const d = Math.abs(v - prog); if (d < bd) { bd = d; best = v; } }
        return best;
      };

      const doLock = () => {
        if (!stRef || locking) return;
        const prog = stRef.progress;
        // don't fight the dive: once you're past the last beat, let it run free to the end
        // if (prog > 0.72) return;
        // const target = nearestLock(prog);
        const dir = stRef.direction;            // 1 = scrolled down, -1 = up
        // current lock you're sitting on/just left
        let curIdx = 0, bd = Infinity;
        LOCKS.forEach((v, i) => { const d = Math.abs(v - prog); if (d < bd) { bd = d; curIdx = i; } });

        // commit in the scroll direction: advance if you moved past the current lock
        let target = LOCKS[curIdx];
        if (dir === 1 && prog > LOCKS[curIdx] + 0.005) target = LOCKS[Math.min(curIdx + 1, LOCKS.length - 1)];
        else if (dir === -1 && prog < LOCKS[curIdx] - 0.005) target = LOCKS[Math.max(curIdx - 1, 0)];
        if (Math.abs(target - prog) < 0.004) return;   // already basically locked
        const y = progressToScrollY(target);
        if (y == null) return;
        locking = true;
        gsap.to(window, {
          scrollTo: y,
          duration: 0.7,
          ease: "power3.inOut",
          overwrite: true,
          onComplete: () => { locking = false; },
        });
      };

      // debounce: only lock after scrolling has been quiet for 140ms
      const onScroll = () => {
        if (locking) return;                  // never interrupt an in-progress lock
        if (scrollEndTimer) clearTimeout(scrollEndTimer);
        scrollEndTimer = setTimeout(doLock, 140);
      };
      // a fresh user gesture cancels any pending lock so we never fight them
      const cancelPending = () => {
        if (scrollEndTimer) { clearTimeout(scrollEndTimer); scrollEndTimer = null; }
        gsap.killTweensOf(window);            // stop a running lock if they grab scroll
        locking = false;
      };

      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("wheel", cancelPending, { passive: true });
      window.addEventListener("touchstart", cancelPending, { passive: true });

      // expose listeners for cleanup
      // store cleanup in a ref (ctx isn't in scope inside its own callback)
      lockCleanupRef.current = () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("wheel", cancelPending);
        window.removeEventListener("touchstart", cancelPending);
        if (scrollEndTimer) clearTimeout(scrollEndTimer);
      };
    }, section);

    return () => {
      if (lockCleanupRef.current) lockCleanupRef.current();
      const l = document.getElementById("navLogo");
      if (l) gsap.set(l, { opacity: 1 });
      ctx.revert();
    };
  }, []);

  <style>{`
  @media (max-width: 768px) {
    #hero .hero-name { bottom: 18vh !important; font-size: clamp(2rem, 13vw, 5rem) !important; }
  }
`}</style>

  // —— 6e · markup (mobile-aware name size) ——
  const noPointer = { pointerEvents: "none" };
  return (
    <main ref={sectionRef} id="hero"
      style={{ position: "relative", width: "100%", height: "100vh", overflow: "hidden", background: theme === "dark" ? "#0c0608" : "#0055ff", }}>
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", ...noPointer }} />

      <div ref={bigNameRef} className="hero-name" style={{
        position: "absolute", left: "4vw", zIndex: 3,
        fontFamily: `${CONFIG.font.family}, sans-serif`,
        bottom: "15vh",
        // bottom: "clamp(5vh, 8vh, 8vh)",
        // smaller, wrappable on mobile so it doesn't overflow
        fontSize: "clamp(2.2rem, 11vw, 14rem)", fontWeight: 900, letterSpacing: "-0.04em",
        lineHeight: 0.85, color: "#fff", textTransform: "uppercase",
        maxWidth: "92vw", wordBreak: "break-word",
        textShadow: "0 6px 40px rgba(0,0,0,0.55)", ...noPointer,
      }}>
        YOGESHWARAN
      </div>

      <div ref={hintRef} style={{
        position: "absolute", right: "4vw", zIndex: 3,
        bottom: "clamp(10vh, 12vh, 14vh)",
        fontSize: "0.7rem", fontWeight: 700, letterSpacing: "2px",
        textTransform: "uppercase", color: "rgba(255,255,255,0.55)", ...noPointer,
      }}>
        Scroll to explore
      </div>

      <div style={{ position: "absolute", right: "1.2vw", top: "15vh", bottom: "15vh", width: 2, background: "rgba(255,255,255,0.08)", zIndex: 3, ...noPointer }}>
        <div ref={lineRef} style={{ width: "100%", height: "100%", background: pal.accent }} />
      </div>

      
      <div ref={arrivalRef} style={{
        position: "absolute", inset: 0, zIndex: 5,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center", opacity: 0, ...noPointer,
        fontFamily: `${CONFIG.font.family}, sans-serif`,
      }}>
        <span style={{
          fontSize: "0.8rem", fontWeight: 700, letterSpacing: "4px",
          textTransform: "uppercase",
          color: theme === "dark" ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)",
          marginBottom: "1rem",
        }}>
          CONTINUE
        </span>
      </div>
      {/* <K2Reveal theme={theme}/> */}
    </main>
  );
}