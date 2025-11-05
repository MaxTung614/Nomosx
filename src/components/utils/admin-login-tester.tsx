import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { Alert, AlertDescription } from '../ui/alert'
import { authHelpers } from '../../utils/supabase/client'
import { projectId } from '../../utils/supabase/info'
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Eye, EyeOff } from 'lucide-react'

export function AdminLoginTester() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [sessionCheck, setSessionCheck] = useState<any>(null)

  const checkCurrentSession = async () => {
    try {
      const { session, error } = await authHelpers.getSession()
      setSessionCheck({
        hasSession: !!session,
        email: session?.user?.email,
        role: session?.user?.user_metadata?.role,
        userId: session?.user?.id,
        error: error?.message
      })
    } catch (err) {
      setSessionCheck({
        hasSession: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      })
    }
  }

  useEffect(() => {
    checkCurrentSession()
  }, [])

  const testLogin = async () => {
    if (!email || !password) {
      setResult({ success: false, message: '请输入邮箱和密码' })
      return
    }

    setTesting(true)
    setResult(null)

    try {
      console.log('[Tester] Attempting login with:', email)
      
      // Step 1: Try to sign in
      const { data, error } = await authHelpers.signIn(email, password)
      
      if (error) {
        setResult({
          success: false,
          message: `登入失败: ${error.message}`,
          step: 'sign_in',
          error: error
        })
        setTesting(false)
        return
      }

      console.log('[Tester] Sign-in successful:', data)

      // Step 2: Extract role from response
      const userRole = data.user?.user_metadata?.role || 'user'
      console.log('[Tester] User role from sign-in:', userRole)

      // Step 3: Check session immediately after login
      await new Promise(resolve => setTimeout(resolve, 200))
      const { session } = await authHelpers.getSession()
      console.log('[Tester] Session after login:', session)

      setResult({
        success: true,
        message: '登入成功！',
        step: 'complete',
        data: {
          userId: data.user?.id,
          email: data.user?.email,
          roleFromSignIn: userRole,
          roleFromSession: session?.user?.user_metadata?.role,
          hasSession: !!session,
          accessToken: !!data.session?.access_token
        }
      })

      // Refresh session check
      await checkCurrentSession()

    } catch (err) {
      console.error('[Tester] Login test failed:', err)
      setResult({
        success: false,
        message: err instanceof Error ? err.message : '未知错误',
        step: 'exception',
        error: err
      })
    }

    setTesting(false)
  }

  const testLogout = async () => {
    try {
      await authHelpers.signOut()
      setResult({ success: true, message: '登出成功' })
      await checkCurrentSession()
    } catch (err) {
      setResult({
        success: false,
        message: err instanceof Error ? err.message : '登出失败'
      })
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>管理员登录测试工具</CardTitle>
          <CardDescription>
            用于诊断管理员登录问题的测试工具
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Session Status */}
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">当前 Session 状态</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={checkCurrentSession}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            {sessionCheck && (
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Has Session:</span>
                  {sessionCheck.hasSession ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>

                {sessionCheck.email && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-mono text-xs">{sessionCheck.email}</span>
                  </div>
                )}

                {sessionCheck.role && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Role:</span>
                    <Badge variant={sessionCheck.role === 'admin' || sessionCheck.role === 'cs' ? 'default' : 'secondary'}>
                      {sessionCheck.role}
                    </Badge>
                  </div>
                )}

                {sessionCheck.userId && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">User ID:</span>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {sessionCheck.userId.slice(0, 8)}...
                    </code>
                  </div>
                )}

                {sessionCheck.error && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{sessionCheck.error}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>

          {/* Login Test Form */}
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-semibold">测试登录</h3>

            <div className="space-y-2">
              <Label htmlFor="test-email">邮箱</Label>
              <Input
                id="test-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="test-password">密码</Label>
              <div className="relative">
                <Input
                  id="test-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={testLogin}
                disabled={testing}
                className="flex-1"
              >
                {testing ? '测试中...' : '测试登录'}
              </Button>
              <Button
                onClick={testLogout}
                variant="outline"
              >
                登出
              </Button>
            </div>
          </div>

          {/* Test Result */}
          {result && (
            <Alert variant={result.success ? 'default' : 'destructive'}>
              {result.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold">{result.message}</p>
                  
                  {result.data && (
                    <div className="mt-3 space-y-1 text-sm">
                      <p><strong>User ID:</strong> <code>{result.data.userId}</code></p>
                      <p><strong>Email:</strong> {result.data.email}</p>
                      <p><strong>Role (from sign-in):</strong> <Badge>{result.data.roleFromSignIn}</Badge></p>
                      <p><strong>Role (from session):</strong> <Badge>{result.data.roleFromSession}</Badge></p>
                      <p><strong>Has Session:</strong> {result.data.hasSession ? '✓' : '✗'}</p>
                      <p><strong>Has Access Token:</strong> {result.data.accessToken ? '✓' : '✗'}</p>
                    </div>
                  )}

                  {result.error && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm">查看错误详情</summary>
                      <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                        {JSON.stringify(result.error, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Instructions */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-semibold mb-2">使用说明：</p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>输入你的管理员账号和密码</li>
                <li>点击"测试登录"按钮</li>
                <li>查看测试结果，确认 role 是否为 'admin' 或 'cs'</li>
                <li>如果 role 是 'user'，你需要使用 Supabase Dashboard 更新用户角色</li>
              </ol>
              <p className="mt-3 text-sm text-muted-foreground">
                参考文档: <code>/docs/admin/quick-setup-admin.md</code>
              </p>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
