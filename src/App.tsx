import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import Home from '@/pages/Home'
import Cases from '@/pages/Cases'
import CaseOpen from '@/pages/CaseOpen'
import Inventory from '@/pages/Inventory'
import Crash from '@/pages/Crash'
import Roulette from '@/pages/Roulette'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/cases" element={<Cases />} />
          <Route path="/cases/:caseId" element={<CaseOpen />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/crash" element={<Crash />} />
          <Route path="/roulette" element={<Roulette />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
