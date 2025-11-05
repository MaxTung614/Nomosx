/**
 * API 地址常量配置
 * 
 * @description
 * 集中管理所有 API 端点，避免硬编码
 */

// API 基础路径
export const API_BASE_PATH = '/make-server-04b375d8'

// API 端点
export const API_ENDPOINTS = {
  // 游戏相关
  GAMES: `${API_BASE_PATH}/games`,
  GAMES_DETAIL: (id: string) => `${API_BASE_PATH}/games/${id}`,
  
  // 产品相关
  PRODUCTS: `${API_BASE_PATH}/products`,
  DENOMINATIONS: `${API_BASE_PATH}/denominations`,
  
  // 订单相关
  ORDERS: `${API_BASE_PATH}/orders`,
  ORDER_DETAIL: (id: string) => `${API_BASE_PATH}/orders/${id}`,
  ORDER_STATUS: (id: string) => `${API_BASE_PATH}/orders/${id}/status`,
  
  // 支付相关
  PAYMENTS: `${API_BASE_PATH}/payments`,
  PAYMENT_DETAIL: (id: string) => `${API_BASE_PATH}/payments/${id}`,
  PAYPAL_CREATE: `${API_BASE_PATH}/paypal/create-order`,
  PAYPAL_CAPTURE: `${API_BASE_PATH}/paypal/capture-order`,
  
  // CMS 管理相关
  CMS_HOMEPAGE_GAMES: `${API_BASE_PATH}/cms/homepage-games`,
  
  // 认证相关
  AUTH_SIGNUP: `${API_BASE_PATH}/signup`,
  AUTH_CHECK_ROLE: `${API_BASE_PATH}/check-role`,
  
  // 搜索相关
  SEARCH_GAMES: '/search-games'
} as const

// PayPal 回调地址
export const PAYPAL_CALLBACK_URLS = {
  RETURN: '/paypal-return',
  CANCEL: '/paypal-cancel'
} as const
