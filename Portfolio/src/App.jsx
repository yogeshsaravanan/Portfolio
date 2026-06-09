import React, { useState } from "react";
import DisintegrationEffect from "./DisintegrationEffect";
import Portfolio from "./Portfolio";

export default function App() {
  const [showPortfolio, setShowPortfolio] = useState(false);

  return (
    <>
      {!showPortfolio ? (
        <DisintegrationEffect onComplete={() => setShowPortfolio(true)} />
      ) : (
        <Portfolio />
      )}
    </>
  );
}