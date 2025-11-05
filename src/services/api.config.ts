// ====================================================================================================
// 文件名: services/api.config.ts
// 描述: API 配置和通用请求方法
// 最后更新: 2025-11-05
// ====================================================================================================

import { projectId, publicAnonKey } from '../utils/supabase/info'
import { authHelpers } from '../utils/supabase/client'
import type { ApiResponse } from '../types'

// API 基础 URL
export const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-04b375d8`

// API 端点配置
export const API_ENDPOINTS = {
  // 认证相关
  auth: {
    signup: '/auth/signup',
    profile: '/auth/profile',
    updateRole: '/auth/update-role',
    users: '/auth/users',
  },
  // 首页游戏管理
  games: {
    list: '/games',
    detail: (id: string) => `/games/${id}`,
    create: '/games',
    update: (id: string) => `/games/${id}`,
    delete: (id: string) => `/games/${id}`,
    uploadCover: '/games/upload-cover',
  },
  // CMS 内容管理
  cms: {
    regions: {
      list: '/cms/regions',
      detail: (id: string) => `/cms/regions/${id}`,
      create: '/cms/regions',
      update: (id: string) => `/cms/regions/${id}`,
      delete: (id: string) => `/cms/regions/${id}`,
    },
    platforms: {
      list: '/cms/platforms',
      detail: (id: string) => `/cms/platforms/${id}`,
      create: '/cms/platforms',
      update: (id: string) => `/cms/platforms/${id}`,
      delete: (id: string) => `/cms/platforms/${id}`,
    },
    displayTags: {
      list: '/cms/display-tags',
      detail: (id: string) => `/cms/display-tags/${id}`,
      create: '/cms/display-tags',
      update: (id: string) => `/cms/display-tags/${id}`,
      delete: (id: string) => `/cms/display-tags/${id}`,
    },
    games: {
      list: '/cms/games',
      detail: (id: string) => `/cms/games/${id}`,
      create: '/cms/games',
      update: (id: string) => `/cms/games/${id}`,
      delete: (id: string) => `/cms/games/${id}`,
    },
    denominations: {
      list: '/cms/denominations',
      detail: (id: string) => `/cms/denominations/${id}`,
      create: '/cms/denominations',
      update: (id: string) => `/cms/denominations/${id}`,
      delete: (id: string) => `/cms/denominations/${id}`,
    },
  },
  // 订单管理
  orders: {
    list: '/admin/orders',
    detail: (id: string) => `/orders/${id}`,
    create: '/orders',
    fulfill: (id: string) => `/orders/${id}/fulfill`,
  },
  // 支付管理
  payments: {
    list: '/admin/payments',
    stats: '/admin/order-stats',
    createPayPalOrder: '/payments/paypal/create-order',
    capturePayPalOrder: (orderId: string) => `/payments/paypal/capture-order/${orderId}`,
  },
} as const

// 请求超时配置（毫秒）
export const REQUEST_TIMEOUT = {
  short: 10000,   // 10 秒 - 一般请求
  medium: 15000,  // 15 秒 - 数据加载
  long: 30000,    // 30 秒 - 文件上传
} as const

// -------------------------------------
// 通用请求方法 (Generic Request Methods)
// -------------------------------------

interface RequestOptions extends RequestInit {
  requireAuth?: boolean
  timeout?: number
  usePublicKey?: boolean
}

/**
 * 通用 API 请求方法
 * @param endpoint - API 端点
 * @param options - 请求选项
 * @returns Promise<ApiResponse>
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const {
    requireAuth = true,
    timeout = REQUEST_TIMEOUT.medium,
    usePublicKey = false,
    ...fetchOptions
  } = options

  try {
    // 构建完整 URL
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`

    // 准备请求头
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    }

    // 添加认证令牌
    if (requireAuth) {
      const { access_token, error: sessionError } = await authHelpers.getSession()
      
      if (sessionError || !access_token) {
        throw new Error('Authentication required')
      }
      
      headers['Authorization'] = `Bearer ${access_token}`
    } else if (usePublicKey) {
      headers['Authorization'] = `Bearer ${publicAnonKey}`
    }

    // 发送请求
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      signal: AbortSignal.timeout(timeout),
    })

    // 解析响应
    if (response.ok) {
      const data = await response.json()
      return {
        success: true,
        data: data.data || data,
        message: data.message,
      }
    } else {
      const error = await response.json().catch(() => ({ error: 'Request failed' }))
      return {
        success: false,
        error: error.error || error.message || 'Unknown error',
      }
    }
  } catch (error) {
    console.error('API request error:', error)
    
    if (error instanceof Error) {
      if (error.name === 'TimeoutError' || error.name === 'AbortError') {
        return {
          success: false,
          error: '請求超時，請檢查網路連線',
        }
      }
      
      if (error.message === 'Authentication required') {
        return {
          success: false,
          error: '會話已過期，請重新登入',
        }
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : '請求失敗',
    }
  }
}

/**
 * GET 请求
 */
export async function apiGet<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    ...options,
    method: 'GET',
  })
}

/**
 * POST 请求
 */
export async function apiPost<T = any>(
  endpoint: string,
  data?: any,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  })
}

/**
 * PUT 请求
 */
export async function apiPut<T = any>(
  endpoint: string,
  data?: any,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  })
}

/**
 * DELETE 请求
 */
export async function apiDelete<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    ...options,
    method: 'DELETE',
  })
}

/**
 * 文件上传请求
 */
export async function apiUpload<T = any>(
  endpoint: string,
  file: File,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const {
    requireAuth = true,
    timeout = REQUEST_TIMEOUT.long,
    ...fetchOptions
  } = options

  try {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`

    const headers: HeadersInit = {
      ...fetchOptions.headers,
    }

    if (requireAuth) {
      const { access_token, error: sessionError } = await authHelpers.getSession()
      
      if (sessionError || !access_token) {
        throw new Error('Authentication required')
      }
      
      headers['Authorization'] = `Bearer ${access_token}`
    }

    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(url, {
      ...fetchOptions,
      method: 'POST',
      headers,
      body: formData,
      signal: AbortSignal.timeout(timeout),
    })

    if (response.ok) {
      const data = await response.json()
      return {
        success: true,
        data: data.data || data,
      }
    } else {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }))
      return {
        success: false,
        error: error.error || 'Upload failed',
      }
    }
  } catch (error) {
    console.error('Upload error:', error)
    
    if (error instanceof Error) {
      if (error.name === 'TimeoutError' || error.name === 'AbortError') {
        return {
          success: false,
          error: '上傳超時，請檢查網路連線',
        }
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : '上傳失敗',
    }
  }
}
