/**
 * 路由常量配置
 * 
 * @description
 * 集中管理所有前端路由路径
 */

// 前台路由
export const ROUTES = {
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: (id: string) => `/products/${id}`,
  PAYMENT: (orderId: string) => `/payment/${orderId}`,
  PAYMENT_RESULT: '/payment-result',
  
  // PayPal 回调
  PAYPAL_RETURN: '/paypal-return',
  PAYPAL_CANCEL: '/paypal-cancel',
  
  // 后台管理
  ADMIN_DASHBOARD: '/enen',
  ADMIN_LOGIN: '/enen',
  
  // 测试工具
  ADMIN_TEST: '/admin-test',
} as const

// 需要认证的路由
export const PROTECTED_ROUTES = [
  ROUTES.ADMIN_DASHBOARD
]

// 管理员专属路由
export const ADMIN_ONLY_ROUTES = [
  ROUTES.ADMIN_DASHBOARD
]

// 客服可访问路由
export const CS_ACCESSIBLE_ROUTES = [
  ROUTES.ADMIN_DASHBOARD
]
