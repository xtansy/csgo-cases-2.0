import { useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { CASES } from '@/data/cases'
import { rollItem, generateRouletteItems } from '@/lib/randomize'
import { useGameStore } from '@/store/gameStore'
import CaseRoulette from '@/components/game/CaseRoulette'
import GradientText from '@/components/GradientText'
import ElectricBorder from '@/components/ElectricBorder'
import { RARITY_COLORS, RARITY_LABELS } from '@/data/items'
import type { Item, InventoryItem, FeedEntry } from '@/types'
import { cn } from '@/lib/utils'

type Phase = 'idle' | 'spinning' | 'result'

export default function CaseOpen() {
  const { caseId } = useParams<{ caseId: string }>()
  const navigate = useNavigate()
  const { balance, deduct, addItem, pushFeed } = useGameStore()
  const [phase, setPhase] = useState<Phase>('idle')
  const [rouletteItems, setRouletteItems] = useState<Item[]>([])
  const [winnerIndex, setWinnerIndex] = useState(0)
  const [wonItem, setWonItem] = useState<Item | null>(null)
  const [quantity, setQuantity] = useState(1)

  const caseData = CASES.find(c => c.id === caseId)

  const handleOpen = useCallback(() => {
    if (!caseData || phase !== 'idle') return
    const totalCost = caseData.price * quantity
    if (!deduct(totalCost)) return

    const winner = rollItem(caseData.items)
    const items = generateRouletteItems(caseData.items, winner)
    const idx = items.length - 1  // winner is at the end

    setRouletteItems(items)
    setWinnerIndex(idx)
    setWonItem(winner)
    setPhase('spinning')
  }, [caseData, phase, quantity, deduct])

  const handleFinish = useCallback(() => {
    if (!wonItem || !caseData) return

    const inventoryItem: InventoryItem = {
      ...wonItem,
      instanceId: `${wonItem.id}_${Date.now()}_${Math.random()}`,
      obtainedAt: Date.now(),
      caseId: caseData.id,
    }
    addItem(inventoryItem)

    const feedEntry: FeedEntry = {
      id: `feed_${Date.now()}`,
      item: wonItem,
      caseName: caseData.name,
      timestamp: Date.now(),
    }
    pushFeed(feedEntry)

    setPhase('result')
  }, [wonItem, caseData, addItem, pushFeed])

  const handleAgain = () => {
    setPhase('idle')
    setWonItem(null)
  }

  if (!caseData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-white/40 mb-4">Case not found</p>
          <Link to="/cases" className="text-indigo-400 hover:underline">Back to Cases</Link>
        </div>
      </div>
    )
  }

  const canAfford = balance >= caseData.price * quantity

  return (
    <div className="min-h-screen px-4 pt-8 pb-4 max-w-lg mx-auto">

      {/* Back + Title */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Link to="/cases" className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all">
            ←
          </Link>
          <div>
            <GradientText colors={['#6366f1', '#8b5cf6']} animationSpeed={3} className="text-2xl font-black">
              {caseData.name}
            </GradientText>
            <p className="text-white/40 text-xs">${caseData.price.toFixed(2)} per case</p>
          </div>
          <span className="ml-auto text-4xl">{caseData.icon}</span>
        </div>
      </div>

      {/* Roulette area */}
      <div>
        {phase === 'idle' && (
          <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-8 text-center mb-6">
            <div className={cn(
              'w-24 h-24 rounded-2xl mx-auto mb-4 flex items-center justify-center text-5xl',
              `bg-gradient-to-br ${caseData.color}`
            )}>
              {caseData.icon}
            </div>
            <p className="text-white/60 text-sm">{caseData.description}</p>
          </div>
        )}

        {(phase === 'spinning' || phase === 'result') && rouletteItems.length > 0 && (
          <div className="mb-6">
            <CaseRoulette
              items={rouletteItems}
              winnerIndex={winnerIndex}
              onFinish={handleFinish}
            />
          </div>
        )}
      </div>

      {/* Result */}
      {phase === 'result' && wonItem && (
        <div>
          <div className="rounded-3xl border overflow-hidden mb-6"
            style={{
              borderColor: `${RARITY_COLORS[wonItem.rarity]}60`,
              boxShadow: `0 0 40px ${RARITY_COLORS[wonItem.rarity]}30`,
            }}
          >
            {wonItem.rarity === 'ancient' || wonItem.rarity === 'legendary' ? (
              <ElectricBorder>
                <ResultCard item={wonItem} />
              </ElectricBorder>
            ) : (
              <ResultCard item={wonItem} />
            )}
          </div>
        </div>
      )}

      {/* Controls */}
      {phase !== 'spinning' && (
        <div>
          {/* Quantity selector */}
          <div className="flex items-center justify-center gap-3 mb-4">
            {[1, 3, 5].map(q => (
              <button
                key={q}
                onClick={() => setQuantity(q)}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-bold transition-all',
                  quantity === q
                    ? 'bg-indigo-500/30 border border-indigo-500/50 text-indigo-300'
                    : 'bg-white/5 border border-white/10 text-white/50 hover:text-white/80'
                )}
              >
                x{q}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {phase === 'result' && (
              <button
                onClick={handleAgain}
                className="py-4 rounded-2xl bg-white/5 border border-white/10 text-white/70 font-bold hover:bg-white/10 transition-all active:scale-95"
              >
                Open Again
              </button>
            )}
            <button
              onClick={phase === 'idle' ? handleOpen : handleAgain}
              disabled={!canAfford}
              className={cn(
                'py-4 rounded-2xl font-black text-base transition-all duration-300 active:scale-95',
                phase === 'result' ? 'col-span-1' : 'col-span-2',
                canAfford
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50'
                  : 'bg-white/5 text-white/50 border border-white/10 cursor-not-allowed'
              )}
            >
              {canAfford
                ? `Open ${quantity > 1 ? `${quantity}x ` : ''}• $${(caseData.price * quantity).toFixed(2)}`
                : 'Insufficient Balance'}
            </button>
          </div>
        </div>
      )}

      {/* Possible items */}
      {phase === 'idle' && (
        <div>
          <div className="mt-6">
            <p className="text-white/50 text-xs font-semibold tracking-widest uppercase mb-3">Possible Drops</p>
            <div className="space-y-2">
              {caseData.items.slice(0, 6).map(item => (
                <div key={item.id} className="flex items-center gap-3 rounded-xl bg-white/[0.08] border border-white/10 px-3 py-2">
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                    style={{ backgroundColor: `${RARITY_COLORS[item.rarity]}15` }}
                  >
                    {item.icon}
                  </span>
                  <span className="text-white/70 text-xs font-medium flex-1 truncate">{item.name}</span>
                  <span className="text-xs font-bold flex-shrink-0" style={{ color: RARITY_COLORS[item.rarity] }}>
                    {RARITY_LABELS[item.rarity]}
                  </span>
                  <span className="text-white/50 text-xs flex-shrink-0">${item.price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ResultCard({ item }: { item: Item }) {
  return (
    <div
      className="p-6 text-center"
      style={{ background: `linear-gradient(135deg, ${RARITY_COLORS[item.rarity]}10, transparent)` }}
    >
      <div className="text-6xl mb-3">{item.icon}</div>
      <div
        className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-2"
        style={{ color: RARITY_COLORS[item.rarity], backgroundColor: `${RARITY_COLORS[item.rarity]}20` }}
      >
        {RARITY_LABELS[item.rarity]}
      </div>
      <h3 className="text-white font-black text-lg mb-1">{item.name}</h3>
      {item.wear && <p className="text-white/40 text-sm mb-3">{item.wear}</p>}
      <p className="text-2xl font-black" style={{ color: RARITY_COLORS[item.rarity] }}>
        ${item.price.toLocaleString()}
      </p>
    </div>
  )
}
