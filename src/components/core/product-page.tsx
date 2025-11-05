import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Badge } from '../ui/badge'
import { toast } from 'sonner@2.0.3'
import { ArrowLeft, ArrowRight, ShoppingCart, GamepadIcon, CreditCard } from 'lucide-react'
import { projectId, publicAnonKey } from '../../utils/supabase/info'

interface Game {
  id: string
  name: string
  region_code: string
  description?: string
  is_archived: boolean
  region?: {
    id: string
    name: string
    code: string
  }
}

interface Denomination {
  id: string
  game_id: string
  platform_id: string
  display_tag_id?: string
  name: string
  display_price: number
  cost_price: number
  sku_code?: string
  is_available: boolean
  is_archived: boolean
  description?: string
  game?: Game
  platform?: {
    id: string
    name: string
    code: string
  }
  displayTag?: {
    id: string
    name: string
    color: string
  }
}

interface ProductPageProps {
  onNavigateBack: () => void
  onNavigateToPayment?: (orderId: string) => void
}

export function ProductPage({ onNavigateBack, onNavigateToPayment }: ProductPageProps) {
  // State for products data
  const [games, setGames] = useState<Game[]>([])
  const [denominations, setDenominations] = useState<Denomination[]>([])
  const [loading, setLoading] = useState(true)
  
  // Mobile 3-step flow state
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [selectedDenomination, setSelectedDenomination] = useState<Denomination | null>(null)
  
  // Form state for step 2 (credentials) and step 3 (payment info)
  const [formData, setFormData] = useState({
    game_login_username: '',
    game_login_password: '',
    customer_email: '',
    customer_phone: '',
    quantity: 1,
    notes: ''
  })
  
  const [submitting, setSubmitting] = useState(false)

  // Load products data
  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-04b375d8/products`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        },
        signal: AbortSignal.timeout(10000)
      })
      
      if (response.ok) {
        const data = await response.json()
        setGames(data.games || [])
        setDenominations(data.denominations || [])
      } else {
        toast.error('載入產品資料失敗')
      }
    } catch (error) {
      console.error('Load products error:', error)
      if (error instanceof Error && error.name === 'TimeoutError') {
        toast.error('請求超時，請檢查網路連線')
      } else {
        toast.error('載入產品資料失敗')
      }
    } finally {
      setLoading(false)
    }
  }

  // Get denominations for selected game
  const getGameDenominations = () => {
    if (!selectedGame) return []
    return denominations.filter(d => d.game_id === selectedGame.id)
  }

  // Handle step 1: Game and denomination selection
  const handleGameSelect = (game: Game) => {
    setSelectedGame(game)
    setSelectedDenomination(null) // Reset denomination when game changes
  }

  const handleDenominationSelect = (denomination: Denomination) => {
    setSelectedDenomination(denomination)
  }

  const proceedToStep2 = () => {
    if (!selectedGame || !selectedDenomination) {
      toast.error('請選擇遊戲和面額')
      return
    }
    setCurrentStep(2)
  }

  // Handle step 2: Account credentials
  const proceedToStep3 = () => {
    if (!formData.game_login_username || !formData.game_login_password) {
      toast.error('請輸入遊戲帳號和密碼')
      return
    }
    setCurrentStep(3)
  }

  // Handle step 3: Order submission
  const submitOrder = async () => {
    if (!formData.customer_email) {
      toast.error('請輸入客戶信箱')
      return
    }

    if (!selectedGame || !selectedDenomination) {
      toast.error('訂單資料有誤，請重新選擇')
      return
    }

    try {
      setSubmitting(true)
      
      const orderData = {
        gameId: selectedGame.id,
        denominationId: selectedDenomination.id,
        game_login_username: formData.game_login_username,
        game_login_password: formData.game_login_password,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        quantity: formData.quantity,
        notes: formData.notes
      }
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-04b375d8/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(orderData),
        signal: AbortSignal.timeout(15000)
      })
      
      if (response.ok) {
        const result = await response.json()
        toast.success('訂單提交成功！')
        console.log('Order submitted:', result.order)
        
        // Navigate to payment flow (Phase 4)
        toast.success(`訂單 ${result.order.id} 已創建，正在導向支付頁面...`)
        
        // Navigate to payment page after a short delay
        setTimeout(() => {
          if (onNavigateToPayment) {
            onNavigateToPayment(result.order.id)
          }
        }, 1500)
        
      } else {
        const error = await response.json()
        toast.error(error.error || '訂單提交失敗')
      }
    } catch (error) {
      console.error('Submit order error:', error)
      if (error instanceof Error && error.name === 'TimeoutError') {
        toast.error('請求超時，請檢查網路連線')
      } else {
        toast.error('訂單提交時發生錯誤')
      }
    } finally {
      setSubmitting(false)
    }
  }

  // Calculate total price
  const getTotalPrice = () => {
    if (!selectedDenomination) return 0
    return selectedDenomination.display_price * formData.quantity
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>載入產品資料中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with step indicator */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={currentStep === 1 ? onNavigateBack : () => setCurrentStep(currentStep - 1 as 1 | 2)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {currentStep === 1 ? '返回' : '上一步'}
            </Button>
            <h1 className="font-medium">遊戲點數購買</h1>
            <div className="w-12"></div> {/* Spacer for centering */}
          </div>
          
          {/* Step indicator */}
          <div className="flex items-center justify-center space-x-2">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm ${
              currentStep >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <div className={`h-1 w-8 ${currentStep >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm ${
              currentStep >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
            <div className={`h-1 w-8 ${currentStep >= 3 ? 'bg-primary' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm ${
              currentStep >= 3 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              3
            </div>
          </div>
          
          {/* Step labels */}
          <div className="flex justify-between mt-2 text-xs text-gray-600">
            <span>選擇產品</span>
            <span>帳號資訊</span>
            <span>確認支付</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-md mx-auto px-4 py-6">
        
        {/* Step 1: Product Selection */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <GamepadIcon className="w-12 h-12 text-primary mx-auto mb-2" />
              <h2>選擇遊戲和面額</h2>
              <p className="text-sm text-gray-600">請選擇您要購買的遊戲和點數面額</p>
            </div>

            {/* Game selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">選擇遊戲</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {games.map((game) => (
                    <div
                      key={game.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedGame?.id === game.id
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleGameSelect(game)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{game.name}</h3>
                          {game.description && (
                            <p className="text-sm text-gray-600 mt-1">{game.description}</p>
                          )}
                          {game.region && (
                            <Badge variant="outline" className="mt-2 text-xs">
                              {game.region.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Denomination selection */}
            {selectedGame && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">選擇面額</CardTitle>
                  <CardDescription>為 {selectedGame.name} 選擇點數面額</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {getGameDenominations().map((denomination) => (
                      <div
                        key={denomination.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedDenomination?.id === denomination.id
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleDenominationSelect(denomination)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium">{denomination.name}</h3>
                            {denomination.description && (
                              <p className="text-sm text-gray-600">{denomination.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              {denomination.platform && (
                                <Badge variant="secondary" className="text-xs">
                                  {denomination.platform.name}
                                </Badge>
                              )}
                              {denomination.displayTag && (
                                <Badge 
                                  variant="outline" 
                                  className="text-xs"
                                  style={{ 
                                    borderColor: denomination.displayTag.color,
                                    color: denomination.displayTag.color 
                                  }}
                                >
                                  {denomination.displayTag.name}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-primary">
                              ${denomination.display_price}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Continue button */}
            {selectedGame && selectedDenomination && (
              <Button 
                className="w-full" 
                onClick={proceedToStep2}
              >
                繼續下一步
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        )}

        {/* Step 2: Account Information */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <ShoppingCart className="w-12 h-12 text-primary mx-auto mb-2" />
              <h2>輸入遊戲帳號</h2>
              <p className="text-sm text-gray-600">請輸入您的遊戲帳號登入資訊</p>
            </div>

            {/* Selected product summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">已選擇的產品</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">遊戲：</span>
                    <span>{selectedGame?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">面額：</span>
                    <span>{selectedDenomination?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">價格：</span>
                    <span className="font-medium text-primary">${selectedDenomination?.display_price}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account credentials form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">遊戲帳號資訊</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="username">遊戲帳號</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="請輸入遊戲帳號"
                    value={formData.game_login_username}
                    onChange={(e) => setFormData(prev => ({ ...prev, game_login_username: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="password">遊戲密碼</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="請輸入遊戲密碼"
                    value={formData.game_login_password}
                    onChange={(e) => setFormData(prev => ({ ...prev, game_login_password: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="quantity">購買數量</Label>
                  <Select 
                    value={formData.quantity.toString()} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, quantity: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 10].map(num => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} 個
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Button 
              className="w-full" 
              onClick={proceedToStep3}
              disabled={!formData.game_login_username || !formData.game_login_password}
            >
              繼續下一步
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Step 3: Payment Information */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <CreditCard className="w-12 h-12 text-primary mx-auto mb-2" />
              <h2>確認訂單</h2>
              <p className="text-sm text-gray-600">請填寫聯絡資訊並確認訂單</p>
            </div>

            {/* Order summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">訂單摘要</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">遊戲：</span>
                    <span>{selectedGame?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">面額：</span>
                    <span>{selectedDenomination?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">帳號：</span>
                    <span>{formData.game_login_username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">數量：</span>
                    <span>{formData.quantity} 個</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-medium text-lg">
                      <span>總計：</span>
                      <span className="text-primary">${getTotalPrice()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">聯絡資訊</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="email">客戶信箱 *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.customer_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, customer_email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">聯絡電話（選填）</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+886 912345678"
                    value={formData.customer_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, customer_phone: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="notes">備註（選填）</Label>
                  <Textarea
                    id="notes"
                    placeholder="如有特殊需求請在此說明"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Button 
              className="w-full" 
              onClick={submitOrder}
              disabled={submitting || !formData.customer_email}
            >
              {submitting ? '提交中...' : `確認訂單並支付 $${getTotalPrice()}`}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}