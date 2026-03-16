import { useEffect, useRef, useState } from 'react'
import type { Item } from '@/types'
import { RARITY_COLORS } from '@/data/items'
import { cn } from '@/lib/utils'

interface CaseRouletteProps {
  items: Item[]
  winnerIndex: number  // index in items[] that is the winning item (last)
  onFinish: () => void
}

const ITEM_WIDTH = 160  // px
const ITEM_GAP = 8      // px
const VISIBLE_ITEMS = 5
const CENTER_INDEX = Math.floor(VISIBLE_ITEMS / 2) // 2

export default function CaseRoulette({ items, winnerIndex, onFinish }: CaseRouletteProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const el = trackRef.current
    if (!el) return

    // Target: winnerIndex should be at center
    const totalUnit = ITEM_WIDTH + ITEM_GAP
    const containerWidth = VISIBLE_ITEMS * ITEM_WIDTH + (VISIBLE_ITEMS - 1) * ITEM_GAP
    const centerOffset = Math.floor(containerWidth / 2) - Math.floor(ITEM_WIDTH / 2)
    const targetX = winnerIndex * totalUnit - centerOffset

    // Small random offset for drama
    const jitter = (Math.random() - 0.5) * 60

    el.style.transition = 'none'
    el.style.transform = 'translateX(0)'

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = `transform 5s cubic-bezier(0.12, 0.8, 0.25, 1)`
        el.style.transform = `translateX(-${targetX + jitter}px)`
      })
    })

    const timeout = setTimeout(() => {
      setDone(true)
      onFinish()
    }, 5200)

    return () => clearTimeout(timeout)
  }, [winnerIndex, onFinish])

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl">
      {/* Center indicator */}
      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[160px] z-20 pointer-events-none">
        <div className="h-full border-l-2 border-r-2 border-indigo-500/60" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-indigo-500 rotate-45 -translate-y-2" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-indigo-500 rotate-45 translate-y-2" />
      </div>

      {/* Left/right fades */}
      <div className="absolute inset-y-0 left-0 w-32 z-10 pointer-events-none bg-gradient-to-r from-black/80 to-transparent" />
      <div className="absolute inset-y-0 right-0 w-32 z-10 pointer-events-none bg-gradient-to-l from-black/80 to-transparent" />

      {/* Track */}
      <div className="overflow-visible py-4 pl-4">
        <div ref={trackRef} className="flex gap-2 w-max">
          {items.map((item, i) => {
            const isWinner = i === winnerIndex
            return (
              <div
                key={i}
                className={cn(
                  'relative flex-shrink-0 rounded-xl border overflow-hidden transition-all duration-300',
                  'flex flex-col items-center justify-center p-3 gap-1',
                  done && isWinner ? 'scale-105' : ''
                )}
                style={{
                  width: ITEM_WIDTH,
                  backgroundColor: `${RARITY_COLORS[item.rarity]}10`,
                  borderColor: `${RARITY_COLORS[item.rarity]}40`,
                  boxShadow: done && isWinner ? `0 0 30px ${RARITY_COLORS[item.rarity]}60` : undefined,
                }}
              >
                <div className="text-4xl">{item.icon}</div>
                <p className="text-white/80 text-xs font-semibold text-center leading-tight truncate w-full text-center">{item.weapon}</p>
                <p
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ color: RARITY_COLORS[item.rarity], backgroundColor: `${RARITY_COLORS[item.rarity]}20` }}
                >
                  {item.skin}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
