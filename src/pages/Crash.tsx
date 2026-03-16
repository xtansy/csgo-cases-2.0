import { useState, useEffect, useRef, useCallback } from 'react'
import { useGameStore } from '@/store/gameStore'
import GradientText from '@/components/GradientText'
import { generateCrashPoint } from '@/lib/randomize'
import type { CrashBot, ChatMessage } from '@/types'
import { cn } from '@/lib/utils'

type GameState = 'waiting' | 'running' | 'crashed'

const BOT_NAMES = ['Dmitry_K', 'xX_Sniper', 'ProGamer99', 'Vladimir_P', 'CrazyBet', 'RiskyPlay', 'GoldRush']
const BOT_AVATARS = ['🐺', '🦊', '🐻', '🦁', '🐯', '🦅', '🐉']

function makeBots(): CrashBot[] {
  const count = 3 + Math.floor(Math.random() * 3)
  return Array.from({ length: count }, (_, i) => ({
    id: `bot_${i}`,
    name: BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)],
    avatar: BOT_AVATARS[i % BOT_AVATARS.length],
    bet: Math.floor(Math.random() * 500 + 50),
    cashoutAt: Math.random() < 0.75 ? +(1.2 + Math.random() * 8).toFixed(2) : null,
    status: 'playing' as const,
    profit: 0,
  }))
}

const CHAT_LINES = {
  start: ['LFG!', 'ez money', 'good luck all', 'let it ride 🚀', 'this is the one'],
  win: ['LETS GO!!! 🎉', 'cashed out in time!', 'gg ez', 'told you 😎', '+profit baby'],
  lose: ['oof 💀', 'rip', 'why didnt i cashout', 'got greedy again', 'bruh...'],
  high: ['moon or bust 🌕', 'holding...', 'still holding 💎', 'not selling', 'diamond hands'],
}

export default function Crash() {
  const { balance, deduct, addBalance } = useGameStore()
  const [state, setGameState] = useState<GameState>('waiting')
  const [multiplier, setMultiplier] = useState(1.0)
  const [crashPoint, setCrashPoint] = useState(0)
  const [betInput, setBetInput] = useState('100')
  const [autoCashout, setAutoCashout] = useState('')
  const [hasBet, setHasBet] = useState(false)
  const [cashedOut, setCashedOut] = useState(false)
  const [cashoutMult, setCashoutMult] = useState(0)
  const [bots, setBots] = useState<CrashBot[]>([])
  const [chat, setChat] = useState<ChatMessage[]>([])
  const [countdown, setCountdown] = useState(0)
  const [graphPoints, setGraphPoints] = useState<{ x: number; y: number }[]>([])

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number>(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const pushChat = useCallback((author: string, avatar: string, text: string, type: ChatMessage['type'] = 'normal') => {
    setChat(prev => [{
      id: `msg_${Date.now()}_${Math.random()}`,
      author, avatar, text, timestamp: Date.now(), type,
    }, ...prev].slice(0, 20))
  }, [])

  // Draw graph
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || graphPoints.length < 2) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const { width, height } = canvas

    ctx.clearRect(0, 0, width, height)

    // Gradient fill
    const grad = ctx.createLinearGradient(0, 0, 0, height)
    const crashed = state === 'crashed'
    grad.addColorStop(0, crashed ? 'rgba(239,68,68,0.3)' : 'rgba(99,102,241,0.4)')
    grad.addColorStop(1, 'transparent')

    ctx.beginPath()
    ctx.moveTo(0, height)
    graphPoints.forEach(({ x, y }) => {
      ctx.lineTo(x * width, height - y * (height * 0.8))
    })
    ctx.lineTo(graphPoints[graphPoints.length - 1].x * width, height)
    ctx.closePath()
    ctx.fillStyle = grad
    ctx.fill()

    // Line
    ctx.beginPath()
    ctx.moveTo(0, height)
    graphPoints.forEach(({ x, y }) => {
      ctx.lineTo(x * width, height - y * (height * 0.8))
    })
    ctx.strokeStyle = crashed ? '#ef4444' : '#6366f1'
    ctx.lineWidth = 3
    ctx.lineJoin = 'round'
    ctx.stroke()
  }, [graphPoints, state])

  const startCountdown = useCallback(() => {
    setCountdown(5)
    setGameState('waiting')
    setMultiplier(1.0)
    setCashedOut(false)
    setHasBet(false)
    setGraphPoints([])

    const newBots = makeBots()
    setBots(newBots)
    newBots.slice(0, 2).forEach(b => pushChat(b.name, b.avatar, CHAT_LINES.start[Math.floor(Math.random() * CHAT_LINES.start.length)]))

    let c = 5
    countdownRef.current = setInterval(() => {
      c--
      setCountdown(c)
      if (c <= 0) {
        clearInterval(countdownRef.current!)
        startRound(newBots)
      }
    }, 1000)
  }, [pushChat])

  const startRound = useCallback((roundBots: CrashBot[]) => {
    const cp = generateCrashPoint()
    setCrashPoint(cp)
    setGameState('running')
    startTimeRef.current = Date.now()

    let points: { x: number; y: number }[] = []

    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000
      const mult = Math.pow(Math.E, 0.15 * elapsed)
      const rounded = Math.floor(mult * 100) / 100
      setMultiplier(rounded)

      const progress = Math.min(elapsed / 20, 1)
      const normalizedY = Math.min((mult - 1) / (cp - 1 + 0.001), 1)
      points = [...points, { x: progress, y: normalizedY }]
      setGraphPoints([...points])

      // Bot cashouts
      setBots(prev => prev.map(bot => {
        if (bot.status === 'playing' && bot.cashoutAt && rounded >= bot.cashoutAt) {
          const profit = Math.round(bot.bet * bot.cashoutAt - bot.bet)
          pushChat(bot.name, bot.avatar, CHAT_LINES.win[Math.floor(Math.random() * CHAT_LINES.win.length)], 'win')
          return { ...bot, status: 'cashedout' as const, profit }
        }
        if (bot.status === 'playing' && rounded > 3 && !bot.cashoutAt) {
          pushChat(bot.name, bot.avatar, CHAT_LINES.high[Math.floor(Math.random() * CHAT_LINES.high.length)])
        }
        return bot
      }))

      // Auto cashout
      const autoVal = parseFloat(autoCashout)
      if (!cashedOut && autoVal > 0 && rounded >= autoVal) {
        handleCashout(rounded)
      }

      if (rounded >= cp) {
        clearInterval(intervalRef.current!)
        setMultiplier(cp)
        setGameState('crashed')
        setBots(prev => prev.map(b => b.status === 'playing' ? { ...b, status: 'lost' as const } : b))
        setTimeout(startCountdown, 3000)
      }
    }, 50)
  }, [autoCashout, cashedOut, pushChat, startCountdown])

  const handleBet = () => {
    const amount = parseFloat(betInput)
    if (isNaN(amount) || amount <= 0 || !deduct(amount)) return
    setHasBet(true)
  }

  const handleCashout = useCallback((currentMult?: number) => {
    if (!hasBet || cashedOut) return
    const mult = currentMult ?? multiplier
    const amount = parseFloat(betInput)
    const winnings = Math.round(amount * mult)
    addBalance(winnings)
    setCashedOut(true)
    setCashoutMult(mult)
    pushChat('You', '😎', `Cashed out at ${mult.toFixed(2)}x! +$${winnings - amount}`, 'win')
  }, [hasBet, cashedOut, multiplier, betInput, addBalance, pushChat])

  // Start initial countdown
  useEffect(() => {
    startCountdown()
    return () => {
      clearInterval(intervalRef.current!)
      clearInterval(countdownRef.current!)
    }
  }, [])

  const betAmount = parseFloat(betInput) || 0
  const potentialWin = hasBet ? Math.round(betAmount * multiplier) : 0
  const isRunning = state === 'running'
  const isCrashed = state === 'crashed'

  return (
    <div className="min-h-screen px-4 pt-8 pb-4 max-w-lg mx-auto">

      <div>
        <div className="mb-5">
          <GradientText colors={['#10b981', '#06b6d4', '#6366f1']} animationSpeed={3} className="text-3xl font-black tracking-tight">
            Crash
          </GradientText>
          <p className="text-white/40 text-sm mt-1">Balance: <span className="text-indigo-300 font-semibold">${balance.toLocaleString()}</span></p>
        </div>
      </div>

      {/* Graph */}
      <div>
        <div className="relative rounded-3xl border border-white/10 bg-black/60 backdrop-blur-xl overflow-hidden mb-4 h-48">
          <canvas ref={canvasRef} className="w-full h-full" width={600} height={200} />

          {/* Multiplier display */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {state === 'waiting' ? (
              <div className="text-center">
                <p className="text-white/40 text-sm mb-1">Next round in</p>
                <p className="text-5xl font-black text-white">{countdown}s</p>
              </div>
            ) : (
              <div className="text-center">
                <p
                  className={cn(
                    'text-6xl font-black tabular-nums transition-colors duration-300',
                    isCrashed ? 'text-red-400' : cashedOut ? 'text-green-400' : 'text-white'
                  )}
                  style={{
                    textShadow: isCrashed ? '0 0 30px #ef4444' : cashedOut ? '0 0 30px #10b981' : '0 0 30px #6366f1',
                  }}
                >
                  {multiplier.toFixed(2)}x
                </p>
                {isCrashed && <p className="text-red-400 font-bold text-sm mt-1">CRASHED!</p>}
                {cashedOut && !isCrashed && (
                  <p className="text-green-400 font-bold text-sm mt-1">
                    Cashed out at {cashoutMult.toFixed(2)}x
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bots */}
      <div>
        <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-none">
          {bots.map(bot => (
            <div
              key={bot.id}
              className={cn(
                'flex-shrink-0 rounded-xl px-3 py-2 border text-center min-w-[80px] transition-all duration-300',
                bot.status === 'cashedout' ? 'bg-green-500/10 border-green-500/30' :
                bot.status === 'lost' ? 'bg-red-500/10 border-red-500/30' :
                'bg-white/[0.10] border-white/10'
              )}
            >
              <div className="text-xl mb-0.5">{bot.avatar}</div>
              <p className="text-white/70 text-[10px] font-semibold truncate max-w-[70px]">{bot.name}</p>
              <p className={cn(
                'text-[10px] font-bold',
                bot.status === 'cashedout' ? 'text-green-400' :
                bot.status === 'lost' ? 'text-red-400' : 'text-white/40'
              )}>
                {bot.status === 'cashedout' ? `+$${bot.profit}` :
                 bot.status === 'lost' ? `-$${bot.bet}` :
                 `$${bot.bet}`}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Bet controls */}
      <div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.08] backdrop-blur-xl p-4 mb-4">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-white/40 text-[10px] uppercase tracking-widest font-semibold block mb-1.5">Bet Amount</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={betInput}
                  onChange={e => setBetInput(e.target.value)}
                  disabled={isRunning || hasBet}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm font-bold focus:outline-none focus:border-indigo-500/50 disabled:opacity-50"
                  placeholder="0"
                  min="1"
                />
              </div>
              <div className="flex gap-1.5 mt-1.5">
                {[50, 100, 500].map(v => (
                  <button
                    key={v}
                    onClick={() => setBetInput(String(v))}
                    disabled={isRunning || hasBet}
                    className="flex-1 py-1 rounded-lg bg-white/5 border border-white/10 text-white/50 text-[10px] font-bold hover:bg-white/10 hover:text-white disabled:opacity-30 transition-all"
                  >
                    ${v}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-white/40 text-[10px] uppercase tracking-widest font-semibold block mb-1.5">Auto Cashout</label>
              <input
                type="number"
                value={autoCashout}
                onChange={e => setAutoCashout(e.target.value)}
                disabled={hasBet}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm font-bold focus:outline-none focus:border-indigo-500/50 disabled:opacity-50"
                placeholder="e.g. 2.00"
                step="0.1"
                min="1.01"
              />
              {hasBet && !cashedOut && isRunning && (
                <p className="text-indigo-300 text-[10px] mt-1.5 font-semibold">
                  Potential: ${potentialWin.toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {/* Action button */}
          {!hasBet ? (
            <button
              onClick={handleBet}
              disabled={isRunning || betAmount <= 0 || betAmount > balance}
              className={cn(
                'w-full py-3.5 rounded-2xl font-black text-base transition-all duration-300 active:scale-95',
                !isRunning && betAmount > 0 && betAmount <= balance
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'bg-white/5 text-white/50 border border-white/10 cursor-not-allowed'
              )}
            >
              {state === 'waiting' ? `Place Bet $${betAmount.toLocaleString()}` :
               isRunning ? 'Round in progress' : 'Waiting...'}
            </button>
          ) : !cashedOut ? (
            <button
              onClick={() => handleCashout()}
              disabled={!isRunning || cashedOut}
              className="w-full py-3.5 rounded-2xl font-black text-base bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all active:scale-95 animate-pulse-glow"
            >
              CASHOUT {multiplier.toFixed(2)}x = ${potentialWin.toLocaleString()}
            </button>
          ) : (
            <div className="w-full py-3.5 rounded-2xl font-black text-base text-center bg-green-500/10 border border-green-500/30 text-green-400">
              Cashed out at {cashoutMult.toFixed(2)}x ✓
            </div>
          )}
        </div>
      </div>

      {/* Chat */}
      <div>
        <div>
          <p className="text-white/50 text-xs font-semibold tracking-widest uppercase mb-2">Live Chat</p>
          <div className="space-y-1.5 max-h-40 overflow-hidden">
            {chat.slice(0, 6).map(msg => (
              <div key={msg.id} className="flex items-start gap-2 animate-slide-in">
                <span className="text-base flex-shrink-0">{msg.avatar}</span>
                <div className="flex-1 min-w-0">
                  <span className={cn(
                    'text-xs font-bold mr-1',
                    msg.type === 'win' ? 'text-green-400' : msg.type === 'lose' ? 'text-red-400' : 'text-indigo-300'
                  )}>{msg.author}</span>
                  <span className="text-white/60 text-xs">{msg.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
