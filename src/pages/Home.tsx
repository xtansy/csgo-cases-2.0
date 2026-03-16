import { useGameStore } from '@/store/gameStore'
import CountUp from '@/components/CountUp'
import GradientText from '@/components/GradientText'
import ShinyText from '@/components/ShinyText'
import { RARITY_COLORS, RARITY_LABELS } from '@/data/items'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export default function Home() {
  const { balance, topUp, feed, inventory } = useGameStore()

  const totalInventoryValue = inventory.reduce((sum, item) => sum + item.price, 0)
  const totalItems = inventory.length

  return (
    <div className="min-h-screen px-4 pt-8 pb-4 max-w-lg mx-auto">

      {/* Header */}
      <div>
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <ShinyText text="VAULT • CS:GO SIMULATOR" className="text-xs font-bold tracking-widest text-indigo-300" speed={3} />
          </div>
          <GradientText
            colors={['#6366f1', '#8b5cf6', '#06b6d4', '#6366f1']}
            animationSpeed={5}
            className="text-4xl font-black tracking-tight leading-none"
          >
            VAULT
          </GradientText>
          <p className="text-white/40 text-sm mt-2 font-medium tracking-wide">Case Opening Simulator</p>
        </div>
      </div>

      {/* Balance Card */}
      <div>
        <div className="relative rounded-3xl overflow-hidden mb-6 border border-white/10">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-purple-900/20 to-transparent" />
          <div className="absolute inset-0 bg-black/30 backdrop-blur-xl" />
          <div className="relative p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/40 text-xs font-semibold tracking-widest uppercase mb-2">Balance</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-white/60 text-2xl font-light">$</span>
                  <CountUp
                    from={0}
                    to={balance}
                    separator=","
                    duration={1}
                    className="text-5xl font-black text-white tabular-nums"
                  />
                </div>
              </div>
              <button
                onClick={topUp}
                className="group flex flex-col items-center gap-1 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-indigo-500/20 hover:border-indigo-500/40 transition-all duration-300 active:scale-95"
              >
                <span className="text-xl">💰</span>
                <span className="text-[10px] font-bold text-white/50 group-hover:text-indigo-300 tracking-wide">+$1,000</span>
              </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-3 mt-5">
              <div className="rounded-2xl bg-white/5 p-3 border border-white/10">
                <p className="text-white/50 text-[10px] uppercase tracking-widest font-semibold mb-1">Items</p>
                <p className="text-white font-bold text-lg">{totalItems}</p>
              </div>
              <div className="rounded-2xl bg-white/5 p-3 border border-white/10">
                <p className="text-white/50 text-[10px] uppercase tracking-widest font-semibold mb-1">Portfolio</p>
                <p className="text-white font-bold text-lg">${totalInventoryValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { to: '/cases', icon: '📦', label: 'Open Cases', sub: '6 available', color: 'from-indigo-600/20 to-purple-600/10', border: 'border-indigo-500/20' },
            { to: '/crash',  icon: '📈', label: 'Crash',      sub: 'vs bots',    color: 'from-green-600/20 to-emerald-600/10', border: 'border-green-500/20' },
            { to: '/roulette', icon: '🎰', label: 'Roulette', sub: '2x / 14x',  color: 'from-red-600/20 to-pink-600/10', border: 'border-red-500/20' },
            { to: '/inventory', icon: '🎒', label: 'Inventory', sub: `${totalItems} items`, color: 'from-yellow-600/20 to-orange-600/10', border: 'border-yellow-500/20' },
          ].map(({ to, icon, label, sub, color, border }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                'group relative rounded-2xl p-4 border overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]',
                `bg-gradient-to-br ${color}`,
                border,
              )}
            >
              <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
              <div className="relative">
                <span className="text-3xl block mb-2">{icon}</span>
                <p className="text-white font-bold text-sm">{label}</p>
                <p className="text-white/40 text-xs">{sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Live Feed */}
      <div>
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <p className="text-white/50 text-xs font-semibold tracking-widest uppercase">Live Feed</p>
          </div>

          {feed.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.08] p-8 text-center">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-white/50 text-sm">No drops yet. Open a case!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {feed.slice(0, 8).map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 rounded-2xl bg-white/[0.10] border border-white/10 px-4 py-3 animate-slide-in"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ backgroundColor: `${RARITY_COLORS[entry.item.rarity]}15`, border: `1px solid ${RARITY_COLORS[entry.item.rarity]}40` }}
                  >
                    {entry.item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{entry.item.name}</p>
                    <p className="text-white/50 text-xs truncate">{entry.caseName}</p>
                  </div>
                  <div className="flex flex-col items-end flex-shrink-0">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ color: RARITY_COLORS[entry.item.rarity], backgroundColor: `${RARITY_COLORS[entry.item.rarity]}20` }}
                    >
                      {RARITY_LABELS[entry.item.rarity]}
                    </span>
                    <span className="text-white/40 text-xs mt-0.5">${entry.item.price.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
