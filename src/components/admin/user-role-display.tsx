import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { useAuth } from '../auth/auth-provider'
import { Shield, User, Crown, Headphones, RefreshCw } from 'lucide-react'
import { toast } from 'sonner@2.0.3'

interface UserRoleDisplayProps {
  showDetails?: boolean
  showRefresh?: boolean
}

export function UserRoleDisplay({ showDetails = true, showRefresh = false }: UserRoleDisplayProps) {
  const { user, userRole, isAuthenticated, refreshSession } = useAuth()

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4" />
      case 'cs':
        return <Headphones className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
      case 'cs':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return '系統管理員'
      case 'cs':
        return '客服人員'
      default:
        return '一般用戶'
    }
  }

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin':
        return '擁有完整系統管理權限，可以進行所有CRUD操作'
      case 'cs':
        return '客服人員權限，可以查看和處理客戶相關事務'
      default:
        return '基本用戶權限，可以瀏覽產品和提交訂單'
    }
  }

  const handleRefreshRole = async () => {
    try {
      await refreshSession()
      toast.success('用戶角色已刷新')
    } catch (error) {
      console.error('Refresh role error:', error)
      toast.error('角色刷新失敗')
    }
  }

  if (!isAuthenticated || !user) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>請先登入以查看角色資訊</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!showDetails) {
    // Compact display - just the badge
    return (
      <div className="flex items-center gap-2">
        <Badge className={getRoleColor(userRole)} variant="outline">
          {getRoleIcon(userRole)}
          <span className="ml-1">{getRoleLabel(userRole)}</span>
        </Badge>
        {showRefresh && (
          <Button variant="ghost" size="sm" onClick={handleRefreshRole}>
            <RefreshCw className="h-3 w-3" />
          </Button>
        )}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          JWT 角色驗證
        </CardTitle>
        <CardDescription>
          從 Supabase JWT Token 讀取的用戶角色資訊
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Role Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              {getRoleIcon(userRole)}
            </div>
            <div>
              <Badge className={getRoleColor(userRole)} variant="outline" size="lg">
                {getRoleLabel(userRole)}
              </Badge>
              <p className="text-sm text-muted-foreground mt-1">
                {getRoleDescription(userRole)}
              </p>
            </div>
          </div>
          {showRefresh && (
            <Button variant="outline" size="sm" onClick={handleRefreshRole}>
              <RefreshCw className="h-4 w-4 mr-2" />
              刷新
            </Button>
          )}
        </div>

        {/* JWT Details */}
        <div className="border-t pt-4 space-y-3">
          <h4 className="font-medium">JWT Token 詳細資訊</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">用戶ID:</span>
              <p className="font-mono bg-muted px-2 py-1 rounded text-xs mt-1 break-all">
                {user.id}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Email:</span>
              <p className="font-medium mt-1">{user.email}</p>
            </div>
            <div>
              <span className="text-muted-foreground">角色 (user.role):</span>
              <p className="font-mono bg-muted px-2 py-1 rounded text-xs mt-1">
                {userRole}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">最後登入:</span>
              <p className="text-xs mt-1">
                {user.last_sign_in_at 
                  ? new Date(user.last_sign_in_at).toLocaleString('zh-TW')
                  : '未知'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Role Permissions */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">當前角色權限</h4>
          <div className="space-y-2">
            {userRole === 'admin' && (
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>完整管理權限 (SELECT, INSERT, UPDATE, DELETE)</span>
              </div>
            )}
            {userRole === 'cs' && (
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>客服權限 (SELECT, 部分 UPDATE)</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              <span>產品瀏覽權限 (SELECT products)</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              <span>訂單提交權限 (INSERT orders)</span>
            </div>
          </div>
        </div>

        {/* Test Information */}
        <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100">測試狀態</p>
              <p className="text-blue-700 dark:text-blue-300 mt-1">
                {userRole === 'admin' 
                  ? '✅ 成功從 JWT 讀取到 admin 角色，RLS 策略將允許完整 CRUD 操作'
                  : '✅ JWT 角色讀取正常，將根據角色限制操作權限'
                }
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}