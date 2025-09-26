import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { Switch } from './ui/switch'
type Theme = 'light' | 'dark'

function setTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'dark') root.classList.add('dark')
  else root.classList.remove('dark')
  localStorage.setItem('theme', theme)
}

export default function ThemeToggle() {
  const [checked, setChecked] = useState(false)

  // on mount: respect saved pref (default to light)
  useEffect(() => {
    const saved = (localStorage.getItem('theme') as Theme) || 'light'
    setChecked(saved === 'dark')
    setTheme(saved)
  }, [])

  return (
    <div className="flex items-center gap-2">
      <Sun className="h-4 w-4" />
      <Switch
        checked={checked}
        onCheckedChange={(v:any) => {
          setChecked(v)
          setTheme(v ? 'dark' : 'light')
        }}
        aria-label="Toggle dark mode"
      />
      <Moon className="h-4 w-4" />
    </div>
  )
}
