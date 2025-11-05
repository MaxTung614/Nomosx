import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Alert, AlertDescription } from '../ui/alert'
import { authHelpers } from '../../utils/supabase/client'
import { Mail, Lock, Shield, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { SupabaseConnectionTest } from '../utils/supabase-connection-test'
import { AuthDebugPanel } from '../utils/auth-debug-panel'

interface AdminLoginPageProps {
  onLoginSuccess: (userRole: string) => void
}

export function AdminLoginPage({ onLoginSuccess }: AdminLoginPageProps) {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  // Check if user is already logged in
  // FIXED: Prioritize session data to avoid role degradation
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const { session } = await authHelpers.getSession()
        if (session?.user) {
          // Extract role directly from session - no additional API call needed!
          const userRole = session.user.user_metadata?.role || 'user'
          console.log('[AdminLogin] Existing session found - Role:', userRole)
          
          // Only trigger success if user has admin/cs role
          if (userRole === 'admin' || userRole === 'cs') {
            console.log('[AdminLogin] Valid admin session detected, triggering redirect')
            onLoginSuccess(userRole)
          } else {
            console.log('[AdminLogin] User has session but no admin privileges')
          }
        } else {
          console.log('[AdminLogin] No existing session found')
        }
      } catch (error) {
        console.error('[AdminLogin] Error checking existing session:', error)
        // Don't block - just continue to login page
      }
    }
    
    checkExistingSession()
  }, [onLoginSuccess])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      console.log('[AdminLogin] Starting login process for:', formData.email)
      
      // Sign in with email and password
      const { data, error: signInError } = await authHelpers.signIn(formData.email, formData.password)
      
      if (signInError) {
        console.error('[AdminLogin] ✗ Sign-in failed:', signInError.message)
        setError(signInError.message)
        return
      }

      if (data.user) {
        // FIXED: Extract role directly from sign-in response data
        // The user object from signIn already contains user_metadata
        const userRole = data.user.user_metadata?.role || 'user'
        console.log('[AdminLogin] ✓ Sign-in successful')
        console.log('[AdminLogin] - User ID:', data.user.id)
        console.log('[AdminLogin] - Email:', data.user.email)
        console.log('[AdminLogin] - Role:', userRole)
        console.log('[AdminLogin] - Has session:', !!data.session)
        console.log('[AdminLogin] - Has access token:', !!data.session?.access_token)
        
        // Check if user has admin/cs privileges
        if (userRole !== 'admin' && userRole !== 'cs') {
          console.warn('[AdminLogin] ⚠️ User does not have admin/cs role')
          setError('此帳號沒有管理員權限。Role: ' + userRole)
          return
        }
        
        console.log('[AdminLogin] ✓ Valid admin/cs role, triggering success callback')
        
        // Call the success handler with role information
        onLoginSuccess(userRole)
      }
    } catch (err) {
      console.error('[AdminLogin] ❌ Exception during login:', err)
      setError('登入過程中發生錯誤，請稍後再試')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: 'email' | 'password') => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
    setError('') // Clear error when user starts typing
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="w-full max-w-md px-6 space-y-6">
        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1 pb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">管理員登入</CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              僅限授權的管理員和客服人員使用
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="admin-email">電子郵件</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="請輸入管理員郵箱"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    className="pl-10"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-password">密碼</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="請輸入密碼"
                    value={formData.password}
                    onChange={handleInputChange('password')}
                    className="pl-10 pr-10"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    登入中...
                  </div>
                ) : (
                  '登入'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
                此登入頁面專為系統管理員和客服人員設計
                <br />
                如需一般用戶登入，請返回主頁面
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Supabase Connection Diagnostic Tool */}
        <SupabaseConnectionTest />
      </div>
      
      {/* Auth Debug Panel */}
      <AuthDebugPanel />
    </div>
  )
}