// ====================================================================================================
// 文件名: services/authService.ts
// 描述: 认证服务
// 最后更新: 2025-11-05
// ====================================================================================================

import { apiGet, apiPost, apiPut, API_ENDPOINTS } from './api.config'
import { authHelpers } from '../utils/supabase/client'
import type { AuthUser, UserRole, ApiResponse } from '../types'

/**
 * 认证服务类
 */
export class AuthService {
  /**
   * 用户注册
   */
  static async signup(data: {
    email: string
    password: string
    full_name?: string
  }): Promise<ApiResponse<{ user: AuthUser }>> {
    return apiPost(API_ENDPOINTS.auth.signup, data, { requireAuth: false })
  }

  /**
   * 用户登录（使用 Supabase Auth）
   */
  static async login(email: string, password: string): Promise<ApiResponse<{ access_token: string }>> {
    try {
      const result = await authHelpers.signIn(email, password)
      
      if (result.error) {
        return {
          success: false,
          error: result.error,
        }
      }

      return {
        success: true,
        data: {
          access_token: result.access_token || '',
        },
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '登入失敗',
      }
    }
  }

  /**
   * 用户登出
   */
  static async logout(): Promise<ApiResponse<void>> {
    try {
      await authHelpers.signOut()
      return {
        success: true,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '登出失敗',
      }
    }
  }

  /**
   * 获取当前用户信息
   */
  static async getCurrentUser(): Promise<ApiResponse<{ user: AuthUser }>> {
    try {
      const result = await authHelpers.getUser()
      
      if (result.error || !result.user) {
        return {
          success: false,
          error: result.error || '獲取用戶信息失敗',
        }
      }

      return {
        success: true,
        data: {
          user: result.user,
        },
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '獲取用戶信息失敗',
      }
    }
  }

  /**
   * 获取用户角色
   */
  static async getUserRole(): Promise<ApiResponse<{ role: UserRole }>> {
    try {
      const role = await authHelpers.checkUserRole()
      return {
        success: true,
        data: {
          role: role as UserRole,
        },
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '獲取用戶角色失敗',
      }
    }
  }

  /**
   * 获取用户资料
   */
  static async getProfile(): Promise<ApiResponse<{ user: AuthUser }>> {
    return apiGet(API_ENDPOINTS.auth.profile, { requireAuth: true })
  }

  /**
   * 更新用户角色（仅 admin）
   */
  static async updateUserRole(userId: string, role: UserRole): Promise<ApiResponse<{ user: AuthUser }>> {
    return apiPut(
      API_ENDPOINTS.auth.updateRole,
      { user_id: userId, role },
      { requireAuth: true }
    )
  }

  /**
   * 获取所有用户列表（仅 admin）
   */
  static async getAllUsers(): Promise<ApiResponse<{ users: AuthUser[] }>> {
    return apiGet(API_ENDPOINTS.auth.users, { requireAuth: true })
  }

  /**
   * 检查当前会话是否有效
   */
  static async checkSession(): Promise<boolean> {
    try {
      const { access_token, error } = await authHelpers.getSession()
      return !error && !!access_token
    } catch {
      return false
    }
  }

  /**
   * 刷新会话令牌
   */
  static async refreshSession(): Promise<ApiResponse<{ access_token: string }>> {
    try {
      const { access_token, error } = await authHelpers.getSession()
      
      if (error || !access_token) {
        return {
          success: false,
          error: '刷新會話失敗',
        }
      }

      return {
        success: true,
        data: {
          access_token,
        },
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '刷新會話失敗',
      }
    }
  }
}

// 导出默认实例
export const authService = AuthService
