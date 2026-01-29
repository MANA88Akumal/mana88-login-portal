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
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function init() {
      // Handle OAuth callback - check for code in URL params (PKCE flow)
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      
      if (code) {
        console.log('Found auth code, exchanging...')
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          console.error('Error exchanging code:', error)
        } else {
          console.log('Session established:', data.user?.email)
          // Clean up URL
          window.history.replaceState({}, '', window.location.pathname)
        }
      }

      // Get session
      const { data: { session } } = await supabase.auth.getSession()
      console.log('Session check:', session ? session.user.email : 'none')
      
      if (mounted) {
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setLoading(false)
        }
      }
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, session?.user?.email)
        if (mounted) {
          setUser(session?.user ?? null)
          if (session?.user) {
            await fetchProfile(session.user.id)
          } else {
            setProfile(null)
            setLoading(false)
          }
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  async function fetchProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          const { data: userData } = await supabase.auth.getUser()
          const newProfile = {
            id: userId,
            email: userData.user?.email,
            full_name: userData.user?.user_metadata?.full_name,
            avatar_url: userData.user?.user_metadata?.avatar_url,
            system_access: { cms: true, investors: true, cash: true }
          }
          
          const { data: created, error: createError } = await supabase
            .from('profiles')
            .insert(newProfile)
            .select()
            .single()
            
          if (!createError) {
            setProfile(created)
          } else {
            console.error('Error creating profile:', createError)
          }
        } else {
          console.error('Error fetching profile:', error)
        }
      } else {
        setProfile(data)
      }
    } catch (err) {
      console.error('Error in fetchProfile:', err)
    } finally {
      setLoading(false)
    }
  }

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
    setProfile(null)
  }

  function getAccessibleSystems() {
    if (!profile?.system_access) return []
    return Object.entries(profile.system_access)
      .filter(([_, access]) => access === true || access?.enabled)
      .map(([systemId]) => SYSTEMS[systemId])
      .filter(Boolean)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signInWithGoogle, signOut, getAccessibleSystems, SYSTEMS }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
