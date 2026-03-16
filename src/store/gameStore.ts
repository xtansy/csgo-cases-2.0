import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { InventoryItem, FeedEntry } from '@/types'

const INITIAL_BALANCE = 10_000

interface GameStore {
  balance: number
  inventory: InventoryItem[]
  feed: FeedEntry[]

  // Баланс
  topUp: () => void
  deduct: (amount: number) => boolean
  addBalance: (amount: number) => void

  // Инвентарь
  addItem: (item: InventoryItem) => void
  sellItem: (instanceId: string) => void

  // Лента
  pushFeed: (entry: FeedEntry) => void

  // Ресет
  resetBalance: () => void
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      balance: INITIAL_BALANCE,
      inventory: [],
      feed: [],

      topUp: () => set(s => ({ balance: s.balance + 1_000 })),

      deduct: (amount) => {
        const { balance } = get()
        if (balance < amount) return false
        set(s => ({ balance: s.balance - amount }))
        return true
      },

      addBalance: (amount) => set(s => ({ balance: s.balance + amount })),

      addItem: (item) => set(s => ({
        inventory: [item, ...s.inventory],
      })),

      sellItem: (instanceId) => {
        const { inventory } = get()
        const item = inventory.find(i => i.instanceId === instanceId)
        if (!item) return
        const sellPrice = Math.round(item.price * 0.5)
        set(s => ({
          inventory: s.inventory.filter(i => i.instanceId !== instanceId),
          balance: s.balance + sellPrice,
        }))
      },

      pushFeed: (entry) => set(s => ({
        feed: [entry, ...s.feed].slice(0, 20),
      })),

      resetBalance: () => set({ balance: INITIAL_BALANCE }),
    }),
    {
      name: 'csgo-vault-storage',
      partialize: (state) => ({
        balance: state.balance,
        inventory: state.inventory,
        feed: state.feed,
      }),
    }
  )
)
