/**
 * 状态值常量配置
 * 
 * @description
 * 定义系统中使用的各种状态枚举值
 */

// 订单状态
export enum OrderStatus {
  PENDING = 'pending',           // 待处理
  PROCESSING = 'processing',     // 处理中
  COMPLETED = 'completed',       // 已完成
  FAILED = 'failed',            // 失败
  CANCELLED = 'cancelled',       // 已取消
  REFUNDED = 'refunded'          // 已退款
}

// 订单状态显示名称
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: '待處理',
  [OrderStatus.PROCESSING]: '處理中',
  [OrderStatus.COMPLETED]: '已完成',
  [OrderStatus.FAILED]: '失敗',
  [OrderStatus.CANCELLED]: '已取消',
  [OrderStatus.REFUNDED]: '已退款'
}

// 订单状态颜色（用于 Badge）
export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: '#FFC107',      // 黄色
  [OrderStatus.PROCESSING]: '#00E0FF',   // 蓝色
  [OrderStatus.COMPLETED]: '#4CAF50',    // 绿色
  [OrderStatus.FAILED]: '#FF5252',       // 红色
  [OrderStatus.CANCELLED]: '#9E9E9E',    // 灰色
  [OrderStatus.REFUNDED]: '#FF9800'      // 橙色
}

// 支付方式
export enum PaymentMethod {
  PAYPAL = 'paypal',
  CREDIT_CARD = 'credit_card',
  ECPAY = 'ecpay',
  BANK_TRANSFER = 'bank_transfer'
}

// 支付方式显示名称
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.PAYPAL]: 'PayPal',
  [PaymentMethod.CREDIT_CARD]: '信用卡',
  [PaymentMethod.ECPAY]: '綠界支付',
  [PaymentMethod.BANK_TRANSFER]: '銀行轉帳'
}

// 支付状态
export enum PaymentStatus {
  PENDING = 'pending',
  AUTHORIZED = 'authorized',
  CAPTURED = 'captured',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

// 支付状态显示名称
export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: '待支付',
  [PaymentStatus.AUTHORIZED]: '已授權',
  [PaymentStatus.CAPTURED]: '已扣款',
  [PaymentStatus.FAILED]: '失敗',
  [PaymentStatus.REFUNDED]: '已退款'
}

// 用户角色
export enum UserRole {
  ADMIN = 'admin',
  CS = 'cs',
  USER = 'user'
}

// 用户角色显示名称
export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]: '系統管理員',
  [UserRole.CS]: '客服人員',
  [UserRole.USER]: '一般用戶'
}
