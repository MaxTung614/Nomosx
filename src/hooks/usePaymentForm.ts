import { useState } from 'react'
import { toast } from 'sonner@2.0.3'
import { paymentsService } from '../services'

/**
 * 支付表单自定义 Hook
 * 
 * @description
 * 封装支付表单的状态管理和提交逻辑，减轻组件负担
 * 
 * @example
 * ```tsx
 * const { formData, updateField, submitPayment, isSubmitting } = usePaymentForm(orderId)
 * ```
 */
export function usePaymentForm(orderId: string) {
  const [formData, setFormData] = useState({
    paymentMethod: 'paypal',
    customerName: '',
    customerEmail: '',
    customerPhone: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateForm = (): boolean => {
    if (!formData.customerEmail) {
      toast.error('請輸入客戶信箱')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.customerEmail)) {
      toast.error('請輸入有效的信箱地址')
      return false
    }

    return true
  }

  const submitPayment = async () => {
    if (!validateForm()) {
      return { success: false, data: null }
    }

    try {
      setIsSubmitting(true)

      const { data, error } = await paymentsService.createPayment({
        orderId,
        paymentMethod: formData.paymentMethod,
        customerEmail: formData.customerEmail,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone
      })

      if (error) {
        toast.error(error)
        return { success: false, data: null }
      }

      toast.success('支付請求已提交')
      return { success: true, data }

    } catch (error) {
      console.error('Payment submission error:', error)
      toast.error('提交支付時發生錯誤')
      return { success: false, data: null }
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      paymentMethod: 'paypal',
      customerName: '',
      customerEmail: '',
      customerPhone: ''
    })
  }

  return {
    formData,
    updateField,
    submitPayment,
    isSubmitting,
    resetForm
  }
}
