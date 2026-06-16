// ============================================================================
//  MountainReveal.jsx  ·  R3F dolly-zoom "the peak rises" cinematic
//
//  The mountain never moves. A low camera at its base looks up; as you scroll,
//  a DOLLY ZOOM (camera pushes IN while FOV WIDENS — the Vertigo effect) makes
//  the peak swell and loom, so it *feels* like K2 is rising out of the frame.
//
//  ── INSTALL ───────────────────────────────────────────────────────────────
//    npm install three @react-three/fiber @react-three/drei gsap
//
//  ── NO ASSET NEEDED ─────────────────────────────────────────────────────────
//    The peak is procedural (noise-displaced geometry), so nothing can render
//    "broken". To use a REAL K2 silhouette later, grab a heightmap PNG (e.g.
//    terrain.party / USGS), drop it at public/models/k2-heightmap.png, set
//    CONFIG.heightmapUrl and CONFIG.useHeightmap=true — one-line swap.
//
//  ── INTEGRATION ─────────────────────────────────────────────────────────────
//    import MountainReveal from "./MountainReveal";
//    <MountainReveal theme={theme} />
// ============================================================================

import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ============================================================================
//  CONFIG
// ============================================================================
const CONFIG = {
  pinLength: "+=340%",
  scrub: 1.0,

  useHeightmap: false,
  heightmapUrl: "/models/k2-heightmap.png",

  // —— DOLLY ZOOM (push-in + FOV-widen) ——
  // Camera moves CLOSER (z shrinks) while FOV WIDENS. The two partially cancel
  // on the mountain's mid-height but diverge at the peak → it swells/looms.
  dolly: {
    zStart: 16,   zEnd: 6.5,      // camera distance: pushes in
    fovStart: 32, fovEnd: 62,     // field of view: widens
    yStart: 1.2,  yEnd: 3.2,      // camera lifts slightly (more "rising")
    pitchStart: 0.16, pitchEnd: 0.40, // look-up angle increases
  },

  peak: { height: 9, baseRadius: 7, seed: 7.0 },
};

const THEME = {
  dark:  { accent: "#ff4d00", sky: ["#2a1c16", "#0c0a0f"], rock: "#3a3330", snow: "#e9e4dd", rim: "#ff6a2a", haze: "#1a1410" },
  light: { accent: "#0055ff", sky: ["#1c2740", "#0a0f1c"], rock: "#3b4250", snow: "#eef3ff", rim: "#5b8bff", haze: "#141b2b" },
};

// ============================================================================
//  PROCEDURAL PEAK  — ridged noise displacement forms a sharp K2-like pyramid
// ============================================================================
function hashNoise(x, y, seed) {
  const s = Math.sin(x * 127.1 + y * 311.7 + seed * 53.3) * 43758.5453;
  return s - Math.floor(s);
}
function smoothN(x, y, seed) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hashNoise(xi, yi, seed), b = hashNoise(xi + 1, yi, seed);
  const c = hashNoise(xi, yi + 1, seed), d = hashNoise(xi + 1, yi + 1, seed);
  return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
}
function ridged(x, y, seed) {
  let val = 0, amp = 0.5, freq = 1;
  for (let i = 0; i < 6; i++) {
    const n = 1 - Math.abs(2 * smoothN(x * freq, y * freq, seed + i) - 1); // ridge
    val += n * amp; amp *= 0.5; freq *= 2.07;
  }
  return val;
}

function Mountain({ pal }) {
  const geo = useMemo(() => {
    const P = CONFIG.peak;
    const g = new THREE.ConeGeometry(P.baseRadius, P.height, 96, 48, true);
    const pos = g.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const heightFrac = (v.y + P.height / 2) / P.height;      // 0 base → 1 peak
      const ang = Math.atan2(v.z, v.x);
      // ridged noise around the cone → jagged mountain faces
      const r = ridged(Math.cos(ang) * 2 + 5, Math.sin(ang) * 2 + 5, P.seed);
      const detail = ridged(v.y * 0.6 + 3, ang * 1.5 + 2, P.seed + 10);
      const disp = (r * 0.9 + detail * 0.5) * (1 - heightFrac * 0.4); // less wobble near tip
      const radial = new THREE.Vector3(v.x, 0, v.z).normalize();
      v.addScaledVector(radial, disp);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    return g;
  }, []);

  // snow line via vertex-color-ish gradient using a custom material onBeforeCompile
  const mat = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({ color: pal.rock, roughness: 0.92, metalness: 0.04, flatShading: true });
    m.onBeforeCompile = (shader) => {
      shader.uniforms.uSnow = { value: new THREE.Color(pal.snow) };
      shader.uniforms.uPeakY = { value: CONFIG.peak.height / 2 };
      shader.vertexShader = "varying float vY;\n" + shader.vertexShader.replace(
        "#include <begin_vertex>", "#include <begin_vertex>\n vY = position.y;"
      );
      shader.fragmentShader = "varying float vY;\nuniform vec3 uSnow;\nuniform float uPeakY;\n" +
        shader.fragmentShader.replace(
          "#include <color_fragment>",
          "#include <color_fragment>\n float snow = smoothstep(uPeakY*0.15, uPeakY*0.6, vY);\n diffuseColor.rgb = mix(diffuseColor.rgb, uSnow, snow);"
        );
    };
    return m;
  }, [pal.rock, pal.snow]);

  return <mesh geometry={geo} material={mat} position={[0, CONFIG.peak.height / 2 - 0.5, 0]} castShadow receiveShadow />;
}

// foreground ridge silhouettes for depth (parallax layers near camera)
function ForegroundRidges({ pal }) {
  const ridges = useMemo(() => {
    const arr = [];
    for (let k = 0; k < 3; k++) {
      const pts = [];
      const z = 6 - k * 1.5, baseY = -2 - k * 0.4, width = 30;
      for (let i = 0; i <= 40; i++) {
        const x = -width / 2 + (width * i) / 40;
        const h = baseY + ridged(x * 0.3 + k * 5, k * 3, CONFIG.peak.seed + k) * (1.6 + k);
        pts.push(new THREE.Vector2(x, h));
      }
      pts.push(new THREE.Vector2(width / 2, -12), new THREE.Vector2(-width / 2, -12));
      const shape = new THREE.Shape(pts);
      arr.push({ geo: new THREE.ShapeGeometry(shape), z, shade: 0.12 + k * 0.06 });
    }
    return arr;
  }, []);
  return (
    <group>
      {ridges.map((r, i) => (
        <mesh key={i} geometry={r.geo} position={[0, 0, r.z]}>
          <meshBasicMaterial color={new THREE.Color(pal.haze).multiplyScalar(1 + r.shade)} />
        </mesh>
      ))}
    </group>
  );
}

// drifting atmospheric haze particles
function Haze({ pal, count = 120 }) {
  const ref = useRef();
  const positions = useMemo(() => {
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      a[i * 3] = (Math.random() - 0.5) * 30;
      a[i * 3 + 1] = Math.random() * 10 - 1;
      a[i * 3 + 2] = (Math.random() - 0.5) * 8 + 2;
    }
    return a;
  }, [count]);
  useFrame((s) => {
    if (ref.current) ref.current.rotation.y = s.clock.elapsedTime * 0.01;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.18} color={pal.snow} transparent opacity={0.12} depthWrite={false} sizeAttenuation />
    </points>
  );
}

// ============================================================================
//  DOLLY ZOOM RIG  — the cinematic core
// ============================================================================
function DollyRig({ progressRef }) {
  const { camera } = useThree();
  const D = CONFIG.dolly;
  useFrame(() => {
    const p = progressRef.current;
    const e = THREE.MathUtils.smoothstep(p, 0, 1);
    // push IN
    camera.position.z = THREE.MathUtils.lerp(D.zStart, D.zEnd, e);
    camera.position.y = THREE.MathUtils.lerp(D.yStart, D.yEnd, e);
    camera.position.x = 0;
    // FOV WIDENS (the dolly-zoom warp)
    camera.fov = THREE.MathUtils.lerp(D.fovStart, D.fovEnd, e);
    camera.updateProjectionMatrix();
    // look-up angle increases → peak towers
    const pitch = THREE.MathUtils.lerp(D.pitchStart, D.pitchEnd, e);
    camera.lookAt(0, CONFIG.peak.height * (0.45 + pitch), 0);
  });
  return null;
}

function Scene({ pal, progressRef }) {
  return (
    <>
      <fog attach="fog" args={[pal.haze, 14, 40]} />
      {/* gradient sky via large backdrop sphere */}
      <mesh scale={[-1, 1, 1]}>
        <sphereGeometry args={[60, 32, 32]} />
        <meshBasicMaterial side={THREE.BackSide} color={pal.sky[1]} />
      </mesh>

      <ambientLight intensity={0.45} />
      {/* sun: low, warm, raking across the peak (golden-hour rim) */}
      <directionalLight
        position={[-8, 10, 6]} intensity={2.6} color={pal.snow}
        castShadow shadow-mapSize={[2048, 2048]}
      />
      {/* accent rim from behind the peak */}
      <directionalLight position={[6, 8, -8]} intensity={1.8} color={pal.rim} />
      {/* soft up-fill */}
      <pointLight position={[0, -2, 8]} intensity={0.8} color={pal.accent} distance={20} />

      <Mountain pal={pal} />
      <ForegroundRidges pal={pal} />
      <Haze pal={pal} />

      <DollyRig progressRef={progressRef} />
    </>
  );
}

// ============================================================================
//  COMPONENT
// ============================================================================
export default function MountainReveal({ theme = "dark" }) {
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
               background: `linear-gradient(180deg, ${pal.sky[0]}, ${pal.sky[1]})` }}
    >
      <Canvas
        shadows
        dpr={dpr}
        camera={{ position: [0, CONFIG.dolly.yStart, CONFIG.dolly.zStart], fov: CONFIG.dolly.fovStart }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        style={{ position: "absolute", inset: 0 }}
      >
        <Scene pal={pal} progressRef={progressRef} />
      </Canvas>

      {/* overlay copy */}
      <div style={{ position: "absolute", left: "5vw", bottom: "9vh", zIndex: 2, pointerEvents: "none", color: "#fff", maxWidth: "min(90vw,640px)" }}>
        <span style={{ display: "block", marginBottom: "0.8rem", fontSize: "0.8rem", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", color: pal.accent }}>
          The Ascent // K2
        </span>
        <h2 style={{ margin: 0, fontWeight: 900, textTransform: "uppercase", lineHeight: 0.95, letterSpacing: "-2px", fontSize: "clamp(2.2rem,6vw,5.5rem)" }}>
          No Summit<br />Without<br />The Climb.
        </h2>
      </div>
    </section>
  );
}