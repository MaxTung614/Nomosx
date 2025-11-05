// ====================================================================================================
// 文件名: services/paymentsService.ts
// 描述: 支付管理服务
// 最后更新: 2025-11-05
// ====================================================================================================

import { apiGet, apiPost, API_ENDPOINTS } from './api.config'
import type { PaymentRecord, PayPalOrderResponse, OrderStats, ApiResponse } from '../types'

/**
 * 支付服务类
 */
export class PaymentsService {
  /**
   * 获取支付记录列表（Admin）
   */
  static async getAllPayments(): Promise<ApiResponse<{ payments: PaymentRecord[] }>> {
    return apiGet(API_ENDPOINTS.payments.list, { requireAuth: true })
  }

  /**
   * 获取订单统计数据（Admin）
   */
  static async getOrderStats(): Promise<ApiResponse<{ stats: OrderStats }>> {
    return apiGet(API_ENDPOINTS.payments.stats, { requireAuth: true })
  }

  /**
   * 创建 PayPal 订单
   */
  static async createPayPalOrder(data: {
    order_id: string
    amount: number
    currency?: string
  }): Promise<ApiResponse<PayPalOrderResponse>> {
    return apiPost(
      API_ENDPOINTS.payments.createPayPalOrder,
      {
        order_id: data.order_id,
        amount: data.amount,
        currency: data.currency || 'USD',
      },
      { requireAuth: false }
    )
  }

  /**
   * 捕获 PayPal 订单支付
   */
  static async capturePayPalOrder(
    paypalOrderId: string
  ): Promise<ApiResponse<{ order: any }>> {
    return apiPost(
      API_ENDPOINTS.payments.capturePayPalOrder(paypalOrderId),
      {},
      { requireAuth: false }
    )
  }

  /**
   * 格式化金额
   */
  static formatAmount(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  /**
   * 计算总金额
   */
  static calculateTotal(items: Array<{ price: number; quantity: number }>): number {
    return items.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  /**
   * 验证支付金额
   */
  static validateAmount(amount: number): boolean {
    return amount > 0 && amount <= 10000 && Number.isFinite(amount)
  }

  /**
   * 获取支付状态显示文本
   */
  static getPaymentStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      pending: '待支付',
      paid: '已支付',
      failed: '支付失敗',
      refunded: '已退款',
    }
    return statusMap[status] || status
  }

  /**
   * 获取支付状态颜色
   */
  static getPaymentStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      pending: 'warning',
      paid: 'success',
      failed: 'destructive',
      refunded: 'secondary',
    }
    return colorMap[status] || 'default'
  }
}

// 导出默认实例
export const paymentsService = PaymentsService
