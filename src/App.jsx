import { Routes, Route } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import ResearchApp from './components/ResearchApp'
import SharedListPage from './components/SharedListPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/app" element={<ResearchApp />} />
      <Route path="/list/:sessionId" element={<SharedListPage />} />
    </Routes>
  )
}
