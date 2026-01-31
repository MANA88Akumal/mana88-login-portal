import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, setSharedAuthCookie, clearSharedAuthCookie } from '../lib/supabase'

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
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [returnTo, setReturnTo] = useState(null)

  useEffect(() => {
    // Check for returnTo parameter
    const params = new URLSearchParams(window.location.search)
    const returnUrl = params.get('returnTo')
    if (returnUrl) {
      setReturnTo(decodeURIComponent(returnUrl))
    }

    // Get session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session)
        setUser(session.user)
        setSharedAuthCookie(session)
        
        // If returnTo, redirect with tokens
        if (returnUrl) {
          const decoded = decodeURIComponent(returnUrl)
          window.location.href = `${decoded}#access_token=${session.access_token}&refresh_token=${session.refresh_token}&expires_at=${session.expires_at}`
          return
        }
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, session?.user?.email)
        
        if (session) {
          setSession(session)
          setUser(session.user)
          setSharedAuthCookie(session)
          
          // Check returnTo
          const params = new URLSearchParams(window.location.search)
          const returnUrl = params.get('returnTo')
          if (returnUrl && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
            const decoded = decodeURIComponent(returnUrl)
            window.location.href = `${decoded}#access_token=${session.access_token}&refresh_token=${session.refresh_token}&expires_at=${session.expires_at}`
            return
          }
        } else {
          setSession(null)
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function signInWithGoogle() {
    const params = new URLSearchParams(window.location.search)
    const returnUrl = params.get('returnTo')
    
    const redirectTo = returnUrl 
      ? `${window.location.origin}?returnTo=${encodeURIComponent(returnUrl)}`
      : window.location.origin
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo }
    })
    if (error) throw error
  }

  async function signOut() {
    clearSharedAuthCookie()
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
  }

  function getAccessibleSystems() {
    return Object.values(SYSTEMS)
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signInWithGoogle, signOut, getAccessibleSystems, SYSTEMS, returnTo }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
