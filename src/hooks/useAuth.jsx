import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

// System definitions
export const SYSTEMS = {
  cms: {
    id: 'cms',
    name: 'Client Management',
    description: 'Manage sales cases, payments, and contracts',
    url: 'https://cms.manaakumal.com',
    icon: 'ClipboardList',
    color: 'bg-emerald-500',
    roles: ['admin', 'sales', 'finance']
  },
  investors: {
    id: 'investors',
    name: 'Investor Portal',
    description: 'View project financials and investment details',
    url: 'https://investors.manaakumal.com',
    icon: 'TrendingUp',
    color: 'bg-blue-500',
    roles: ['admin', 'investor']
  },
  cash: {
    id: 'cash',
    name: 'Cash Flow',
    description: 'Track income, expenses, and cash projections',
    url: 'https://cash.manaakumal.com',
    icon: 'Wallet',
    color: 'bg-amber-500',
    roles: ['admin', 'finance']
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for auth tokens in URL hash (OAuth callback)
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    
    if (accessToken) {
      console.log('Found access token in URL, processing...')
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session ? 'found' : 'none')
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, session?.user?.email)
        setUser(session?.user ?? null)
        
        if (event === 'SIGNED_IN' && session?.user) {
          if (window.location.hash) {
            window.history.replaceState(null, '', window.location.pathname)
          }
          await fetchProfile(session.user.id)
        } else if (event === 'SIGNED_OUT') {
          setProfile(null)
          setLoading(false)
        } else if (!session) {
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
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
    const redirectTo = window.location.origin
    console.log('Signing in with Google, redirect to:', redirectTo)
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTo
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
      .filter(([_, access]) => access && (access === true || access.enabled))
      .map(([systemId]) => SYSTEMS[systemId])
      .filter(Boolean)
  }

  const value = {
    user,
    profile,
    loading,
    signInWithGoogle,
    signOut,
    getAccessibleSystems,
    SYSTEMS
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
