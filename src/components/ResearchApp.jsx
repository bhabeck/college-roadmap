import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import OnboardingScreen from './OnboardingScreen'
import ResearchScreen from './ResearchScreen'

export default function ResearchApp() {
  const [screen, setScreen] = useState('onboarding')
  const [rankedPillars, setRankedPillars] = useState([])
  const [sessionId, setSessionId] = useState(null)
  const navigate = useNavigate()

  // Resume existing session if one is stored locally
  useEffect(() => {
    const stored = localStorage.getItem('crSessionId')
    if (stored) {
      // Verify the session still exists in Supabase
      supabase
        .from('sessions')
        .select('id, pillars, cards, messages')
        .eq('id', stored)
        .single()
        .then(({ data, error }) => {
          if (data && !error) {
            setSessionId(data.id)
            setRankedPillars(data.pillars || [])
            setScreen('research')
          } else {
            // Session not found — clear stale local reference
            localStorage.removeItem('crSessionId')
          }
        })
    }
  }, [])

  async function handleStart(pillars) {
    // Create a new session in Supabase
    const { data, error } = await supabase
      .from('sessions')
      .insert({
        pillars,
        messages: [],
        cards: { tier1: [], tier2: [], tier3: [] },
      })
      .select('id')
      .single()

    if (error || !data) {
      console.error('Failed to create session:', error)
      // Fall back to sessionless mode — app still works, just won't persist
      setRankedPillars(pillars)
      setScreen('research')
      return
    }

    localStorage.setItem('crSessionId', data.id)
    setSessionId(data.id)
    setRankedPillars(pillars)
    setScreen('research')
  }

  function handleNewSearch() {
    localStorage.removeItem('crSessionId')
    setSessionId(null)
    setRankedPillars([])
    setScreen('onboarding')
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {screen === 'onboarding' && <OnboardingScreen onStart={handleStart} />}
      {screen === 'research' && (
        <ResearchScreen
          pillars={rankedPillars}
          sessionId={sessionId}
          onNewSearch={handleNewSearch}
        />
      )}
    </div>
  )
}
