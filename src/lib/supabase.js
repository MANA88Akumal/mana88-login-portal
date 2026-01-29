import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jmlxpcnkovxmadbygolp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptbHhwY25rb3Z4bWFkYnlnb2xwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc1NjY2MzYsImV4cCI6MjA1MzE0MjYzNn0.Z60KJLbYYbFsjl4NJIKBPPwkqp8WEQULR79foZJAcuQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'mana88-login-auth',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'implicit'
  }
})
