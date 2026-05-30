import { Routes, Route } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import ResearchApp from './components/ResearchApp'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/app" element={<ResearchApp />} />
    </Routes>
  )
}