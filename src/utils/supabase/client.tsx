import { createClient } from '@supabase/supabase-js'
import { projectId, publicAnonKey } from './info'

const supabaseUrl = `https://${projectId}.supabase.co`
const supabaseAnonKey = publicAnonKey

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type AuthUser = {
  id: string
  email: string
  role?: 'admin' | 'cs' | 'user'
  user_metadata?: {
    full_name?: string
    avatar_url?: string
    [key: string]: any
  }
}

// Auth helper functions
export const authHelpers = {
  // Sign up with email and password (using backend endpoint)
  signUp: async (email: string, password: string, userData?: { full_name?: string }) => {
    try {
      // Use backend signup endpoint for auto email confirmation
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-04b375d8/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          email,
          password,
          full_name: userData?.full_name || ''
        })
      })

      const result = await response.json()

      if (!response.ok) {
        return { data: null, error: { message: result.error || 'Registration failed' } }
      }

      // After successful registration, sign in the user
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      return { data, error }
    } catch (error) {
      console.error('Signup error:', error)
      return { data: null, error: { message: 'Registration failed' } }
    }
  },

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  // Sign in with OAuth providers
  signInWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
    return { data, error }
  },



  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current session with timeout protection
  getSession: async () => {
    try {
      // Add aggressive timeout protection - if Supabase is unreachable, fail fast
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Session retrieval timeout')), 5000) // Reduced to 5s
      )
      
      const sessionPromise = supabase.auth.getSession()
      
      const { data: { session }, error } = await Promise.race([
        sessionPromise,
        timeoutPromise
      ]) as any
      
      if (error) {
        console.warn('[Supabase] Session retrieval error:', error.message)
        return { session: null, error, access_token: null }
      }
      return { 
        session, 
        error: null,
        access_token: session?.access_token || null
      }
    } catch (err) {
      // This is expected if Supabase is unreachable - don't spam errors
      console.warn('[Supabase] Session check unavailable:', err instanceof Error ? err.message : 'timeout')
      return { 
        session: null, 
        error: err instanceof Error ? err : new Error('Session retrieval failed'),
        access_token: null 
      }
    }
  },

  // Get current user with timeout protection
  getUser: async () => {
    try {
      // Add timeout protection
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('User retrieval timeout')), 5000) // Reduced to 5s
      )
      
      const userPromise = supabase.auth.getUser()
      
      const { data: { user }, error } = await Promise.race([
        userPromise,
        timeoutPromise
      ]) as any
      
      if (error) {
        console.warn('[Supabase] User retrieval error:', error.message)
        return { user: null, error }
      }
      return { user, error: null }
    } catch (err) {
      console.warn('[Supabase] User check unavailable:', err instanceof Error ? err.message : 'timeout')
      return { 
        user: null, 
        error: err instanceof Error ? err : new Error('User retrieval failed')
      }
    }
  },

  // Reset password
  resetPassword: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email)
    return { data, error }
  },

  // Check user role (assuming role is stored in user metadata)
  // FIXED: Prioritize session data to avoid race conditions and API calls
  checkUserRole: async () => {
    try {
      // PRIORITY 1: Try to get role from existing session (faster, already cached)
      const { session } = await authHelpers.getSession()
      
      if (session?.user?.user_metadata?.role) {
        const roleFromSession = session.user.user_metadata.role
        console.log('[Auth] ✓ Role from session:', roleFromSession)
        return roleFromSession
      }
      
      console.warn('[Auth] ⚠️ No role in session metadata, falling back to user API call')
      
      // PRIORITY 2: Fallback to getUser() only if session doesn't have role
      const timeoutPromise = new Promise<string>((_, reject) => 
        setTimeout(() => reject(new Error('Role check timeout')), 5000)
      )
      
      const rolePromise = (async () => {
        const { user, error } = await authHelpers.getUser()
        if (error) {
          console.error('[Auth] Error fetching user for role check:', error)
          return 'user'
        }
        const role = user?.user_metadata?.role || 'user'
        console.log('[Auth] Role from user API:', role)
        return role
      })()
      
      const role = await Promise.race([rolePromise, timeoutPromise])
      return role as string
    } catch (error) {
      console.error('[Auth] ❌ Role check failed:', error)
      return 'user' // Default to 'user' role on error
    }
  },

  // Listen to auth state changes
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}