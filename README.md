# VAULT — CS:GO Case Opening Simulator

A futuristic, feature-rich CS:GO case opening simulator built with React 18, TypeScript, Vite, and the `react-bits` animation library. Designed with a next-generation dark aesthetic inspired by Apple and Google's newest design language.

---

## Features

### Case Opening
- 6 unique cases at different price points ($1.99 – $49.99)
- Real CS:GO skins (AK-47 Redline, AWP Dragon Lore, M4A4 Howl, Karambit Doppler...) mixed with original invented skins
- Smooth horizontal roulette animation with cubic-bezier easing
- Drop rates by rarity: Common 50% → Ancient 0.5%
- Open 1, 3, or 5 cases at once

### Inventory
- 3D SpotlightCard display for all obtained items
- ElectricBorder effect on Legendary & Ancient items
- Filter by rarity (All, Ancient, Legendary, Mythical, Rare, Uncommon, Common)
- Sell items for 50% of value (double-confirm protection)
- Portfolio stats: item count + total value

### Crash Game
- Live canvas graph with growing multiplier
- 3–6 AI bot players with nicknames, avatars, and auto-cashout logic
- Live chat with bot reactions (win/lose/holding messages)
- Auto-cashout setting for the player
- House edge ~5% crash algorithm

### Roulette
- Horizontal spinning strip animation
- Bet on Red (2x), Black (2x), or Green (14x)
- Full round history display
- Quick-bet buttons ($50 / $100 / $250 / $500)

### Balance System
- Starting balance: **$10,000**
- Top Up button adds **+$1,000** at any time
- Persisted to `localStorage` across sessions
- Animated CountUp display

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| React 18 + TypeScript | UI framework |
| Vite | Build tool |
| Tailwind CSS | Styling |
| react-bits | Animation components (Aurora, SpotlightCard, etc.) |
| Zustand + localStorage | State management + persistence |
| React Router v6 | Client-side routing |
| GSAP | AnimatedContent scroll/mount animations |
| OGL | Aurora WebGL background |

---

## react-bits Components Used

- `Aurora` — animated aurora WebGL background
- `SpotlightCard` — cursor-responsive spotlight on case/inventory cards
- `GradientText` — animated gradient page titles
- `ShinyText` — metallic sheen on the VAULT logo badge
- `DecryptedText` — hacker-style text effects
- `ClickSpark` — particle sparks on every click
- `AnimatedContent` — scroll/mount entrance animations
- `CountUp` — animated balance counter
- `ElectricBorder` — electric arc border on Legendary/Ancient items
- `SplashCursor` — liquid splash cursor effect
- `Noise` — film grain overlay for depth
- `GlassSurface` — Apple-style glass panels

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Project Structure

```
src/
  components/
    layout/        # Layout, Navbar
    game/          # CaseRoulette component
    *.tsx          # react-bits components (auto-installed by shadcn)
  pages/           # Home, Cases, CaseOpen, Inventory, Crash, Roulette
  store/           # Zustand store (balance, inventory, feed)
  data/            # cases.ts, items.ts (25 skins: real + original)
  types/           # TypeScript interfaces
  lib/             # utils.ts, randomize.ts (drop logic, crash algo)
```

---

## Drop Rates

| Rarity | Color | Chance |
|--------|-------|--------|
| Common | Gray `#b0b0b0` | 50% |
| Uncommon | Blue `#4d9fff` | 25% |
| Rare | Purple `#8847ff` | 15% |
| Mythical | Pink `#d32ee6` | 7% |
| Legendary | Red `#eb4b4b` | 2.5% |
| Ancient | Gold `#e4ae39` | 0.5% |
