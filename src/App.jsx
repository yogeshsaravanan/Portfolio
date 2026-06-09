import React, { useState } from "react";
import DisintegrationEffect from "./DisintegrationEffect";
import Portfolio from "./Portfolio";

export default function App() {
  const [step, setStep] = useState(1); // 1: LinkedIn, 2: Matrix Pill Choice, 3: Core Portfolio
  const [theme, setTheme] = useState("dark"); // "light" (Blue Pill) or "dark" (Red Pill)

  const handlePillChoice = (selectedTheme) => {
    setTheme(selectedTheme);
    setStep(3);
  };

  return (
    <>
      {step === 1 && (
        <DisintegrationEffect onComplete={() => setStep(3)} />
      )}

      {step === 2 && (
        <div style={matrixStyles.overlay}>
          <div style={matrixStyles.choiceContainer}>
            <h2 style={matrixStyles.title}>Choose Your Reality</h2>
            <p style={matrixStyles.subtitle}>How do you want to evaluate my engineering profile?</p>
            
            <div style={matrixStyles.pillWrapper}>
              {/* Blue Pill: Light Mode Corporate */}
              <button onClick={() => handlePillChoice("light")} style={matrixStyles.bluePillBtn}>
                <div style={matrixStyles.pillBlue}></div>
                <span>Blue Pill // Corporate Light Mode</span>
              </button>

              {/* Red Pill: Dark Mode Cyberpunk */}
              <button onClick={() => handlePillChoice("dark")} style={matrixStyles.redPillBtn}>
                <div style={matrixStyles.pillRed}></div>
                <span>Red Pill // Elite Performance Dark Mode</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 3 && <Portfolio initialTheme={theme} />}
    </>
  );
}

const matrixStyles = {
  overlay: { position: "fixed", inset: 0, backgroundColor: "#000", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, fontFamily: "monospace", padding: "2rem" },
  choiceContainer: { textAlign: "center", maxWidth: "600px" },
  title: { color: "#fff", fontSize: "2rem", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "1rem" },
  subtitle: { color: "#666", fontSize: "1rem", marginBottom: "3rem" },
  pillWrapper: { display: "flex", gap: "2rem", flexWrap: "wrap", justifyContent: "center" },
  bluePillBtn: { background: "#111", border: "1px solid #0055ff", padding: "1.5rem 2rem", borderRadius: "12px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", color: "#fff", transition: "transform 0.2s" },
  redPillBtn: { background: "#111", border: "1px solid #ff2200", padding: "1.5rem 2rem", borderRadius: "12px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", color: "#fff", transition: "transform 0.2s" },
  pillBlue: { width: "60px", height: "25px", backgroundColor: "#0055ff", borderRadius: "20px", boxShadow: "0 0 20px #0055ff" },
  pillRed: { width: "60px", height: "25px", backgroundColor: "#ff2200", borderRadius: "20px", boxShadow: "0 0 20px #ff2200" },
};