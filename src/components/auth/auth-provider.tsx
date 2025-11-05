import React, { createContext, useContext, useEffect, useState } from 'react'
import { authHelpers, type AuthUser } from '../../utils/supabase/client'
import { toast } from 'sonner@2.0.3'
import { OfflineModeBanner } from '../utils/offline-mode-banner'

interface AuthContextType {
  user: AuthUser | null
  userRole: string
  isLoading: boolean
  isAuthenticated: boolean
  isOfflineMode: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [userRole, setUserRole] = useState<string>('user')
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isOfflineMode, setIsOfflineMode] = useState(false)

  // Initialize auth state and set up auth state change listener
  useEffect(() => {
    let isMounted = true

    const initializeAuth = async () => {
      const startTime = performance.now()
      console.log('[Auth] Starting initialization...')
      
      try {
        // Check for existing session with aggressive timeout
        const sessionStart = performance.now()
        let session = null
        let sessionCheckFailed = false
        
        try {
          const result = await authHelpers.getSession()
          session = result.session
          const sessionTime = (performance.now() - sessionStart).toFixed(0)
          
          if (result.error) {
            console.warn(`[Auth] Session check failed (${sessionTime}ms):`, result.error.message)
            sessionCheckFailed = true
          } else {
            console.log(`[Auth] Session check completed in ${sessionTime}ms`)
          }
        } catch (sessionError) {
          const sessionTime = (performance.now() - sessionStart).toFixed(0)
          console.warn(`[Auth] Session check timeout (${sessionTime}ms) - Supabase may be unreachable`)
          sessionCheckFailed = true
        }
        
        // If session check failed, enable offline mode
        if (sessionCheckFailed && isMounted) {
          console.info('[Auth] 💡 Continuing in guest mode. Auth features may be unavailable.')
          setIsOfflineMode(true)
        }
        
        // Process session if available
        // FIXED: Prioritize session data to avoid unnecessary API calls and race conditions
        if (session?.user && isMounted) {
          try {
            // Extract role directly from session (no additional API call needed!)
            const role = session.user.user_metadata?.role || 'user'
            console.log(`[Auth] ✓ Session found - Role: ${role}`)
            
            // Use session user data directly - it already contains everything we need
            setUser(session.user as AuthUser)
            setUserRole(role)
            setIsAuthenticated(true)
            
            // Optional: Fetch fresh user data in background (non-blocking)
            // This keeps data fresh but doesn't block initial load
            authHelpers.getUser().then(({ user: freshUser }) => {
              if (freshUser && isMounted) {
                const freshRole = freshUser.user_metadata?.role || role
                if (freshRole !== role) {
                  console.log(`[Auth] 🔄 Role updated from background fetch: ${freshRole}`)
                  setUserRole(freshRole)
                }
                setUser(freshUser as AuthUser)
              }
            }).catch(err => {
              console.warn('[Auth] Background user fetch failed (non-critical):', err.message)
            })
          } catch (userError) {
            console.warn('[Auth] Error processing session, using fallback')
            if (isMounted) {
              setUser(session.user as AuthUser)
              setUserRole(session.user.user_metadata?.role || 'user')
              setIsAuthenticated(true)
            }
          }
        } else if (!session && isMounted) {
          console.log('[Auth] No active session - continuing as guest')
        }
      } catch (error) {
        // This should rarely happen now, but handle it gracefully
        console.warn('[Auth] Initialization encountered an error:', error)
      } finally {
        if (isMounted) {
          setIsLoading(false)
          const totalTime = (performance.now() - startTime).toFixed(0)
          console.log(`[Auth] ✓ Initialization complete in ${totalTime}ms`)
        }
      }
    }

    // Set up auth state change listener
    const { data: { subscription } } = authHelpers.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email)
      
      if (!isMounted) return

      if (event === 'SIGNED_IN' && session?.user) {
        // FIXED: Use session data immediately to prevent role degradation
        if (!isMounted) return
        
        // Extract role directly from session - it's already there!
        const role = session.user.user_metadata?.role || 'user'
        console.log(`[Auth] SIGNED_IN event - Role: ${role}`)
        
        setUser(session.user as AuthUser)
        setUserRole(role)
        setIsAuthenticated(true)
        setIsLoading(false)
        toast.success('登入成功！')
        
        // Optional: Fetch fresh user data in background (non-blocking)
        authHelpers.getUser().then(({ user: freshUser }) => {
          if (freshUser && isMounted) {
            const freshRole = freshUser.user_metadata?.role || role
            if (freshRole !== role) {
              console.log(`[Auth] 🔄 Role updated after sign-in: ${freshRole}`)
              setUserRole(freshRole)
            }
            setUser(freshUser as AuthUser)
          }
        }).catch(err => {
          console.warn('[Auth] Background user fetch after sign-in failed (non-critical):', err.message)
        })
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setUserRole('user')
        setIsAuthenticated(false)
        setIsLoading(false)
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully')
        // Optionally update user data on token refresh - non-blocking
        authHelpers.getUser().then(({ user: currentUser }) => {
          if (currentUser && isMounted) {
            setUser(currentUser as AuthUser)
          }
        }).catch(error => {
          console.error('Error refreshing user data:', error)
        })
      }
    })

    initializeAuth()

    // Cleanup function
    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await authHelpers.signIn(email, password)
      
      if (error) {
        return { success: false, error: error.message }
      }

      if (data.user) {
        // User state will be updated by the auth state change listener
        return { success: true }
      }

      return { success: false, error: '登入失敗' }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: '登入過程中發生錯誤' }
    }
  }

  const logout = async (): Promise<void> => {
    try {
      const { error } = await authHelpers.signOut()
      if (error) {
        console.error('Logout error:', error)
        toast.error('登出時發生錯誤')
      } else {
        toast.success('已成功登出')
      }
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('登出時發生錯誤')
    }
  }

  const refreshSession = async (): Promise<void> => {
    try {
      const { session } = await authHelpers.getSession()
      if (session) {
        // Force a token refresh by getting the session again
        await authHelpers.getUser()
      }
    } catch (error) {
      console.error('Session refresh error:', error)
    }
  }

  const value: AuthContextType = {
    user,
    userRole,
    isLoading,
    isAuthenticated,
    isOfflineMode,
    login,
    logout,
    refreshSession
  }

  const handleRetry = async () => {
    setIsLoading(true)
    setIsOfflineMode(false)
    // Re-run initialization
    const { session } = await authHelpers.getSession()
    if (session) {
      setIsOfflineMode(false)
      toast.success('連接成功！')
    } else {
      setIsOfflineMode(true)
      toast.error('仍無法連接到認證服務')
    }
    setIsLoading(false)
  }

  return (
    <AuthContext.Provider value={value}>
      <OfflineModeBanner show={isOfflineMode} onRetry={handleRetry} />
      {children}
    </AuthContext.Provider>
  )
}