# ⚡ 快速重组指南

由于文件系统限制，AI 无法直接移动文件。请按照以下步骤操作：

## 🎯 一键执行脚本

复制以下脚本并在项目根目录执行：

```bash
#!/bin/bash

echo "🚀 开始组件重组..."

# 创建新目录
mkdir -p components/core components/auth components/admin components/payment components/utils

# 移动核心组件
mv components/main-app.tsx components/core/ 2>/dev/null || true
mv components/router.tsx components/core/ 2>/dev/null || true
mv components/SearchBar.tsx components/core/ 2>/dev/null || true
mv components/product-page.tsx components/core/ 2>/dev/null || true

# 移动认证组件
mv components/auth-provider.tsx components/auth/ 2>/dev/null || true
mv components/auth-modal.tsx components/auth/ 2>/dev/null || true
mv components/admin-login-page.tsx components/auth/ 2>/dev/null || true

# 移动管理组件
mv components/admin-dashboard.tsx components/admin/ 2>/dev/null || true
mv components/user-role-display.tsx components/admin/ 2>/dev/null || true

# 移动支付组件
mv components/payment-page.tsx components/payment/ 2>/dev/null || true
mv components/payment-result-page.tsx components/payment/ 2>/dev/null || true
mv components/paypal-cancel-handler.tsx components/payment/ 2>/dev/null || true
mv components/paypal-return-handler.tsx components/payment/ 2>/dev/null || true

# 移动工具组件
mv components/supabase-connection-test.tsx components/utils/ 2>/dev/null || true
mv components/edge-function-health-check.tsx components/utils/ 2>/dev/null || true
mv components/offline-mode-banner.tsx components/utils/ 2>/dev/null || true

echo "✅ 文件移动完成！"
echo ""
echo "📊 重组结果："
echo "Core: $(ls components/core/ 2>/dev/null | wc -l) 个文件"
echo "Auth: $(ls components/auth/ 2>/dev/null | wc -l) 个文件"  
echo "Admin: $(ls components/admin/ 2>/dev/null | wc -l) 个文件"
echo "Payment: $(ls components/payment/ 2>/dev/null | wc -l) 个文件"
echo "Utils: $(ls components/utils/ 2>/dev/null | wc -l) 个文件"
echo ""
echo "🎯 下一步: 告诉 AI '文件已移动，请更新导入路径'"
```

## Windows用户（PowerShell）

```powershell
# 创建目录
New-Item -ItemType Directory -Force -Path components/core
New-Item -ItemType Directory -Force -Path components/auth
New-Item -ItemType Directory -Force -Path components/admin
New-Item -ItemType Directory -Force -Path components/payment
New-Item -ItemType Directory -Force -Path components/utils

# 移动核心组件
Move-Item components/main-app.tsx components/core/ -ErrorAction SilentlyContinue
Move-Item components/router.tsx components/core/ -ErrorAction SilentlyContinue
Move-Item components/SearchBar.tsx components/core/ -ErrorAction SilentlyContinue
Move-Item components/product-page.tsx components/core/ -ErrorAction SilentlyContinue

# 移动认证组件
Move-Item components/auth-provider.tsx components/auth/ -ErrorAction SilentlyContinue
Move-Item components/auth-modal.tsx components/auth/ -ErrorAction SilentlyContinue
Move-Item components/admin-login-page.tsx components/auth/ -ErrorAction SilentlyContinue

# 移动管理组件
Move-Item components/admin-dashboard.tsx components/admin/ -ErrorAction SilentlyContinue
Move-Item components/user-role-display.tsx components/admin/ -ErrorAction SilentlyContinue

# 移动支付组件
Move-Item components/payment-page.tsx components/payment/ -ErrorAction SilentlyContinue
Move-Item components/payment-result-page.tsx components/payment/ -ErrorAction SilentlyContinue
Move-Item components/paypal-cancel-handler.tsx components/payment/ -ErrorAction SilentlyContinue
Move-Item components/paypal-return-handler.tsx components/payment/ -ErrorAction SilentlyContinue

# 移动工具组件
Move-Item components/supabase-connection-test.tsx components/utils/ -ErrorAction SilentlyContinue
Move-Item components/edge-function-health-check.tsx components/utils/ -ErrorAction SilentlyContinue
Move-Item components/offline-mode-banner.tsx components/utils/ -ErrorAction SilentlyContinue

Write-Host "✅ 文件移动完成！请告诉 AI '文件已移动，请更新导入路径'"
```

## 执行完成后

告诉 AI:
```
文件已移动，请更新导入路径
```
