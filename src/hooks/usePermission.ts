import { useAuth } from '../components/auth/auth-provider'

export type UserRole = 'admin' | 'cs' | 'user'

/**
 * 权限判断自定义 Hook
 * 
 * @description
 * 封装权限逻辑，统一管理角色权限判断
 * 
 * @example
 * ```tsx
 * const { hasRole, isAdmin, isCS, canAccess } = usePermission()
 * 
 * if (canAccess(['admin', 'cs'])) {
 *   // 渲染管理功能
 * }
 * ```
 */
export function usePermission() {
  const { userRole, isAuthenticated } = useAuth()

  /**
   * 检查用户是否具有指定角色
   */
  const hasRole = (role: UserRole): boolean => {
    return isAuthenticated && userRole === role
  }

  /**
   * 检查用户是否具有多个角色中的任一角色
   */
  const canAccess = (allowedRoles: UserRole[]): boolean => {
    return isAuthenticated && allowedRoles.includes(userRole as UserRole)
  }

  /**
   * 检查是否为管理员
   */
  const isAdmin = (): boolean => {
    return hasRole('admin')
  }

  /**
   * 检查是否为客服
   */
  const isCS = (): boolean => {
    return hasRole('cs')
  }

  /**
   * 检查是否为管理员或客服（后台人员）
   */
  const isStaff = (): boolean => {
    return canAccess(['admin', 'cs'])
  }

  /**
   * 检查是否为普通用户
   */
  const isRegularUser = (): boolean => {
    return hasRole('user')
  }

  return {
    userRole,
    isAuthenticated,
    hasRole,
    canAccess,
    isAdmin,
    isCS,
    isStaff,
    isRegularUser
  }
}
