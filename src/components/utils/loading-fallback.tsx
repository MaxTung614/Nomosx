/**
 * ====================================================================================================
 * 文件名: components/utils/loading-fallback.tsx
 * 描述: 代码拆分时使用的加载后备组件
 * 最后更新: 2025-11-05
 * ====================================================================================================
 */

import React from 'react'
import { Loader2 } from 'lucide-react'

/**
 * 页面级加载组件
 * 用于 React.lazy() 的 Suspense fallback
 */
export function PageLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">載入中...</p>
      </div>
    </div>
  )
}

/**
 * 组件级加载组件
 * 用于较小的组件懒加载
 */
export function ComponentLoadingFallback() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">載入中...</p>
      </div>
    </div>
  )
}

/**
 * 内联加载组件
 * 用于表格或列表中的小型加载
 */
export function InlineLoadingFallback() {
  return (
    <div className="flex items-center justify-center p-4">
      <Loader2 className="h-5 w-5 animate-spin text-primary" />
    </div>
  )
}

/**
 * 骨架屏 - 卡片
 */
export function CardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6 space-y-3 animate-pulse">
      <div className="h-4 bg-muted rounded w-3/4" />
      <div className="h-3 bg-muted rounded w-1/2" />
      <div className="h-20 bg-muted rounded" />
    </div>
  )
}

/**
 * 骨架屏 - 表格
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2 animate-pulse">
      {/* Header */}
      <div className="flex gap-4 pb-2 border-b">
        <div className="h-4 bg-muted rounded flex-1" />
        <div className="h-4 bg-muted rounded flex-1" />
        <div className="h-4 bg-muted rounded flex-1" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-3 border-b">
          <div className="h-3 bg-muted rounded flex-1" />
          <div className="h-3 bg-muted rounded flex-1" />
          <div className="h-3 bg-muted rounded flex-1" />
        </div>
      ))}
    </div>
  )
}

/**
 * 骨架屏 - 游戏卡片网格
 */
export function GamesGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3 animate-pulse">
          <div className="aspect-square bg-muted rounded-lg" />
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-3 bg-muted rounded w-1/2" />
        </div>
      ))}
    </div>
  )
}
