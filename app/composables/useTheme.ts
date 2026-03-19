export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'warpulse-theme'

export const useTheme = () => {
  const theme = useState<Theme>('theme', () => 'light')

  const apply = (t: Theme) => {
    theme.value = t
    if (import.meta.client) {
      document.documentElement.classList.toggle('dark', t === 'dark')
      localStorage.setItem(STORAGE_KEY, t)
    }
  }

  const toggle = () => apply(theme.value === 'dark' ? 'light' : 'dark')

  const init = () => {
    if (!import.meta.client) return
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null
    const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    apply(saved ?? preferred)
  }

  return { theme, toggle, apply, init }
}
