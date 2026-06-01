import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import OnboardingScreen from './OnboardingScreen'
import ResearchScreen from './ResearchScreen'

export default function ResearchApp() {
  const [screen, setScreen] = useState('onboarding')
  const [rankedPillars, setRankedPillars] = useState([])
  const [extraCriteria, setExtraCriteria] = useState('')
  const [sessionId, setSessionId] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const stored = localStorage.getItem('crSessionId')
    if (stored) {
      supabase
        .from('sessions')
        .select('id, pillars, cards, messages, extra_criteria')
        .eq('id', stored)
        .single()
        .then(({ data, error }) => {
          if (data && !error) {
            setSessionId(data.id)
            setRankedPillars(data.pillars || [])
            setExtraCriteria(data.extra_criteria || '')
            setScreen('research')
          } else {
            localStorage.removeItem('crSessionId')
          }
        })
    }
  }, [])

  async function handleStart(pillars, extra) {
    const { data, error } = await supabase
      .from('sessions')
      .insert({
        pillars,
        extra_criteria: extra || '',
        messages: [],
        cards: { tier1: [], tier2: [], tier3: [], honorable: [] },
      })
      .select('id')
      .single()

    if (error || !data) {
      setRankedPillars(pillars)
      setExtraCriteria(extra || '')
      setScreen('research')
      return
    }

    localStorage.setItem('crSessionId', data.id)
    setSessionId(data.id)
    setRankedPillars(pillars)
    setExtraCriteria(extra || '')
    setScreen('research')
  }

  function handleNewSearch() {
    localStorage.removeItem('crSessionId')
    setSessionId(null)
    setRankedPillars([])
    setExtraCriteria('')
    setScreen('onboarding')
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {screen === 'onboarding' && <OnboardingScreen onStart={handleStart} />}
      {screen === 'research' && (
        <ResearchScreen
          pillars={rankedPillars}
          extraCriteria={extraCriteria}
          sessionId={sessionId}
          onNewSearch={handleNewSearch}
        />
      )}
    </div>
  )
}
