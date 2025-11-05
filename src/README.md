# 🎮 遊戲儲值交易平台

一個完整的遊戲產品交易平台，包含用戶認證、訂單管理、支付集成和 Admin 後台。

> 📚 **完整文檔**: 查看 [文檔中心](/docs/README.md) | [文檔總索引](/docs/DOCUMENTATION-INDEX.md)

---

## 🚀 快速開始

### 30 分鐘啟動指南
```bash
# 1. 克隆項目
git clone <repository-url>
cd <project-directory>

# 2. 安裝依賴
npm install

# 3. 配置環境變量（參考 docs/setup/environment-variables.md）
cp .env.example .env

# 4. 啟動開發服務器
npm run dev
```

### 📖 新用戶必讀
- **[快速啟動指南](./docs/getting-started/quick-start.md)** ⭐ 30 分鐘完整設置
- **[項目概覽](./docs/getting-started/project-overview.md)** - 了解項目架構
- **[環境配置](./docs/setup/environment-setup.md)** - 詳細配置步驟

---

## ✨ 核心功能

- 🔐 **認證系統** - Email/密碼 + Google OAuth
- 👥 **角色管理** - Admin、CS、User 三種角色
- 📊 **Admin 後台** - 遊戲/產品/訂單管理
- 💳 **支付集成** - PayPal（ECPay 計劃中）
- 🔒 **企業級安全** - RLS + AES-256-GCM 加密
- 📈 **完整審計** - Audit Logs 追蹤所有操作

---

## 🏗️ 技術棧

```
前端:  React + TypeScript + Tailwind CSS
後端:  Supabase (Auth + Database + Edge Functions)
安全:  Row Level Security + AES-256-GCM
支付:  PayPal + ECPay (計劃中)
```

---

## 📚 文檔

完整文檔位於 `/docs` 目錄：

### 快速導航
| 文檔類型 | 鏈接 |
|---------|------|
| 🚀 快速開始 | [/docs/getting-started/](./docs/getting-started/) |
| 🔧 環境配置 | [/docs/setup/](./docs/setup/) |
| 🚢 部署指南 | [/docs/deployment/](./docs/deployment/) |
| 🐛 問題修復 | [/docs/fixes/](./docs/fixes/) |
| 🧪 測試指南 | [/docs/testing/](./docs/testing/) |
| 💳 支付集成 | [/docs/integrations/](./docs/integrations/) |
| 👑 Admin 後台 | [/docs/admin/](./docs/admin/) |
| 🔐 安全指南 | [/docs/security/](./docs/security/) |

### 📖 查看完整文檔索引
- [文檔中心](./docs/README.md) - 所有文檔的索引和導航

---

## 🧪 診斷工具

訪問 `/enen` 查看內建的診斷工具：
- **Supabase Connection Test** - 檢查連接和性能
- **CORS Test Panel** - 驗證 CORS 配置
- **Auth Debug Panel** - 調試認證和角色

或使用調試模式：
```
https://your-app.com/?debug=auth
```

---

## 🎯 根據角色快速開始

### 🆕 新開發者
```
1. 📖 閰讀 docs/getting-started/project-overview.md
2. 🚀 跟隨 docs/getting-started/quick-start.md
3. 🔧 配置環境（docs/setup/）
4. 🧪 運行測試
```

### 🚀 運維人員
```
1. ✅ docs/deployment/deployment-checklist.md
2. 🔧 docs/setup/environment-setup.md
3. 🔐 docs/security/rls-implementation.md
4. 📊 設置監控
```

### 👨‍💻 開發人員
```
重點文檔:
- docs/admin/ - Admin 功能
- docs/integrations/ - 支付集成
- docs/fixes/ - 最新修復
```

---

## 📊 最近更新

### 2025-10-22
- ✅ Admin 角色降級問題修復（性能提升 95%）
- ✅ CORS 預檢處理修復（錯誤率降至 0%）
- ✅ Session 超時優化
- ✅ 文檔結構重組
- ✅ 中文全文檢索 Edge Function

詳細信息：[最近修復總結](./docs/fixes/recent-fixes-summary.md)

---

## 🔗 重要鏈接

- [完整文檔](./docs/README.md)
- [快速啟動](./docs/getting-started/quick-start.md)
- [環境配置](./docs/setup/environment-variables.md)
- [部署指南](./docs/deployment/deployment-guide.md)
- [PayPal 集成](./docs/integrations/paypal-integration-guide.md)

---

## 🆘 需要幫助？

### 自助資源
- 📖 查看 [文檔中心](./docs/README.md)
- 🐛 查看 [問題修復](./docs/fixes/)
- 🧪 使用診斷工具（訪問 `/enen`）

### 常見問題
- 登入問題 → 查看 [Auth 測試指南](./docs/testing/auth-testing-guide.md)
- 環境配置 → 查看 [環境變量說明](./docs/setup/environment-variables.md)
- 部署問題 → 查看 [部署檢查清單](./docs/deployment/deployment-checklist.md)

---

## 📝 授權

本項目的歸屬和授權信息請查看 LICENSE 文件。

---

## 🙏 致謝

感謝所有貢獻者和使用的開源項目。詳細信息請查看 [Attributions.md](./Attributions.md)。

---

**最後更新**: 2025-10-22  
**項目版本**: 1.0.0  
**文檔版本**: 3.0