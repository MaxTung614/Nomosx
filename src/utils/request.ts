/**
 * 统一请求工具
 * 
 * @description
 * 封装统一的 HTTP 请求逻辑，包括：
 * - 请求头统一配置
 * - 错误捕获与提示
 * - 日志记录
 * - 超时处理
 * 
 * @example
 * ```tsx
 * import { request } from '../utils/request'
 * 
 * const data = await request('/api/orders', {
 *   method: 'POST',
 *   data: { gameId: '123' }
 * })
 * ```
 */

import { toast } from 'sonner@2.0.3'
import { projectId, publicAnonKey } from './supabase/info'

// 请求配置接口
export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  data?: any
  headers?: Record<string, string>
  timeout?: number
  showErrorToast?: boolean // 是否自动显示错误提示
  accessToken?: string // 可选的访问令牌
}

// 请求响应接口
export interface RequestResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  statusCode?: number
}

/**
 * 构建完整的 API URL
 */
function buildUrl(endpoint: string): string {
  // 如果是完整的 URL，直接返回
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint
  }

  // 如果是 Supabase Edge Function
  if (endpoint.startsWith('/make-server-') || endpoint.startsWith('/search-')) {
    return `https://${projectId}.supabase.co/functions/v1${endpoint}`
  }

  // 默认使用 Supabase Edge Function
  return `https://${projectId}.supabase.co/functions/v1${endpoint}`
}

/**
 * 统一请求函数
 * 
 * @param endpoint - API 端点路径
 * @param config - 请求配置
 * @returns Promise<RequestResponse>
 */
export async function request<T = any>(
  endpoint: string,
  config: RequestConfig = {}
): Promise<RequestResponse<T>> {
  const {
    method = 'GET',
    data,
    headers = {},
    timeout = 15000,
    showErrorToast = true,
    accessToken
  } = config

  const url = buildUrl(endpoint)

  // 构建请求头
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken || publicAnonKey}`,
    ...headers
  }

  // 构建请求配置
  const fetchOptions: RequestInit = {
    method,
    headers: requestHeaders,
    signal: AbortSignal.timeout(timeout)
  }

  // 添加请求体
  if (data && method !== 'GET') {
    fetchOptions.body = JSON.stringify(data)
  }

  // 日志记录（开发环境）
  if (process.env.NODE_ENV === 'development') {
    console.log('[Request]', {
      method,
      url,
      data,
      headers: requestHeaders
    })
  }

  try {
    const response = await fetch(url, fetchOptions)

    // 解析响应
    let responseData: any
    const contentType = response.headers.get('content-type')
    
    if (contentType?.includes('application/json')) {
      responseData = await response.json()
    } else {
      responseData = await response.text()
    }

    // 日志记录（开发环境）
    if (process.env.NODE_ENV === 'development') {
      console.log('[Response]', {
        status: response.status,
        data: responseData
      })
    }

    // 处理成功响应
    if (response.ok) {
      return {
        success: true,
        data: responseData,
        statusCode: response.status
      }
    }

    // 处理错误响应
    const errorMessage = responseData?.error || responseData?.message || `請求失敗 (${response.status})`
    
    if (showErrorToast) {
      toast.error(errorMessage)
    }

    console.error('[Request Error]', {
      url,
      status: response.status,
      error: errorMessage
    })

    return {
      success: false,
      error: errorMessage,
      statusCode: response.status
    }

  } catch (error) {
    // 处理网络错误或超时
    let errorMessage = '網路連線失敗，請稍後再試'

    if (error instanceof Error) {
      if (error.name === 'TimeoutError' || error.name === 'AbortError') {
        errorMessage = '請求超時，請檢查網路連線'
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = '無法連接到伺服器'
      } else {
        errorMessage = error.message
      }
    }

    if (showErrorToast) {
      toast.error(errorMessage)
    }

    console.error('[Request Exception]', {
      url,
      error
    })

    return {
      success: false,
      error: errorMessage
    }
  }
}

/**
 * GET 请求快捷方法
 */
export async function get<T = any>(
  endpoint: string,
  config?: Omit<RequestConfig, 'method' | 'data'>
): Promise<RequestResponse<T>> {
  return request<T>(endpoint, { ...config, method: 'GET' })
}

/**
 * POST 请求快捷方法
 */
export async function post<T = any>(
  endpoint: string,
  data?: any,
  config?: Omit<RequestConfig, 'method' | 'data'>
): Promise<RequestResponse<T>> {
  return request<T>(endpoint, { ...config, method: 'POST', data })
}

/**
 * PUT 请求快捷方法
 */
export async function put<T = any>(
  endpoint: string,
  data?: any,
  config?: Omit<RequestConfig, 'method' | 'data'>
): Promise<RequestResponse<T>> {
  return request<T>(endpoint, { ...config, method: 'PUT', data })
}

/**
 * DELETE 请求快捷方法
 */
export async function del<T = any>(
  endpoint: string,
  config?: Omit<RequestConfig, 'method' | 'data'>
): Promise<RequestResponse<T>> {
  return request<T>(endpoint, { ...config, method: 'DELETE' })
}

/**
 * PATCH 请求快捷方法
 */
export async function patch<T = any>(
  endpoint: string,
  data?: any,
  config?: Omit<RequestConfig, 'method' | 'data'>
): Promise<RequestResponse<T>> {
  return request<T>(endpoint, { ...config, method: 'PATCH', data })
}
