// ====================================================================================================
// 文件名: services/ordersService.ts
// 描述: 订单管理服务
// 最后更新: 2025-11-05
// ====================================================================================================

import { apiGet, apiPost, API_ENDPOINTS } from './api.config'
import type { Order, FulfillmentStatus, ApiResponse } from '../types'

/**
 * 订单服务类
 */
export class OrdersService {
  /**
   * 获取订单列表（Admin）
   */
  static async getAllOrders(params?: {
    limit?: number
    fulfillment_status?: FulfillmentStatus
  }): Promise<ApiResponse<{ orders: Order[] }>> {
    let url = API_ENDPOINTS.orders.list

    if (params) {
      const queryParams = new URLSearchParams()
      if (params.limit) queryParams.append('limit', params.limit.toString())
      if (params.fulfillment_status) queryParams.append('fulfillment_status', params.fulfillment_status)
      
      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`
      }
    }

    return apiGet(url, { requireAuth: true })
  }

  /**
   * 获取待履行订单
   */
  static async getPendingOrders(): Promise<ApiResponse<{ orders: Order[] }>> {
    return this.getAllOrders({ fulfillment_status: 'processing' })
  }

  /**
   * 获取单个订单详情
   */
  static async getOrderById(id: string): Promise<ApiResponse<{ order: Order }>> {
    return apiGet(API_ENDPOINTS.orders.detail(id), { requireAuth: true })
  }

  /**
   * 创建新订单
   */
  static async createOrder(data: {
    denomination_id: string
    quantity: number
    customer_email: string
    game_login_username: string
  }): Promise<ApiResponse<{ order: Order }>> {
    return apiPost(API_ENDPOINTS.orders.create, data, { requireAuth: false })
  }

  /**
   * 履行订单（Admin）
   */
  static async fulfillOrder(
    orderId: string,
    fulfillmentNotes?: string
  ): Promise<ApiResponse<{ order: Order }>> {
    return apiPost(
      API_ENDPOINTS.orders.fulfill(orderId),
      { fulfillment_notes: fulfillmentNotes },
      { requireAuth: true }
    )
  }

  /**
   * 搜索订单
   */
  static searchOrders(orders: Order[], query: string): Order[] {
    if (!query.trim()) return orders
    
    const lowerQuery = query.toLowerCase()
    return orders.filter(order => 
      order.customer_email?.toLowerCase().includes(lowerQuery) ||
      order.game_login_username?.toLowerCase().includes(lowerQuery) ||
      order.id?.toLowerCase().includes(lowerQuery) ||
      order.denominations?.name?.toLowerCase().includes(lowerQuery)
    )
  }

  /**
   * 排序订单
   */
  static sortOrders(
    orders: Order[],
    sortBy: string,
    sortOrder: 'asc' | 'desc'
  ): Order[] {
    return [...orders].sort((a, b) => {
      let aValue = a[sortBy as keyof Order]
      let bValue = b[sortBy as keyof Order]

      // Handle nested objects
      if (sortBy.includes('.')) {
        const keys = sortBy.split('.')
        aValue = keys.reduce((obj: any, key) => obj?.[key], a)
        bValue = keys.reduce((obj: any, key) => obj?.[key], b)
      }

      if (aValue == null) return 1
      if (bValue == null) return -1

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
      }

      // Handle dates
      if (typeof aValue === 'string' && !isNaN(Date.parse(aValue))) {
        const dateA = new Date(aValue).getTime()
        const dateB = new Date(bValue as string).getTime()
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
      }

      return 0
    })
  }

  /**
   * 导出订单到 CSV
   */
  static exportToCSV(orders: Order[], filename: string = 'orders'): void {
    const headers = [
      'Order ID',
      'Customer Email',
      'Game Username',
      'Product',
      'Quantity',
      'Total Price (USD)',
      'Payment Status',
      'Fulfillment Status',
      'Created At',
      'Paid At',
      'Fulfilled At',
      'Fulfillment Notes'
    ]

    const escapeCSV = (value: any): string => {
      if (value == null) return ''
      const stringValue = String(value)
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      return stringValue
    }

    const csvData = [
      headers.join(','),
      ...orders.map(order => [
        escapeCSV(order.id),
        escapeCSV(order.customer_email),
        escapeCSV(order.game_login_username),
        escapeCSV(order.denominations?.name || '-'),
        escapeCSV(order.quantity),
        escapeCSV(order.total_price.toFixed(2)),
        escapeCSV(order.payment_status),
        escapeCSV(order.fulfillment_status),
        escapeCSV(new Date(order.created_at).toLocaleString('zh-TW')),
        escapeCSV(order.paid_at ? new Date(order.paid_at).toLocaleString('zh-TW') : ''),
        escapeCSV(order.fulfilled_at ? new Date(order.fulfilled_at).toLocaleString('zh-TW') : ''),
        escapeCSV(order.fulfillment_notes || '')
      ].join(','))
    ].join('\n')

    const blob = new Blob(['\uFEFF' + csvData], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

// 导出默认实例
export const ordersService = OrdersService
