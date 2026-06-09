import React, { useState, useRef } from "react";
import html2canvas from "html2canvas";
import { motion, AnimatePresence } from "framer-motion";

export default function DisintegrationEffect({ onComplete }) {
  const [isSnapped, setIsSnapped] = useState(false);
  const cardRef = useRef(null);
  const canvasRef = useRef(null);

  const handleSnap = async () => {
    if (!cardRef.current || !canvasRef.current) return;
    setIsSnapped(true);

    const card = cardRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Capture the LinkedIn Card snapshot
    const snapshot = await html2canvas(card, { backgroundColor: null, useCORS: true });
    const rect = card.getBoundingClientRect();
    const snapshotCtx = snapshot.getContext("2d");
    const imgData = snapshotCtx.getImageData(0, 0, snapshot.width, snapshot.height);
    const pixels = imgData.data;

    const particles = [];

    // Sample pixels (Step 4 for CPU safety performance balance)
    for (let y = 0; y < snapshot.height; y += 4) {
      for (let x = 0; x < snapshot.width; x += 4) {
        const index = (y * snapshot.width + x) * 4;
        const alpha = pixels[index + 3];

        if (alpha > 0) {
          particles.push({
            x: rect.left + x,
            y: rect.top + y,
            r: pixels[index],
            g: pixels[index + 1],
            b: pixels[index + 2],
            a: alpha / 255,
            vx: (Math.random() - 0.2) * 2.5, // Drift right velocity
            vy: (Math.random() - 0.7) * 2.5, // Floating upward velocity
            life: 1 + Math.random() * 1.5,
          });
        }
      }
    }

    // Hide original DOM element structure
    card.style.visibility = "hidden";

    // Frame-by-frame canvas animation rendering loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let stillActive = false;

      particles.forEach((p) => {
        if (p.life > 0) {
          stillActive = true;
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 0.015; // Rate of decay
          p.vx += (Math.random() - 0.4) * 0.05; // Wind turbulence simulation

          ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${p.a * p.life})`;
          ctx.fillRect(p.x, p.y, 2, 2);
        }
      });

      if (stillActive) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onComplete(); // Triggers parent state to load main UI
      }
    };

    animate();
  };

  return (
    <div style={styles.overlay}>
      <canvas ref={canvasRef} style={styles.canvas} />
      
      <AnimatePresence>
        {!isSnapped && (
          <motion.div
            ref={cardRef}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={styles.card}
          >
            {/* Simulated LinkedIn Cover Banner */}
            <div style={styles.banner}>
              <div style={styles.avatar}>YOU</div>
            </div>

            {/* LinkedIn Profile Mock Content */}
            <div style={styles.content}>
              <h2 style={styles.name}>Your Full Name</h2>
              <p style={styles.headline}>
                Full-Stack Engineer & Interactive Designer // Building high-velocity creative web applications optimized for cross-platform computing.
              </p>
              <p style={styles.meta}>Bengaluru, Karnataka, India • Contact info</p>
              
              <button onClick={handleSnap} style={styles.button}>
                Initialize Portfolio Protocol
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Built-in inline styles system to ensure correct presentation without Tailwind
const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "#000000",
    zIndex: 999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
    overflow: "hidden",
    boxSizing: "border-box",
  },
  canvas: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    zIndex: 1000,
  },
  card: {
    width: "100%",
    maxWidth: "550px",
    backgroundColor: "#1b1f23", // LinkedIn Native Dark Mode background
    borderRadius: "12px",
    border: "1px solid #38434f",
    overflow: "hidden",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    position: "relative",
    boxSizing: "border-box",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  banner: {
    height: "112px",
    background: "linear-gradient(135deg, #0077b5, #004471)", // LinkedIn blue
    position: "relative",
  },
  avatar: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    backgroundColor: "#272c30",
    border: "4px solid #1b1f23",
    position: "absolute",
    bottom: "-48px",
    left: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "0.875rem",
    letterSpacing: "0.05em",
    color: "#ffffff",
  },
  content: {
    padding: "64px 24px 24px 24px",
    textAlign: "left",
    boxSizing: "border-box",
  },
  name: {
    fontSize: "1.25rem",
    fontWeight: "700",
    color: "#f3f5f7",
    margin: 0,
  },
  headline: {
    fontSize: "0.875rem",
    color: "#e1e9ee",
    marginTop: "4px",
    lineHeight: 1.5,
    marginRight: 0,
    marginBottom: 0,
  },
  meta: {
    fontSize: "0.75rem",
    color: "#9199a1",
    marginTop: "8px",
    marginBottom: 0,
  },
  button: {
    width: "100%",
    backgroundColor: "#70b5f9", // High-contrast LinkedIn button color
    color: "#1b1f23",
    fontWeight: "700",
    padding: "0.625rem 1rem",
    borderRadius: "9999px",
    border: "none",
    marginTop: "24px",
    cursor: "pointer",
    fontSize: "0.95rem",
    transition: "background-color 0.2s ease",
  },
};