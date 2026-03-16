import type { Case } from '@/types'
import { ALL_ITEMS } from './items'

const getItemsByRarities = (rarities: string[]) =>
  ALL_ITEMS.filter(i => rarities.includes(i.rarity))

export const CASES: Case[] = [
  {
    id: 'prime_case',
    name: 'Prime Case',
    price: 2.49,
    icon: '📦',
    color: 'from-blue-500 to-indigo-600',
    description: 'The classic starter case with common finds.',
    items: getItemsByRarities(['common', 'uncommon', 'rare']),
  },
  {
    id: 'neon_uprising',
    name: 'Neon Uprising',
    price: 7.99,
    icon: '⚡',
    color: 'from-cyan-400 to-blue-600',
    description: 'Vibrant electric skins with mythical chance.',
    items: getItemsByRarities(['uncommon', 'rare', 'mythical', 'legendary']),
  },
  {
    id: 'shadow_protocol',
    name: 'Shadow Protocol',
    price: 14.99,
    icon: '🌑',
    color: 'from-violet-600 to-purple-900',
    description: 'Dark elite skins. Legendary tier guaranteed.',
    items: getItemsByRarities(['rare', 'mythical', 'legendary', 'ancient']),
  },
  {
    id: 'apex_vault',
    name: 'Apex Vault',
    price: 49.99,
    icon: '💎',
    color: 'from-yellow-400 to-orange-500',
    description: 'Ultra premium. Ancient drop rate doubled.',
    items: getItemsByRarities(['mythical', 'legendary', 'ancient']),
  },
  {
    id: 'glitch_box',
    name: 'Glitch Box',
    price: 1.99,
    icon: '🎲',
    color: 'from-green-500 to-emerald-700',
    description: 'Cheap case, mostly common. Luck is everything.',
    items: getItemsByRarities(['common', 'uncommon', 'rare']),
  },
  {
    id: 'phantom_crate',
    name: 'Phantom Crate',
    price: 24.99,
    icon: '👻',
    color: 'from-pink-500 to-rose-700',
    description: 'Mythical and above only. No disappointments.',
    items: getItemsByRarities(['mythical', 'legendary', 'ancient']),
  },
]
