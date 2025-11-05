import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { authHelpers } from '../../utils/supabase/client'
import { useAuth } from '../auth/auth-provider'
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react'

export function AuthDebugPanel() {
  const { user, userRole, isAuthenticated, isLoading } = useAuth()
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [checking, setChecking] = useState(false)

  const checkSession = async () => {
    setChecking(true)
    try {
      const { session, error } = await authHelpers.getSession()
      setSessionInfo({
        hasSession: !!session,
        email: session?.user?.email,
        role: session?.user?.user_metadata?.role,
        error: error?.message
      })
    } catch (err) {
      setSessionInfo({
        hasSession: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      })
    }
    setChecking(false)
  }

  useEffect(() => {
    checkSession()
  }, [])

  return (
    <Card className="fixed bottom-4 right-4 w-80 shadow-lg z-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Auth Debug</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={checkSession}
            disabled={checking}
          >
            <RefreshCw className={`h-3 w-3 ${checking ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Loading:</span>
          {isLoading ? (
            <Badge variant="secondary">Loading...</Badge>
          ) : (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Authenticated:</span>
          {isAuthenticated ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">User Email:</span>
          <span className="font-mono">{user?.email || 'N/A'}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Role (Context):</span>
          <Badge variant={userRole === 'admin' || userRole === 'cs' ? 'default' : 'secondary'}>
            {userRole}
          </Badge>
        </div>

        {sessionInfo && (
          <>
            <div className="border-t pt-2 mt-2">
              <p className="text-muted-foreground mb-1">Session Info:</p>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Has Session:</span>
              {sessionInfo.hasSession ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </div>

            {sessionInfo.email && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-mono">{sessionInfo.email}</span>
              </div>
            )}

            {sessionInfo.role && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Role (Session):</span>
                <Badge variant={sessionInfo.role === 'admin' || sessionInfo.role === 'cs' ? 'default' : 'secondary'}>
                  {sessionInfo.role}
                </Badge>
              </div>
            )}

            {sessionInfo.error && (
              <div className="text-red-500 text-xs mt-1">
                Error: {sessionInfo.error}
              </div>
            )}
          </>
        )}

        <div className="border-t pt-2 mt-2">
          <p className="text-muted-foreground">Current Path:</p>
          <code className="text-xs">{window.location.pathname}</code>
        </div>
      </CardContent>
    </Card>
  )
}
