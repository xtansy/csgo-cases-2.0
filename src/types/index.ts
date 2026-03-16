export type Rarity = 'common' | 'uncommon' | 'rare' | 'mythical' | 'legendary' | 'ancient'

export interface Item {
  id: string
  name: string
  weapon: string
  skin: string
  rarity: Rarity
  price: number
  icon: string        // emoji or svg icon
  color: string       // rarity color
  wear?: string       // Factory New, Minimal Wear, etc.
  isStatTrak?: boolean
  isReal?: boolean    // реальный CS:GO скин или выдуманный
}

export interface InventoryItem extends Item {
  instanceId: string  // уникальный id экземпляра в инвентаре
  obtainedAt: number  // timestamp
  caseId: string
}

export interface Case {
  id: string
  name: string
  price: number
  icon: string        // emoji
  color: string       // gradient color
  items: Item[]
  description?: string
}

export interface FeedEntry {
  id: string
  item: Item
  caseName: string
  timestamp: number
}

export interface CrashBot {
  id: string
  name: string
  avatar: string
  bet: number
  cashoutAt: number | null  // null = не поставил
  status: 'playing' | 'cashedout' | 'lost'
  profit: number
}

export interface ChatMessage {
  id: string
  author: string
  avatar: string
  text: string
  timestamp: number
  type: 'normal' | 'win' | 'lose'
}

export type RouletteColor = 'red' | 'black' | 'green'
export interface RouletteBet {
  color: RouletteColor
  amount: number
}
