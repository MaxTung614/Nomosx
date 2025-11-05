# Utility Components

工具组件目录

---

## 📋 组件列表

### 系统工具组件

- **`supabase-connection-test.tsx`** - Supabase 连接测试
- **`edge-function-health-check.tsx`** - Edge Function 健康检查
- **`offline-mode-banner.tsx`** - 离线模式横幅

### 加载状态组件 ⭐ (新增)

- **`loading-fallback.tsx`** - 代码拆分加载组件集合

---

## 🎯 加载状态组件

### 概述

`loading-fallback.tsx` 提供了多层级的加载组件，用于代码拆分和异步加载场景。

### 可用组件

| 组件 | 用途 | 示例 |
|------|------|------|
| `PageLoadingFallback` | 页面级加载 | 全屏居中加载动画 |
| `ComponentLoadingFallback` | 组件级加载 | 局部区域加载 |
| `InlineLoadingFallback` | 行内加载 | 表格/列表中的小型加载 |
| `CardSkeleton` | 卡片骨架屏 | 匹配卡片布局 |
| `TableSkeleton` | 表格骨架屏 | 匹配表格结构 |
| `GamesGridSkeleton` | 游戏网格骨架屏 | 游戏列表加载状态 |

### 使用示例

#### 1. 页面级加载（路由懒加载）

```typescript
import { lazy, Suspense } from 'react'
import { PageLoadingFallback } from '../utils/loading-fallback'

const AdminDashboard = lazy(() => import('./admin-dashboard'))

export function Router() {
  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <AdminDashboard />
    </Suspense>
  )
}
```

#### 2. 组件级加载

```typescript
import { lazy, Suspense } from 'react'
import { ComponentLoadingFallback } from '../utils/loading-fallback'

const Chart = lazy(() => import('./chart'))

export function Dashboard() {
  return (
    <div>
      <h1>仪表板</h1>
      <Suspense fallback={<ComponentLoadingFallback />}>
        <Chart data={data} />
      </Suspense>
    </div>
  )
}
```

#### 3. 骨架屏（数据加载）

```typescript
import { useState, useEffect } from 'react'
import { GamesGridSkeleton } from '../utils/loading-fallback'

export function GamesList() {
  const [loading, setLoading] = useState(true)
  const [games, setGames] = useState([])

  useEffect(() => {
    loadGames().then(data => {
      setGames(data)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return <GamesGridSkeleton count={6} />
  }

  return <GamesGrid games={games} />
}
```

#### 4. 表格骨架屏

```typescript
import { TableSkeleton } from '../utils/loading-fallback'

export function OrdersTable() {
  if (loading) {
    return <TableSkeleton rows={10} />
  }

  return <Table data={orders} />
}
```

#### 5. 卡片骨架屏

```typescript
import { CardSkeleton } from '../utils/loading-fallback'

export function ProductCard() {
  if (loading) {
    return <CardSkeleton />
  }

  return <Card product={product} />
}
```

### 最佳实践

#### ✅ 推荐

```typescript
// 1. 为懒加载组件提供加载状态
<Suspense fallback={<PageLoadingFallback />}>
  <LazyComponent />
</Suspense>

// 2. 使用匹配真实内容的骨架屏
{loading ? <GamesGridSkeleton /> : <GamesGrid />}

// 3. 避免布局抖动
// 骨架屏应该和实际内容尺寸一致
```

#### ❌ 避免

```typescript
// 1. 不要使用空白 fallback
<Suspense fallback={null}>  // ❌
  <LazyComponent />
</Suspense>

// 2. 不要使用通用的 "Loading..."
{loading && <div>Loading...</div>}  // ❌

// 3. 不要忘记 Suspense
<LazyComponent />  // ❌ 缺少 Suspense
```

### 自定义加载组件

你可以基于现有组件创建自定义的加载状态：

```typescript
import { Loader2 } from 'lucide-react'

export function BrandedLoadingFallback() {
  return (
    <div className="min-h-screen bg-nomosx-gradient flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <img src="/logo.png" alt="NomosX" className="w-24 animate-pulse" />
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
        <span className="text-gold-gradient">載入中...</span>
      </div>
    </div>
  )
}
```

---

## 📚 相关文档

- [代码拆分指南](/docs/performance/code-splitting-guide.md)
- [性能优化总结](/docs/performance/PERFORMANCE-OPTIMIZATION-SUMMARY.md)
- [快速开始](/docs/performance/QUICK-START.md)

---

**最后更新:** 2025-11-05  
**维护者:** NomosX 开发团队
