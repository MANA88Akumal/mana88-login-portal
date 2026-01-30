import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jmlxpcnkovxmadbygolp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptbHhwY25rb3Z4bWFkYnlnb2xwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1ODY0NDIsImV4cCI6MjA4NDE2MjQ0Mn0.vwLJMJbHVofBu7btXmUYisB5RtEWkpyDMCrQSzfO0xc'

// Cookie-based storage for cross-subdomain auth
const cookieStorage = {
  getItem: (key) => {
    const cookies = document.cookie.split(';')
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=')
      if (name === key) {
        return decodeURIComponent(value)
      }
    }
    return null
  },
  setItem: (key, value) => {
    const maxAge = 60 * 60 * 24 * 365 // 1 year
    document.cookie = `${key}=${encodeURIComponent(value)}; path=/; domain=.manaakumal.com; max-age=${maxAge}; secure; samesite=lax`
  },
  removeItem: (key) => {
    document.cookie = `${key}=; path=/; domain=.manaakumal.com; max-age=0; secure; samesite=lax`
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: cookieStorage
  }
})
