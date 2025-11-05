import React, { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Badge } from '../ui/badge'
import { toast } from 'sonner@2.0.3'
import { ArrowLeft, ArrowRight, ShoppingCart, GamepadIcon, CreditCard, Sparkles, Check } from 'lucide-react'
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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0B0C10' }}>
        <div className="text-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 rounded-full mx-auto mb-4"
            style={{ borderColor: '#FFC107', borderTopColor: 'transparent' }}
          ></motion.div>
          <p style={{ color: '#9EA3AE' }}>載入產品資料中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0B0C10' }}>
      {/* Header with step indicator */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="shadow-sm border-b"
        style={{ 
          backgroundColor: 'rgba(18, 20, 26, 0.95)',
          borderColor: '#1F2937',
          backdropFilter: 'blur(10px)'
        }}
      >
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={currentStep === 1 ? onNavigateBack : () => setCurrentStep(currentStep - 1 as 1 | 2)}
              className="flex items-center gap-2 transition-all duration-300"
              style={{ color: '#9EA3AE' }}
            >
              <ArrowLeft className="w-4 h-4" />
              {currentStep === 1 ? '返回' : '上一步'}
            </Button>
            <h1 className="flex items-center gap-2" style={{ color: '#EAEAEA' }}>
              <Sparkles className="w-5 h-5" style={{ color: '#FFC107' }} />
              遊戲點數購買
            </h1>
            <div className="w-12"></div> {/* Spacer for centering */}
          </div>
          
          {/* Step indicator */}
          <div className="flex items-center justify-center space-x-2">
            <motion.div 
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm transition-all duration-300`}
              style={{
                backgroundColor: currentStep >= 1 ? '#FFC107' : '#1F2937',
                color: currentStep >= 1 ? '#0B0C10' : '#9EA3AE',
                boxShadow: currentStep >= 1 ? '0 0 15px rgba(255, 193, 7, 0.5)' : 'none'
              }}
              animate={{ scale: currentStep === 1 ? [1, 1.1, 1] : 1 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep > 1 ? <Check className="w-4 h-4" /> : '1'}
            </motion.div>
            <motion.div 
              className="h-1 w-8 rounded-full transition-all duration-500"
              style={{ backgroundColor: currentStep >= 2 ? '#FFC107' : '#1F2937' }}
            ></motion.div>
            <motion.div 
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm transition-all duration-300`}
              style={{
                backgroundColor: currentStep >= 2 ? '#FFC107' : '#1F2937',
                color: currentStep >= 2 ? '#0B0C10' : '#9EA3AE',
                boxShadow: currentStep >= 2 ? '0 0 15px rgba(255, 193, 7, 0.5)' : 'none'
              }}
              animate={{ scale: currentStep === 2 ? [1, 1.1, 1] : 1 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep > 2 ? <Check className="w-4 h-4" /> : '2'}
            </motion.div>
            <motion.div 
              className="h-1 w-8 rounded-full transition-all duration-500"
              style={{ backgroundColor: currentStep >= 3 ? '#FFC107' : '#1F2937' }}
            ></motion.div>
            <motion.div 
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm transition-all duration-300`}
              style={{
                backgroundColor: currentStep >= 3 ? '#FFC107' : '#1F2937',
                color: currentStep >= 3 ? '#0B0C10' : '#9EA3AE',
                boxShadow: currentStep >= 3 ? '0 0 15px rgba(255, 193, 7, 0.5)' : 'none'
              }}
              animate={{ scale: currentStep === 3 ? [1, 1.1, 1] : 1 }}
              transition={{ duration: 0.3 }}
            >
              3
            </motion.div>
          </div>
          
          {/* Step labels */}
          <div className="flex justify-between mt-2 text-xs" style={{ color: '#9EA3AE' }}>
            <span>選擇產品</span>
            <span>帳號資訊</span>
            <span>確認支付</span>
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="max-w-md mx-auto px-4 py-6">
        
        {/* Step 1: Product Selection */}
        {currentStep === 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block mb-3"
              >
                <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(255, 193, 7, 0.1)', border: '1px solid #FFC107' }}>
                  <GamepadIcon className="w-12 h-12" style={{ color: '#FFC107' }} />
                </div>
              </motion.div>
              <h2 className="text-2xl mb-2" style={{ color: '#EAEAEA' }}>選擇遊戲和面額</h2>
              <p className="text-sm" style={{ color: '#9EA3AE' }}>請選擇您要購買的遊戲和點數面額</p>
            </div>

            {/* Game selection */}
            <Card 
              className="border-0"
              style={{ 
                backgroundColor: '#12141A',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
              }}
            >
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2" style={{ color: '#EAEAEA' }}>
                  <div className="w-1 h-6 rounded-full" style={{ backgroundColor: '#FFC107' }}></div>
                  選擇遊戲
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {games.map((game) => (
                    <motion.div
                      key={game.id}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 border rounded-lg cursor-pointer transition-all duration-300`}
                      style={{
                        backgroundColor: selectedGame?.id === game.id ? 'rgba(255, 193, 7, 0.1)' : 'transparent',
                        borderColor: selectedGame?.id === game.id ? '#FFC107' : '#1F2937',
                        boxShadow: selectedGame?.id === game.id ? '0 0 20px rgba(255, 193, 7, 0.2)' : 'none'
                      }}
                      onClick={() => handleGameSelect(game)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="mb-1" style={{ color: '#EAEAEA' }}>{game.name}</h3>
                          {game.description && (
                            <p className="text-sm mt-1" style={{ color: '#9EA3AE' }}>{game.description}</p>
                          )}
                          {game.region && (
                            <Badge 
                              variant="outline" 
                              className="mt-2 text-xs"
                              style={{ borderColor: '#00E0FF', color: '#00E0FF' }}
                            >
                              {game.region.name}
                            </Badge>
                          )}
                        </div>
                        {selectedGame?.id === game.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="p-1 rounded-full"
                            style={{ backgroundColor: '#FFC107' }}
                          >
                            <Check className="w-4 h-4" style={{ color: '#0B0C10' }} />
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Denomination selection */}
            {selectedGame && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card
                  className="border-0"
                  style={{ 
                    backgroundColor: '#12141A',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2" style={{ color: '#EAEAEA' }}>
                      <div className="w-1 h-6 rounded-full" style={{ backgroundColor: '#00E0FF' }}></div>
                      選擇面額
                    </CardTitle>
                    <CardDescription style={{ color: '#9EA3AE' }}>
                      為 {selectedGame.name} 選擇點數面額
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {getGameDenominations().map((denomination) => (
                        <motion.div
                          key={denomination.id}
                          whileHover={{ scale: 1.02, x: 5 }}
                          whileTap={{ scale: 0.98 }}
                          className={`p-4 border rounded-lg cursor-pointer transition-all duration-300`}
                          style={{
                            backgroundColor: selectedDenomination?.id === denomination.id ? 'rgba(0, 224, 255, 0.1)' : 'transparent',
                            borderColor: selectedDenomination?.id === denomination.id ? '#00E0FF' : '#1F2937',
                            boxShadow: selectedDenomination?.id === denomination.id ? '0 0 20px rgba(0, 224, 255, 0.2)' : 'none'
                          }}
                          onClick={() => handleDenominationSelect(denomination)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="mb-1" style={{ color: '#EAEAEA' }}>{denomination.name}</h3>
                              {denomination.description && (
                                <p className="text-sm" style={{ color: '#9EA3AE' }}>{denomination.description}</p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                {denomination.platform && (
                                  <Badge 
                                    variant="secondary" 
                                    className="text-xs"
                                    style={{ backgroundColor: 'rgba(158, 163, 174, 0.2)', color: '#9EA3AE' }}
                                  >
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
                            <div className="text-right flex items-center gap-3">
                              <div className="text-xl" style={{ color: '#FFC107', fontWeight: 600 }}>
                                ${denomination.display_price}
                              </div>
                              {selectedDenomination?.id === denomination.id && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="p-1 rounded-full"
                                  style={{ backgroundColor: '#00E0FF' }}
                                >
                                  <Check className="w-4 h-4" style={{ color: '#0B0C10' }} />
                                </motion.div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Continue button */}
            {selectedGame && selectedDenomination && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Button 
                  className="w-full py-6 transition-all duration-300"
                  onClick={proceedToStep2}
                  style={{
                    backgroundColor: '#FFC107',
                    color: '#0B0C10',
                    boxShadow: '0 0 30px rgba(255, 193, 7, 0.3)'
                  }}
                >
                  繼續下一步
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Step 2: Account Information */}
        {currentStep === 2 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block mb-3"
              >
                <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(0, 224, 255, 0.1)', border: '1px solid #00E0FF' }}>
                  <ShoppingCart className="w-12 h-12" style={{ color: '#00E0FF' }} />
                </div>
              </motion.div>
              <h2 className="text-2xl mb-2" style={{ color: '#EAEAEA' }}>輸入遊戲帳號</h2>
              <p className="text-sm" style={{ color: '#9EA3AE' }}>請輸入您的遊戲帳號登入資訊</p>
            </div>

            {/* Selected product summary */}
            <Card
              className="border-0"
              style={{ 
                backgroundColor: '#12141A',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 193, 7, 0.2)'
              }}
            >
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2" style={{ color: '#EAEAEA' }}>
                  <Sparkles className="w-5 h-5" style={{ color: '#FFC107' }} />
                  已選擇的產品
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 rounded" style={{ backgroundColor: 'rgba(255, 193, 7, 0.05)' }}>
                    <span style={{ color: '#9EA3AE' }}>遊戲：</span>
                    <span style={{ color: '#EAEAEA' }}>{selectedGame?.name}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded" style={{ backgroundColor: 'rgba(0, 224, 255, 0.05)' }}>
                    <span style={{ color: '#9EA3AE' }}>面額：</span>
                    <span style={{ color: '#EAEAEA' }}>{selectedDenomination?.name}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded" style={{ backgroundColor: 'rgba(255, 193, 7, 0.1)' }}>
                    <span style={{ color: '#9EA3AE' }}>價格：</span>
                    <span className="text-xl" style={{ color: '#FFC107', fontWeight: 600 }}>${selectedDenomination?.display_price}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account credentials form */}
            <Card
              className="border-0"
              style={{ 
                backgroundColor: '#12141A',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
              }}
            >
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2" style={{ color: '#EAEAEA' }}>
                  <div className="w-1 h-6 rounded-full" style={{ backgroundColor: '#00E0FF' }}></div>
                  遊戲帳號資訊
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="username" style={{ color: '#EAEAEA' }}>遊戲帳號</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="請輸入遊戲帳號"
                    value={formData.game_login_username}
                    onChange={(e) => setFormData(prev => ({ ...prev, game_login_username: e.target.value }))}
                    className="mt-2 border-0"
                    style={{ 
                      backgroundColor: 'rgba(31, 41, 55, 0.5)',
                      color: '#EAEAEA',
                      borderColor: '#1F2937'
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="password" style={{ color: '#EAEAEA' }}>遊戲密碼</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="請輸入遊戲密碼"
                    value={formData.game_login_password}
                    onChange={(e) => setFormData(prev => ({ ...prev, game_login_password: e.target.value }))}
                    className="mt-2 border-0"
                    style={{ 
                      backgroundColor: 'rgba(31, 41, 55, 0.5)',
                      color: '#EAEAEA',
                      borderColor: '#1F2937'
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="quantity" style={{ color: '#EAEAEA' }}>購買數量</Label>
                  <Select 
                    value={formData.quantity.toString()} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, quantity: parseInt(value) }))}
                  >
                    <SelectTrigger
                      className="mt-2 border-0"
                      style={{ 
                        backgroundColor: 'rgba(31, 41, 55, 0.5)',
                        color: '#EAEAEA',
                        borderColor: '#1F2937'
                      }}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent style={{ backgroundColor: '#12141A', borderColor: '#1F2937' }}>
                      {[1, 2, 3, 4, 5, 10].map(num => (
                        <SelectItem 
                          key={num} 
                          value={num.toString()}
                          style={{ color: '#EAEAEA' }}
                        >
                          {num} 個
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Button 
              className="w-full py-6 transition-all duration-300" 
              onClick={proceedToStep3}
              disabled={!formData.game_login_username || !formData.game_login_password}
              style={{
                backgroundColor: !formData.game_login_username || !formData.game_login_password ? '#1F2937' : '#00E0FF',
                color: !formData.game_login_username || !formData.game_login_password ? '#9EA3AE' : '#0B0C10',
                boxShadow: !formData.game_login_username || !formData.game_login_password ? 'none' : '0 0 30px rgba(0, 224, 255, 0.3)'
              }}
            >
              繼續下一步
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        )}

        {/* Step 3: Payment Information */}
        {currentStep === 3 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotateY: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="inline-block mb-3"
              >
                <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(255, 193, 7, 0.1)', border: '1px solid #FFC107' }}>
                  <CreditCard className="w-12 h-12" style={{ color: '#FFC107' }} />
                </div>
              </motion.div>
              <h2 className="text-2xl mb-2" style={{ color: '#EAEAEA' }}>確認訂單</h2>
              <p className="text-sm" style={{ color: '#9EA3AE' }}>請填寫聯絡資訊並確認訂單</p>
            </div>

            {/* Order summary */}
            <Card
              className="border-0 relative overflow-hidden"
              style={{ 
                backgroundColor: '#12141A',
                boxShadow: '0 4px 30px rgba(255, 193, 7, 0.2)',
                border: '1px solid rgba(255, 193, 7, 0.3)'
              }}
            >
              {/* Glow effect */}
              <div className="absolute inset-0 opacity-30" style={{ 
                background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(0, 224, 255, 0.1) 100%)'
              }}></div>
              
              <CardHeader className="relative">
                <CardTitle className="text-lg flex items-center gap-2" style={{ color: '#EAEAEA' }}>
                  <Sparkles className="w-5 h-5" style={{ color: '#FFC107' }} />
                  訂單摘要
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
                    <span style={{ color: '#9EA3AE' }}>遊戲：</span>
                    <span style={{ color: '#EAEAEA' }}>{selectedGame?.name}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
                    <span style={{ color: '#9EA3AE' }}>面額：</span>
                    <span style={{ color: '#EAEAEA' }}>{selectedDenomination?.name}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
                    <span style={{ color: '#9EA3AE' }}>帳號：</span>
                    <span style={{ color: '#EAEAEA' }}>{formData.game_login_username}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
                    <span style={{ color: '#9EA3AE' }}>數量：</span>
                    <span style={{ color: '#EAEAEA' }}>{formData.quantity} 個</span>
                  </div>
                  <div className="border-t pt-4 mt-4" style={{ borderColor: '#1F2937' }}>
                    <div className="flex justify-between items-center p-4 rounded-lg" style={{ backgroundColor: 'rgba(255, 193, 7, 0.1)' }}>
                      <span className="text-xl" style={{ color: '#EAEAEA', fontWeight: 600 }}>總計：</span>
                      <motion.span 
                        className="text-3xl"
                        style={{ color: '#FFC107', fontWeight: 700 }}
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        ${getTotalPrice()}
                      </motion.span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer information */}
            <Card
              className="border-0"
              style={{ 
                backgroundColor: '#12141A',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
              }}
            >
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2" style={{ color: '#EAEAEA' }}>
                  <div className="w-1 h-6 rounded-full" style={{ backgroundColor: '#00E0FF' }}></div>
                  聯絡資訊
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="email" style={{ color: '#EAEAEA' }}>客戶信箱 *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.customer_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, customer_email: e.target.value }))}
                    className="mt-2 border-0"
                    style={{ 
                      backgroundColor: 'rgba(31, 41, 55, 0.5)',
                      color: '#EAEAEA',
                      borderColor: '#1F2937'
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="phone" style={{ color: '#EAEAEA' }}>聯絡電話（選填）</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+886 912345678"
                    value={formData.customer_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, customer_phone: e.target.value }))}
                    className="mt-2 border-0"
                    style={{ 
                      backgroundColor: 'rgba(31, 41, 55, 0.5)',
                      color: '#EAEAEA',
                      borderColor: '#1F2937'
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="notes" style={{ color: '#EAEAEA' }}>備註（選填）</Label>
                  <Textarea
                    id="notes"
                    placeholder="如有特殊需求請在此說明"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="mt-2 border-0"
                    style={{ 
                      backgroundColor: 'rgba(31, 41, 55, 0.5)',
                      color: '#EAEAEA',
                      borderColor: '#1F2937'
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                className="w-full py-6 text-lg transition-all duration-300" 
                onClick={submitOrder}
                disabled={submitting || !formData.customer_email}
                style={{
                  backgroundColor: submitting || !formData.customer_email ? '#1F2937' : '#FFC107',
                  color: submitting || !formData.customer_email ? '#9EA3AE' : '#0B0C10',
                  boxShadow: submitting || !formData.customer_email ? 'none' : '0 0 40px rgba(255, 193, 7, 0.5)',
                  fontWeight: 700
                }}
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                    ></motion.div>
                    處理中...
                  </span>
                ) : (
                  `確認訂單並支付 $${getTotalPrice()}`
                )}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}