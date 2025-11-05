# Constants 常量配置文档

## 📚 概述

Constants 目录集中管理所有项目中使用的常量配置，包括 API 端点、状态值、路由路径等。

## 🎯 设计原则

1. **集中管理** - 所有常量在一处定义，便于维护
2. **类型安全** - 使用 TypeScript 的 const 断言和枚举
3. **避免硬编码** - 代码中不出现魔法字符串
4. **语义化命名** - 常量名称清晰表达其用途

## 📦 常量模块

### 1. API 端点 (`api.ts`)

**用途**：管理所有 API 请求地址

**使用示例**：
```tsx
import { API_ENDPOINTS } from '../constants'

// 获取游戏列表
const response = await fetch(API_ENDPOINTS.GAMES)

// 获取订单详情
const orderUrl = API_ENDPOINTS.ORDER_DETAIL('order-123')
```

**可用常量**：
- `API_BASE_PATH` - API 基础路径
- `API_ENDPOINTS.GAMES` - 游戏列表
- `API_ENDPOINTS.ORDERS` - 订单列表
- `API_ENDPOINTS.PAYMENTS` - 支付相关
- `API_ENDPOINTS.PAYPAL_CREATE` - PayPal 创建订单
- 等等...

---

### 2. 状态值 (`status.ts`)

**用途**：定义系统中使用的各种状态枚举值

**使用示例**：
```tsx
import { OrderStatus, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../constants'

// 检查订单状态
if (order.status === OrderStatus.COMPLETED) {
  // 处理已完成订单
}

// 显示状态标签
<Badge style={{ backgroundColor: ORDER_STATUS_COLORS[order.status] }}>
  {ORDER_STATUS_LABELS[order.status]}
</Badge>
```

**可用枚举**：

#### OrderStatus（订单状态）
```typescript
enum OrderStatus {
  PENDING = 'pending',       // 待处理
  PROCESSING = 'processing', // 处理中
  COMPLETED = 'completed',   // 已完成
  FAILED = 'failed',        // 失败
  CANCELLED = 'cancelled',   // 已取消
  REFUNDED = 'refunded'      // 已退款
}
```

#### PaymentMethod（支付方式）
```typescript
enum PaymentMethod {
  PAYPAL = 'paypal',
  CREDIT_CARD = 'credit_card',
  ECPAY = 'ecpay',
  BANK_TRANSFER = 'bank_transfer'
}
```

#### PaymentStatus（支付状态）
```typescript
enum PaymentStatus {
  PENDING = 'pending',
  AUTHORIZED = 'authorized',
  CAPTURED = 'captured',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}
```

#### UserRole（用户角色）
```typescript
enum UserRole {
  ADMIN = 'admin',
  CS = 'cs',
  USER = 'user'
}
```

**辅助对象**：
- `ORDER_STATUS_LABELS` - 状态显示名称
- `ORDER_STATUS_COLORS` - 状态颜色
- `PAYMENT_METHOD_LABELS` - 支付方式名称
- `USER_ROLE_LABELS` - 用户角色名称

---

### 3. 路由路径 (`routes.ts`)

**用途**：管理所有前端路由路径

**使用示例**：
```tsx
import { ROUTES, PROTECTED_ROUTES, ADMIN_ONLY_ROUTES } from '../constants'

// 导航到产品详情
navigate(ROUTES.PRODUCT_DETAIL(productId))

// 检查是否为受保护路由
if (PROTECTED_ROUTES.includes(currentPath)) {
  // 验证用户认证
}
```

**可用常量**：
- `ROUTES.HOME` - 首页
- `ROUTES.PRODUCTS` - 产品列表
- `ROUTES.PRODUCT_DETAIL(id)` - 产品详情
- `ROUTES.PAYMENT(orderId)` - 支付页面
- `ROUTES.ADMIN_DASHBOARD` - 管理后台
- `PROTECTED_ROUTES` - 需要认证的路由数组
- `ADMIN_ONLY_ROUTES` - 管理员专属路由
- `CS_ACCESSIBLE_ROUTES` - 客服可访问路由

---

## 🔧 添加新常量

### 1. 选择合适的文件

根据常量类型选择对应的文件：
- API 相关 → `api.ts`
- 状态值 → `status.ts`
- 路由 → `routes.ts`

### 2. 使用合适的数据结构

**简单常量**：
```typescript
export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
export const DEFAULT_PAGE_SIZE = 20
```

**对象常量**（使用 as const）：
```typescript
export const CONFIG = {
  timeout: 15000,
  retryCount: 3
} as const
```

**枚举**：
```typescript
export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}
```

**映射对象**：
```typescript
export const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  [NotificationType.SUCCESS]: '✓',
  [NotificationType.ERROR]: '✗',
  [NotificationType.WARNING]: '⚠',
  [NotificationType.INFO]: 'ℹ'
}
```

### 3. 添加到导出

在 `index.ts` 中导出新常量：
```typescript
export * from './api'
export * from './status'
export * from './routes'
```

---

## 📝 命名规范

### 常量命名
```typescript
// ✅ 好的命名 - 全大写，下划线分隔
export const API_BASE_URL = 'https://api.example.com'
export const MAX_RETRY_COUNT = 3

// ❌ 避免
export const apiBaseUrl = 'https://api.example.com'
export const maxRetryCount = 3
```

### 枚举命名
```typescript
// ✅ 好的命名 - PascalCase
export enum OrderStatus { ... }
export enum PaymentMethod { ... }

// ❌ 避免
export enum orderStatus { ... }
export enum PAYMENT_METHOD { ... }
```

### 对象常量
```typescript
// ✅ 好的命名 - SCREAMING_SNAKE_CASE
export const API_ENDPOINTS = { ... }
export const STATUS_COLORS = { ... }

// ❌ 避免
export const apiEndpoints = { ... }
export const statusColors = { ... }
```

---

## 🎨 使用示例

### 完整的订单状态管理示例

```tsx
import { 
  OrderStatus, 
  ORDER_STATUS_LABELS, 
  ORDER_STATUS_COLORS 
} from '../constants'
import { Badge } from '../components/ui/badge'

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge 
      style={{ 
        backgroundColor: ORDER_STATUS_COLORS[status],
        color: '#FFFFFF'
      }}
    >
      {ORDER_STATUS_LABELS[status]}
    </Badge>
  )
}

function OrderList({ orders }) {
  const pendingOrders = orders.filter(
    order => order.status === OrderStatus.PENDING
  )
  
  const completedOrders = orders.filter(
    order => order.status === OrderStatus.COMPLETED
  )

  return (
    <div>
      <h2>待處理訂單 ({pendingOrders.length})</h2>
      {pendingOrders.map(order => (
        <div key={order.id}>
          <OrderStatusBadge status={order.status} />
        </div>
      ))}
      
      <h2>已完成訂單 ({completedOrders.length})</h2>
      {completedOrders.map(order => (
        <div key={order.id}>
          <OrderStatusBadge status={order.status} />
        </div>
      ))}
    </div>
  )
}
```

---

## ⚠️ 注意事项

1. **不要在常量文件中引入其他依赖**
   - 常量应该是纯粹的值定义
   - 避免导入其他模块，防止循环依赖

2. **保持常量的不可变性**
   - 使用 `as const` 确保对象常量不被修改
   - 使用 `enum` 定义有限的状态集合

3. **文档化复杂常量**
   - 为每个常量添加注释说明其用途
   - 提供使用示例

4. **避免过度使用**
   - 只有真正需要复用的值才提取为常量
   - 组件内部的临时值不需要提取

---

## 📖 相关资源

- [TypeScript Enums](https://www.typescriptlang.org/docs/handbook/enums.html)
- [TypeScript Const Assertions](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions)
- [项目 Types 文档](/types/index.ts)
