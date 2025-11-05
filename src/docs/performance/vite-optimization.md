# Vite 性能优化配置

**日期:** 2025-11-05  
**目标:** 优化构建性能和运行时性能

---

## 📋 推荐的 Vite 配置

### 基础配置

创建或更新 `vite.config.ts`：

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    
    // 构建分析插件（可选）
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html'
    })
  ],

  // 开发服务器配置
  server: {
    port: 3000,
    host: true,
    // 预热常用文件
    warmup: {
      clientFiles: [
        './src/components/core/main-app.tsx',
        './src/components/core/router.tsx',
      ]
    }
  },

  // 构建优化
  build: {
    // 目标浏览器
    target: 'es2015',
    
    // 启用 CSS 代码拆分
    cssCodeSplit: true,
    
    // 生成 sourcemap（生产环境可关闭）
    sourcemap: false,
    
    // chunk 大小警告限制 (KB)
    chunkSizeWarningLimit: 1000,
    
    // Rollup 选项
    rollupOptions: {
      output: {
        // 手动分块策略
        manualChunks: {
          // React 核心库
          'react-vendor': ['react', 'react-dom'],
          
          // UI 组件库
          'ui-components': [
            './src/components/ui/button',
            './src/components/ui/card',
            './src/components/ui/dialog',
            './src/components/ui/input',
            './src/components/ui/table',
          ],
          
          // 动画库
          'motion': ['motion/react'],
          
          // 图标库
          'icons': ['lucide-react'],
          
          // 服务层
          'services': [
            './src/services/api.config',
            './src/services/authService',
            './src/services/gamesService',
            './src/services/cmsService',
            './src/services/ordersService',
            './src/services/paymentsService',
          ],
        },
        
        // 文件命名
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      }
    },
    
    // 压缩选项
    minify: 'terser',
    terserOptions: {
      compress: {
        // 移除 console
        drop_console: true,
        drop_debugger: true,
      },
    },
  },

  // 优化依赖预构建
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'motion/react',
      'lucide-react',
    ],
    exclude: [
      // 排除已经优化的包
    ],
  },

  // 路径别名
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@services': '/src/services',
      '@types': '/src/types',
      '@utils': '/src/utils',
      '@styles': '/src/styles',
    }
  },
})
```

---

## 🚀 性能优化策略

### 1. 预构建依赖

Vite 会自动预构建 node_modules 中的依赖，但可以手动优化：

```typescript
optimizeDeps: {
  // 强制预构建
  include: [
    'react',
    'react-dom',
    'motion/react',
    'lucide-react',
    'sonner@2.0.3',
  ],
  
  // 排除预构建（对于已优化的 ESM 包）
  exclude: [
    '@supabase/supabase-js'
  ],
}
```

### 2. 代码分割策略

```typescript
manualChunks: (id) => {
  // 第三方库
  if (id.includes('node_modules')) {
    // React 生态
    if (id.includes('react') || id.includes('react-dom')) {
      return 'react-vendor'
    }
    
    // UI 库
    if (id.includes('lucide-react')) {
      return 'icons'
    }
    
    if (id.includes('motion')) {
      return 'motion'
    }
    
    // 其他第三方库
    return 'vendor'
  }
  
  // 业务代码
  if (id.includes('/src/components/ui/')) {
    return 'ui-components'
  }
  
  if (id.includes('/src/services/')) {
    return 'services'
  }
  
  if (id.includes('/src/components/admin/')) {
    return 'admin'
  }
}
```

### 3. CSS 优化

```typescript
css: {
  // CSS 模块配置
  modules: {
    localsConvention: 'camelCase',
  },
  
  // PostCSS 配置
  postcss: {
    plugins: [
      // 自动添加浏览器前缀
      autoprefixer(),
      
      // 压缩 CSS（生产环境）
      ...(process.env.NODE_ENV === 'production' 
        ? [cssnano({ preset: 'default' })] 
        : []),
    ],
  },
}
```

### 4. 图片优化

```typescript
// 使用 vite-plugin-imagemin
import viteImagemin from 'vite-plugin-imagemin'

plugins: [
  viteImagemin({
    gifsicle: {
      optimizationLevel: 7,
      interlaced: false,
    },
    optipng: {
      optimizationLevel: 7,
    },
    mozjpeg: {
      quality: 80,
    },
    pngquant: {
      quality: [0.8, 0.9],
      speed: 4,
    },
    svgo: {
      plugins: [
        {
          name: 'removeViewBox',
        },
        {
          name: 'removeEmptyAttrs',
          active: false,
        },
      ],
    },
  }),
]
```

---

## 📦 打包分析

### 使用 rollup-plugin-visualizer

```bash
npm install -D rollup-plugin-visualizer
```

```typescript
import { visualizer } from 'rollup-plugin-visualizer'

plugins: [
  visualizer({
    open: true,              // 自动打开分析页面
    gzipSize: true,          // 显示 gzip 大小
    brotliSize: true,        // 显示 brotli 大小
    filename: 'dist/stats.html',
  })
]
```

### 分析命令

```bash
# 构建并生成分析报告
npm run build

# 查看报告
open dist/stats.html
```

### 读取分析报告

**关注以下指标：**

1. **最大的包** - 考虑拆分或懒加载
2. **重复的依赖** - 检查是否可以去重
3. **未使用的代码** - 考虑 tree-shaking

---

## ⚡ 开发环境优化

### 1. 快速刷新

```typescript
plugins: [
  react({
    // 启用快速刷新
    fastRefresh: true,
    
    // Babel 配置
    babel: {
      plugins: [
        // 开发环境插件
      ],
    },
  }),
]
```

### 2. 预热文件

```typescript
server: {
  warmup: {
    clientFiles: [
      './src/components/core/main-app.tsx',
      './src/components/core/router.tsx',
      './src/components/auth/auth-provider.tsx',
    ]
  }
}
```

### 3. 缓存优化

Vite 默认使用 `.vite` 目录缓存，可以配置：

```typescript
cacheDir: 'node_modules/.vite',
```

---

## 🎯 生产环境优化

### 1. 启用压缩

```typescript
build: {
  minify: 'terser',
  terserOptions: {
    compress: {
      drop_console: true,      // 移除 console
      drop_debugger: true,     // 移除 debugger
      pure_funcs: ['console.log'], // 移除特定函数
    },
    format: {
      comments: false,         // 移除注释
    },
  },
}
```

### 2. 启用 Gzip/Brotli

```bash
npm install -D vite-plugin-compression
```

```typescript
import viteCompression from 'vite-plugin-compression'

plugins: [
  // Gzip 压缩
  viteCompression({
    algorithm: 'gzip',
    ext: '.gz',
  }),
  
  // Brotli 压缩
  viteCompression({
    algorithm: 'brotliCompress',
    ext: '.br',
  }),
]
```

### 3. 资源内联

对于小文件，可以内联到 HTML 中：

```typescript
build: {
  assetsInlineLimit: 4096, // 4KB 以下的资源内联
}
```

---

## 🔍 性能监控

### 构建时间分析

```bash
# 使用 DEBUG 模式
DEBUG=vite:* npm run build

# 或使用 time 命令
time npm run build
```

### 运行时性能

在 `main.tsx` 中添加性能监控：

```typescript
// 性能监控
if (import.meta.env.PROD) {
  // 监控首次内容绘制
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log(`${entry.name}: ${entry.startTime}ms`)
    }
  })
  
  observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] })
}
```

---

## 📱 PWA 优化

### 添加 PWA 插件

```bash
npm install -D vite-plugin-pwa
```

```typescript
import { VitePWA } from 'vite-plugin-pwa'

plugins: [
  VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['favicon.ico', 'logo.png'],
    manifest: {
      name: 'NomosX',
      short_name: 'NomosX',
      description: '游戏充值平台',
      theme_color: '#030213',
      icons: [
        {
          src: 'logo-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: 'logo-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    },
    workbox: {
      // 缓存策略
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 300, // 5 分钟
            },
          },
        },
      ],
    },
  }),
]
```

---

## 🐛 常见问题

### Q1: 构建很慢？

**解决方案：**
1. 检查是否安装了过多的插件
2. 减少 manualChunks 的复杂度
3. 禁用不必要的 sourcemap
4. 使用 SWC 替代 Babel

### Q2: 开发环境很慢？

**解决方案：**
1. 确保使用最新版本的 Vite
2. 检查 optimizeDeps 配置
3. 减少 warmup 文件数量
4. 清除 .vite 缓存

### Q3: 打包体积太大？

**解决方案：**
1. 使用 visualizer 分析
2. 启用代码拆分
3. 移除未使用的依赖
4. 启用压缩

---

## 📚 参考资源

- [Vite 官方文档](https://vitejs.dev/)
- [Vite 性能优化](https://vitejs.dev/guide/performance.html)
- [Rollup 配置](https://rollupjs.org/configuration-options/)
- [Web.dev 性能优化](https://web.dev/performance/)

---

**最后更新：** 2025-11-05  
**维护者：** NomosX 开发团队
