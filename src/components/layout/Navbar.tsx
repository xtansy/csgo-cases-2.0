import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/',          label: 'Home',      icon: '🏠' },
  { to: '/cases',     label: 'Cases',     icon: '📦' },
  { to: '/inventory', label: 'Inventory', icon: '🎒' },
  { to: '/crash',     label: 'Crash',     icon: '📈' },
  { to: '/roulette',  label: 'Roulette',  icon: '🎰' },
]

export default function Navbar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      {/* Blur backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-2xl border-t border-white/10" />

      <div className="relative flex items-center justify-around px-4 py-3 max-w-lg mx-auto">
        {navItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all duration-300 select-none',
                isActive
                  ? 'text-white scale-110'
                  : 'text-white/40 hover:text-white/70 hover:scale-105'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={cn(
                    'relative flex items-center justify-center w-11 h-11 rounded-2xl text-2xl transition-all duration-300',
                    isActive
                      ? 'bg-white/10 shadow-lg shadow-indigo-500/20'
                      : 'bg-transparent'
                  )}
                >
                  {isActive && (
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-sm" />
                  )}
                  <span className="relative z-10">{icon}</span>
                </div>
                <span className={cn(
                  'text-[10px] font-semibold tracking-wide uppercase transition-all duration-300',
                  isActive ? 'text-indigo-300' : 'text-white/30'
                )}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
