# NomosX 快速参考卡片

> 💡 开发时快速查找常用代码和模式

---

## 🎯 服务层使用

### 基本模式

```typescript
import { someService } from '../services'
import type { SomeType } from '../types'
import { toast } from 'sonner@2.0.3'

const [data, setData] = useState<SomeType[]>([])
const [loading, setLoading] = useState(false)

const loadData = async () => {
  try {
    setLoading(true)
    const { data, error } = await someService.getAll()
    
    if (error) {
      toast.error(error)
      return
    }
    
    setData(data.items)
  } catch (error) {
    console.error('Load error:', error)
    toast.error('載入失敗')
  } finally {
    setLoading(false)
  }
}
```

### 可用服务

| 服务 | 导入 | 主要方法 |
|------|------|----------|
| 认证 | `authService` | `login()`, `logout()`, `getCurrentUser()` |
| 游戏 | `gamesService` | `getAllGames()`, `createGame()`, `uploadCoverImage()` |
| CMS | `cmsService` | `getAllRegions()`, `getAllPlatforms()`, `loadAllCMSData()` |
| 订单 | `ordersService` | `getAllOrders()`, `createOrder()`, `fulfillOrder()` |
| 支付 | `paymentsService` | `createPayPalOrder()`, `capturePayPalOrder()` |

---

## 🎨 样式工具类

### 动画

```tsx
<div className="animate-fade-in">淡入</div>
<div className="animate-slide-in-up">从下滑入</div>
<div className="pulse-subtle">轻微脉冲</div>
<div className="glow-gold">金色发光</div>
```

### 渐变

```tsx
<div className="bg-nomosx-gradient">黑金背景</div>
<h1 className="text-gold-gradient">金色文字</h1>
```

### 玻璃态

```tsx
<div className="glass">玻璃效果</div>
<div className="glass-dark">暗色玻璃</div>
```

### 滚动条

```tsx
<div className="scrollbar-hide overflow-auto">隐藏滚动条</div>
<div className="scrollbar-custom overflow-auto">自定义滚动条</div>
```

### 文字截断

```tsx
<p className="line-clamp-1">单行截断...</p>
<p className="line-clamp-2">两行截断...</p>
```

---

## 📦 常用类型

```typescript
import type {
  // 认证
  AuthUser,
  UserRole,
  
  // 游戏
  HomepageGame,
  Game,
  
  // 订单
  Order,
  OrderStatus,
  PaymentStatus,
  
  // CMS
  Region,
  Platform,
  DisplayTag,
  Denomination,
  
  // 通用
  ApiResponse,
  ValidationErrors
} from '../types'
```

---

## 🎯 组件模板

### 列表组件

```typescript
import { useState, useEffect } from 'react'
import { someService } from '../services'
import type { SomeItem } from '../types'
import { Card } from '../components/ui/card'
import { toast } from 'sonner@2.0.3'

export function ItemsList() {
  const [items, setItems] = useState<SomeItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadItems()
  }, [])

  const loadItems = async () => {
    try {
      setLoading(true)
      const { data, error } = await someService.getAll()
      
      if (error) {
        toast.error(error)
        return
      }
      
      setItems(data.items)
    } catch (error) {
      toast.error('載入失敗')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>載入中...</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {items.map(item => (
        <Card key={item.id}>
          {item.name}
        </Card>
      ))}
    </div>
  )
}
```

### 表单组件

```typescript
import { useState } from 'react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { toast } from 'sonner@2.0.3'
import { someService } from '../services'

export function ItemForm() {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = '名稱為必填項目'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) return

    try {
      setSubmitting(true)
      const { error } = await someService.create(formData)
      
      if (error) {
        toast.error(error)
        return
      }
      
      toast.success('創建成功')
      setFormData({ name: '', description: '' })
    } catch (error) {
      toast.error('創建失敗')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="名稱"
        />
        {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
      </div>
      
      <Button type="submit" disabled={submitting}>
        {submitting ? '提交中...' : '提交'}
      </Button>
    </form>
  )
}
```

---

## 🔧 API 配置

### 添加新端点

```typescript
// services/api.config.ts
export const API_ENDPOINTS = {
  // ... 现有端点
  
  newFeature: {
    list: '/new-feature',
    detail: (id: string) => `/new-feature/${id}`,
    create: '/new-feature',
    update: (id: string) => `/new-feature/${id}`,
    delete: (id: string) => `/new-feature/${id}`,
  }
}
```

### 创建新服务

```typescript
// services/newFeatureService.ts
import { apiGet, apiPost, apiPut, apiDelete, API_ENDPOINTS } from './api.config'
import type { NewFeature, ApiResponse } from '../types'

export class NewFeatureService {
  static async getAll(): Promise<ApiResponse<{ items: NewFeature[] }>> {
    return apiGet(API_ENDPOINTS.newFeature.list)
  }
  
  static async getById(id: string): Promise<ApiResponse<{ item: NewFeature }>> {
    return apiGet(API_ENDPOINTS.newFeature.detail(id))
  }
  
  static async create(data: Partial<NewFeature>): Promise<ApiResponse<{ item: NewFeature }>> {
    return apiPost(API_ENDPOINTS.newFeature.create, data)
  }
  
  static async update(id: string, data: Partial<NewFeature>): Promise<ApiResponse<{ item: NewFeature }>> {
    return apiPut(API_ENDPOINTS.newFeature.update(id), data)
  }
  
  static async delete(id: string): Promise<ApiResponse<void>> {
    return apiDelete(API_ENDPOINTS.newFeature.delete(id))
  }
}

export const newFeatureService = NewFeatureService
```

```typescript
// services/index.ts
export * from './newFeatureService'
```

---

## 🎨 颜色变量

### 主题色

```tsx
<div className="bg-primary text-primary-foreground">主色</div>
<div className="bg-secondary text-secondary-foreground">辅助色</div>
<div className="bg-accent text-accent-foreground">强调色</div>
<div className="bg-muted text-muted-foreground">柔和色</div>
<div className="bg-destructive text-destructive-foreground">危险色</div>
```

### UI 元素

```tsx
<div className="bg-card text-card-foreground">卡片</div>
<div className="bg-popover text-popover-foreground">弹出框</div>
<div className="border border-border">边框</div>
```

---

## 📝 常用组件

### ShadCN UI

```tsx
import { Button } from './components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Input } from './components/ui/input'
import { Label } from './components/ui/label'
import { Badge } from './components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar'
```

### 图标

```tsx
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Download,
  Upload,
  Check,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

<Button>
  <Plus className="h-4 w-4 mr-2" />
  新增
</Button>
```

---

## 🚀 响应式设计

```tsx
<div className="
  // Mobile (default)
  flex flex-col gap-2
  
  // Tablet (md:)
  md:flex-row md:gap-4
  
  // Desktop (lg:)
  lg:gap-6
  
  // Large Desktop (xl:)
  xl:gap-8
">
  内容
</div>
```

### 断点

- `sm:` - ≥640px
- `md:` - ≥768px
- `lg:` - ≥1024px
- `xl:` - ≥1280px
- `2xl:` - ≥1536px

---

## 💾 本地存储

```typescript
// 保存
localStorage.setItem('key', JSON.stringify(data))

// 读取
const data = JSON.parse(localStorage.getItem('key') || '{}')

// 删除
localStorage.removeItem('key')
```

---

## 🔍 调试技巧

```typescript
// 1. 详细的错误日志
console.error('Error context:', {
  error,
  data,
  timestamp: new Date().toISOString()
})

// 2. 性能监控
console.time('operation')
// ... 操作
console.timeEnd('operation')

// 3. 条件断点
if (someCondition) {
  debugger
}
```

---

## 📚 有用的链接

| 资源 | 链接 |
|------|------|
| Tailwind CSS | https://tailwindcss.com/docs |
| ShadCN UI | https://ui.shadcn.com/ |
| Lucide Icons | https://lucide.dev/ |
| Motion | https://motion.dev/ |
| TypeScript | https://www.typescriptlang.org/docs/ |

---

## 🎓 最佳实践

✅ **使用服务层** - 不要在组件中直接调用 API  
✅ **类型安全** - 始终导入和使用类型定义  
✅ **错误处理** - 使用 toast 提示用户  
✅ **加载状态** - 提供视觉反馈  
✅ **响应式设计** - 移动优先  
✅ **一致性** - 遵循现有代码风格  

---

**更新日期：** 2025-11-05  
**维护团队：** NomosX Dev Team
