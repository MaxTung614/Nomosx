import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import { Badge } from '../ui/badge'
import { toast } from 'sonner@2.0.3'
import { ArrowLeft, CreditCard, Building2, Smartphone, CheckCircle, Clock, AlertCircle } from 'lucide-react'
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
  payment_gateway?: string | null  // 'paypal' or 'ecpay'
  gateway_transaction_id?: string | null  // Payment gateway transaction ID
  created_at: string
  updated_at: string
  paid_at?: string
}

interface PaymentPageProps {
  orderId: string
  onNavigateBack: () => void
  onPaymentSuccess: (orderId: string) => void
}

type PaymentMethod = 'credit_card' | 'paypal' | 'ecpay' | 'bank_transfer' | 'mobile_payment'

export function PaymentPage({ orderId, onNavigateBack, onPaymentSuccess }: PaymentPageProps) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('credit_card')
  
  // Credit card form state
  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  })

  // Bank transfer form state
  const [bankForm, setBankForm] = useState({
    accountNumber: '',
    bankCode: '',
    accountHolder: ''
  })

  // Load order details
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
        const error = await response.json()
        toast.error(error.error || '載入訂單資料失敗')
      }
    } catch (error) {
      console.error('Load order error:', error)
      if (error instanceof Error && error.name === 'TimeoutError') {
        toast.error('請求超時，請檢查網路連線')
      } else {
        toast.error('載入訂單資料失敗')
      }
    } finally {
      setLoading(false)
    }
  }

  const processPayment = async () => {
    if (!order) return

    // PayPal payment flow
    if (selectedPaymentMethod === 'paypal') {
      try {
        setProcessing(true)
        
        // Create PayPal order
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-04b375d8/payments/paypal/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ orderId: order.id }),
          signal: AbortSignal.timeout(30000)
        })
        
        if (response.ok) {
          const result = await response.json()
          console.log('PayPal order created:', result)
          
          // Redirect to PayPal approval URL
          if (result.approvalUrl) {
            window.location.href = result.approvalUrl
          } else {
            toast.error('無法獲取 PayPal 支付連結')
          }
        } else {
          const error = await response.json()
          toast.error(error.error || 'PayPal 訂單創建失敗')
        }
      } catch (error) {
        console.error('PayPal payment error:', error)
        if (error instanceof Error && error.name === 'TimeoutError') {
          toast.error('請求超時，請稍後再試')
        } else {
          toast.error('PayPal 支付處理時發生錯誤')
        }
      } finally {
        setProcessing(false)
      }
      return
    }

    // TODO: Phase 4.2 - ECPay payment flow will be implemented here
    if (selectedPaymentMethod === 'ecpay') {
      toast.error('ECPay 支付功能正在維護中，請選擇其他支付方式')
      return
    }

    // Validation based on payment method (for other methods)
    if (selectedPaymentMethod === 'credit_card') {
      if (!cardForm.cardNumber || !cardForm.expiryDate || !cardForm.cvv || !cardForm.cardholderName) {
        toast.error('請填寫完整的信用卡資訊')
        return
      }
      
      // Basic card number validation (should be 16 digits)
      const cardNumberDigits = cardForm.cardNumber.replace(/\s/g, '')
      if (!/^\d{16}$/.test(cardNumberDigits)) {
        toast.error('請輸入有效的信用卡號碼')
        return
      }
      
      // Basic expiry date validation (MM/YY format)
      if (!/^\d{2}\/\d{2}$/.test(cardForm.expiryDate)) {
        toast.error('請輸入有效的到期日 (MM/YY)')
        return
      }
      
      // Basic CVV validation (3-4 digits)
      if (!/^\d{3,4}$/.test(cardForm.cvv)) {
        toast.error('請輸入有效的 CVV')
        return
      }
    } else if (selectedPaymentMethod === 'bank_transfer') {
      if (!bankForm.accountNumber || !bankForm.bankCode || !bankForm.accountHolder) {
        toast.error('請填寫完整的銀行轉帳資訊')
        return
      }
    }

    try {
      setProcessing(true)
      
      const paymentData = {
        orderId: order.id,
        paymentMethod: selectedPaymentMethod,
        amount: order.totalPrice,
        currency: 'USD',
        paymentDetails: selectedPaymentMethod === 'credit_card' ? {
          cardNumber: cardForm.cardNumber.replace(/\s/g, ''), // Remove spaces
          expiryDate: cardForm.expiryDate,
          cvv: cardForm.cvv,
          cardholderName: cardForm.cardholderName
        } : selectedPaymentMethod === 'bank_transfer' ? {
          accountNumber: bankForm.accountNumber,
          bankCode: bankForm.bankCode,
          accountHolder: bankForm.accountHolder
        } : {}
      }
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-04b375d8/payments/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(paymentData),
        signal: AbortSignal.timeout(30000) // Longer timeout for payment processing
      })
      
      if (response.ok) {
        const result = await response.json()
        toast.success('支付成功！')
        console.log('Payment processed:', result)
        
        // Navigate to success page
        onPaymentSuccess(order.id)
        
      } else {
        const error = await response.json()
        toast.error(error.error || '支付處理失敗')
      }
    } catch (error) {
      console.error('Payment processing error:', error)
      if (error instanceof Error && error.name === 'TimeoutError') {
        toast.error('支付處理超時，請稍後再試')
      } else {
        toast.error('支付處理時發生錯誤')
      }
    } finally {
      setProcessing(false)
    }
  }

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\s/g, '').slice(0, 16)
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  // Format expiry date with slash
  const formatExpiryDate = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4)
    if (digits.length >= 2) {
      return digits.substring(0, 2) + '/' + digits.substring(2)
    }
    return digits
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>載入訂單資料中...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-medium mb-2">找不到訂單</h2>
          <p className="text-gray-600 mb-4">指定的訂單不存在或已被刪除</p>
          <Button onClick={onNavigateBack}>返回</Button>
        </div>
      </div>
    )
  }

  // Show different UI based on order status
  if (order.status === 'paid') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-lg font-medium mb-2">訂單已支付</h2>
          <p className="text-gray-600 mb-4">此訂單已經完成支付</p>
          <Button onClick={onNavigateBack}>返回</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onNavigateBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              返回
            </Button>
            <h1 className="font-medium">支付</h1>
            <div className="w-12"></div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        
        {/* Order summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5" />
              訂單詳情
            </CardTitle>
            <CardDescription>訂單編號：{order.id}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">客戶信箱：</span>
                <span>{order.customer_email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">遊戲帳號：</span>
                <span>{order.game_login_username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">數量：</span>
                <span>{order.quantity} 個</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">單價：</span>
                <span>${order.pricePerUnit}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-medium text-lg">
                  <span>總計：</span>
                  <span className="text-primary">${order.totalPrice}</span>
                </div>
              </div>
              <Badge 
                variant={order.status === 'pending_payment' ? 'secondary' : 'outline'} 
                className="mt-2"
              >
                {order.status === 'pending_payment' ? '等待支付' : order.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Payment method selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">選擇支付方式</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedPaymentMethod} onValueChange={(value) => setSelectedPaymentMethod(value as PaymentMethod)}>
              <div className="space-y-3">
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="credit_card" id="credit_card" />
                  <Label htmlFor="credit_card" className="flex items-center gap-2 cursor-pointer flex-1">
                    <CreditCard className="w-5 h-5" />
                    <div>
                      <div className="font-medium">信用卡</div>
                      <div className="text-sm text-gray-600">Visa, MasterCard, JCB</div>
                    </div>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="paypal" id="paypal" />
                  <Label htmlFor="paypal" className="flex items-center gap-2 cursor-pointer flex-1">
                    <div className="w-5 h-5 bg-blue-600 rounded text-white flex items-center justify-center text-xs font-bold">P</div>
                    <div>
                      <div className="font-medium">PayPal</div>
                      <div className="text-sm text-gray-600">使用 PayPal 帳戶支付</div>
                    </div>
                  </Label>
                </div>
                
                {/* ECPay - Taiwan Local Payment Gateway (Coming Soon - Phase 4.2) */}
                <div className="flex items-center space-x-2 p-3 border rounded-lg bg-gray-50 opacity-60 relative">
                  <RadioGroupItem value="ecpay" id="ecpay" disabled />
                  <Label htmlFor="ecpay" className="flex items-center gap-2 cursor-not-allowed flex-1">
                    <div className="w-5 h-5 bg-green-600 rounded text-white flex items-center justify-center text-xs font-bold">E</div>
                    <div className="flex-1">
                      <div className="font-medium flex items-center gap-2">
                        綠界 ECPay
                        <Badge variant="secondary" className="text-xs">維護中</Badge>
                      </div>
                      <div className="text-sm text-gray-600">信用卡、ATM、超商付款</div>
                    </div>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                  <Label htmlFor="bank_transfer" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Building2 className="w-5 h-5" />
                    <div>
                      <div className="font-medium">銀行轉帳</div>
                      <div className="text-sm text-gray-600">ATM 或網路銀行轉帳</div>
                    </div>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="mobile_payment" id="mobile_payment" />
                  <Label htmlFor="mobile_payment" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Smartphone className="w-5 h-5" />
                    <div>
                      <div className="font-medium">行動支付</div>
                      <div className="text-sm text-gray-600">Apple Pay, Google Pay, LINE Pay</div>
                    </div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Payment details form */}
        {selectedPaymentMethod === 'credit_card' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">信用卡資訊</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="cardNumber">卡號 *</Label>
                <Input
                  id="cardNumber"
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardForm.cardNumber}
                  onChange={(e) => setCardForm(prev => ({ 
                    ...prev, 
                    cardNumber: formatCardNumber(e.target.value) 
                  }))}
                  maxLength={19} // 16 digits + 3 spaces
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiryDate">到期日 *</Label>
                  <Input
                    id="expiryDate"
                    type="text"
                    placeholder="MM/YY"
                    value={cardForm.expiryDate}
                    onChange={(e) => setCardForm(prev => ({ 
                      ...prev, 
                      expiryDate: formatExpiryDate(e.target.value) 
                    }))}
                    maxLength={5}
                  />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV *</Label>
                  <Input
                    id="cvv"
                    type="text"
                    placeholder="123"
                    value={cardForm.cvv}
                    onChange={(e) => setCardForm(prev => ({ 
                      ...prev, 
                      cvv: e.target.value.replace(/\D/g, '').slice(0, 4)
                    }))}
                    maxLength={4}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="cardholderName">持卡人姓名 *</Label>
                <Input
                  id="cardholderName"
                  type="text"
                  placeholder="CARDHOLDER NAME"
                  value={cardForm.cardholderName}
                  onChange={(e) => setCardForm(prev => ({ 
                    ...prev, 
                    cardholderName: e.target.value.toUpperCase() 
                  }))}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {selectedPaymentMethod === 'bank_transfer' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">銀行轉帳資訊</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="bankCode">銀行代碼 *</Label>
                <Input
                  id="bankCode"
                  type="text"
                  placeholder="007"
                  value={bankForm.bankCode}
                  onChange={(e) => setBankForm(prev => ({ 
                    ...prev, 
                    bankCode: e.target.value.replace(/\D/g, '').slice(0, 3)
                  }))}
                  maxLength={3}
                />
              </div>
              <div>
                <Label htmlFor="accountNumber">帳號 *</Label>
                <Input
                  id="accountNumber"
                  type="text"
                  placeholder="1234567890123456"
                  value={bankForm.accountNumber}
                  onChange={(e) => setBankForm(prev => ({ 
                    ...prev, 
                    accountNumber: e.target.value.replace(/\D/g, '').slice(0, 16)
                  }))}
                  maxLength={16}
                />
              </div>
              <div>
                <Label htmlFor="accountHolder">戶名 *</Label>
                <Input
                  id="accountHolder"
                  type="text"
                  placeholder="請輸入戶名"
                  value={bankForm.accountHolder}
                  onChange={(e) => setBankForm(prev => ({ 
                    ...prev, 
                    accountHolder: e.target.value
                  }))}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {(selectedPaymentMethod === 'paypal' || selectedPaymentMethod === 'mobile_payment') && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedPaymentMethod === 'paypal' ? 'PayPal 支付' : '行動支付'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                {selectedPaymentMethod === 'paypal' 
                  ? '點擊確認支付後，您將被導向到 PayPal 進行付款。'
                  : '點擊確認支付後，將開啟行動支付應用程式。'
                }
              </p>
            </CardContent>
          </Card>
        )}

        {/* Process payment button */}
        <Button 
          className="w-full" 
          onClick={processPayment}
          disabled={processing}
        >
          {processing ? '處理中...' : `確認支付 $${order.totalPrice}`}
        </Button>

        {/* Security notice */}
        <div className="text-xs text-gray-500 text-center">
          <p>🔒 您的支付資訊受到 SSL 加密保護</p>
        </div>
      </div>
    </div>
  )
}