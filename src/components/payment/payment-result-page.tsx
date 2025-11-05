import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { CheckCircle, XCircle, Clock, Download, Home, RotateCcw } from 'lucide-react'
import { projectId, publicAnonKey } from '../../utils/supabase/info'

interface Order {
  id: string
  gameId: string
  denominationId: string
  game_login_username: string
  customer_email: string
  customer_phone?: string
  quantity: number
  pricePerUnit: number
  totalPrice: number
  notes?: string
  status: string
  created_at: string
  updated_at: string
  payment_method?: string
  payment_gateway?: string | null  // 'paypal' or 'ecpay'
  gateway_transaction_id?: string | null  // Payment gateway transaction ID
  paid_at?: string
}

interface PaymentResultPageProps {
  orderId: string
  onNavigateHome: () => void
  onRetryPayment: () => void
}

export function PaymentResultPage({ orderId, onNavigateHome, onRetryPayment }: PaymentResultPageProps) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (orderId) {
      loadOrderDetails()
    }
  }, [orderId])

  const loadOrderDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-04b375d8/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        },
        signal: AbortSignal.timeout(10000)
      })
      
      if (response.ok) {
        const data = await response.json()
        setOrder(data.order)
      } else {
        console.error('Failed to load order details')
      }
    } catch (error) {
      console.error('Load order error:', error)
    } finally {
      setLoading(false)
    }
  }

  const downloadReceipt = () => {
    if (!order) return
    
    // Generate a simple receipt text
    const receiptContent = `
支付收據
==================

訂單編號: ${order.id}
支付時間: ${order.paid_at ? new Date(order.paid_at).toLocaleString('zh-TW') : '無'}
支付方式: ${getPaymentMethodName(order.payment_method)}
支付網關: ${order.payment_gateway ? order.payment_gateway.toUpperCase() : '無'}
交易編號: ${order.gateway_transaction_id || '無'}
支付狀態: ${getStatusName(order.status)}

客戶資訊:
信箱: ${order.customer_email}
電話: ${order.customer_phone || '無'}

遊戲帳號: ${order.game_login_username}
購買數量: ${order.quantity} 個
單價: ${order.pricePerUnit}
總金額: ${order.totalPrice}

備註: ${order.notes || '無'}

==================
感謝您的購買！
    `.trim()

    // Create and download the receipt file
    const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `receipt_${order.id}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const getStatusName = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pending_payment': '等待支付',
      'paid': '已支付',
      'processing': '處理中',
      'completed': '已完成',
      'failed': '支付失敗',
      'cancelled': '已取消',
      'refunded': '已退款'
    }
    return statusMap[status] || status
  }

  const getPaymentMethodName = (method?: string) => {
    const methodMap: { [key: string]: string } = {
      'credit_card': '信用卡',
      'paypal': 'PayPal',
      'bank_transfer': '銀行轉帳',
      'mobile_payment': '行動支付'
    }
    return method ? methodMap[method] || method : '無'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return <CheckCircle className="w-16 h-16 text-green-500" />
      case 'failed':
      case 'cancelled':
        return <XCircle className="w-16 h-16 text-red-500" />
      default:
        return <Clock className="w-16 h-16 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return 'text-green-600 bg-green-50'
      case 'failed':
      case 'cancelled':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-yellow-600 bg-yellow-50'
    }
  }

  const getTitle = (status: string) => {
    switch (status) {
      case 'paid':
        return '支付成功！'
      case 'completed':
        return '訂單完成！'
      case 'failed':
        return '支付失敗'
      case 'cancelled':
        return '訂單已取消'
      default:
        return '支付處理中'
    }
  }

  const getDescription = (status: string) => {
    switch (status) {
      case 'paid':
        return '您的支付已成功完成，我們正在處理您的訂單。'
      case 'completed':
        return '您的訂單已完成處理，遊戲點數已加值到您的帳戶。'
      case 'failed':
        return '支付過程中發生錯誤，請重試或聯繫客服。'
      case 'cancelled':
        return '此訂單已被取消，如有疑問請聯繫客服。'
      default:
        return '我們正在處理您的支付，請稍候。'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>載入支付結果中...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-medium mb-2">找不到訂單</h2>
          <p className="text-gray-600 mb-6">指定的訂單不存在或已被刪除</p>
          <Button onClick={onNavigateHome}>
            <Home className="w-4 h-4 mr-2" />
            返回首頁
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 py-8">
        
        {/* Status Icon and Title */}
        <div className="text-center mb-8">
          {getStatusIcon(order.status)}
          <h1 className="text-2xl font-medium mt-4 mb-2">
            {getTitle(order.status)}
          </h1>
          <p className="text-gray-600">
            {getDescription(order.status)}
          </p>
        </div>

        {/* Order Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">訂單詳情</CardTitle>
            <CardDescription>訂單編號：{order.id}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">支付狀態：</span>
                <Badge className={getStatusColor(order.status)}>
                  {getStatusName(order.status)}
                </Badge>
              </div>
              
              {order.payment_method && (
                <div className="flex justify-between">
                  <span className="text-gray-600">支付方式：</span>
                  <span>{getPaymentMethodName(order.payment_method)}</span>
                </div>
              )}
              
              {order.payment_gateway && (
                <div className="flex justify-between">
                  <span className="text-gray-600">支付網關：</span>
                  <span className="uppercase">{order.payment_gateway}</span>
                </div>
              )}
              
              {order.gateway_transaction_id && (
                <div className="flex justify-between">
                  <span className="text-gray-600">交易編號：</span>
                  <span className="text-xs font-mono">{order.gateway_transaction_id}</span>
                </div>
              )}
              
              {order.paid_at && (
                <div className="flex justify-between">
                  <span className="text-gray-600">支付時間：</span>
                  <span>{new Date(order.paid_at).toLocaleString('zh-TW')}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-600">客戶信箱：</span>
                <span>{order.customer_email}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">遊戲帳號：</span>
                <span>{order.game_login_username}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">購買數量：</span>
                <span>{order.quantity} 個</span>
              </div>
              
              <div className="border-t pt-3">
                <div className="flex justify-between font-medium text-lg">
                  <span>總金額：</span>
                  <span className="text-primary">${order.totalPrice}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          {order.status === 'paid' || order.status === 'completed' ? (
            <>
              <Button 
                className="w-full" 
                onClick={downloadReceipt}
                variant="outline"
              >
                <Download className="w-4 h-4 mr-2" />
                下載收據
              </Button>
              <Button 
                className="w-full" 
                onClick={onNavigateHome}
              >
                <Home className="w-4 h-4 mr-2" />
                返回首頁
              </Button>
            </>
          ) : order.status === 'failed' ? (
            <>
              <Button 
                className="w-full" 
                onClick={onRetryPayment}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                重新支付
              </Button>
              <Button 
                className="w-full" 
                onClick={onNavigateHome}
                variant="outline"
              >
                <Home className="w-4 h-4 mr-2" />
                返回首頁
              </Button>
            </>
          ) : (
            <Button 
              className="w-full" 
              onClick={onNavigateHome}
            >
              <Home className="w-4 h-4 mr-2" />
              返回首頁
            </Button>
          )}
        </div>

        {/* Support Contact */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>如有問題，請聯繫客服</p>
          <p>客服信箱：support@example.com</p>
          <p>客服電話：0800-123-456</p>
        </div>
      </div>
    </div>
  )
}