// ============================================================================
//  K2Reveal.jsx  ·  cinematic crane-up mountain reveal
//
//  Reads like the reference clip: a lone figure stands on a near ridge against
//  empty sky — no mountain visible. As you scroll, the camera CRANES UP and
//  back; the foreground ridge drops in frame and a massive snow peak that was
//  always there (hidden behind the ridge) is unveiled, towering behind the
//  figure for scale.
//
//  TECHNIQUE (matched to "I won't rotate it, minimal 3D"):
//   · the peak is a static, heavily-shaded displaced mesh — a BACKDROP
//   · a foreground ridge mesh OCCLUDES it at the start; the crane reveals it
//   · realism budget spent on: snow/rock shading, rim light, atmospheric haze
//     band between camera and peak, and the clean silhouette reveal
//   · camera only translates/tilts (a crane) — no orbiting, no model spin
//
//  INSTALL:  npm install three @react-three/fiber @react-three/drei gsap
//  USE:      import K2Reveal from "./K2Reveal";  <K2Reveal theme={theme} />
// ============================================================================

import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ============================================================================
//  CONFIG  — all cinematic dials
// ============================================================================
const CONFIG = {
  pinLength: "+=1000%",
  scrub: 1.1,

  // —— CRANE CAMERA ——
  // Reveal comes mostly from TILT (rotation, which doesn't change the ridge's
  // size) + a gentle push-in. Peak is far, ridge is near → parallax keeps the
  // ridge stable while the distant peak climbs into the frame.
  crane: {
    posStart: [0, -5, 10],     // low, moderately back
    posEnd:   [0, 10.0, 14],     // gentle push-in only (not a big dolly)
    lookStart:[0, 20, -75],     // tilted UP at empty sky over the ridge
    lookEnd:  [0, 12, -75],     // tilts DOWN onto the peak
    fov: 46,
  },

  peak: {
    pos: [0, -35, -75],           // FAR back → push-in barely enlarges it (parallax)
    width: 130, depth: 46, height: 70,
    snowLine: 0.30,
    seed: 11.0,
  },

  ridge: { pos: [0, -10, -6], width: 90, height: 24, seed: 4.0 },  // NEAR camera, stable foreground

  figure: { pos: [2.2, 1.2, -6], height: 2.0 },
};

const THEME = {
  dark: {
    accent: "#ff4d00",
    skyTop: "#0d4a86", skyBot: "#7db4dd",   // deep alpine blue → pale horizon
    rock: "#2c2622", snow: "#f2f4f8", snowShadow: "#9fb4cf",
    rim: "#ffd9a0", haze: "#bcd4e6", figure: "#0a0a0c",
  },
  light: {
    accent: "#0055ff",
    skyTop: "#0d4a86", skyBot: "#9cc6e6",
    rock: "#322c28", snow: "#f6f8fc", snowShadow: "#aebfd6",
    rim: "#fff0d4", haze: "#cfe0ee", figure: "#0a0a0c",
  },
};

// ============================================================================
//  NOISE  — ridged multifractal for sharp alpine ridgelines
// ============================================================================
function hash(x, y, s) { const v = Math.sin(x * 127.1 + y * 311.7 + s * 53.3) * 43758.5453; return v - Math.floor(v); }
function snoise(x, y, s) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi, s), b = hash(xi + 1, yi, s), c = hash(xi, yi + 1, s), d = hash(xi + 1, yi + 1, s);
  return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
}
function fbm(x, y, s, oct = 6) {
  let val = 0, amp = 0.5, freq = 1;
  for (let i = 0; i < oct; i++) { val += amp * snoise(x * freq, y * freq, s + i); amp *= 0.5; freq *= 2.03; }
  return val;
}
function ridgedFbm(x, y, s, oct = 6) {
  let val = 0, amp = 0.5, freq = 1, prev = 1;
  for (let i = 0; i < oct; i++) {
    let n = 1 - Math.abs(2 * snoise(x * freq, y * freq, s + i) - 1);
    n = n * n; n *= prev; prev = n;
    val += n * amp; amp *= 0.5; freq *= 2.07;
  }
  return val;
}

// ============================================================================
//  THE PEAK  — a wide displaced plane shaped into a towering pyramidal massif
// ============================================================================
function Peak({ pal }) {
  const geo = useMemo(() => {
    const P = CONFIG.peak;
    const seg = 220;
    const g = new THREE.PlaneGeometry(P.width, P.height, seg, Math.floor(seg * 0.65));
    const pos = g.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const cRock = new THREE.Color(pal.rock);
    const cSnow = new THREE.Color(pal.snow);
    const cSnowSh = new THREE.Color(pal.snowShadow);
    const v = new THREE.Vector3();

    // first pass: compute displaced Y/Z and store, so we can derive slope after
    const H = new Float32Array(pos.count);   // final height
    const Zd = new Float32Array(pos.count);  // depth
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const nx = v.x / P.width + 0.5;
      const ny = v.y / P.height + 0.5;
      const distC = Math.abs(v.x / (P.width * 0.5));
      const pyramid = Math.pow(Math.max(0, 1 - distC), 1.5);
      const r = ridgedFbm(nx * 6 + 2, ny * 5 + 1, P.seed);
      const detail = fbm(nx * 18, ny * 14, P.seed + 20) * 0.25;
      const yBoost = pyramid * P.height * 0.55 * (0.7 + r * 0.5);
      const z = (pyramid * 1.0 + r * 0.5) * P.depth * 0.5 + detail * P.depth * 0.15;
      H[i] = v.y * 0.5 + yBoost;
      Zd[i] = z;
    }

    // SOLID BASE: any vertex on the plane's bottom row is dragged far DOWN and
    // forward, so the mountain has a closed skirt — no sky shows through (fixes
    // the blue "hole"). We detect bottom-row verts by their original y.
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const isBottom = v.y <= -P.height / 2 + 0.001;
      let y = H[i];
      let z = Zd[i];
      if (isBottom) { y = -P.height; z = P.depth * 0.6; }   // skirt drops below ridge
      pos.setXYZ(i, v.x, y, z);
    }
    g.computeVertexNormals();

    // second pass: slope-based colouring (snow on flat/high, rock on steep)
    const norm = g.attributes.normal;
    const up = new THREE.Vector3(0, 1, 0);
    const n = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const heightFrac = THREE.MathUtils.clamp((y + P.height) / (P.height * 1.6), 0, 1);
      n.set(norm.getX(i), norm.getY(i), norm.getZ(i));
      const slope = Math.max(0, n.dot(up));        // 1 = flat, 0 = vertical
      // snow needs both altitude AND a not-too-steep face
      let snowAmt = THREE.MathUtils.clamp((heightFrac - P.snowLine) / (1 - P.snowLine), 0, 1);
      snowAmt *= THREE.MathUtils.smoothstep(slope, 0.25, 0.7);   // steep = bare rock
      snowAmt = Math.pow(snowAmt, 0.8);
      // gully AO from a noise lookup
      const ao = THREE.MathUtils.clamp(0.5 + slope * 0.6, 0.4, 1);
      const snowCol = cSnow.clone().lerp(cSnowSh, (1 - ao) * 0.9);
      const col = cRock.clone().lerp(snowCol, snowAmt);
      colors[i * 3] = col.r; colors[i * 3 + 1] = col.g; colors[i * 3 + 2] = col.b;
    }
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return g;
  }, [pal]);

  return (
    <mesh geometry={geo} position={CONFIG.peak.pos} castShadow receiveShadow>
      <meshStandardMaterial vertexColors roughness={0.92} metalness={0.02} flatShading />
    </mesh>
  );
}

// ============================================================================
//  FOREGROUND RIDGE  — the dark near ground the figure stands on; OCCLUDES the
//  peak at the start, revealed-past as the camera cranes up.
// ============================================================================
function Ridge({ pal }) {
  const geo = useMemo(() => {
    const R = CONFIG.ridge;
    const seg = 160;
    const g = new THREE.PlaneGeometry(R.width, R.height, seg, 40);
    const pos = g.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const nx = v.x / R.width + 0.5;
      // jagged top edge only near the top of the plane
      const topness = THREE.MathUtils.clamp((v.y / R.height) + 0.5, 0, 1);
      const jag = ridgedFbm(nx * 9 + 3, 2, R.seed) * 2.2;
      const rocky = fbm(nx * 30, v.y * 2, R.seed + 5) * 0.5;
      pos.setXYZ(i, v.x, v.y + jag * topness + rocky, v.z + fbm(nx * 12, 1, R.seed + 9) * 2.5);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <mesh geometry={geo} position={CONFIG.ridge.pos} rotation={[-0.08, 0, 0]} receiveShadow castShadow>
      <meshStandardMaterial color={pal.rock} roughness={1} metalness={0} flatShading />
    </mesh>
  );
}

// lone figure silhouette on the ridge (scale + the reference's lone man)
function Figure({ pal }) {
  const F = CONFIG.figure;
  return (
    <group position={F.pos}>
      {/* body */}
      <mesh position={[0, F.height * 0.5, 0]} castShadow>
        <capsuleGeometry args={[F.height * 0.16, F.height * 0.55, 4, 12]} />
        <meshStandardMaterial color={pal.figure} roughness={0.9} />
      </mesh>
      {/* head */}
      <mesh position={[0, F.height * 0.92, 0]} castShadow>
        <sphereGeometry args={[F.height * 0.13, 16, 16]} />
        <meshStandardMaterial color={pal.figure} roughness={0.9} />
      </mesh>
    </group>
  );
}

// gradient sky dome
function Sky({ pal }) {
  const mat = useMemo(() => {
    const m = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: { top: { value: new THREE.Color(pal.skyTop) }, bot: { value: new THREE.Color(pal.skyBot) } },
      vertexShader: `varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);} `,
      fragmentShader: `varying vec3 vP; uniform vec3 top; uniform vec3 bot;
        void main(){ float h = normalize(vP).y*0.5+0.5; gl_FragColor = vec4(mix(bot, top, smoothstep(-0.1,0.95,h)),1.0);} `,
    });
    return m;
  }, [pal]);
  return <mesh material={mat}><sphereGeometry args={[200, 32, 32]} /></mesh>;
}

// atmospheric haze band between camera and peak (depth + realism)
function HazeBand({ pal }) {
  return (
    <mesh position={[0, 3, -58]}>
      <planeGeometry args={[260, 30]} />
      <meshBasicMaterial color={pal.haze} transparent opacity={0.16} depthWrite={false} />
    </mesh>
  );
}

// ============================================================================
//  CRANE CAMERA RIG
// ============================================================================
function CraneRig({ progressRef }) {
  const { camera } = useThree();
  const C = CONFIG.crane;
  const look = useRef(new THREE.Vector3(...C.lookStart));
  useFrame(() => {
    const p = progressRef.current;
    const e = THREE.MathUtils.smoothstep(p, 0, 1);
    camera.position.set(
      THREE.MathUtils.lerp(C.posStart[0], C.posEnd[0], e),
      THREE.MathUtils.lerp(C.posStart[1], C.posEnd[1], e),
      THREE.MathUtils.lerp(C.posStart[2], C.posEnd[2], e),
    );
    look.current.set(
      THREE.MathUtils.lerp(C.lookStart[0], C.lookEnd[0], e),
      THREE.MathUtils.lerp(C.lookStart[1], C.lookEnd[1], e),
      THREE.MathUtils.lerp(C.lookStart[2], C.lookEnd[2], e),
    );
    camera.lookAt(look.current);
  });
  return null;
}

function Scene({ pal, progressRef }) {
  return (
    <>
      <Sky pal={pal} />
      <fog attach="fog" args={[pal.haze, 45, 130]} />

      <ambientLight intensity={0.55} />
      {/* sun: high, slightly back-left → lights the snow faces, casts long shadow */}
      <directionalLight
        position={[-14, 30, -30]} intensity={2.8} color={"#fff6ec"}
        castShadow shadow-mapSize={[2048, 2048]}
        shadow-camera-near={1} shadow-camera-far={200}
        shadow-camera-left={-90} shadow-camera-right={90}
        shadow-camera-top={90} shadow-camera-bottom={-90}
      />
      {/* warm rim from sun side edge */}
      <directionalLight position={[18, 14, -20]} intensity={1.2} color={pal.rim} />
      {/* cool sky fill */}
      <hemisphereLight args={[pal.skyTop, pal.rock, 0.5]} />

      <Peak pal={pal} />
      <HazeBand pal={pal} />
      <Ridge pal={pal} />
      <Figure pal={pal} />

      <CraneRig progressRef={progressRef} />
    </>
  );
}

// ============================================================================
//  COMPONENT
// ============================================================================
export default function K2Reveal({ theme = "dark" }) {
  const sectionRef = useRef(null);
  const progressRef = useRef(0);
  const [dpr, setDpr] = useState(1);
  const pal = THEME[theme] || THEME.dark;

  useEffect(() => {
    const mob = window.innerWidth < 768;
    setDpr(Math.min(window.devicePixelRatio || 1, mob ? 1.3 : 1.8));
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section, start: "top top", end: CONFIG.pinLength,
        pin: true, scrub: CONFIG.scrub, invalidateOnRefresh: true,
        onUpdate: (self) => { progressRef.current = self.progress; },
      });
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="ascent"
      style={{ position: "relative", width: "100%", height: "100vh", overflow: "hidden",
               background: pal.skyTop }}
    >
      <Canvas
        shadows
        dpr={dpr}
        camera={{ position: CONFIG.crane.posStart, fov: CONFIG.crane.fov }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        style={{ position: "absolute", inset: 0 }}
      >
        <Scene pal={pal} progressRef={progressRef} />
      </Canvas>

      <div style={{ position: "absolute", left: "5vw", bottom: "9vh", zIndex: 2, pointerEvents: "none", color: "#fff", maxWidth: "min(90vw,640px)", textShadow: "0 4px 30px rgba(0,0,0,0.5)" }}>
        {/* <span style={{ display: "block", marginBottom: "0.8rem", fontSize: "0.8rem", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", color: pal.accent }}>
          The Ascent
        </span> */}
        <h2 style={{ margin: 0, fontWeight: 900, textTransform: "uppercase", lineHeight: 0.95, letterSpacing: "-2px", fontSize: "clamp(2.2rem,6vw,5.5rem)" }}>
          Think big
        </h2>
      </div>
    </section>
  );
}