# NomosX 样式系统说明

## 📁 目录结构

```
styles/
├── globals.css                 # 主入口文件（导入所有模块）
├── base/                       # 基础层
│   └── reset.css              # 全局重置和基础样式
├── theme/                      # 主题层
│   ├── colors.css             # 颜色系统（明/暗模式）
│   ├── typography.css         # 排版系统
│   └── spacing.css            # 间距和圆角
├── utilities/                  # 工具层
│   ├── animations.css         # 动画效果
│   └── helpers.css            # 实用工具类
└── README.md                  # 本文档
```

## 🎨 设计原则

### 1. 模块化
- 每个 CSS 文件专注于单一职责
- 易于维护和更新
- 避免样式冲突

### 2. Tailwind First
- 优先使用 Tailwind CSS 类
- 仅在必要时使用自定义 CSS
- 充分利用 CSS 变量系统

### 3. 主题支持
- 完整的明/暗模式支持
- 使用 CSS 变量实现主题切换
- NomosX 黑金电竞风格主题

## 📚 模块说明

### Base Layer (基础层)

#### `reset.css` - 全局重置
```css
/* 统一边框和 outline */
* {
  @apply border-border outline-ring/50;
}

/* 应用主题背景和文字颜色 */
body {
  @apply bg-background text-foreground;
}
```

**用途：**
- 提供一致的基础样式
- 与 Tailwind 集成
- 支持暗色模式切换

---

### Theme Layer (主题层)

#### `colors.css` - 颜色系统

定义了完整的颜色主题，包括：

**核心颜色：**
- `--background` / `--foreground` - 背景和前景色
- `--primary` / `--primary-foreground` - 主色（黑金主题）
- `--secondary` / `--secondary-foreground` - 辅助色
- `--muted` / `--muted-foreground` - 柔和色
- `--accent` / `--accent-foreground` - 强调色
- `--destructive` / `--destructive-foreground` - 危险色

**UI 元素颜色：**
- `--card` / `--card-foreground` - 卡片
- `--popover` / `--popover-foreground` - 弹出框
- `--border` - 边框
- `--input` - 输入框
- `--ring` - 焦点环

**图表颜色：**
- `--chart-1` 到 `--chart-5` - 五种图表颜色

**侧边栏颜色：**
- `--sidebar-*` - 侧边栏相关颜色

**使用示例：**
```tsx
// 使用 Tailwind 类
<div className="bg-primary text-primary-foreground">
  NomosX
</div>

// 使用 CSS 变量
<div style={{ backgroundColor: 'var(--primary)' }}>
  Custom
</div>
```

#### `typography.css` - 排版系统

定义了字体大小和权重：

**变量：**
- `--font-size: 16px` - 基础字体大小
- `--font-weight-medium: 500` - 中等字重
- `--font-weight-normal: 400` - 普通字重

**默认排版：**
- `h1` - `--text-2xl`, 中等字重
- `h2` - `--text-xl`, 中等字重
- `h3` - `--text-lg`, 中等字重
- `h4` - `--text-base`, 中等字重
- `p` - `--text-base`, 普通字重
- `label` - `--text-base`, 中等字重
- `button` - `--text-base`, 中等字重
- `input` - `--text-base`, 普通字重

**注意：**
这些样式只应用于没有 Tailwind `text-*` 类的元素，避免冲突。

**使用示例：**
```tsx
// ❌ 会使用默认排版
<h1>标题</h1>

// ✅ 使用 Tailwind 类（推荐）
<h1 className="text-3xl font-bold">标题</h1>
```

#### `spacing.css` - 间距和圆角

定义了圆角大小：

**变量：**
- `--radius: 0.625rem` (10px) - 基础圆角
- `--radius-sm: 6px` - 小圆角
- `--radius-md: 8px` - 中圆角
- `--radius-lg: 10px` - 大圆角
- `--radius-xl: 14px` - 超大圆角

**使用示例：**
```tsx
<div className="rounded-lg">默认圆角</div>
<div className="rounded-xl">大圆角</div>
```

---

### Utilities Layer (工具层)

#### `animations.css` - 动画效果

提供常用的动画效果：

**淡入动画：**
```tsx
<div className="animate-fade-in">淡入</div>
<div className="animate-fade-in-slow">慢速淡入</div>
```

**滑入动画：**
```tsx
<div className="animate-slide-in-up">从下滑入</div>
<div className="animate-slide-in-down">从上滑入</div>
<div className="animate-slide-in-left">从左滑入</div>
<div className="animate-slide-in-right">从右滑入</div>
```

**脉冲和发光效果：**
```tsx
<div className="pulse-subtle">轻微脉冲</div>
<div className="glow">发光</div>
<div className="glow-gold">金色发光</div>
```

#### `helpers.css` - 实用工具类

提供各种实用工具类：

**滚动条样式：**
```tsx
<div className="scrollbar-hide">隐藏滚动条</div>
<div className="scrollbar-custom">自定义滚动条</div>
```

**渐变效果：**
```tsx
<div className="bg-gradient-radial">径向渐变</div>
<div className="bg-nomosx-gradient">NomosX 黑金渐变</div>
<div className="bg-gold-gradient">金色渐变</div>
```

**文字效果：**
```tsx
<h1 className="text-gradient from-yellow-400 to-orange-500">
  渐变文字
</h1>
<h1 className="text-gold-gradient">金色渐变文字</h1>

<p className="line-clamp-2">
  这段文字会被截断为两行...
</p>
```

**玻璃态效果：**
```tsx
<div className="glass">玻璃态（亮）</div>
<div className="glass-dark">玻璃态（暗）</div>
```

**宽高比：**
```tsx
<div className="aspect-video">16:9</div>
<div className="aspect-square">1:1</div>
```

## 🎯 最佳实践

### 1. 优先使用 Tailwind 类

```tsx
// ✅ 推荐
<div className="bg-primary text-white rounded-lg p-4">
  内容
</div>

// ❌ 不推荐
<div style={{ backgroundColor: '#030213', color: 'white', borderRadius: '10px', padding: '16px' }}>
  内容
</div>
```

### 2. 使用 CSS 变量实现主题

```tsx
// ✅ 使用主题变量
<div className="bg-primary">主题色</div>

// ❌ 硬编码颜色
<div className="bg-[#030213]">硬编码</div>
```

### 3. 合理使用自定义动画

```tsx
// ✅ 使用预定义动画
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  className="animate-fade-in"
>
  内容
</motion.div>

// 如果需要复杂动画，使用 Motion 库
<motion.div
  initial={{ scale: 0 }}
  animate={{ scale: 1 }}
  transition={{ type: "spring" }}
>
  复杂动画
</motion.div>
```

### 4. 避免重复样式

```tsx
// ❌ 重复样式
<button className="bg-primary text-white px-4 py-2 rounded-lg">按钮 1</button>
<button className="bg-primary text-white px-4 py-2 rounded-lg">按钮 2</button>

// ✅ 使用 ShadCN 组件
import { Button } from './components/ui/button'

<Button>按钮 1</Button>
<Button>按钮 2</Button>
```

### 5. 组件内样式组织

```tsx
// ✅ 推荐的组织方式
export function MyComponent() {
  return (
    <div className="
      // Layout
      flex flex-col gap-4
      // Size
      w-full h-screen
      // Colors
      bg-background text-foreground
      // Effects
      rounded-lg shadow-lg
    ">
      内容
    </div>
  )
}
```

## 🔧 自定义主题

### 修改颜色主题

编辑 `styles/theme/colors.css`：

```css
:root {
  /* 修改主色 */
  --primary: #your-color;
  --primary-foreground: #your-text-color;
  
  /* 其他颜色... */
}
```

### 添加新的工具类

在 `styles/utilities/helpers.css` 中添加：

```css
@layer utilities {
  .my-custom-utility {
    /* 你的样式 */
  }
}
```

### 添加新的动画

在 `styles/utilities/animations.css` 中添加：

```css
@layer utilities {
  .my-animation {
    animation: myKeyframes 1s ease-in-out;
  }

  @keyframes myKeyframes {
    from { /* 起始状态 */ }
    to { /* 结束状态 */ }
  }
}
```

## 📊 性能优化

### 1. CSS 文件大小
- 所有模块化 CSS 文件总计 < 10KB
- 使用 PostCSS 和 Tailwind 自动清除未使用的样式
- 生产构建时自动压缩

### 2. 加载策略
- 所有样式通过 `globals.css` 统一导入
- 利用浏览器缓存
- CSS 变量提供即时主题切换，无需重新加载

### 3. 避免样式冲突
- 使用 `@layer` 指令组织样式
- Tailwind 类优先级最高
- 自定义样式使用 `@layer utilities`

## 🐛 常见问题

### Q: 样式不生效？
A: 检查以下几点：
1. 确保 `globals.css` 在 `App.tsx` 中被导入
2. 检查 Tailwind 类名是否正确
3. 查看浏览器开发者工具，确认样式是否被其他规则覆盖

### Q: 如何调试样式？
A: 
1. 使用浏览器开发者工具的 Elements 面板
2. 检查 Computed 样式
3. 查看 CSS 变量的实际值

### Q: 暗色模式不工作？
A: 确保：
1. 使用了 `.dark` 类或 `dark:` 前缀
2. CSS 变量在 `.dark` 中正确定义
3. 组件使用了主题变量而不是硬编码颜色

## 📚 相关资源

- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [ShadCN UI 组件](https://ui.shadcn.com/)
- [Motion 动画库](https://motion.dev/)
- [CSS 变量 MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)

---

**最后更新：** 2025-11-05  
**维护者：** NomosX 开发团队
