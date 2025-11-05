/**
 * 用户相关类型定义
 * 
 * @description
 * 集中管理用户、认证相关的 TypeScript 类型
 */

// 用户角色类型
export type UserRole = 'admin' | 'cs' | 'user'

// 用户基础信息
export interface User {
  id: string
  email: string
  created_at: string
  last_sign_in_at?: string
}

// 用户元数据
export interface UserMetadata {
  full_name?: string
  role?: UserRole
  avatar_url?: string
  phone?: string
  [key: string]: any
}

// 认证用户（包含元数据）
export interface AuthUser extends User {
  user_metadata?: UserMetadata
}

// 会话信息
export interface AuthSession {
  access_token: string
  refresh_token?: string
  expires_in?: number
  expires_at?: number
  user: AuthUser
}

// 登录表单数据
export interface LoginFormData {
  email: string
  password: string
}

// 注册表单数据
export interface RegisterFormData {
  email: string
  password: string
  confirmPassword?: string
  fullName?: string
}

// 用户档案
export interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  phone?: string
  role: UserRole
  created_at: string
  updated_at?: string
}

// 用户权限
export interface UserPermissions {
  canViewDashboard: boolean
  canManageGames: boolean
  canManageOrders: boolean
  canManageUsers: boolean
  canViewReports: boolean
  canExportData: boolean
}
