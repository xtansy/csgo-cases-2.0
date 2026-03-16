/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0f',
        surface: 'rgba(255,255,255,0.04)',
        'surface-hover': 'rgba(255,255,255,0.08)',
        primary: '#6366f1',
        secondary: '#8b5cf6',
        accent: '#06b6d4',
        success: '#10b981',
        danger: '#ef4444',
        gold: '#f59e0b',
        rarity: {
          common: '#b0b0b0',
          uncommon: '#4d9fff',
          rare: '#8847ff',
          mythical: '#d32ee6',
          legendary: '#eb4b4b',
          ancient: '#e4ae39',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'roulette': 'roulette 3s cubic-bezier(0.23, 1, 0.32, 1) forwards',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(99,102,241,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(99,102,241,0.7), 0 0 80px rgba(99,102,241,0.3)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
