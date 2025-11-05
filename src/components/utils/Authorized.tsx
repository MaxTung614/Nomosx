/**
 * 权限控制组件
 * 
 * @description
 * 用于控制组件的访问权限，根据用户角色显示或隐藏内容
 * 
 * @example
 * ```tsx
 * // 仅管理员可见
 * <Authorized requiredRole="admin">
 *   <AdminDashboard />
 * </Authorized>
 * 
 * // 管理员或客服可见
 * <Authorized requiredRoles={['admin', 'cs']}>
 *   <ManagementPanel />
 * </Authorized>
 * 
 * // 需要认证即可
 * <Authorized requireAuth>
 *   <UserProfile />
 * </Authorized>
 * 
 * // 自定义无权限提示
 * <Authorized requiredRole="admin" fallback={<NoAccessMessage />}>
 *   <SensitiveData />
 * </Authorized>
 * ```
 */

import React from 'react'
import { usePermission } from '../../hooks/usePermission'
import type { UserRole } from '../../types/user'

interface AuthorizedProps {
  children: React.ReactNode
  requiredRole?: UserRole
  requiredRoles?: UserRole[]
  requireAuth?: boolean
  fallback?: React.ReactNode
}

export function Authorized({
  children,
  requiredRole,
  requiredRoles,
  requireAuth = false,
  fallback = null
}: AuthorizedProps) {
  const { isAuthenticated, canAccess, hasRole } = usePermission()

  // 检查是否需要认证
  if (requireAuth && !isAuthenticated) {
    return <>{fallback}</>
  }

  // 检查单个角色
  if (requiredRole && !hasRole(requiredRole)) {
    return <>{fallback}</>
  }

  // 检查多个角色
  if (requiredRoles && !canAccess(requiredRoles)) {
    return <>{fallback}</>
  }

  // 有权限，渲染子组件
  return <>{children}</>
}

/**
 * 无权限提示组件
 */
export function NoAccessMessage() {
  return (
    <div 
      className="flex flex-col items-center justify-center min-h-screen p-6"
      style={{ backgroundColor: '#0B0C10' }}
    >
      <div 
        className="max-w-md w-full p-8 rounded-xl text-center"
        style={{ 
          backgroundColor: '#12141A',
          border: '1px solid #1F2937'
        }}
      >
        <div 
          className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(255, 82, 82, 0.1)' }}
        >
          <svg 
            className="w-8 h-8" 
            style={{ color: '#FF5252' }}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
            />
          </svg>
        </div>
        <h2 className="text-2xl mb-2" style={{ color: '#EAEAEA' }}>
          無訪問權限
        </h2>
        <p style={{ color: '#9EA3AE' }}>
          您沒有權限訪問此內容，請聯繫管理員獲取權限
        </p>
      </div>
    </div>
  )
}

/**
 * 需要登录提示组件
 */
export function LoginRequired({ onLogin }: { onLogin?: () => void }) {
  return (
    <div 
      className="flex flex-col items-center justify-center min-h-screen p-6"
      style={{ backgroundColor: '#0B0C10' }}
    >
      <div 
        className="max-w-md w-full p-8 rounded-xl text-center"
        style={{ 
          backgroundColor: '#12141A',
          border: '1px solid #1F2937'
        }}
      >
        <div 
          className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(255, 193, 7, 0.1)' }}
        >
          <svg 
            className="w-8 h-8" 
            style={{ color: '#FFC107' }}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
            />
          </svg>
        </div>
        <h2 className="text-2xl mb-2" style={{ color: '#EAEAEA' }}>
          需要登入
        </h2>
        <p className="mb-6" style={{ color: '#9EA3AE' }}>
          請先登入以訪問此內容
        </p>
        {onLogin && (
          <button
            onClick={onLogin}
            className="px-6 py-3 rounded-lg transition-all duration-300"
            style={{
              backgroundColor: '#FFC107',
              color: '#0B0C10',
              boxShadow: '0 0 20px rgba(255, 193, 7, 0.3)'
            }}
          >
            立即登入
          </button>
        )}
      </div>
    </div>
  )
}
