// ============================================================================
//  MechReveal.jsx  ·  React Three Fiber cinematic "mech rises from the ground"
//
//  A pinned, scroll-driven 3D scene: a cracked, damaged ground plane sits in a
//  hazy lit void; as you scroll, a mech slowly rises out of a broken crater in
//  the surface, lit dramatically (key + warm rim), with drifting dust.
//
//  ── INSTALL ───────────────────────────────────────────────────────────────
//    npm install three @react-three/fiber @react-three/drei gsap
//
//  ── THE MODEL YOU NEED (only asset required) ────────────────────────────────
//    Format : .glb  (GLTF binary — single file, textures embedded)
//    Source : https://quaternius.com  → "Robots" / "Mechs" pack  (CC0, no
//             attribution required). Or Sketchfab, filtered to "Downloadable"
//             + license "CC0" or "CC-BY" (CC-BY needs a credit line).
//    Specs  : • single mesh or grouped, Y-up, facing +Z
//             • real-world-ish scale is fine — we normalise it at runtime
//             • keep it under ~5 MB / ~100k tris for web (Quaternius models are
//               low-poly and perfect for this)
//    Place  : put the file at   public/models/mech.glb
//             (Vite/CRA serve /public at the site root, so the URL is
//              "/models/mech.glb" — already set in CONFIG.modelUrl below.)
//
//    If you have NO model yet, the component renders a BLOCKY PLACEHOLDER mech
//    (built from primitives) so you can wire up and test the scroll/lighting
//    first, then drop the real .glb in later — set CONFIG.userealModel=true.
//
//  ── INTEGRATION (Portfolio.jsx) ─────────────────────────────────────────────
//    import MechReveal from "./MechReveal";
//    ...place it as your 2nd cinematic section, e.g. after the hero or wherever
//    you want the reveal:
//      <MechReveal theme={theme} />
// ============================================================================

import React, { useRef, useMemo, Suspense, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ============================================================================
//  CONFIG
// ============================================================================
const CONFIG = {
  modelUrl:import.meta.env.BASE_URL + "/models/mech.glb",
  useRealModel: true,         // ← your uploaded model is enabled
  pinLength: "+=320%",        // scroll distance for the reveal
  scrub: 1.0,

  // ── orientation fix for the uploaded model ──
  // Inspection showed the model's tall axis is Z (it's modelled lying down),
  // so we stand it up with a -90° X rotation. Tweak if it faces wrong.
  modelRotation: [-Math.PI / 2, 0, 0],   // [x, y, z] radians — stands it upright
  modelFaceY: Math.PI,                    // extra Y spin so it faces the camera

  mech: {
    normalizeHeight: 3.2,     // model scaled so its standing height ≈ this
    buriedY: -3.4,            // start: fully sunk below ground
    risenY: 0.05,             // end: standing on the surface
    startRotY: -0.6,
    endRotY: 0.0,
  },

  camera: {
    start: [0, 1.2, 9],
    end: [0, 2.4, 6.2],
    fov: 38,
  },
};

// theme → lighting accent
const THEME = {
  dark:  { accent: "#ff4d00", fog: "#241813", ground: "#2a201a", key: "#fff2e6", rim: "#ff5a1e" },
  light: { accent: "#0055ff", fog: "#141b2b", ground: "#1b2230", key: "#eaf0ff", rim: "#3b7bff" },
};

// ============================================================================
//  CRACKED GROUND  — a displaced plane with a crater the mech rises through
// ============================================================================
function CrackedGround({ pal }) {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(40, 40, 120, 120);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const r = Math.hypot(v.x, v.z);
      // rocky noise
      let h = (Math.sin(v.x * 1.7) * Math.cos(v.z * 1.9) * 0.18)
            + (Math.sin(v.x * 0.6 + 2.0) * 0.25)
            + (Math.random() * 0.10);
      // carve a crater near the centre where the mech emerges
      const crater = Math.max(0, 1.6 - r);          // inside radius 1.6
      h -= crater * crater * 0.9;                    // deep dip
      // raised jagged rim around the crater
      const rim = Math.exp(-Math.pow(r - 1.8, 2) * 3.0);
      h += rim * (0.3 + Math.random() * 0.25);
      pos.setY(i, h);
    }
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <mesh geometry={geo} receiveShadow>
      <meshStandardMaterial color={pal.ground} roughness={0.95} metalness={0.05} flatShading />
    </mesh>
  );
}

// scattered rubble rocks around the crater
function Rubble({ pal, count = 60 }) {
  const rocks = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 1.6 + Math.random() * 6;
      arr.push({
        pos: [Math.cos(a) * r, -0.1 + Math.random() * 0.2, Math.sin(a) * r],
        rot: [Math.random() * 3, Math.random() * 3, Math.random() * 3],
        s: 0.12 + Math.random() * 0.35,
      });
    }
    return arr;
  }, [count]);
  return (
    <group>
      {rocks.map((rk, i) => (
        <mesh key={i} position={rk.pos} rotation={rk.rot} castShadow receiveShadow>
          <dodecahedronGeometry args={[rk.s, 0]} />
          <meshStandardMaterial color={pal.ground} roughness={1} metalness={0.05} flatShading />
        </mesh>
      ))}
    </group>
  );
}

// ============================================================================
//  PLACEHOLDER MECH  — blocky primitive robot so you can test without a model
// ============================================================================
function PlaceholderMech({ pal }) {
  return (
    <group>
      {/* torso */}
      <mesh position={[0, 1.6, 0]} castShadow>
        <boxGeometry args={[1.1, 1.3, 0.7]} />
        <meshStandardMaterial color="#2a2a30" metalness={0.8} roughness={0.35} />
      </mesh>
      {/* head */}
      <mesh position={[0, 2.55, 0.05]} castShadow>
        <boxGeometry args={[0.5, 0.45, 0.5]} />
        <meshStandardMaterial color="#3a3a42" metalness={0.85} roughness={0.3} />
      </mesh>
      {/* glowing eye */}
      <mesh position={[0, 2.58, 0.31]}>
        <boxGeometry args={[0.34, 0.06, 0.02]} />
        <meshStandardMaterial color={pal.accent} emissive={pal.accent} emissiveIntensity={3} toneMapped={false} />
      </mesh>
      {/* shoulders */}
      {[-0.85, 0.85].map((x, i) => (
        <mesh key={i} position={[x, 2.0, 0]} castShadow>
          <boxGeometry args={[0.5, 0.5, 0.7]} />
          <meshStandardMaterial color="#26262c" metalness={0.8} roughness={0.4} />
        </mesh>
      ))}
      {/* arms */}
      {[-1.05, 1.05].map((x, i) => (
        <mesh key={i} position={[x, 1.2, 0]} castShadow>
          <boxGeometry args={[0.32, 1.3, 0.32]} />
          <meshStandardMaterial color="#2f2f36" metalness={0.75} roughness={0.4} />
        </mesh>
      ))}
      {/* chest core glow */}
      <mesh position={[0, 1.7, 0.36]}>
        <circleGeometry args={[0.18, 24]} />
        <meshStandardMaterial color={pal.accent} emissive={pal.accent} emissiveIntensity={2.5} toneMapped={false} />
      </mesh>
      {/* legs */}
      {[-0.32, 0.32].map((x, i) => (
        <mesh key={i} position={[x, 0.4, 0]} castShadow>
          <boxGeometry args={[0.4, 1.1, 0.4]} />
          <meshStandardMaterial color="#26262c" metalness={0.8} roughness={0.45} />
        </mesh>
      ))}
    </group>
  );
}

// real GLB model: stand it upright, normalize height, recenter, apply material
function RealMech({ pal }) {
  const { scene } = useGLTF(CONFIG.modelUrl);
  const normalized = useMemo(() => {
    const clone = scene.clone(true);

    // 1) stand the model upright (it was modelled lying down on Z)
    clone.rotation.set(...CONFIG.modelRotation);
    clone.rotateY(CONFIG.modelFaceY);
    clone.updateMatrixWorld(true);

    // 2) bake that rotation into a wrapper so scaling/centering is clean
    const wrap = new THREE.Group();
    wrap.add(clone);
    wrap.updateMatrixWorld(true);

    // 3) normalize height
    const box = new THREE.Box3().setFromObject(wrap);
    const size = new THREE.Vector3(); box.getSize(size);
    // const s = CONFIG.mech.normalizeHeight / (size.y || 1);
    // wrap.scale.setScalar(s);

    // 4) recenter on its base (feet at y=0) and centre on X/Z
    wrap.updateMatrixWorld(true);
    const box2 = new THREE.Box3().setFromObject(wrap);
    const c = new THREE.Vector3(); box2.getCenter(c);
    wrap.position.x -= c.x;
    wrap.position.z -= c.z;
    wrap.position.y -= box2.min.y;

    // 5) the model has no materials — give every mesh a brushed-metal look
    //    with a faint accent-emissive so it reads in the dark.
    // wrap.traverse((o) => {
    //   if (o.isMesh) {
    //     o.castShadow = true;
    //     o.receiveShadow = true;
    //     o.material = new THREE.MeshStandardMaterial({
    //       color: "#3a3d44",
    //       metalness: 0.85,
    //       roughness: 0.38,
    //       emissive: new THREE.Color(pal.accent),
    //       emissiveIntensity: 0.06,
    //       flatShading: false,
    //     });
    //   }
    // });
    const s = CONFIG.mech.normalizeHeight / size.y;
    wrap.scale.setScalar(s);
    return wrap;
  }, [scene, pal.accent]);

  return <primitive object={normalized} />;
}

// ============================================================================
//  THE MECH GROUP  — driven by scroll progress (via a ref the scene reads)
// ============================================================================
function Mech({ pal, progressRef }) {
  const group = useRef();
  const M = CONFIG.mech;

  useFrame(() => {
    if (!group.current) return;
    const p = progressRef.current;                  // 0..1 scroll progress
    // rise mostly in the middle of the scroll, eased
    const rise = THREE.MathUtils.smoothstep(p, 0.12, 0.82);
    group.current.position.y = THREE.MathUtils.lerp(M.buriedY, M.risenY, rise);
    group.current.rotation.y = THREE.MathUtils.lerp(M.startRotY, M.endRotY, rise)
                             + Math.sin(p * Math.PI) * 0.05;            // subtle sway
    // a slow idle turn once fully risen
    if (p > 0.82) group.current.rotation.y += (p - 0.82) * 0.6;
  });

  return (
    <group ref={group} position={[0, M.buriedY, 0]}>
      {CONFIG.useRealModel ? <RealMech pal={pal} /> : <PlaceholderMech pal={pal} />}
    </group>
  );
}

// dust particles drifting up from the crater as the mech rises
function Dust({ pal, progressRef, count = 220 }) {
  const ref = useRef();
  const data = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() * 2.2;
      arr.push({ x: Math.cos(a) * r, z: Math.sin(a) * r, y: Math.random() * 4, sp: 0.2 + Math.random() * 0.8, ph: Math.random() * 6 });
    }
    return arr;
  }, [count]);

  const positions = useMemo(() => new Float32Array(count * 3), [count]);

  useFrame((state) => {
    const p = progressRef.current;
    const burst = THREE.MathUtils.smoothstep(p, 0.12, 0.6);   // dust kicks up as it rises
    const t = state.clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const d = data[i];
      const y = ((d.y + t * d.sp) % 4);
      positions[i * 3] = d.x + Math.sin(t * 0.5 + d.ph) * 0.2;
      positions[i * 3 + 1] = y * burst;
      positions[i * 3 + 2] = d.z + Math.cos(t * 0.4 + d.ph) * 0.2;
    }
    if (ref.current) {
      ref.current.geometry.attributes.position.needsUpdate = true;
      ref.current.material.opacity = 0.28 * burst;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color={pal.key} transparent opacity={0} depthWrite={false} sizeAttenuation />
    </points>
  );
}

// ============================================================================
//  SCENE  — camera + lights, reads the same scroll progress ref
// ============================================================================
function Scene({ pal, progressRef }) {
  const { camera } = useThree();
  const C = CONFIG.camera;

  useFrame(() => {
    const p = progressRef.current;
    const e = THREE.MathUtils.smoothstep(p, 0, 1);
    camera.position.set(
      THREE.MathUtils.lerp(C.start[0], C.end[0], e),
      THREE.MathUtils.lerp(C.start[1], C.end[1], e),
      THREE.MathUtils.lerp(C.start[2], C.end[2], e)
    );
    camera.lookAt(0, 1.4, 0);
  });

  return (
    <>
      <fog attach="fog" args={[pal.fog, 12, 32]} />
      <color attach="background" args={[pal.fog]} />

      {/* ambient base — brighter so the scene isn't swallowed */}
      <ambientLight intensity={0.4} />
      {/* key light — strong, from front-top */}
      <directionalLight
        position={[4, 9, 6]} intensity={3.2} color={pal.key}
        castShadow shadow-mapSize={[2048, 2048]}
        shadow-camera-near={1} shadow-camera-far={30}
        shadow-camera-left={-12} shadow-camera-right={12}
        shadow-camera-top={12} shadow-camera-bottom={-12}
      />
      {/* warm rim light — behind the mech, carves its silhouette (the drama) */}
      <spotLight position={[-3, 6, -7]} angle={0.7} penumbra={0.8} intensity={3.6} color={pal.rim} />
      {/* faint fill from below the crater (emergence glow) */}
      <pointLight position={[0, 0.2, 0]} intensity={2.4} color={pal.accent} distance={7} decay={2} />
      {/* soft front fill so the mech's face/front isn't pure shadow */}
      <directionalLight position={[0, 3, 10]} intensity={0.6} color={pal.key} />

      <Suspense fallback={null}>
        <Mech pal={pal} progressRef={progressRef} />
        {CONFIG.useRealModel && <Environment preset="city" />}
      </Suspense>

      <CrackedGround pal={pal} />
      <Rubble pal={pal} />
      <Dust pal={pal} progressRef={progressRef} />

      <ContactShadows position={[0, 0.02, 0]} opacity={0.55} scale={20} blur={2.4} far={6} />
    </>
  );
}

// ============================================================================
//  COMPONENT  — pins the section, feeds scroll progress to the 3D scene
// ============================================================================
export default function MechReveal({ theme = "dark" }) {
  const sectionRef = useRef(null);
  const progressRef = useRef(0);      // 0..1, written by ScrollTrigger, read in useFrame
  const [dpr, setDpr] = useState(1);
  const pal = THEME[theme] || THEME.dark;

  useEffect(() => {
    // cap DPR for performance (mobile-friendly), same philosophy as the hero
    const mob = window.innerWidth < 768;
    setDpr(Math.min(window.devicePixelRatio || 1, mob ? 1.3 : 1.8));
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: CONFIG.pinLength,
        pin: true,
        scrub: CONFIG.scrub,
        invalidateOnRefresh: true,
        onUpdate: (self) => { progressRef.current = self.progress; },
      });
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="reveal"
      style={{ position: "relative", width: "100%", height: "100vh", overflow: "hidden", background: pal.fog }}
    >
      <Canvas
        shadows
        dpr={dpr}
        camera={{ position: CONFIG.camera.start, fov: CONFIG.camera.fov }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        style={{ position: "absolute", inset: 0 }}
      >
        <Scene pal={pal} progressRef={progressRef} />
      </Canvas>

      {/* overlay copy — fades with scroll via CSS (optional, edit freely) */}
      <div style={{
        position: "absolute", left: "5vw", bottom: "8vh", zIndex: 2, pointerEvents: "none",
        color: "#fff", maxWidth: "min(90vw, 640px)",
      }}>
        <span style={{
          display: "block", marginBottom: "0.8rem", fontSize: "0.8rem", fontWeight: 700,
          letterSpacing: "3px", textTransform: "uppercase", color: pal.accent,
        }}>
          System // Reawakening
        </span>
        <h2 style={{
          margin: 0, fontWeight: 900, textTransform: "uppercase", lineHeight: 0.95,
          letterSpacing: "-2px", fontSize: "clamp(2.2rem, 6vw, 5.5rem)",
        }}>
          Built To<br />Rise.
        </h2>
      </div>
    </section>
  );
}

// preload the model so it's ready before the section scrolls into view
useGLTF.preload(CONFIG.modelUrl);