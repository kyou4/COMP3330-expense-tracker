import './App.css'
import AppCard from './components/Appcard'
import ThemeToggle from './components/theme-toggle'
export default function App() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl p-6">
        <h1 className="text-3xl font-bold">COMP3330 – Frontend Setup</h1>
        <p className="mt-2 text-sm text-gray-600">Vite • React • Tailwind • ShadCN</p>
        <AppCard/>
        <ThemeToggle/>
      </div>
    </main>
  )
}

