import { Link } from 'react-router-dom'
import { CASES } from '@/data/cases'
import SpotlightCard from '@/components/SpotlightCard'
import GradientText from '@/components/GradientText'
import { useGameStore } from '@/store/gameStore'
import { cn } from '@/lib/utils'

export default function Cases() {
  const { balance } = useGameStore()

  return (
    <div className="min-h-screen px-4 pt-8 pb-4 max-w-lg mx-auto">

      {/* Header */}
      <div>
        <div className="mb-7">
          <GradientText
            colors={['#6366f1', '#8b5cf6', '#06b6d4']}
            animationSpeed={4}
            className="text-3xl font-black tracking-tight"
          >
            Case Store
          </GradientText>
          <p className="text-white/40 text-sm mt-1">Balance: <span className="text-indigo-300 font-semibold">${balance.toLocaleString()}</span></p>
        </div>
      </div>

      {/* Cases Grid */}
      <div className="grid grid-cols-2 gap-4">
        {CASES.map((c, i) => (
          <div>
            <Link to={`/cases/${c.id}`} className="block">
              <SpotlightCard
                spotlightColor="rgba(99, 102, 241, 0.2)"
                className="h-full rounded-2xl overflow-hidden border border-white/10 bg-black/50 hover:border-white/15 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className={cn('h-1 w-full bg-gradient-to-r', c.color)} />
                <div className="p-4">
                  {/* Icon */}
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3',
                    `bg-gradient-to-br ${c.color} opacity-80`
                  )}>
                    {c.icon}
                  </div>

                  <h3 className="text-white font-bold text-sm leading-tight mb-1">{c.name}</h3>
                  {c.description && (
                    <p className="text-white/50 text-[11px] leading-tight mb-3 line-clamp-2">{c.description}</p>
                  )}

                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <span className="text-white font-black text-base">${c.price.toFixed(2)}</span>
                    <span
                      className={cn(
                        'text-[10px] px-2 py-0.5 rounded-full font-semibold',
                        balance >= c.price
                          ? 'bg-indigo-500/20 text-indigo-300'
                          : 'bg-red-500/20 text-red-400'
                      )}
                    >
                      {balance >= c.price ? 'Afford' : 'Low funds'}
                    </span>
                  </div>

                  {/* Items count */}
                  <p className="text-white/20 text-[10px] mt-2">{c.items.length} possible items</p>
                </div>
              </SpotlightCard>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
