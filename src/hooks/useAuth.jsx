import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const SYSTEMS = {
  cms: {
    id: 'cms',
    name: 'Client Management',
    description: 'Manage sales cases, payments, and contracts',
    url: 'https://cms.manaakumal.com',
    icon: 'ClipboardList',
    color: 'bg-emerald-500',
  },
  investors: {
    id: 'investors',
    name: 'Investor Portal',
    description: 'View project financials and investment details',
    url: 'https://investors.manaakumal.com',
    icon: 'TrendingUp',
    color: 'bg-blue-500',
  },
  cash: {
    id: 'cash',
    name: 'Cash Flow',
    description: 'Track income, expenses, and cash projections',
    url: 'https://cash.manaakumal.com',
    icon: 'Wallet',
    color: 'bg-amber-500',
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, session?.user?.email)
        if (mounted) {
          setUser(session?.user ?? null)
          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })
    if (error) throw error
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
  }

  function getAccessibleSystems() {
    // For now, give access to all systems
    // Later we can add profile-based filtering
    return Object.values(SYSTEMS)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut, getAccessibleSystems, SYSTEMS }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
