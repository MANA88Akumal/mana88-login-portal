import { useAuth } from '../hooks/useAuth'
import { ClipboardList, TrendingUp, Wallet, LogOut, User, ShieldAlert } from 'lucide-react'

// Icon mapping
const IconMap = {
  ClipboardList,
  TrendingUp,
  Wallet
}

function AppCard({ system, onClick }) {
  const Icon = IconMap[system.icon] || ClipboardList
  
  return (
    <button
      onClick={onClick}
      className="app-card text-left w-full group"
    >
      <div className={`w-16 h-16 ${system.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{system.name}</h3>
      <p className="text-gray-500 text-sm">{system.description}</p>
      <div className="mt-4 flex items-center text-emerald-600 font-medium text-sm">
        Open App
        <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  )
}

function NoAccessMessage() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
      <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <ShieldAlert className="w-8 h-8 text-amber-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">No Access Granted</h3>
      <p className="text-gray-500 mb-4">
        Your account doesn't have access to any systems yet. Please contact an administrator to request access.
      </p>
      <p className="text-sm text-gray-400">
        Contact: admin@manaakumal.com
      </p>
    </div>
  )
}

export default function AppSelector() {
  const { user, profile, signOut, getAccessibleSystems } = useAuth()
  const systems = getAccessibleSystems()

  function handleAppClick(system) {
    window.location.href = system.url
  }

  return (
    <div className="min-h-screen bg-mana-gradient">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <span className="text-lg font-bold text-emerald-700">M88</span>
            </div>
            <span className="text-xl font-semibold text-white">MANA88</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-white/80">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.full_name} 
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
              )}
              <span className="text-sm hidden sm:block">{profile?.full_name || user?.email}</span>
            </div>
            
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-3 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:block text-sm">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}!
          </h1>
          <p className="text-emerald-100">
            Select an application to get started
          </p>
        </div>

        {systems.length === 0 ? (
          <div className="flex justify-center">
            <NoAccessMessage />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {systems.map(system => (
              <AppCard 
                key={system.id} 
                system={system} 
                onClick={() => handleAppClick(system)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 py-4 text-center text-emerald-100/60 text-sm">
        © 2026 MANA88 Akumal. All rights reserved.
      </footer>
    </div>
  )
}
