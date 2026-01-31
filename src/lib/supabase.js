import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jmlxpcnkovxmadbygolp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptbHhwY25rb3Z4bWFkYnlnb2xwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1ODY0NDIsImV4cCI6MjA4NDE2MjQ0Mn0.vwLJMJbHVofBu7btXmUYisB5RtEWkpyDMCrQSzfO0xc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
})

// Shared cookie helpers
export function setSharedAuthCookie(session) {
  if (session) {
    const data = JSON.stringify({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at
    })
    document.cookie = `mana88_session=${encodeURIComponent(data)}; path=/; domain=.manaakumal.com; max-age=${60*60*24*30}; secure; samesite=lax`
  }
}

export function clearSharedAuthCookie() {
  document.cookie = `mana88_session=; path=/; domain=.manaakumal.com; max-age=0; secure; samesite=lax`
}

export function getSharedAuthCookie() {
  const cookies = document.cookie.split(';')
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'mana88_session' && value) {
      try {
        return JSON.parse(decodeURIComponent(value))
      } catch {
        return null
      }
    }
  }
  return null
}
