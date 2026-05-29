import { useState } from "react";
import OnboardingScreen from "./components/OnboardingScreen";
import ResearchScreen from "./components/ResearchScreen";

export default function App() {
  const [screen, setScreen] = useState("onboarding"); // onboarding | research
  const [rankedPillars, setRankedPillars] = useState([]);

  function handleStart(pillars) {
    setRankedPillars(pillars);
    setScreen("research");
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {screen === "onboarding" && <OnboardingScreen onStart={handleStart} />}
      {screen === "research" && <ResearchScreen pillars={rankedPillars} />}
    </div>
  );
}