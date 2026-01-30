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
