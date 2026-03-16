import type { Item, Rarity } from '@/types'
import { RARITY_WEIGHTS } from '@/data/items'

export function rollRarity(): Rarity {
  const total = Object.values(RARITY_WEIGHTS).reduce((a, b) => a + b, 0)
  let rand = Math.random() * total
  for (const [rarity, weight] of Object.entries(RARITY_WEIGHTS) as [Rarity, number][]) {
    rand -= weight
    if (rand <= 0) return rarity
  }
  return 'common'
}

export function rollItem(items: Item[]): Item {
  const rarity = rollRarity()

  // Найти предметы нужной редкости в кейсе
  let pool = items.filter(i => i.rarity === rarity)

  // Если пул пустой — берём ближайшую редкость вниз
  if (pool.length === 0) {
    const order: Rarity[] = ['ancient', 'legendary', 'mythical', 'rare', 'uncommon', 'common']
    const idx = order.indexOf(rarity)
    for (let i = idx + 1; i < order.length; i++) {
      pool = items.filter(item => item.rarity === order[i])
      if (pool.length > 0) break
    }
  }

  if (pool.length === 0) return items[Math.floor(Math.random() * items.length)]
  return pool[Math.floor(Math.random() * pool.length)]
}

// Генерирует список предметов для рулетки (80 штук, финальный — выигрышный)
export function generateRouletteItems(caseItems: Item[], winner: Item): Item[] {
  const count = 80
  const result: Item[] = []
  for (let i = 0; i < count - 1; i++) {
    const pool = caseItems.filter(i => i.rarity !== 'ancient' || Math.random() < 0.05)
    result.push(pool[Math.floor(Math.random() * pool.length)] ?? caseItems[0])
  }
  result.push(winner)
  return result
}

// Crash point алгоритм (house edge ~5%)
export function generateCrashPoint(): number {
  const r = Math.random()
  if (r < 0.05) return 1.0  // instant crash (house edge)
  const raw = 1 / (1 - r * 0.95)
  return Math.floor(raw * 100) / 100
}
