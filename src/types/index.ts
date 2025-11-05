// ====================================================================================================
// 文件名: types/index.ts
// 描述: NomosX 全局类型定义
// 最后更新: 2025-11-05
// ====================================================================================================

// -------------------------------------
// 认证相关类型 (Authentication Types)
// -------------------------------------
export interface AuthUser {
  id: string
  email: string
  user_metadata?: {
    full_name?: string
    role?: string
    avatar_url?: string
  }
  created_at?: string
  last_sign_in_at?: string
}

export interface AuthSession {
  access_token: string
  refresh_token?: string
  user: AuthUser
}

export type UserRole = 'admin' | 'cs' | 'user'

// -------------------------------------
// CMS 相关类型 (CMS Types)
// -------------------------------------
export interface Region {
  id: string
  region_code: string
  region_name: string
  is_archived?: boolean
  created_at: string
  updated_at?: string
}

export interface Platform {
  id: string
  platform_code: string
  platform_name: string
  is_archived?: boolean
  created_at: string
  updated_at?: string
}

export interface DisplayTag {
  id: string
  tag_name: string
  tag_color: string
  is_archived?: boolean
  created_at: string
  updated_at?: string
}

export interface Game {
  id: string
  name: string
  code?: string
  region_code: string
  description?: string
  is_archived?: boolean
  created_at: string
  updated_at?: string
}

export interface Denomination {
  id: string
  game_id: string
  platform_id: string
  display_tag_id?: string
  name: string
  display_price: number
  cost_price: number
  sku_code?: string
  is_available?: boolean
  is_archived?: boolean
  description?: string
  created_at: string
  updated_at?: string
}

// -------------------------------------
// 首页游戏相关类型 (Homepage Games Types)
// -------------------------------------
export interface HomepageGame {
  id: string
  name: string
  coverUrl: string
  price: string
  badge: string | null
  discount: string | null
  order: number
  createdAt: string
  updatedAt: string
}

// -------------------------------------
// 订单相关类型 (Order Types)
// -------------------------------------
export interface Order {
  id: string
  customer_email: string
  game_login_username: string
  denomination_id: string
  quantity: number
  total_price: number
  status: OrderStatus
  payment_status: PaymentStatus
  fulfillment_status: FulfillmentStatus
  payment_method?: string
  payment_id?: string
  created_at: string
  paid_at?: string
  fulfilled_at?: string
  fulfillment_notes?: string
  denominations?: {
    name: string
    display_price: number
  }
}

export type OrderStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type FulfillmentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'

// -------------------------------------
// 支付相关类型 (Payment Types)
// -------------------------------------
export interface PaymentRecord {
  id: string
  order_id: string
  amount: number
  currency: string
  payment_method: string
  payment_id: string
  status: PaymentStatus
  created_at: string
  updated_at?: string
}

export interface PayPalOrderResponse {
  id: string
  status: string
  links: Array<{
    href: string
    rel: string
    method: string
  }>
}

export interface OrderStats {
  total_orders: number
  total_revenue: number
  pending_orders: number
  completed_orders: number
  today_orders: number
  today_revenue: number
}

// -------------------------------------
// API 响应类型 (API Response Types)
// -------------------------------------
export interface ApiResponse<T = any> {
  success?: boolean
  data?: T
  error?: string
  message?: string
}

export interface ListResponse<T> {
  items: T[]
  total: number
  page?: number
  limit?: number
}

// -------------------------------------
// 表单相关类型 (Form Types)
// -------------------------------------
export interface ValidationErrors {
  [key: string]: string
}

export interface FormState<T> {
  data: T
  errors: ValidationErrors
  isSubmitting: boolean
  isValid: boolean
}

// -------------------------------------
// 搜索和过滤相关类型 (Search & Filter Types)
// -------------------------------------
export interface SearchParams {
  query?: string
  filters?: Record<string, any>
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface SortConfig {
  key: string
  order: 'asc' | 'desc'
}

// -------------------------------------
// 图片上传相关类型 (Image Upload Types)
// -------------------------------------
export interface ImageUploadResponse {
  success: boolean
  url?: string
  path?: string
  error?: string
}

// -------------------------------------
// 通用工具类型 (Utility Types)
// -------------------------------------
export type Nullable<T> = T | null
export type Optional<T> = T | undefined
export type AsyncResult<T> = Promise<ApiResponse<T>>
