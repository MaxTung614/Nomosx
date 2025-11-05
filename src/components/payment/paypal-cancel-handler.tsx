import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { XCircle } from 'lucide-react'

interface PayPalCancelHandlerProps {
  onReturnToPayment: (orderId: string) => void
  onReturnHome: () => void
}

export function PayPalCancelHandler({ onReturnToPayment, onReturnHome }: PayPalCancelHandlerProps) {
  const [orderId, setOrderId] = useState<string | null>(null)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const orderIdParam = urlParams.get('orderId')
    setOrderId(orderIdParam)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="text-center">支付已取消</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <XCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-6">您已取消 PayPal 支付流程</p>
          
          <div className="space-y-3">
            {orderId && (
              <Button 
                onClick={() => onReturnToPayment(orderId)}
                className="w-full"
              >
                返回支付頁面
              </Button>
            )}
            <Button 
              onClick={onReturnHome}
              variant="outline"
              className="w-full"
            >
              返回首頁
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}