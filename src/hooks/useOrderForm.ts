import { useState } from 'react'
import { toast } from 'sonner@2.0.3'
import { ordersService } from '../services'

interface OrderFormData {
  game_login_username: string
  game_login_password: string
  customer_email: string
  customer_phone: string
  quantity: number
  notes: string
}

/**
 * 订单表单自定义 Hook
 * 
 * @description
 * 封装订单创建的状态管理和提交逻辑
 * 
 * @example
 * ```tsx
 * const { formData, updateField, submitOrder, isSubmitting } = useOrderForm()
 * ```
 */
export function useOrderForm() {
  const [formData, setFormData] = useState<OrderFormData>({
    game_login_username: '',
    game_login_password: '',
    customer_email: '',
    customer_phone: '',
    quantity: 1,
    notes: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField = <K extends keyof OrderFormData>(
    field: K,
    value: OrderFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateForm = (gameId?: string, denominationId?: string): boolean => {
    if (!gameId || !denominationId) {
      toast.error('請選擇遊戲和面額')
      return false
    }

    if (!formData.game_login_username || !formData.game_login_password) {
      toast.error('請輸入遊戲帳號和密碼')
      return false
    }

    if (!formData.customer_email) {
      toast.error('請輸入客戶信箱')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.customer_email)) {
      toast.error('請輸入有效的信箱地址')
      return false
    }

    return true
  }

  const submitOrder = async (gameId: string, denominationId: string) => {
    if (!validateForm(gameId, denominationId)) {
      return { success: false, orderId: null }
    }

    try {
      setIsSubmitting(true)

      const { data, error } = await ordersService.createOrder({
        gameId,
        denominationId,
        ...formData
      })

      if (error) {
        toast.error(error)
        return { success: false, orderId: null }
      }

      toast.success('訂單提交成功！')
      return { success: true, orderId: data?.order?.id }

    } catch (error) {
      console.error('Order submission error:', error)
      toast.error('訂單提交時發生錯誤')
      return { success: false, orderId: null }
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      game_login_username: '',
      game_login_password: '',
      customer_email: '',
      customer_phone: '',
      quantity: 1,
      notes: ''
    })
  }

  return {
    formData,
    updateField,
    submitOrder,
    isSubmitting,
    resetForm
  }
}
