import { useState, useRef, useEffect, useCallback } from 'react'
import { useGameStore } from '@/store/gameStore'
import GradientText from '@/components/GradientText'
import type { RouletteColor } from '@/types'
import { cn } from '@/lib/utils'

// Roulette sequence: 0=green, 1-7=red, 8-14=black (repeating)
const SEQUENCE: RouletteColor[] = [
  'red','black','red','black','red','black','red',
  'green',
  'black','red','black','red','black','red','black',
]
const SEQ_LEN = SEQUENCE.length

const COLOR_META: Record<RouletteColor, { bg: string; text: string; label: string; mult: number; emoji: string }> = {
  red:   { bg: '#ef4444', text: '#fff', label: 'Red',   mult: 2,  emoji: '🔴' },
  black: { bg: '#1a1a2e', text: '#fff', label: 'Black', mult: 2,  emoji: '⚫' },
  green: { bg: '#10b981', text: '#fff', label: 'Green', mult: 14, emoji: '🟢' },
}

// Generate a long strip of tiles
function makeTiles(count: number) {
  return Array.from({ length: count }, (_, i) => SEQUENCE[i % SEQ_LEN])
}

const TILE_W = 72   // px
const TILE_GAP = 4  // px
const TILE_UNIT = TILE_W + TILE_GAP
const TOTAL_TILES = 120

export default function Roulette() {
  const { balance, deduct, addBalance } = useGameStore()
  const [betColor, setBetColor] = useState<RouletteColor | null>(null)
  const [betInput, setBetInput] = useState('100')
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<{ color: RouletteColor; won: boolean; profit: number } | null>(null)
  const [tiles] = useState(() => makeTiles(TOTAL_TILES))
  const [history, setHistory] = useState<RouletteColor[]>([])

  const trackRef = useRef<HTMLDivElement>(null)
  const currentOffsetRef = useRef(0)

  // Reset track position on mount
  useEffect(() => {
    if (trackRef.current) {
      trackRef.current.style.transition = 'none'
      trackRef.current.style.transform = 'translateX(0)'
    }
  }, [])

  const spin = useCallback(() => {
    const amount = parseFloat(betInput)
    if (!betColor || isNaN(amount) || amount <= 0 || !deduct(amount) || spinning) return

    setSpinning(true)
    setResult(null)

    // Pick a random landing tile (in the last 30 tiles)
    const landingTile = 80 + Math.floor(Math.random() * 20)
    // Optionally rig to player's bet color occasionally
    let targetColor: RouletteColor
    if (Math.random() < 0.48 && betColor !== 'green') {
      targetColor = betColor  // give player slight chance
    } else {
      targetColor = tiles[landingTile]
    }

    // Find tile with target color near landingTile
    let targetIdx = landingTile
    for (let i = landingTile; i < landingTile + 15; i++) {
      if (tiles[i % TOTAL_TILES] === targetColor) { targetIdx = i; break }
    }

    const containerWidth = 5 * TILE_UNIT  // visible width
    const centerOff = Math.floor(containerWidth / 2) - Math.floor(TILE_W / 2)
    const targetX = targetIdx * TILE_UNIT - centerOff + (Math.random() - 0.5) * 30

    const el = trackRef.current
    if (!el) return

    // Start from current + a spin base
    const spinBase = 40 * TILE_UNIT
    const totalX = spinBase + targetX

    el.style.transition = 'none'
    el.style.transform = `translateX(-${currentOffsetRef.current}px)`

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = 'transform 5s cubic-bezier(0.12, 0.8, 0.25, 1)'
        el.style.transform = `translateX(-${currentOffsetRef.current + totalX}px)`
        currentOffsetRef.current += totalX
      })
    })

    setTimeout(() => {
      const won = targetColor === betColor
      const profit = won ? Math.round(amount * COLOR_META[betColor].mult) - amount : -amount
      if (won) addBalance(Math.round(amount * COLOR_META[betColor].mult))

      setHistory(prev => [targetColor, ...prev].slice(0, 12))
      setResult({ color: targetColor, won, profit })
      setSpinning(false)
    }, 5200)
  }, [betColor, betInput, deduct, spinning, tiles, addBalance])

  const betAmount = parseFloat(betInput) || 0
  const canSpin = betColor !== null && !spinning && betAmount > 0 && betAmount <= balance

  return (
    <div className="min-h-screen px-4 pt-8 pb-4 max-w-lg mx-auto">

      <div>
        <div className="mb-5">
          <GradientText colors={['#ef4444', '#8b5cf6', '#10b981']} animationSpeed={4} className="text-3xl font-black tracking-tight">
            Roulette
          </GradientText>
          <p className="text-white/40 text-sm mt-1">Balance: <span className="text-indigo-300 font-semibold">${balance.toLocaleString()}</span></p>
        </div>
      </div>

      {/* Spin strip */}
      <div>
        <div className="relative rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl overflow-hidden mb-5">
          {/* Center indicator */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[72px] z-20 pointer-events-none border-l-2 border-r-2 border-white/30">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 -translate-y-1.5" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 translate-y-1.5" />
          </div>

          {/* Fades */}
          <div className="absolute inset-y-0 left-0 w-20 z-10 bg-gradient-to-r from-black/90 to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-20 z-10 bg-gradient-to-l from-black/90 to-transparent pointer-events-none" />

          <div className="overflow-hidden py-3 pl-2">
            <div ref={trackRef} className="flex gap-1 w-max">
              {tiles.map((color, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 rounded-xl flex items-center justify-center text-xl font-black"
                  style={{
                    width: TILE_W,
                    height: TILE_W,
                    backgroundColor: COLOR_META[color].bg,
                    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.1)`,
                  }}
                >
                  {color === 'green' ? '0' : color === 'red' ? '🔴' : '⚫'}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div>
          <div className={cn(
            'rounded-2xl border p-4 text-center mb-4',
            result.won ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'
          )}>
            <p className="text-2xl mb-1">{result.won ? '🎉' : '😞'}</p>
            <p className={cn('font-black text-lg', result.won ? 'text-green-400' : 'text-red-400')}>
              {result.won ? `+$${result.profit}` : `-$${Math.abs(result.profit)}`}
            </p>
            <p className="text-white/40 text-xs mt-1">
              Result: <span style={{ color: COLOR_META[result.color].bg }}>{COLOR_META[result.color].label}</span>
            </p>
          </div>
        </div>
      )}

      {/* Bet controls */}
      <div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.08] backdrop-blur-xl p-4 mb-4">

          {/* Color buttons */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {(['red', 'black', 'green'] as RouletteColor[]).map(color => {
              const meta = COLOR_META[color]
              const selected = betColor === color
              return (
                <button
                  key={color}
                  onClick={() => setBetColor(color)}
                  disabled={spinning}
                  className={cn(
                    'py-4 rounded-2xl flex flex-col items-center gap-1 transition-all duration-300 border active:scale-95',
                    selected ? 'scale-105' : 'opacity-60 hover:opacity-80'
                  )}
                  style={{
                    backgroundColor: selected ? `${meta.bg}30` : `${meta.bg}10`,
                    borderColor: selected ? meta.bg : `${meta.bg}30`,
                    boxShadow: selected ? `0 0 20px ${meta.bg}40` : 'none',
                  }}
                >
                  <span className="text-2xl">{meta.emoji}</span>
                  <span className="text-white font-bold text-sm">{meta.label}</span>
                  <span className="text-white/60 text-xs font-semibold">{meta.mult}x</span>
                </button>
              )
            })}
          </div>

          {/* Bet input */}
          <div className="mb-3">
            <label className="text-white/40 text-[10px] uppercase tracking-widest font-semibold block mb-1.5">Bet Amount</label>
            <input
              type="number"
              value={betInput}
              onChange={e => setBetInput(e.target.value)}
              disabled={spinning}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm font-bold focus:outline-none focus:border-indigo-500/50 disabled:opacity-50"
              placeholder="0"
              min="1"
            />
            <div className="flex gap-1.5 mt-1.5">
              {[50, 100, 250, 500].map(v => (
                <button
                  key={v}
                  onClick={() => setBetInput(String(v))}
                  disabled={spinning}
                  className="flex-1 py-1 rounded-lg bg-white/5 border border-white/10 text-white/50 text-[10px] font-bold hover:bg-white/10 hover:text-white disabled:opacity-30 transition-all"
                >
                  ${v}
                </button>
              ))}
            </div>
          </div>

          {/* Potential win */}
          {betColor && betAmount > 0 && (
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-white/40 text-xs">Potential win</span>
              <span className="text-white font-bold text-sm">
                ${Math.round(betAmount * COLOR_META[betColor].mult).toLocaleString()}
              </span>
            </div>
          )}

          <button
            onClick={spin}
            disabled={!canSpin}
            className={cn(
              'w-full py-4 rounded-2xl font-black text-base transition-all duration-300 active:scale-95',
              canSpin
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50'
                : 'bg-white/5 text-white/50 border border-white/10 cursor-not-allowed'
            )}
          >
            {spinning ? 'Spinning...' : !betColor ? 'Select a color' : `Spin • $${betAmount.toLocaleString()}`}
          </button>
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div>
          <div>
            <p className="text-white/50 text-xs font-semibold tracking-widest uppercase mb-2">History</p>
            <div className="flex gap-1.5 flex-wrap">
              {history.map((color, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black"
                  style={{ backgroundColor: COLOR_META[color].bg }}
                >
                  {color === 'green' ? '0' : color === 'red' ? 'R' : 'B'}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
