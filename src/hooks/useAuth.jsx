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
      // Check for hash params (implicit flow) or query params (PKCE)
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const queryParams = new URLSearchParams(window.location.search)
      
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')
      const code = queryParams.get('code')

      if (accessToken && refreshToken) {
        console.log('Setting session from hash tokens...')
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        })
        if (error) {
          console.error('Error setting session:', error)
        } else {
          console.log('Session set successfully:', data.user?.email)
          window.history.replaceState({}, '', window.location.pathname)
        }
      } else if (code) {
        console.log('Exchanging code for session...')
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          console.error('Error exchanging code:', error)
        } else {
          console.log('Session established:', data.user?.email)
          window.history.replaceState({}, '', window.location.pathname)
        }
      }

      const { data: { session } } = await supabase.auth.getSession()
      console.log('Final session:', session?.user?.email || 'none')
      
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
        console.log('Auth event:', event)
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

      if (error && error.code === 'PGRST116') {
        const { data: userData } = await supabase.auth.getUser()
        const newProfile = {
          id: userId,
          email: userData.user?.email,
          full_name: userData.user?.user_metadata?.full_name,
          avatar_url: userData.user?.user_metadata?.avatar_url,
          system_access: { cms: true, investors: true, cash: true }
        }
        
        const { data: created } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single()
          
        if (created) setProfile(created)
      } else if (data) {
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
        redirectTo: window.location.origin,
        skipBrowserRedirect: false
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
