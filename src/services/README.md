# Services 目录说明

## 📁 目录结构

```
services/
├── api.config.ts          # API 配置和通用请求方法
├── authService.ts         # 认证服务
├── gamesService.ts        # 首页游戏管理服务
├── cmsService.ts          # CMS 内容管理服务
├── ordersService.ts       # 订单管理服务
├── paymentsService.ts     # 支付管理服务
├── index.ts               # 统一导出入口
└── README.md              # 本文档
```

## 🎯 设计理念

### 1. 关注点分离
- **组件层**：只负责 UI 渲染和用户交互
- **服务层**：负责所有业务逻辑和 API 请求
- **工具层**：提供通用工具函数

### 2. 统一的 API 调用方式
所有服务都使用统一的请求方法，确保：
- 统一的错误处理
- 统一的超时控制
- 统一的认证机制
- 统一的响应格式

### 3. 类型安全
所有服务方法都有完整的 TypeScript 类型定义，确保类型安全。

## 📚 服务说明

### api.config.ts - API 配置

提供基础的 API 配置和通用请求方法。

**主要功能：**
- API 端点配置
- 通用请求方法（GET, POST, PUT, DELETE, UPLOAD）
- 请求超时配置
- 自动添加认证令牌

**使用示例：**
```typescript
import { apiGet, apiPost, API_ENDPOINTS } from '../services/api.config'

// GET 请求
const result = await apiGet('/some-endpoint')

// POST 请求
const result = await apiPost('/some-endpoint', { data: 'value' })

// 使用预定义端点
const result = await apiGet(API_ENDPOINTS.games.list)
```

### authService.ts - 认证服务

处理所有认证相关的业务逻辑。

**主要功能：**
- 用户注册、登录、登出
- 获取当前用户信息
- 获取和更新用户角色
- 会话管理

**使用示例：**
```typescript
import { authService } from '../services'

// 登录
const result = await authService.login('user@example.com', 'password')

// 获取当前用户
const { data } = await authService.getCurrentUser()

// 获取用户角色
const { data: { role } } = await authService.getUserRole()

// 登出
await authService.logout()
```

### gamesService.ts - 首页游戏管理服务

管理首页显示的热门游戏。

**主要功能：**
- 获取游戏列表
- 创建/更新/删除游戏
- 上传游戏封面图片
- 批量更新游戏排序

**使用示例：**
```typescript
import { gamesService } from '../services'

// 获取所有游戏（公开接口）
const { data } = await gamesService.getAllGames()

// 创建新游戏
const result = await gamesService.createGame({
  name: 'Valorant',
  coverUrl: 'https://...',
  price: '即刻充值',
  badge: '熱門',
  order: 0
})

// 上传封面图片
const file = e.target.files[0]
const { data } = await gamesService.uploadCoverImage(file)
const imageUrl = data.url

// 更新游戏
await gamesService.updateGame(gameId, { name: 'New Name' })

// 删除游戏
await gamesService.deleteGame(gameId)
```

### cmsService.ts - CMS 内容管理服务

管理所有 CMS 内容（区域、平台、促销标签、游戏、产品面额）。

**主要功能：**
- 区域管理（CRUD）
- 平台管理（CRUD）
- 促销标签管理（CRUD）
- 游戏管理（CRUD）
- 产品面额管理（CRUD）
- 批量加载所有数据

**使用示例：**
```typescript
import { cmsService } from '../services'

// 获取所有区域
const { data } = await cmsService.getAllRegions()

// 创建新区域
await cmsService.createRegion({
  region_code: 'NA',
  region_name: 'North America'
})

// 批量加载所有 CMS 数据
const allData = await cmsService.loadAllCMSData()
console.log(allData.regions, allData.platforms, ...)
```

### ordersService.ts - 订单管理服务

管理订单相关的所有业务逻辑。

**主要功能：**
- 获取订单列表
- 创建订单
- 履行订单
- 搜索和排序订单
- 导出订单到 CSV

**使用示例：**
```typescript
import { ordersService } from '../services'

// 获取所有订单
const { data } = await ordersService.getAllOrders({ limit: 100 })

// 获取待履行订单
const { data } = await ordersService.getPendingOrders()

// 创建订单
await ordersService.createOrder({
  denomination_id: 'xxx',
  quantity: 1,
  customer_email: 'user@example.com',
  game_login_username: 'player123'
})

// 履行订单
await ordersService.fulfillOrder(orderId, '已發貨')

// 搜索订单
const filtered = ordersService.searchOrders(orders, 'search query')

// 排序订单
const sorted = ordersService.sortOrders(orders, 'created_at', 'desc')

// 导出 CSV
ordersService.exportToCSV(orders, 'orders-export')
```

### paymentsService.ts - 支付管理服务

处理支付相关的业务逻辑。

**主要功能：**
- 获取支付记录
- 获取订单统计
- 创建和捕获 PayPal 订单
- 金额格式化和验证
- 支付状态辅助方法

**使用示例：**
```typescript
import { paymentsService } from '../services'

// 获取支付记录
const { data } = await paymentsService.getAllPayments()

// 获取订单统计
const { data: { stats } } = await paymentsService.getOrderStats()

// 创建 PayPal 订单
const result = await paymentsService.createPayPalOrder({
  order_id: 'ORDER123',
  amount: 99.99
})

// 捕获支付
await paymentsService.capturePayPalOrder(paypalOrderId)

// 格式化金额
const formatted = paymentsService.formatAmount(99.99) // "$99.99"

// 验证金额
const isValid = paymentsService.validateAmount(amount)
```

## 🔧 最佳实践

### 1. 在组件中使用服务

```typescript
import React, { useState, useEffect } from 'react'
import { gamesService } from '../services'
import { toast } from 'sonner@2.0.3'

export function MyComponent() {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadGames()
  }, [])

  const loadGames = async () => {
    try {
      setLoading(true)
      const { data, error } = await gamesService.getAllGames()
      
      if (error) {
        toast.error(error)
        return
      }
      
      setGames(data.games)
    } catch (error) {
      console.error('Load games error:', error)
      toast.error('載入失敗')
    } finally {
      setLoading(false)
    }
  }

  // ... rest of component
}
```

### 2. 错误处理

所有服务方法返回统一的响应格式：

```typescript
{
  success: boolean
  data?: T
  error?: string
  message?: string
}
```

始终检查 `success` 或 `error` 字段：

```typescript
const result = await someService.someMethod()

if (result.error) {
  // 处理错误
  toast.error(result.error)
  return
}

// 使用数据
const data = result.data
```

### 3. 类型安全

导入和使用类型定义：

```typescript
import { gamesService } from '../services'
import type { HomepageGame } from '../types'

const [games, setGames] = useState<HomepageGame[]>([])
```

### 4. 避免直接使用 fetch

不要在组件中直接使用 `fetch`，而是：
1. 使用现有的服务方法
2. 如果需要新的 API 调用，在对应的服务文件中添加新方法

## 📝 添加新服务

如果需要添加新的服务：

1. 在 `services/` 目录创建新文件，例如 `notificationsService.ts`
2. 实现服务类和方法
3. 在 `services/index.ts` 中导出
4. 在 `api.config.ts` 的 `API_ENDPOINTS` 中添加端点

示例：

```typescript
// notificationsService.ts
import { apiGet, apiPost, API_ENDPOINTS } from './api.config'
import type { Notification, ApiResponse } from '../types'

export class NotificationsService {
  static async getAll(): Promise<ApiResponse<{ notifications: Notification[] }>> {
    return apiGet(API_ENDPOINTS.notifications.list)
  }
  
  static async markAsRead(id: string): Promise<ApiResponse<void>> {
    return apiPost(API_ENDPOINTS.notifications.markRead(id))
  }
}

export const notificationsService = NotificationsService
```

## 🎓 总结

通过使用服务层：
- ✅ 代码更清晰、更易维护
- ✅ 组件更专注于 UI 逻辑
- ✅ 业务逻辑集中管理
- ✅ 更容易测试
- ✅ 更容易复用
- ✅ 统一的错误处理
- ✅ 完整的类型安全
