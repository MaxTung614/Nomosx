/**
 * 支付相关类型定义
 * 
 * @description
 * 集中管理支付相关的 TypeScript 类型
 */

// 支付方式
export type PaymentMethod = 'paypal' | 'credit_card' | 'ecpay' | 'bank_transfer'

// 支付状态
export type PaymentStatus = 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded'

// 货币类型
export type Currency = 'TWD' | 'USD' | 'CNY' | 'HKD' | 'JPY'

// 支付记录
export interface PaymentRecord {
  id: string
  order_id: string
  amount: number
  currency: Currency
  payment_method: PaymentMethod
  payment_provider: string // 'paypal', 'ecpay', 'stripe', etc.
  payment_id: string // 第三方支付平台的支付 ID
  status: PaymentStatus
  customer_email: string
  customer_name?: string
  metadata?: Record<string, any>
  error_message?: string
  created_at: string
  updated_at?: string
  authorized_at?: string
  captured_at?: string
  refunded_at?: string
}

// 创建支付请求
export interface CreatePaymentRequest {
  orderId: string
  paymentMethod: PaymentMethod
  customerEmail: string
  customerName?: string
  customerPhone?: string
  returnUrl?: string
  cancelUrl?: string
}

// PayPal 订单响应
export interface PayPalOrderResponse {
  id: string
  status: string
  links: Array<{
    href: string
    rel: string
    method: string
  }>
}

// PayPal 捕获响应
export interface PayPalCaptureResponse {
  id: string
  status: string
  purchase_units: Array<{
    reference_id: string
    payments: {
      captures: Array<{
        id: string
        status: string
        amount: {
          currency_code: string
          value: string
        }
      }>
    }
  }>
}

// 支付表单数据
export interface PaymentFormData {
  paymentMethod: PaymentMethod
  customerName: string
  customerEmail: string
  customerPhone?: string
  cardNumber?: string // 信用卡号（仅前端临时使用，不存储）
  cardExpiry?: string
  cardCvv?: string
}

// 支付统计
export interface PaymentStats {
  total_amount: number
  total_payments: number
  successful_payments: number
  failed_payments: number
  refunded_amount: number
  pending_amount: number
  by_method: Record<PaymentMethod, {
    count: number
    amount: number
  }>
}

// 退款请求
export interface RefundRequest {
  payment_id: string
  amount?: number // 部分退款金额，不填则全额退款
  reason?: string
}

// 退款响应
export interface RefundResponse {
  id: string
  payment_id: string
  amount: number
  status: 'pending' | 'completed' | 'failed'
  created_at: string
}
