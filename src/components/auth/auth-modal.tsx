import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Alert, AlertDescription } from '../ui/alert'
import { toast } from 'sonner'
import { authHelpers } from '../../utils/supabase/client'
import { Mail, Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultTab?: 'login' | 'register'
}

export function AuthModal({ isOpen, onClose, defaultTab = 'login' }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [showCaptcha, setShowCaptcha] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [error, setError] = useState('')
  
  // Form states
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [registerForm, setRegisterForm] = useState({ 
    email: '', 
    password: '', 
    confirmPassword: '', 
    fullName: '' 
  })
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')

  const resetForms = () => {
    setLoginForm({ email: '', password: '' })
    setRegisterForm({ email: '', password: '', confirmPassword: '', fullName: '' })
    setForgotPasswordEmail('')
    setError('')
    setLoginAttempts(0)
    setShowCaptcha(false)
    setShowForgotPassword(false)
  }

  const handleClose = () => {
    resetForms()
    onClose()
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Add timeout protection for sign-in
      const signInPromise = authHelpers.signIn(loginForm.email, loginForm.password)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('登入請求超時，請重試')), 15000)
      )
      
      const { data, error } = await Promise.race([signInPromise, timeoutPromise]) as any
      
      if (error) {
        setLoginAttempts((prev: number) => prev + 1)
        if (loginAttempts >= 2) { // 3rd attempt triggers CAPTCHA
          setShowCaptcha(true)
        }
        setError(error.message)
        return
      }

      if (data.user) {
        // Don't wait for toast - close modal immediately
        handleClose()
        // Auth state change listener will show success toast
      }
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err?.message || '登入過程中發生錯誤，請稍後再試')
      setLoginAttempts((prev: number) => prev + 1)
      if (loginAttempts >= 2) {
        setShowCaptcha(true)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (registerForm.password !== registerForm.confirmPassword) {
      setError('密碼確認不符')
      setIsLoading(false)
      return
    }

    if (registerForm.password.length < 6) {
      setError('密碼至少需要 6 個字符')
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await authHelpers.signUp(
        registerForm.email, 
        registerForm.password,
        { full_name: registerForm.fullName }
      )
      
      if (error) {
        setError(error.message)
        return
      }

      if (data?.user) {
        toast.success('註冊成功！請檢查您的郵箱以驗證帳戶')
        setActiveTab('login')
        setRegisterForm({ email: '', password: '', confirmPassword: '', fullName: '' })
      }
    } catch (err) {
      setError('註冊過程中發生錯誤，請稍後再試')
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const { error } = await authHelpers.resetPassword(forgotPasswordEmail)
      
      if (error) {
        setError(error.message)
        return
      }

      toast.success('密碼重設郵件已發送！')
      setShowForgotPassword(false)
      setForgotPasswordEmail('')
    } catch (err) {
      setError('發送重設郵件時發生錯誤')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = async (_provider: 'google') => {
    setIsLoading(true)
    setError('')

    try {
      const result = await authHelpers.signInWithGoogle()
      const { error } = result
      
      if (error) {
        setError(error.message)
        return
      }

      // Note: OAuth redirects will handle the success case
      toast.success('正在透過 Google 登入...')
    } catch (err) {
      setError('Google 登入失敗')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-[#12141A] border-[#1E2130]">
        <DialogHeader>
          <DialogTitle className="text-white">
            {showForgotPassword ? '重設密碼' : '歡迎回來'}
          </DialogTitle>
          <DialogDescription className="text-[#9EA3AE]">
            {showForgotPassword 
              ? '輸入您的電子郵件地址，我們將發送重設密碼連結給您' 
              : '請登入您的帳戶或建立新帳戶'
            }
          </DialogDescription>
        </DialogHeader>

        {showForgotPassword ? (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="forgot-email" className="text-white">電子郵件</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="請輸入您的電子郵件"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  className="pl-10 bg-[#1E2130] border-[#363A4F] text-white placeholder:text-[#4B5563] focus:border-[#FFC107]"
                  required
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="bg-[#371B26] border-[#7F1D1D]">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-white">{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForgotPassword(false)}
                className="flex-1 border-[#363A4F] text-white hover:bg-[#1E2130]"
              >
                返回
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1 bg-[#FFC107] hover:bg-[#FFD700] text-[#0B0C10] font-bold">
                {isLoading ? '發送中...' : '發送重設郵件'}
              </Button>
            </div>
          </form>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-[#1E2130]">
              <TabsTrigger value="login" className="text-white data-[state=active]:bg-[#FFC107] data-[state=active]:text-[#0B0C10]">登入</TabsTrigger>
              <TabsTrigger value="register" className="text-white data-[state=active]:bg-[#FFC107] data-[state=active]:text-[#0B0C10]">註冊</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-white">電子郵件</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="請輸入電子郵件"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      className="pl-10 bg-[#1E2130] border-[#363A4F] text-white placeholder:text-[#4B5563] focus:border-[#FFC107]"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-white">密碼</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="請輸入密碼"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      className="pl-10 pr-10 bg-[#1E2130] border-[#363A4F] text-white placeholder:text-[#4B5563] focus:border-[#FFC107]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 h-4 w-4 text-muted-foreground"
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>

                {/* CAPTCHA Placeholder - 預留 CAPTCHA 驗證機制 */}
                {showCaptcha && (
                  <div className="p-4 border border-dashed border-[#363A4F] rounded-lg bg-[#1E2130]">
                    <div className="text-center text-sm text-[#9EA3AE]">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                      <p>CAPTCHA 驗證區域</p>
                      <p className="text-xs">連續登入失敗 3 次後顯示</p>
                      <p className="text-xs text-orange-400">此為預留空間，需接入 CAPTCHA 服務</p>
                    </div>
                  </div>
                )}

                {error && (
                  <Alert variant="destructive" className="bg-[#371B26] border-[#7F1D1D]">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-white">{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full bg-[#FFC107] hover:bg-[#FFD700] text-[#0B0C10] font-bold" disabled={isLoading}>
                  {isLoading ? '登入中...' : '登入'}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-[#FFC107] hover:underline hover:text-[#FFD700]"
                  >
                    忘記密碼？
                  </button>
                </div>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#12141A] px-2 text-[#9EA3AE]">或</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialLogin('google')}
                disabled={isLoading}
                className="w-full bg-white border-white text-[#0B0C10] hover:bg-gray-100"
              >
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#4A90E2" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#FBBC05" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google 登入
              </Button>
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name" className="text-white">姓名</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="請輸入您的姓名"
                      value={registerForm.fullName}
                      onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                      className="pl-10 bg-[#1E2130] border-[#363A4F] text-white placeholder:text-[#4B5563] focus:border-[#FFC107]"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-white">電子郵件</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="請輸入電子郵件"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      className="pl-10 bg-[#1E2130] border-[#363A4F] text-white placeholder:text-[#4B5563] focus:border-[#FFC107]"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-white">密碼</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="請輸入密碼 (至少 6 個字符)"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      className="pl-10 pr-10 bg-[#1E2130] border-[#363A4F] text-white placeholder:text-[#4B5563] focus:border-[#FFC107]"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 h-4 w-4 text-muted-foreground"
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-confirm-password" className="text-white">確認密碼</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="請再次輸入密碼"
                      value={registerForm.confirmPassword}
                      onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                      className="pl-10 pr-10 bg-[#1E2130] border-[#363A4F] text-white placeholder:text-[#4B5563] focus:border-[#FFC107]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 h-4 w-4 text-muted-foreground"
                    >
                      {showConfirmPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive" className="bg-[#371B26] border-[#7F1D1D]">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-white">{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full bg-[#FFC107] hover:bg-[#FFD700] text-[#0B0C10] font-bold" disabled={isLoading}>
                  {isLoading ? '註冊中...' : '註冊'}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">或</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialLogin('google')}
                disabled={isLoading}
                className="w-full bg-white border-white text-[#0B0C10] hover:bg-gray-100"
              >
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#4A90E2" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#FBBC05" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google 註冊
              </Button>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}