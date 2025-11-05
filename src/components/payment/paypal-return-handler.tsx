import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import { projectId, publicAnonKey } from '../../utils/supabase/info'

interface PayPalReturnHandlerProps {
  onPaymentSuccess: (orderId: string) => void
  onPaymentCancel: (orderId: string) => void
}

export function PayPalReturnHandler({ onPaymentSuccess, onPaymentCancel }: PayPalReturnHandlerProps) {
  const [processing, setProcessing] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)

  useEffect(() => {
    const processPayPalReturn = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const token = urlParams.get('token') // PayPal order ID
      const orderIdParam = urlParams.get('orderId')
      
      setOrderId(orderIdParam)

      if (!token || !orderIdParam) {
        setError('缺少必要的支付參數')
        setProcessing(false)
        return
      }

      try {
        // Call backend to capture the payment
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-04b375d8/payments/paypal/capture`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`
            },
            body: JSON.stringify({
              orderId: orderIdParam,
              paypalOrderId: token
            }),
            signal: AbortSignal.timeout(30000)
          }
        )

        if (response.ok) {
          const result = await response.json()
          console.log('PayPal payment captured:', result)
          setSuccess(true)
          toast.success('支付成功！')
          
          // Wait a moment before redirecting
          setTimeout(() => {
            onPaymentSuccess(orderIdParam)
          }, 2000)
        } else {
          const errorData = await response.json()
          console.error('PayPal capture error:', errorData)
          setError(errorData.error || '支付處理失敗')
          toast.error(errorData.error || '支付處理失敗')
        }
      } catch (err) {
        console.error('PayPal return handler error:', err)
        setError('支付處理時發生錯誤')
        toast.error('支付處理時發生錯誤')
      } finally {
        setProcessing(false)
      }
    }

    processPayPalReturn()
  }, [onPaymentSuccess])

  if (processing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle className="text-center">處理支付中</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-600">正在完成您的 PayPal 支付，請稍候...</p>
            <p className="text-sm text-gray-500 mt-2">請勿關閉此頁面</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle className="text-center text-green-600">支付成功！</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">您的 PayPal 支付已成功完成</p>
            <p className="text-sm text-gray-500">正在跳轉到訂單詳情頁面...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="text-center text-red-600">支付失敗</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{error || '支付處理失敗'}</p>
          {orderId && (
            <Button 
              onClick={() => onPaymentCancel(orderId)}
              className="w-full"
            >
              返回支付頁面
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}