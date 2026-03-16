import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Noise from '@/components/Noise'
import SplashCursor from '@/components/SplashCursor'
import ClickSpark from '@/components/ClickSpark'

export default function Layout() {
  return (
    <div className="relative min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">

      {/* Static dark gradient background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[#0a0a0f]" />
        {/* Ambient glow blobs */}
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-indigo-900/30 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-900/20 blur-[100px]" />
        <div className="absolute top-[40%] right-[10%] w-[30vw] h-[30vw] rounded-full bg-cyan-900/15 blur-[80px]" />
      </div>

      {/* Subtle grid overlay */}
      <div
        className="fixed inset-0 z-[1] pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Noise overlay */}
      <div className="fixed inset-0 z-[2] pointer-events-none opacity-20">
        <Noise
          patternSize={150}
          patternScaleX={1}
          patternScaleY={1}
          patternRefreshInterval={2}
          patternAlpha={15}
        />
      </div>

      {/* Cursor effect */}
      <SplashCursor SPLAT_RADIUS={0.15} SPLAT_FORCE={3000} DENSITY_DISSIPATION={4} VELOCITY_DISSIPATION={0.98} />

      {/* Page content */}
      <ClickSpark sparkColor="#6366f1" sparkSize={8} sparkRadius={15} sparkCount={8} duration={500}>
        <main className="relative z-10 pb-28 min-h-screen">
          <Outlet />
        </main>
      </ClickSpark>

      <Navbar />
    </div>
  )
}
