import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{vue,ts}'],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--color-canvas)',
        card:   'var(--color-card)',
        border: 'var(--color-border)',
        muted:  'var(--color-muted)',
        dim:    'var(--color-dim)',
        ink:    'var(--color-ink)',
        surface:'var(--color-surface)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
