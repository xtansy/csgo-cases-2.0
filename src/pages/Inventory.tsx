import { useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import GradientText from '@/components/GradientText'
import SpotlightCard from '@/components/SpotlightCard'
import ElectricBorder from '@/components/ElectricBorder'
import { RARITY_COLORS, RARITY_LABELS } from '@/data/items'
import type { Rarity } from '@/types'
import { cn, hexToRgba } from '@/lib/utils'

type Filter = 'all' | Rarity

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'ancient', label: 'Ancient' },
  { key: 'legendary', label: 'Legendary' },
  { key: 'mythical', label: 'Mythical' },
  { key: 'rare', label: 'Rare' },
  { key: 'uncommon', label: 'Uncommon' },
  { key: 'common', label: 'Common' },
]

export default function Inventory() {
  const { inventory, sellItem, balance } = useGameStore()
  const [filter, setFilter] = useState<Filter>('all')
  const [sellConfirm, setSellConfirm] = useState<string | null>(null)

  const filtered = filter === 'all' ? inventory : inventory.filter(i => i.rarity === filter)
  const totalValue = inventory.reduce((sum, i) => sum + i.price, 0)
  const sellValue = Math.round(totalValue * 0.5)

  const handleSell = (instanceId: string) => {
    if (sellConfirm === instanceId) {
      sellItem(instanceId)
      setSellConfirm(null)
    } else {
      setSellConfirm(instanceId)
      setTimeout(() => setSellConfirm(null), 3000)
    }
  }

  return (
    <div className="min-h-screen px-4 pt-8 pb-4 max-w-lg mx-auto">

      {/* Header */}
      <div>
        <div className="mb-6">
          <GradientText colors={['#f59e0b', '#ef4444', '#8b5cf6']} animationSpeed={4} className="text-3xl font-black tracking-tight">
            Inventory
          </GradientText>
          <p className="text-white/40 text-sm mt-1">
            Balance: <span className="text-indigo-300 font-semibold">${balance.toLocaleString()}</span>
          </p>
        </div>
      </div>

      {/* Stats */}
      <div>
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Items', value: inventory.length.toString() },
            { label: 'Total Value', value: `$${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
            { label: 'Sell All', value: `$${sellValue.toLocaleString()}` },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-2xl bg-white/[0.10] border border-white/10 p-3 text-center">
              <p className="text-white/50 text-[10px] uppercase tracking-widest font-semibold mb-1">{label}</p>
              <p className="text-white font-bold text-sm">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filter tabs */}
      <div>
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-none">
          {FILTERS.map(({ key, label }) => {
            const count = key === 'all' ? inventory.length : inventory.filter(i => i.rarity === key).length
            if (key !== 'all' && count === 0) return null
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={cn(
                  'flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200',
                  filter === key
                    ? 'text-white'
                    : 'bg-white/5 border border-white/10 text-white/40 hover:text-white/70'
                )}
                style={filter === key ? {
                  backgroundColor: key === 'all' ? 'rgba(99,102,241,0.25)' : `${RARITY_COLORS[key as Rarity]}25`,
                  borderWidth: 1,
                  borderStyle: 'solid',
                  borderColor: key === 'all' ? 'rgba(99,102,241,0.4)' : `${RARITY_COLORS[key as Rarity]}50`,
                  color: key === 'all' ? '#a5b4fc' : RARITY_COLORS[key as Rarity],
                } : undefined}
              >
                {label} {count > 0 && <span className="opacity-60">({count})</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Items grid */}
      {filtered.length === 0 ? (
        <div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.08] p-10 text-center">
            <p className="text-5xl mb-4">🎒</p>
            <p className="text-white/50 text-sm">
              {inventory.length === 0 ? 'No items yet. Open some cases!' : 'No items in this category.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((item, i) => {
            const isElite = item.rarity === 'ancient' || item.rarity === 'legendary'
            const confirmSell = sellConfirm === item.instanceId

            const card = (
              <SpotlightCard
                spotlightColor={hexToRgba(RARITY_COLORS[item.rarity], 0.18)}
                className={`rounded-2xl overflow-hidden border bg-black/50 backdrop-blur-sm h-full`}
              >
                <div
                  className="h-0.5 w-full"
                  style={{ background: `linear-gradient(90deg, transparent, ${RARITY_COLORS[item.rarity]}, transparent)` }}
                />
                <div className="p-3">
                  {/* Icon */}
                  <div
                    className="w-full h-20 rounded-xl flex items-center justify-center text-4xl mb-3"
                    style={{ backgroundColor: `${RARITY_COLORS[item.rarity]}10` }}
                  >
                    {item.icon}
                  </div>

                  <p className="text-white text-xs font-bold leading-tight mb-0.5 truncate">{item.weapon}</p>
                  <p className="text-white/50 text-[10px] truncate mb-2">{item.skin}</p>

                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded font-bold"
                      style={{ color: RARITY_COLORS[item.rarity], backgroundColor: `${RARITY_COLORS[item.rarity]}20` }}
                    >
                      {RARITY_LABELS[item.rarity]}
                    </span>
                    <span className="text-white/70 text-xs font-bold">${item.price.toLocaleString()}</span>
                  </div>

                  <button
                    onClick={() => handleSell(item.instanceId)}
                    className={cn(
                      'w-full py-1.5 rounded-xl text-[11px] font-bold transition-all duration-200 active:scale-95',
                      confirmSell
                        ? 'bg-red-500/30 border border-red-500/50 text-red-300'
                        : 'bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 hover:text-white/80'
                    )}
                  >
                    {confirmSell ? `Sell $${Math.round(item.price * 0.5)}?` : `Sell $${Math.round(item.price * 0.5)}`}
                  </button>
                </div>
              </SpotlightCard>
            )

            return (
              <div>
                {isElite ? (
                  <ElectricBorder className="rounded-2xl h-full">
                    {card}
                  </ElectricBorder>
                ) : card}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
