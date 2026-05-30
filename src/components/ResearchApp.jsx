import { useState } from 'react'
import OnboardingScreen from './OnboardingScreen'
import ResearchScreen from './ResearchScreen'

export default function ResearchApp() {
  const [screen, setScreen] = useState('onboarding')
  const [rankedPillars, setRankedPillars] = useState([])

  function handleStart(pillars) {
    setRankedPillars(pillars)
    setScreen('research')
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {screen === 'onboarding' && <OnboardingScreen onStart={handleStart} />}
      {screen === 'research' && <ResearchScreen pillars={rankedPillars} />}
    </div>
  )
}