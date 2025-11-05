# 📚 項目文檔中心

歡迎來到遊戲儲值平台的文檔中心！這裡包含了所有你需要的指南、教程和參考資料。

---

## 🚀 快速開始

### 新用戶必看
- **[快速啟動指南](./getting-started/quick-start.md)** ⭐ 30 分鐘快速上手
- **[項目文件結構](./PROJECT-FILE-STRUCTURE.md)** 📂 121 個文件完整清單
- **[環境配置指南](./setup/environment-setup.md)** - 完整的環境配置步驟
- **[部署檢查清單](./deployment/deployment-checklist.md)** - 部署前的檢查清單

---

## 📁 文檔分類

### 🎯 入門指南 (`/docs/getting-started/`)
- `quick-start.md` - 30 分鐘快速啟動指南
- `project-overview.md` - 項目概覽與架構

### 🔧 環境配置 (`/docs/setup/`)
- `environment-setup.md` - 完整的環境配置與收尾指南
- `environment-variables.md` - 環境變量詳細說明

### 🚀 部署指南 (`/docs/deployment/`)
- `deployment-checklist.md` - 部署檢查清單
- `deployment-guide.md` - 完整部署流程

### 🐛 問題修復 (`/docs/fixes/`)
- `admin-role-fix.md` - Admin 角色降級修復
- `cors-fix.md` - CORS 預檢處理修復
- `session-timeout-fix.md` - Session 超時修復
- `auth-improvements.md` - 認證系統改進總結

### 🧪 測試指南 (`/docs/testing/`)
- `auth-testing-guide.md` - 認證功能測試指南
- `admin-testing-checklist.md` - Admin Dashboard 測試清單

### 💳 支付集成 (`/docs/integrations/`)
- `paypal-integration-guide.md` - PayPal 集成完整指南
- `payment-gateway-reference.md` - 支付閘道參考
- `ecpay-placeholder.md` - ECPay 未來功能

### 👑 管理後台 (`/docs/admin/`)
- `admin-ux-improvements.md` - UX/UI 優化報告
- `admin-search-sort-export.md` - 搜索、排序、導出功能

### 🔐 安全與權限 (`/docs/security/`)
- `rls-implementation.md` - Row Level Security 實施
- `security-best-practices.md` - 安全最佳實踐

### 📝 變更日誌 (`/docs/changelogs/`)
- `2025-10-09-fixes.md` - 2025-10-09 修復總結
- `auth-fix-changelog.md` - 認證修復詳細日誌
- `search-sort-export-changelog.md` - 搜索排序導出功能

### 🗂️ 歸檔文檔 (`/docs/archive/`)
- 已完成的遷移腳本和過時文檔

---

## 🎯 根據你的角色選擇路徑

### 🆕 新開發者
```
1. 📖 閱讀 getting-started/project-overview.md
2. 🚀 跟隨 getting-started/quick-start.md 操作
3. 🔧 配置 setup/environment-setup.md
4. 🧪 測試 testing/auth-testing-guide.md
```

### 🧪 QA/測試人員
```
1. 📋 查看 testing/admin-testing-checklist.md
2. 🔍 執行 testing/auth-testing-guide.md
3. 📊 記錄測試結果
```

### 🚀 運維/部署人員
```
1. ✅ 完成 deployment/deployment-checklist.md
2. 🔧 配置 setup/environment-setup.md
3. 🔐 審查 security/rls-implementation.md
4. 📊 設置監控
```

### 👨‍💻 前端開發者
```
重點文檔:
- admin/admin-ux-improvements.md
- admin/admin-search-sort-export.md
- fixes/auth-improvements.md
```

### 🔧 後端開發者
```
重點文檔:
- security/rls-implementation.md
- integrations/payment-gateway-reference.md
- fixes/session-timeout-fix.md
```

---

## 📊 最近更新

### 2025-10-22
- ✅ Admin 角色降級問題修復（性能提升 95%）
- ✅ CORS 預檢處理修復（錯誤率降至 0%）
- ✅ Session 超時優化
- ✅ 文檔結構重組

---

## 🔍 快速查找

### 我想...

| 需求 | 查看文檔 |
|------|---------|
| 快速啟動系統 | `getting-started/quick-start.md` |
| 配置環境變量 | `setup/environment-variables.md` |
| 部署到生產環境 | `deployment/deployment-guide.md` |
| 集成 PayPal | `integrations/paypal-integration-guide.md` |
| 測試 Admin 功能 | `testing/admin-testing-checklist.md` |
| 了解最新修復 | `fixes/` 目錄 |
| 查看變更記錄 | `changelogs/` 目錄 |
| 安全配置 | `security/rls-implementation.md` |

---

## 🆘 需要幫助？

### 診斷工具
- 訪問 `/enen` 查看完整的診斷面板
- 使用 `?debug=auth` 啟用調試模式

### 常見問題
- 查看各個文檔中的「故障排查」章節
- 參考 `getting-started/quick-start.md` 中的測試流程

---

## 📝 文檔維護指南

### 添加新文檔
1. 確定文檔分類
2. 放置到對應目錄
3. 更新本 README 的索引
4. 更新相關鏈接

### 歸檔舊文檔
1. 移動到 `archive/` 目錄
2. 更新 `archive/ARCHIVED-FILES-INDEX.md`
3. 從本 README 移除索引

---

**最後更新**: 2025-10-22  
**版本**: 2.0（新增最終環境配置文檔）  
**維護**: 開發團隊