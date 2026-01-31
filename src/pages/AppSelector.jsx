import { useAuth } from '../hooks/useAuth'
import { ClipboardList, TrendingUp, Wallet, LogOut } from 'lucide-react'

const iconMap = {
  ClipboardList,
  TrendingUp,
  Wallet
}

export default function AppSelector() {
  const { user, signOut, getAccessibleSystems } = useAuth()
  const systems = getAccessibleSystems()

  const handleAppClick = (url) => {
    window.location.href = url
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <img 
              src="https://manaakumal.com/wp-content/uploads/2025/06/logo-main-black.png" 
              alt="MANA88" 
              className="h-10 w-auto"
            />
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <button
                onClick={signOut}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
          <p className="mt-2 text-gray-600">Select an application to get started</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {systems.map((system) => {
            const Icon = iconMap[system.icon]
            return (
              <button
                key={system.id}
                onClick={() => handleAppClick(system.url)}
                className="bg-white rounded-xl border border-gray-200 p-6 text-left hover:shadow-lg hover:border-emerald-200 transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  system.id === 'cms' ? 'bg-emerald-100 text-emerald-600' :
                  system.id === 'investors' ? 'bg-blue-100 text-blue-600' :
                  'bg-amber-100 text-amber-600'
                }`}>
                  {Icon && <Icon className="w-6 h-6" />}
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-1">{system.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{system.description}</p>
                <span className="text-sm font-medium text-emerald-600 group-hover:text-emerald-700">
                  Open App →
                </span>
              </button>
            )
          })}
        </div>
      </main>

      <footer className="absolute bottom-0 w-full py-6">
        <p className="text-center text-xs text-gray-400">
          © 2026 MANA88 Akumal. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
