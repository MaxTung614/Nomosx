/**
 * 订单相关类型定义
 * 
 * @description
 * 集中管理订单相关的 TypeScript 类型
 */

// 订单状态
export type OrderStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded'

// 支付状态
export type PaymentStatus = 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded'

// 履行状态
export type FulfillmentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'

// 订单基础信息
export interface Order {
  id: string
  customer_email: string
  customer_phone?: string
  game_login_username: string
  game_login_password?: string // 仅在创建时使用
  game_id: string
  denomination_id: string
  quantity: number
  total_price: number
  status: OrderStatus
  payment_status: PaymentStatus
  fulfillment_status: FulfillmentStatus
  payment_method?: string
  payment_id?: string
  notes?: string
  fulfillment_notes?: string
  created_at: string
  updated_at?: string
  paid_at?: string
  fulfilled_at?: string
  cancelled_at?: string
}

// 订单详情（包含关联数据）
export interface OrderDetail extends Order {
  game?: {
    id: string
    name: string
    code?: string
    region_code: string
  }
  denomination?: {
    id: string
    name: string
    display_price: number
    platform_name?: string
  }
  payment?: {
    id: string
    payment_method: string
    amount: number
    status: PaymentStatus
    created_at: string
  }
}

// 创建订单请求
export interface CreateOrderRequest {
  gameId: string
  denominationId: string
  game_login_username: string
  game_login_password: string
  customer_email: string
  customer_phone?: string
  quantity: number
  notes?: string
}

// 更新订单请求
export interface UpdateOrderRequest {
  status?: OrderStatus
  payment_status?: PaymentStatus
  fulfillment_status?: FulfillmentStatus
  fulfillment_notes?: string
}

// 订单统计
export interface OrderStats {
  total_orders: number
  total_revenue: number
  pending_orders: number
  processing_orders: number
  completed_orders: number
  failed_orders: number
  today_orders: number
  today_revenue: number
  this_month_orders: number
  this_month_revenue: number
}

// 订单列表查询参数
export interface OrderListParams {
  status?: OrderStatus
  payment_status?: PaymentStatus
  customer_email?: string
  game_id?: string
  start_date?: string
  end_date?: string
  page?: number
  limit?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

// 订单筛选选项
export interface OrderFilterOptions {
  statuses: OrderStatus[]
  paymentStatuses: PaymentStatus[]
  dateRange?: {
    start: string
    end: string
  }
}
