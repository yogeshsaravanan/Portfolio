// ============================================================================
//  HeroCinematic.jsx  ·  v11
//  Scroll-driven cinematic space journey.
//
//  WHAT'S NEW IN v11
//   · Name flight fixed — folded into ONE master timeline (no rival trigger)
//   · Beats now SLIDE right→left via u_textShift, with heavier glyphs
//   · Tunnel rebuilt for real DEPTH — forward-rushing rings + wall light
//     shafts + a bright vanishing-point throat you accelerate toward
//
//  SECTION MAP (explained in detail in the chat after this file)
//   §1 CONFIG            every tunable number
//   §2 VERTEX shader
//   §3 FRAGMENT shader   cosmos · lensing · ring · TUNNEL · text
//   §4 math helpers
//   §5 TextEngine        crisp web-font glyphs → GPU texture
//   §6 Component         6a refs · 6b GL boot · 6c loop · 6d timeline · 6e markup
//
//  CAMERA: higher u_zoom = further OUT · lower = IN (suck)
//  nav logo must be:  <div id="navLogo">YOGESHWARAN<br/>SARAVANAN</div>
// ============================================================================

import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ============================================================================
//  §1 · CONFIG
// ============================================================================
const CONFIG = {
  pinLength: "+=540%",
  scrub: 1.2,

  zoom: { start: 1.0, max: 50.0, suckEnd: 0.04, outEnd: 0.72 },

  win: {
    flightIn: 0.08, flightOut: 0.22, navTakeover: 0.23,
    //          enter  exit   (hold is the span between)
    beatA: [0.26, 0.40],
    beatB: [0.44, 0.58],
    beatC: [0.62, 0.72],
    travel: 0.035,              // how long the slide-in / slide-out takes
    formStart: 0.50, formEnd: 0.72,
    suckStart: 0.72,
  },

  ease: { uZoom: 0.05, uForm: 0.04, uDive: 0.075, uShift: 0.12, sing: 0.05, birth: 0.03 },

  ring: { radius: 0.115, sharp: 150.0, soft: 11.0, gain: 0.85 },

  tunnel: {
    rings: 7.0,                 // how many concentric depth rings in the tube
    ringSpeed: 3.0,             // how fast they rush toward you
    shafts: 22.0,               // radial wall light shafts (rotational reference)
    throatGlow: 1.6,            // brightness of the vanishing-point
  },

  font: {
    family: "Archivo",
    url: "https://fonts.gstatic.com/s/archivo/v19/k3k6o8UDI-1M0wlSV9XAw6lQkqWY8Q82sJaRE-NWIDdgffTTNDNZ9xdp.woff2",
    cssHref: "https://fonts.googleapis.com/css2?family=Archivo:wght@400;700;900&display=swap",
    supersample: 2,
  },
};

const THEME = {
  dark:  { accent: "#ff4d00", glAccent: 0.0 },
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
  v_uv.y = 1.0 - v_uv.y;          // flip Y so the 2D text canvas lines up
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

// ============================================================================
//  §3 · FRAGMENT SHADER
// ============================================================================
const FRAG = `
precision highp float;

varying vec2 v_uv;
uniform vec2  u_res;
uniform vec2  u_sing;
uniform float u_time;
uniform float u_zoom;
uniform float u_mass;
uniform float u_twist;
uniform float u_form;
uniform float u_dive;
uniform float u_accent;

uniform sampler2D u_textTex;
uniform float u_textAlpha;
uniform float u_textShift;        // horizontal slide of the glyph layer (uv units)

#define PI 3.14159265359

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float vnoise(vec2 p){
  vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y);
}
float fbm(vec2 p){
  float v=0.0, amp=0.5, fr=1.0;
  for(int i=0;i<5;i++){ v+=amp*vnoise(p*fr); amp*=0.5; fr*=2.1; }
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

  // —— gravitational lensing ——
  float pull = min(u_mass/(d*d), 70.0);
  vec2 dir   = rel / d;
  vec2 bent  = st - dir * pull * 0.045;
  bent = rot(mt, bent, pull * u_twist * 0.10);

  float dive = u_dive;

  // —— tunnel coordinate warp (forward pull toward vanishing point) ——
  if(dive > 0.001){
    vec2  cd  = bent - center;
    float cl  = max(length(cd), 1e-4);
    float ca  = atan(cd.y, cd.x);
    float throat = mix(1.0, 0.30/(cl + 0.18), smoothstep(0.0,1.0,dive));
    ca += sin(u_time*0.6 + cl*3.0) * 0.10 * dive*dive;   // gentle banking
    cd  = vec2(cos(ca), sin(ca)) * cl * throat;
    bent = center + cd;
  }

  // —— camera zoom ——
  vec2 p = (bent - center) * u_zoom + center;

  // —— cosmos field ——
  float tm = u_time * mix(0.15, 0.06, dive);
  vec2  q  = vec2(fbm(p+tm), fbm(p+vec2(5.2,1.3)+tm));
  float f  = fbm(p + 4.0*vec2(fbm(p+4.0*q+vec2(1.7,9.2)+tm*0.7),
                              fbm(p+4.0*q+vec2(8.3,2.8)+tm*0.5)));
  vec3 bg = cosmosPal(f + 0.3*tm) * 1.8;

  // ========================================================================
  //  DIMENSIONAL TUNNEL  (only when diving) — three depth cues:
  //   (1) forward-rushing concentric rings   (2) radial wall shafts
  //   (3) bright vanishing-point throat glow + darkened near rim
  // ========================================================================
  if(dive > 0.02){
    vec2  cd = bent - center;
    float cl = max(length(cd), 1e-4);     // radius from centre (0 = far point)
    float ca = atan(cd.y, cd.x);          // angle around the tube

    // tube depth coordinate: 1/r maps screen radius → distance down the tube.
    float depth = 1.0 / (cl + 0.06);

    // (1) concentric rings rushing toward us as depth scrolls with time+dive
    float ringPhase = depth * ${CONFIG.tunnel.rings.toFixed(1)}
                    - (u_time * ${CONFIG.tunnel.ringSpeed.toFixed(1)} + dive*14.0);
    float rings = 0.5 + 0.5*sin(ringPhase*PI*2.0);
    rings = pow(rings, 3.0);              // crisp bright bands, dark gaps

    // (2) radial light shafts along the walls (rotational reference)
    float shafts = 0.5 + 0.5*sin(ca*${CONFIG.tunnel.shafts.toFixed(1)} + depth*1.5);
    shafts = pow(shafts, 4.0);

    // wall colour: warm tube material, brighter near walls (large cl)
    vec3 wallCol = cosmosPal(depth*0.15 + u_time*0.05);
    float wallLit = (rings*0.8 + shafts*0.4) * smoothstep(0.02, 0.30, cl);
    vec3 tube = wallCol * (0.4 + 1.6*wallLit);

    // (3) vanishing-point throat glow — bright far point we accelerate toward
    float throatGlow = ${CONFIG.tunnel.throatGlow.toFixed(1)} * exp(-cl*7.0);
    vec3 glowCol = mix(vec3(1.0,0.9,0.78), mix(vec3(1.0,0.55,0.2),vec3(0.5,0.7,1.0),u_accent), 0.4);
    tube += glowCol * throatGlow;

    // darken the near rim (edges) so depth reads — far is bright, near is dark
    tube *= 1.0 - smoothstep(0.32, 0.85, cl)*0.6;

    // blend cosmos → tube as the dive deepens
    bg = mix(bg, tube, smoothstep(0.05, 0.55, dive));
  }

  // —— soft vignette ——
  bg *= (1.0 - smoothstep(0.30,1.20,length(uv-0.5)*1.6)*0.18) * 0.85;

  // —— PHOTON RING (the only feature of the hole) ——
  float rh    = ${CONFIG.ring.radius} * u_zoom;
  float sigma = mix(${CONFIG.ring.sharp.toFixed(1)}, ${CONFIG.ring.soft.toFixed(1)}, smoothstep(0.0,0.6,dive));
  float rr    = rh * (1.0 + dive*2.6);
  float ring  = exp(-pow((d - rr)*sigma, 2.0));
  float ringVis = u_form * (0.55 + 0.45*(1.0-dive));
  vec3 ringHot = mix(vec3(1.0,0.95,0.88), mix(vec3(1.0,0.55,0.25),vec3(0.55,0.75,1.0),u_accent), 0.5);
  bg += ringHot * ring * ${CONFIG.ring.gain} * ringVis;

  // —— infall shimmer + clean dark swallow ——
  bg += vec3(0.02,0.06,0.15) * min(pull,4.0) * 0.12 * dive;
  bg *= 1.0 - smoothstep(0.86, 1.0, dive);

  // —— filmic tone-map ——
  bg = bg * 1.06 / (1.0 + 0.16*bg);

  // ========================================================================
  //  TEXT COMPOSITE — slides horizontally (u_textShift), blends per pixel
  // ========================================================================
  vec3 finalCol = bg;
  vec2 tuv = vec2(v_uv.x - u_textShift, v_uv.y);     // horizontal slide
  if(tuv.x > 0.0 && tuv.x < 1.0){
    vec4 glyph = texture2D(u_textTex, tuv);
    if(glyph.a > 0.004){
      bool wantsAccent = (glyph.r > 0.5 && glyph.g < 0.5);
      vec3 accentCol = mix(vec3(1.0,0.30,0.0), vec3(0.0,0.33,1.0), u_accent);
      float bgMatch = (u_accent < 0.5) ? smoothstep(0.22,0.50,bg.r) : smoothstep(0.22,0.50,bg.b);
      vec3 accentResolved = mix(accentCol, vec3(1.0), bgMatch);
      vec3 whiteResolved  = mix(vec3(1.0), vec3(0.92), smoothstep(0.6,0.9,bg.r));
      vec3 textCol = wantsAccent ? accentResolved : whiteResolved;
      finalCol = mix(finalCol, textCol, glyph.a * u_textAlpha);
    }
  }

  gl_FragColor = vec4(finalCol, 1.0);
}`;

// ============================================================================
//  §4 · MATH HELPERS
// ============================================================================
const seg     = (p, a, b) => Math.min(Math.max((p - a) / (b - a), 0), 1);
const smooth  = (t) => t * t * (3 - 2 * t);
const logZoom = (t, start, max) => start * Math.exp(smooth(t) * Math.log(max / start));

// ============================================================================
//  §5 · TEXT ENGINE
// ============================================================================
class TextEngine {
  constructor(gl) {
    this.gl = gl;
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.tex = gl.createTexture();
    this.ready = false;
    this.lastKey = "";
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
    const s = CONFIG.font.supersample;
    this.canvas.width = Math.max(2, Math.floor(w * s));
    this.canvas.height = Math.max(2, Math.floor(h * s));
    this.lastKey = "";
  }
  // heavier glyphs: fill + a small stroke pass to fatten the weight
  _heavy(txt, x, y, sizePx, spacing, accent) {
    const { ctx } = this;
    const fam = this.ready ? CONFIG.font.family : "Arial, sans-serif";
    ctx.font = `900 ${sizePx}px ${fam}`;
    ctx.lineJoin = "round";
    let cx = x;
    for (const ch of txt) {
      // accent flag = pure red (255,0,0); white = (255,255,255)
      const col = accent ? "rgb(255,0,0)" : "rgb(255,255,255)";
      ctx.fillStyle = col;
      ctx.strokeStyle = col;
      ctx.lineWidth = sizePx * 0.035;        // fatten weight
      ctx.fillText(ch, cx, y);
      ctx.strokeText(ch, cx, y);
      cx += ctx.measureText(ch).width + spacing;
    }
  }
  _badge(txt, x, y, sizePx) {
    const { ctx } = this;
    const fam = this.ready ? CONFIG.font.family : "Arial, sans-serif";
    ctx.font = `700 ${sizePx}px ${fam}`;
    ctx.fillStyle = "rgb(255,255,255)";
    let cx = x;
    for (const ch of txt) { ctx.fillText(ch, cx, y); cx += ctx.measureText(ch).width + sizePx*0.18; }
  }
  draw(beat) {
    const key = beat + (this.ready ? "1" : "0");
    if (key === this.lastKey) return;
    this.lastKey = key;
    const { ctx, canvas } = this;
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.textBaseline = "alphabetic";
    const padX = W * 0.05, topY = H * 0.42;
    const big = Math.floor(H * 0.090), small = Math.floor(H * 0.018), lh = big * 1.02;

    if (beat === "A") {
      this._badge("PORTFOLIO PROTOCOL // ACTIVE", padX, topY - big*0.7, small);
      this._heavy("ENGINEERING THE", padX, topY + big, big, big*-0.02, false);
      this._heavy("NEXT GENERATION.", padX, topY + big + lh, big, big*-0.02, true);
    } else if (beat === "B") {
      this._badge("TRACK RECORD // VERIFIED", padX, topY - big*0.7, small);
      this._heavy("SENIOR SOFTWARE", padX, topY + big, big*0.82, big*-0.02, false);
      this._heavy("ENGINEER", padX, topY + big + lh*0.82, big*0.82, big*-0.02, true);
      const stats = [["5+","YRS BUILDING"],["42%","PERF GAINS"],["500+","COMMITS / YR"]];
      let sx = padX; const sy = topY + big + lh*1.9;
      const fam = this.ready ? CONFIG.font.family : "Arial, sans-serif";
      stats.forEach(([n,l]) => {
        ctx.font = `900 ${big*0.34}px ${fam}`; ctx.fillStyle = "rgb(255,0,0)"; ctx.fillText(n, sx, sy);
        ctx.font = `700 ${small*0.85}px ${fam}`; ctx.fillStyle = "rgb(255,255,255)"; ctx.fillText(l, sx, sy + small*1.7);
        sx += W*0.18;
      });
    } else if (beat === "C") {
      this._badge("SYSTEMS // READY FOR DEPLOYMENT", padX, topY - big*0.7, small);
      this._heavy("NOW ENTERING", padX, topY + big, big*0.92, big*-0.02, false);
      this._heavy("DEEP SPACE.", padX, topY + big + lh*0.92, big*0.92, big*-0.02, true);
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
  // —— 6a · refs & state ——
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const bigNameRef = useRef(null);
  const hintRef = useRef(null);
  const lineRef = useRef(null);

  const mouseRef = useRef({ x: 0.5, y: 0.5, lastMove: 0 });
  const feedRef = useRef({ down: false, t: 0 });

  const S = useRef({
    zoom: CONFIG.zoom.start, form: 0, dive: 0, shift: 0,
    zoomT: CONFIG.zoom.start, formT: 0, diveT: 0, shiftT: 0,
    textAlpha: 0, beat: "A",
  });

  const pal = THEME[theme] || THEME.dark;

  // —— 6b/6c · WebGL + loop ——
  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas.getContext("webgl", { antialias: true, premultipliedAlpha: false });
    if (!gl) return;

    if (!document.querySelector("link[data-hero-font]")) {
      const l = document.createElement("link");
      l.rel = "stylesheet"; l.href = CONFIG.font.cssHref; l.setAttribute("data-hero-font","1");
      document.head.appendChild(l);
    }

    const text = new TextEngine(gl);
    const resize = () => {
      const w = canvas.offsetWidth, h = canvas.offsetHeight;
      canvas.width = w; canvas.height = h; gl.viewport(0,0,w,h); text.resize(w,h);
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    const onMove = (e) => { mouseRef.current = { x: e.clientX/window.innerWidth, y: 1 - e.clientY/window.innerHeight, lastMove: performance.now() }; };
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
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) console.error("Link:", gl.getProgramInfoLog(prog));
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(aPos); gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const U = (n) => gl.getUniformLocation(prog, n);
    const u = {
      res:U("u_res"), sing:U("u_sing"), time:U("u_time"), zoom:U("u_zoom"),
      mass:U("u_mass"), twist:U("u_twist"), form:U("u_form"), dive:U("u_dive"),
      accent:U("u_accent"), textTex:U("u_textTex"), textAlpha:U("u_textAlpha"), textShift:U("u_textShift"),
    };
    gl.uniform1f(u.accent, pal.glAccent);
    gl.uniform1i(u.textTex, 0);

    const start = performance.now();
    let birth = 0, sing = { x: 0.5, y: 0.5 }, raf;

    const tick = () => {
      const now = performance.now(), t = (now - start)/1000, st = S.current;

      st.zoom  += (st.zoomT  - st.zoom ) * CONFIG.ease.uZoom;
      st.form  += (st.formT  - st.form ) * CONFIG.ease.uForm;
      st.dive  += (st.diveT  - st.dive ) * CONFIG.ease.uDive;
      st.shift += (st.shiftT - st.shift) * CONFIG.ease.uShift;
      birth += (1 - birth) * CONFIG.ease.birth;

      const mass = birth * (0.0012 + st.form*0.014 + st.dive*st.dive*0.30);

      const fr = feedRef.current;
      if (fr.down) fr.t = Math.min(fr.t + 0.04, 2.5); else fr.t -= fr.t*0.02;

      const idle = now - mouseRef.current.lastMove > 2500;
      const tx = idle ? 0.5 + Math.sin(t*0.5)*-0.22 : mouseRef.current.x;
      const ty = idle ? 0.5 + Math.sin(t*0.6)* 0.16 : mouseRef.current.y;
      const lock = Math.max(st.form, Math.min(st.dive*3, 1));
      sing.x += ((tx*(1-lock)+0.5*lock) - sing.x)*CONFIG.ease.sing;
      sing.y += ((ty*(1-lock)+0.5*lock) - sing.y)*CONFIG.ease.sing;

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

  // —— 6d · SINGLE master timeline (fixes the name flight) ——
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
      gsap.set(lineRef.current, { scaleY: 0, transformOrigin: "top center" });

      const W = CONFIG.win;

      // ONE timeline. DOM tweens live on it; shader targets set in onUpdate.
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section, start: "top top", end: CONFIG.pinLength,
          pin: true, scrub: CONFIG.scrub, invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress, st = S.current;

            // camera: log recede → water-slide suck
            const out = seg(p, 0.0, CONFIG.zoom.outEnd);
            const zoomOut = logZoom(out, CONFIG.zoom.start, CONFIG.zoom.max);
            const suck = Math.pow(seg(p, W.suckStart, 1.0), 2.3);
            st.zoomT = zoomOut*(1 - suck) + CONFIG.zoom.suckEnd*suck;
            st.formT = smooth(seg(p, W.formStart, W.formEnd));
            st.diveT = suck;

            // —— beats: pick active beat, set alpha + horizontal SHIFT ——
            // shift convention: +0.5 = off right, 0 = centred, -0.5 = off left
            const evalBeat = ([tin, tout]) => {
              const tv = W.travel;
              const inP  = seg(p, tin, tin + tv);          // 0→1 entering
              const outP = seg(p, tout - tv, tout);        // 0→1 exiting
              const alpha = smooth(inP) * (1 - smooth(outP));
              // shift: from +0.5 (right) → 0 → -0.5 (left)
              const shift = 0.5*(1 - smooth(inP)) - 0.5*smooth(outP);
              return { alpha, shift };
            };
            const A = evalBeat(W.beatA), B = evalBeat(W.beatB), C = evalBeat(W.beatC);
            if (A.alpha >= B.alpha && A.alpha >= C.alpha)      { st.beat="A"; st.textAlpha=A.alpha; st.shiftT=A.shift; }
            else if (B.alpha >= C.alpha)                       { st.beat="B"; st.textAlpha=B.alpha; st.shiftT=B.shift; }
            else                                               { st.beat="C"; st.textAlpha=C.alpha; st.shiftT=C.shift; }

            gsap.set(lineRef.current, { scaleY: p });
          },
        },
      });

      // —— name flight, now ON the master timeline (positions = progress) ——
      tl.to(hintRef.current, { opacity: 0, duration: 0.04 }, W.flightIn);
      tl.to(bigName, {
        x: () => flight().x, y: () => flight().y, scale: () => flight().scale,
        ease: "power2.inOut", duration: W.flightOut - W.flightIn,
      }, W.flightIn);
      tl.to(bigName, { opacity: 0, duration: 0.02 }, W.flightOut);
      if (navLogo) tl.to(navLogo, { opacity: 1, duration: 0.03 }, W.navTakeover);

      // pad the timeline to full length so positions map 1:1 to scroll progress
      tl.to({}, { duration: 1 }, 1.0);
    }, section);

    return () => {
      const l = document.getElementById("navLogo");
      if (l) gsap.set(l, { opacity: 1 });
      ctx.revert();
    };
  }, []);

  // —— 6e · markup ——
  const noPointer = { pointerEvents: "none" };
  return (
    <main ref={sectionRef} id="hero"
      style={{ position: "relative", width: "100%", height: "100vh", overflow: "hidden", background: "#000" }}>
      <canvas ref={canvasRef} style={{ position:"absolute", inset:0, width:"100%", height:"100%", ...noPointer }} />

      <div ref={bigNameRef} style={{
        position:"absolute", left:"2vw", bottom:"4vh", zIndex:3,
        fontFamily:`${CONFIG.font.family}, sans-serif`,
        fontSize:"clamp(3.5rem,12.5vw,14rem)", fontWeight:900, letterSpacing:"-0.04em",
        lineHeight:0.85, color:"#fff", textTransform:"uppercase", whiteSpace:"nowrap",
        textShadow:"0 6px 40px rgba(0,0,0,0.55)", ...noPointer,
      }}>
        YOGESHWARAN
      </div>

      <div ref={hintRef} style={{
        position:"absolute", right:"4vw", bottom:"3vh", zIndex:3,
        fontSize:"0.8rem", fontWeight:700, letterSpacing:"3px",
        textTransform:"uppercase", color:"rgba(255,255,255,0.55)", ...noPointer,
      }}>
        Scroll to explore · Hold to feed the void
      </div>

      <div style={{ position:"absolute", right:"1.2vw", top:"15vh", bottom:"15vh", width:2, background:"rgba(255,255,255,0.08)", zIndex:3, ...noPointer }}>
        <div ref={lineRef} style={{ width:"100%", height:"100%", background: pal.accent }} />
      </div>
    </main>
  );
}