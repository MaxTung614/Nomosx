# NomosX 项目目录结构说明

## 📁 完整目录结构

```
nomostx/
├── App.tsx                          # 应用主入口
├── components/                      # 所有 React 组件
│   ├── admin/                       # 管理后台相关组件
│   │   ├── admin-dashboard.tsx     # Admin 主面板
│   │   ├── homepage-games-manager.tsx  # 首页游戏管理
│   │   ├── user-role-display.tsx   # 用户角色显示
│   │   └── README.md
│   ├── auth/                        # 认证相关组件
│   │   ├── admin-login-page.tsx    # Admin/CS 登录页
│   │   ├── auth-modal.tsx          # 用户登录/注册弹窗
│   │   ├── auth-provider.tsx       # 认证上下文 Provider
│   │   └── README.md
│   ├── core/                        # 核心业务组件
│   │   ├── main-app.tsx            # 主应用页面
│   │   ├── product-page.tsx        # 产品页面
│   │   ├── router.tsx              # 路由组件
│   │   ├── SearchBar.tsx           # 搜索栏
│   │   └── README.md
│   ├── payment/                     # 支付相关组件
│   │   ├── payment-page.tsx        # 支付页面
│   │   ├── payment-result-page.tsx # 支付结果页
│   │   ├── paypal-cancel-handler.tsx  # PayPal 取消处理
│   │   ├── paypal-return-handler.tsx  # PayPal 返回处理
│   │   └── README.md
│   ├── ui/                          # ShadCN UI 组件库
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── utils/                       # 工具组件
│   │   ├── edge-function-health-check.tsx
│   │   ├── offline-mode-banner.tsx
│   │   ├── supabase-connection-test.tsx
│   │   └── README.md
│   └── figma/                       # Figma 相关组件
│       └── ImageWithFallback.tsx    # 带回退的图片组件
├── services/                        # 业务逻辑层（新增）⭐
│   ├── api.config.ts               # API 配置和通用请求方法
│   ├── authService.ts              # 认证服务
│   ├── gamesService.ts             # 首页游戏管理服务
│   ├── cmsService.ts               # CMS 内容管理服务
│   ├── ordersService.ts            # 订单管理服务
│   ├── paymentsService.ts          # 支付管理服务
│   ├── index.ts                    # 统一导出
│   └── README.md                   # 服务层说明文档
├── types/                           # TypeScript 类型定义（新增）⭐
│   └── index.ts                    # 全局类型定义
├── utils/                           # 工具函数
│   └── supabase/                   # Supabase 相关工具
│       ├── client.tsx              # Supabase 客户端
│       └── info.tsx                # Supabase 配置信息
├── supabase/                        # Supabase Edge Functions
│   └── functions/
│       ├── server/                 # 主服务器函数
│       │   ├── index.tsx           # 服务器入口
│       │   └── kv_store.tsx        # KV 存储工具
│       └── search-games/           # 游戏搜索函数
│           └── index.ts
├── styles/                          # 样式文件
│   └── globals.css                 # 全局样式
├── docs/                            # 项目文档
│   ├── architecture/               # 架构文档（新增）⭐
│   │   └── directory-structure.md # 本文档
│   ├── admin/                      # Admin 相关文档
│   ├── design/                     # 设计文档
│   ├── deployment/                 # 部署文档
│   ├── integrations/               # 集成文档
│   └── ...
└── imports/                         # Figma 导入资源
    └── Container.tsx
```

## 🎯 目录职责说明

### 1. `/components` - 组件层

**职责：** UI 渲染和用户交互

**原则：**
- 只负责 UI 展示和用户交互逻辑
- 不包含复杂的业务逻辑
- 通过调用 `services/` 层来处理数据

**子目录说明：**

#### `/components/admin` - 管理后台组件
- Admin Dashboard 主面板
- 各种管理功能组件
- 仅管理员和客服可访问

#### `/components/auth` - 认证组件
- 登录/注册表单
- 认证状态管理
- 权限验证组件

#### `/components/core` - 核心业务组件
- 主应用页面
- 产品页面
- 路由管理
- 搜索功能

#### `/components/payment` - 支付组件
- 支付表单
- 支付结果处理
- PayPal 集成组件

#### `/components/ui` - UI 组件库
- ShadCN 组件库
- 可复用的 UI 元素
- 不包含业务逻辑

#### `/components/utils` - 工具组件
- 健康检查
- 连接测试
- 离线模式提示

### 2. `/services` - 服务层 ⭐ (新增)

**职责：** 业务逻辑和 API 请求

**原则：**
- 所有 API 请求都通过服务层
- 包含业务逻辑处理
- 提供统一的错误处理
- 确保类型安全

**文件说明：**

#### `api.config.ts` - API 配置
- API 基础 URL 配置
- 端点路径定义
- 通用请求方法（GET, POST, PUT, DELETE, UPLOAD）
- 超时配置
- 认证令牌管理

#### `authService.ts` - 认证服务
- 用户登录/注册/登出
- 获取用户信息
- 角色管理
- 会话管理

#### `gamesService.ts` - 游戏服务
- 首页游戏 CRUD
- 图片上传
- 游戏排序

#### `cmsService.ts` - CMS 服务
- 区域、平台、标签管理
- 游戏和面额管理
- 批量数据加载

#### `ordersService.ts` - 订单服务
- 订单 CRUD
- 订单履行
- 搜索和排序
- CSV 导出

#### `paymentsService.ts` - 支付服务
- PayPal 集成
- 支付记录管理
- 订单统计
- 金额处理

### 3. `/types` - 类型定义 ⭐ (新增)

**职责：** 全局 TypeScript 类型定义

**包含：**
- 接口定义
- 类型别名
- 枚举类型
- API 响应类型

**优势：**
- 集中管理类型
- 避免类型重复定义
- 提高类型复用性
- 确保类型一致性

### 4. `/utils` - 工具函数

**职责：** 通用工具函数和配置

**包含：**
- Supabase 客户端配置
- 通用辅助函数
- 常量定义

### 5. `/supabase` - 后端服务

**职责：** Edge Functions 和后端逻辑

**包含：**
- API 路由定义
- 数据库操作
- 业务逻辑处理

### 6. `/docs` - 项目文档

**职责：** 项目文档和说明

**包含：**
- 架构文档
- API 文档
- 部署指南
- 开发指南

## 🔄 数据流向

```
用户操作
    ↓
组件层 (components/)
    ↓
服务层 (services/) ← 使用类型 (types/)
    ↓
API 配置 (api.config.ts)
    ↓
后端 API (supabase/functions/)
    ↓
数据库
```

## 📝 使用示例

### 在组件中使用服务

```typescript
// ❌ 错误：直接在组件中调用 API
import { useEffect, useState } from 'react'

function MyComponent() {
  const [data, setData] = useState([])
  
  useEffect(() => {
    // 不要这样做！
    fetch('/api/games')
      .then(res => res.json())
      .then(data => setData(data))
  }, [])
}

// ✅ 正确：使用服务层
import { useEffect, useState } from 'react'
import { gamesService } from '../services'
import type { HomepageGame } from '../types'
import { toast } from 'sonner@2.0.3'

function MyComponent() {
  const [games, setGames] = useState<HomepageGame[]>([])
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
}
```

### 使用类型定义

```typescript
// ✅ 导入和使用类型
import type { HomepageGame, Order, PaymentStatus } from '../types'

interface ComponentProps {
  game: HomepageGame
  order: Order
}

function MyComponent({ game, order }: ComponentProps) {
  const status: PaymentStatus = order.payment_status
  // TypeScript 会提供完整的类型检查和智能提示
}
```

## 🎯 最佳实践

### 1. 组件设计
- ✅ 保持组件简洁，专注于 UI
- ✅ 将业务逻辑抽取到服务层
- ✅ 使用 TypeScript 类型确保类型安全
- ❌ 不要在组件中直接调用 `fetch`

### 2. 服务层使用
- ✅ 所有 API 请求通过服务层
- ✅ 统一的错误处理
- ✅ 使用 async/await
- ❌ 不要在服务中包含 UI 逻辑

### 3. 类型定义
- ✅ 在 `/types` 中定义共享类型
- ✅ 为所有函数和变量添加类型
- ✅ 使用 interface 而不是 type（当可能时）
- ❌ 不要使用 `any` 类型

### 4. 文件组织
- ✅ 按功能模块组织文件
- ✅ 相关文件放在同一目录
- ✅ 使用有意义的文件名
- ❌ 不要创建过深的目录层级

## 🔧 添加新功能

### 步骤 1: 定义类型
在 `/types/index.ts` 中添加新类型：

```typescript
export interface NewFeature {
  id: string
  name: string
  // ...
}
```

### 步骤 2: 创建服务
在 `/services/` 中创建服务文件：

```typescript
// newFeatureService.ts
import { apiGet, apiPost, API_ENDPOINTS } from './api.config'
import type { NewFeature, ApiResponse } from '../types'

export class NewFeatureService {
  static async getAll(): Promise<ApiResponse<{ items: NewFeature[] }>> {
    return apiGet(API_ENDPOINTS.newFeature.list)
  }
}

export const newFeatureService = NewFeatureService
```

### 步骤 3: 导出服务
在 `/services/index.ts` 中导出：

```typescript
export * from './newFeatureService'
```

### 步骤 4: 创建组件
在 `/components/` 中创建组件：

```typescript
import { newFeatureService } from '../services'
import type { NewFeature } from '../types'

export function NewFeatureComponent() {
  // 使用服务获取数据
  const { data } = await newFeatureService.getAll()
  
  // 渲染 UI
}
```

## 📚 相关文档

- [Services 层说明](/services/README.md)
- [API 配置说明](/services/api.config.ts)
- [组件开发指南](/docs/getting-started/component-development.md)
- [类型系统说明](/types/README.md)

## 🎓 总结

通过这种目录结构：

- ✅ **清晰的关注点分离**：UI、业务逻辑、类型定义各司其职
- ✅ **易于维护**：代码组织清晰，容易定位和修改
- ✅ **类型安全**：完整的 TypeScript 支持
- ✅ **可复用性高**：服务层和类型定义可在多个组件中复用
- ✅ **易于测试**：业务逻辑独立，便于单元测试
- ✅ **团队协作友好**：明确的代码组织规范

---

**最后更新：** 2025-11-05
**维护者：** NomosX 开发团队
