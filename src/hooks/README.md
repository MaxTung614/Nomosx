# Custom Hooks 使用文档

## 📚 概述

Hooks 目录包含所有自定义 React Hooks，用于封装可复用的业务逻辑和状态管理。

## 🎯 设计原则

1. **单一职责** - 每个 Hook 只处理一个特定的业务逻辑
2. **可复用性** - Hook 应该能在多个组件中复用
3. **类型安全** - 使用 TypeScript 确保类型安全
4. **错误处理** - 统一的错误处理和用户提示

## 📦 可用的 Hooks

### 1. usePaymentForm

**用途**：处理支付表单的状态管理和提交逻辑

**使用示例**：
```tsx
import { usePaymentForm } from '../hooks'

function PaymentPage({ orderId }) {
  const { 
    formData, 
    updateField, 
    submitPayment, 
    isSubmitting,
    resetForm 
  } = usePaymentForm(orderId)

  const handleSubmit = async () => {
    const result = await submitPayment()
    if (result.success) {
      // 处理成功逻辑
      window.location.href = result.data.approvalUrl
    }
  }

  return (
    <form>
      <input
        value={formData.customerEmail}
        onChange={(e) => updateField('customerEmail', e.target.value)}
      />
      <button onClick={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? '提交中...' : '確認支付'}
      </button>
    </form>
  )
}
```

**API**：
- `formData` - 表单数据对象
- `updateField(field, value)` - 更新单个字段
- `submitPayment()` - 提交支付请求
- `isSubmitting` - 提交状态
- `resetForm()` - 重置表单

---

### 2. useOrderForm

**用途**：处理订单创建的状态管理和提交逻辑

**使用示例**：
```tsx
import { useOrderForm } from '../hooks'

function CheckoutPage() {
  const { 
    formData, 
    updateField, 
    submitOrder, 
    isSubmitting 
  } = useOrderForm()

  const handleCheckout = async () => {
    const { success, orderId } = await submitOrder(gameId, denominationId)
    if (success) {
      navigate(`/payment/${orderId}`)
    }
  }

  return (
    <form>
      <input
        value={formData.game_login_username}
        onChange={(e) => updateField('game_login_username', e.target.value)}
      />
      {/* 其他表单字段 */}
      <button onClick={handleCheckout} disabled={isSubmitting}>
        提交訂單
      </button>
    </form>
  )
}
```

**API**：
- `formData` - 订单表单数据
- `updateField(field, value)` - 更新字段值（类型安全）
- `submitOrder(gameId, denominationId)` - 提交订单
- `isSubmitting` - 提交状态
- `resetForm()` - 重置表单

---

### 3. usePermission

**用途**：封装权限判断逻辑，统一管理角色权限

**使用示例**：
```tsx
import { usePermission } from '../hooks'

function DashboardPage() {
  const { 
    isAdmin, 
    isCS, 
    isStaff, 
    canAccess 
  } = usePermission()

  return (
    <div>
      {isAdmin() && <AdminPanel />}
      {isCS() && <CustomerServicePanel />}
      {canAccess(['admin', 'cs']) && <ManagementTools />}
    </div>
  )
}
```

**API**：
- `userRole` - 当前用户角色
- `isAuthenticated` - 是否已认证
- `hasRole(role)` - 检查是否具有指定角色
- `canAccess(roles)` - 检查是否具有指定角色中的任一角色
- `isAdmin()` - 是否为管理员
- `isCS()` - 是否为客服
- `isStaff()` - 是否为后台人员（管理员或客服）
- `isRegularUser()` - 是否为普通用户

---

## 🔧 创建新的 Hook

### 命名规范
- 使用 `use` 前缀
- 驼峰命名法（camelCase）
- 描述性名称，如 `useProductFilter`, `useOrderHistory`

### 文件结构
```typescript
/**
 * Hook 名称和用途说明
 */
import { useState } from 'react'

export function useMyCustomHook(param: string) {
  const [state, setState] = useState(initialState)

  const someMethod = () => {
    // 业务逻辑
  }

  return {
    state,
    someMethod
  }
}
```

### 最佳实践

1. **添加 JSDoc 注释**
```typescript
/**
 * 自定义 Hook 说明
 * 
 * @description
 * 详细描述 Hook 的功能和用途
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = useMyHook()
 * ```
 */
```

2. **提供清晰的返回值**
```typescript
// ✅ 好的做法 - 返回对象，清晰的属性名
return {
  data,
  isLoading,
  error,
  refetch
}

// ❌ 避免 - 返回数组，不够清晰
return [data, isLoading, error, refetch]
```

3. **处理错误和边界情况**
```typescript
try {
  // 业务逻辑
} catch (error) {
  console.error('Hook error:', error)
  toast.error('操作失败')
}
```

4. **添加到 index.ts 导出**
```typescript
// hooks/index.ts
export { useMyCustomHook } from './useMyCustomHook'
```

---

## 📝 测试建议

### 单元测试示例
```typescript
import { renderHook, act } from '@testing-library/react'
import { usePaymentForm } from './usePaymentForm'

describe('usePaymentForm', () => {
  it('should update field value', () => {
    const { result } = renderHook(() => usePaymentForm('order-123'))
    
    act(() => {
      result.current.updateField('customerEmail', 'test@example.com')
    })
    
    expect(result.current.formData.customerEmail).toBe('test@example.com')
  })
})
```

---

## 🚀 性能优化

### 使用 useMemo 和 useCallback

```typescript
import { useMemo, useCallback } from 'react'

export function useExpensiveCalculation(data: any[]) {
  // 缓存计算结果
  const processedData = useMemo(() => {
    return data.map(item => /* 复杂计算 */)
  }, [data])

  // 缓存回调函数
  const handleAction = useCallback(() => {
    // 处理逻辑
  }, [/* dependencies */])

  return { processedData, handleAction }
}
```

---

## 📖 相关资源

- [React Hooks 官方文档](https://react.dev/reference/react)
- [自定义 Hook 最佳实践](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [项目 Types 文档](/types/index.ts)
