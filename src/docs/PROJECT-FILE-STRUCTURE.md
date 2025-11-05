# 📂 NomosX 項目文件結構總結

> **最後更新**: 2025-10-22  
> **項目狀態**: 生產就緒  
> **總文件數**: 120+

---

## 📋 目錄

- [項目概覽](#項目概覽)
- [根目錄文件](#根目錄文件)
- [前端組件 `/components`](#前端組件-components)
- [UI 組件庫 `/components/ui`](#ui-組件庫-componentsui)
- [文檔系統 `/docs`](#文檔系統-docs)
- [樣式文件 `/styles`](#樣式文件-styles)
- [後端服務 `/supabase/functions`](#後端服務-supabasefunctions)
- [工具函數 `/utils`](#工具函數-utils)
- [開發指南 `/guidelines`](#開發指南-guidelines)

---

## 🎯 項目概覽

**NomosX** 是一個全功能的遊戲點數交易平台，具備：
- ✅ 用戶認證系統（Email/密碼、Google OAuth）
- ✅ 角色型權限控制（Admin、CS、User）
- ✅ Admin CMS 內容管理系統
- ✅ PayPal 支付集成
- ✅ 訂單管理與履行流程
- ✅ AES-256-GCM 密碼加密
- ✅ 完整的審計追蹤系統
- ✅ 響應式設計（桌面 + 行動端）

---

## 📄 根目錄文件

### 主要入口

| 文件 | 類型 | 功能說明 |
|------|------|----------|
| `App.tsx` | React | 應用程式主入口，根組件 |
| `README.md` | 文檔 | 項目說明文件 |
| `START-HERE.md` | 文檔 | 快速開始指南 |
| `CHANGELOG.md` | 文檔 | 版本變更記錄 |
| `Attributions.md` | 文檔 | 第三方套件與授權聲明 |

### 文件狀態

- ✅ **生產就緒**：所有根目錄文件
- 📝 **維護頻率**：CHANGELOG.md 隨版本更新

---

## 🧩 前端組件 `/components`

### 核心業務組件（11 個）

#### 認證與授權

| 組件 | 文件名 | 功能 | 依賴 |
|------|--------|------|------|
| 🔐 認證彈窗 | `auth-modal.tsx` | Email/密碼、Google 登入、CAPTCHA | Supabase Auth |
| 🔐 Admin 登入頁 | `admin-login-page.tsx` | `/enen` 專用登入頁面 | - |
| 🔐 認證提供者 | `auth-provider.tsx` | React Context 全局認證狀態 | Supabase Client |
| 👤 用戶角色顯示 | `user-role-display.tsx` | 顯示當前用戶角色標籤 | Auth Context |

#### 主應用與路由

| 組件 | 文件名 | 功能 | 路由 |
|------|--------|------|------|
| 🏠 主應用 | `main-app.tsx` | 主頁面容器 | `/` |
| 🗺️ 路由器 | `router.tsx` | React Router 路由配置 | 所有路由 |

#### 業務功能

| 組件 | 文件名 | 功能 | API 端點 |
|------|--------|------|----------|
| 🎮 產品頁面 | `product-page.tsx` | 遊戲產品展示與選擇 | `GET /products` |
| 🔍 搜索欄 | `SearchBar.tsx` | 實時遊戲搜索（PGroonga + Debounce） | `GET /search-games` |
| 💳 支付頁面 | `payment-page.tsx` | PayPal 支付流程 | `POST /payments/paypal/*` |
| 💳 ECPay 支付頁 | `payment-page-with-ecpay.tsx` | ECPay 支付（未來實現） | Placeholder |
| 📊 Admin 後台 | `admin-dashboard.tsx` | 訂單管理、CMS、統計 | `GET /admin/*` |
| ✅ 支付結果頁 | `payment-result-page.tsx` | 支付成功/失敗展示 | - |

#### PayPal 支付處理

| 組件 | 文件名 | 功能 |
|------|--------|------|
| ✅ 支付成功處理 | `paypal-return-handler.tsx` | PayPal 返回處理 |
| ❌ 支付取消處理 | `paypal-cancel-handler.tsx` | PayPal 取消處理 |

#### 開發與測試工具

| 組件 | 文件名 | 功能 | 用途 |
|------|--------|------|------|
| 🔍 認證調試面板 | `auth-debug-panel.tsx` | 顯示認證狀態 | 開發階段 |
| 🔍 CORS 測試面板 | `cors-test-panel.tsx` | 測試 CORS 配置 | 開發階段 |
| 🔍 RLS 測試面板 | `rls-test-panel.tsx` | 測試資料庫權限 | 開發階段 |
| 🔍 Supabase 連線測試 | `supabase-connection-test.tsx` | 測試 Supabase 連線 | 開發階段 |
| ⚕️ Edge Function 健康檢查 | `edge-function-health-check.tsx` | 測試後端服務 | 開發/生產 |
| 📡 離線模式橫幅 | `offline-mode-banner.tsx` | 顯示離線狀態 | 生產 |

### 特殊組件

| 目錄 | 組件 | 功能 |
|------|------|------|
| `figma/` | `ImageWithFallback.tsx` | 圖片加載失敗時的備用顯示 |

---

## 🎨 UI 組件庫 `/components/ui`

### ShadCN/UI 組件（58 個）

> **完整的企業級 UI 組件庫，基於 Radix UI + Tailwind CSS**

#### 佈局組件（9 個）

| 組件 | 文件 | 用途 |
|------|------|------|
| Card | `card.tsx` | 卡片容器 |
| Separator | `separator.tsx` | 分隔線 |
| Aspect Ratio | `aspect-ratio.tsx` | 比例容器 |
| Scroll Area | `scroll-area.tsx` | 滾動區域 |
| Resizable | `resizable.tsx` | 可調整大小面板 |
| Sheet | `sheet.tsx` | 側邊抽屜 |
| Sidebar | `sidebar.tsx` | 側邊欄 |
| Drawer | `drawer.tsx` | 底部抽屜 |
| Collapsible | `collapsible.tsx` | 可折疊區域 |

#### 導航組件（6 個）

| 組件 | 文件 | 用途 |
|------|------|------|
| Navigation Menu | `navigation-menu.tsx` | 導航菜單 |
| Breadcrumb | `breadcrumb.tsx` | 麵包屑導航 |
| Pagination | `pagination.tsx` | 分頁器 |
| Menubar | `menubar.tsx` | 菜單欄 |
| Tabs | `tabs.tsx` | 標籤頁 |
| Accordion | `accordion.tsx` | 手風琴折疊 |

#### 表單組件（14 個）

| 組件 | 文件 | 用途 |
|------|------|------|
| Form | `form.tsx` | 表單容器（React Hook Form + Zod） |
| Input | `input.tsx` | 輸入框 |
| Textarea | `textarea.tsx` | 多行文本框 |
| Select | `select.tsx` | 下拉選擇器 |
| Checkbox | `checkbox.tsx` | 複選框 |
| Radio Group | `radio-group.tsx` | 單選按鈕組 |
| Switch | `switch.tsx` | 開關 |
| Slider | `slider.tsx` | 滑塊 |
| Calendar | `calendar.tsx` | 日曆選擇器 |
| Input OTP | `input-otp.tsx` | OTP 驗證碼輸入 |
| Label | `label.tsx` | 表單標籤 |
| Toggle | `toggle.tsx` | 切換按鈕 |
| Toggle Group | `toggle-group.tsx` | 切換按鈕組 |
| Command | `command.tsx` | 命令面板 |

#### 反饋組件（10 個）

| 組件 | 文件 | 用途 |
|------|------|------|
| Button | `button.tsx` | 按鈕 |
| Alert | `alert.tsx` | 警告提示 |
| Alert Dialog | `alert-dialog.tsx` | 警告對話框 |
| Dialog | `dialog.tsx` | 對話框 |
| Sonner | `sonner.tsx` | Toast 通知 |
| Tooltip | `tooltip.tsx` | 工具提示 |
| Popover | `popover.tsx` | 彈出層 |
| Hover Card | `hover-card.tsx` | 懸停卡片 |
| Progress | `progress.tsx` | 進度條 |
| Skeleton | `skeleton.tsx` | 骨架屏 |

#### 數據展示（5 個）

| 組件 | 文件 | 用途 |
|------|------|------|
| Table | `table.tsx` | 表格 |
| Chart | `chart.tsx` | 圖表（Recharts） |
| Avatar | `avatar.tsx` | 頭像 |
| Badge | `badge.tsx` | 徽章標籤 |
| Carousel | `carousel.tsx` | 輪播圖 |

#### 菜單組件（2 個）

| 組件 | 文件 | 用途 |
|------|------|------|
| Dropdown Menu | `dropdown-menu.tsx` | 下拉菜單 |
| Context Menu | `context-menu.tsx` | 右鍵菜單 |

#### 工具函數（2 個）

| 文件 | 功能 |
|------|------|
| `use-mobile.ts` | 檢測行動裝置 Hook |
| `utils.ts` | Tailwind 類名合併工具 |

---

## 📚 文檔系統 `/docs`

### 文檔結構（9 個分類目錄 + 31 個文件）

#### 🏠 核心索引（3 個）

| 文件 | 功能 | 優先級 |
|------|------|--------|
| `README.md` | 文檔中心主頁，全站導航 | ⭐⭐⭐ |
| `DOCUMENTATION-INDEX.md` | 完整文檔索引（按主題分類） | ⭐⭐⭐ |
| `PROJECT-FILE-STRUCTURE.md` | 本文件（項目結構總結） | ⭐⭐ |
| `MIGRATION-COMPLETE.md` | 文檔遷移完成報告（歷史記錄） | ⭐ |

#### 🚀 入門指南 `/getting-started`（2 個）

| 文件 | 內容 | 目標讀者 |
|------|------|----------|
| `quick-start.md` | 5 分鐘快速啟動指南 | 新開發者 |
| `project-overview.md` | 項目架構、技術棧、功能模塊 | 所有人 |

#### 🔧 環境配置 `/setup`（4 個）

| 文件 | 內容 | 用途 |
|------|------|------|
| `environment-setup.md` | 完整環境配置步驟 | 初始化 |
| `environment-variables.md` | 環境變量清單與說明 | 配置參考 |
| `final-environment-checklist.md` | 部署前檢查清單 | 部署準備 |
| `final-environment-setup.md` | 最終環境配置驗證 | 部署驗證 |

#### 🚢 部署指南 `/deployment`（2 個）

| 文件 | 內容 | 用途 |
|------|------|------|
| `deployment-guide.md` | Supabase Edge Function 部署步驟 | 部署流程 |
| `deployment-checklist.md` | 部署前後檢查項目 | 質量保證 |

#### 🔐 安全文檔 `/security`（2 個）

| 文件 | 內容 | 重要性 |
|------|------|--------|
| `README.md` | 安全最佳實踐總覽 | 必讀 |
| `rls-implementation.md` | Row Level Security 實現細節 | 技術參考 |

#### 💳 第三方整合 `/integrations`（4 個）

| 文件 | 內容 | 狀態 |
|------|------|------|
| `README.md` | 整合清單總覽 | 索引 |
| `paypal-integration-guide.md` | PayPal 完整整合指南 | ✅ 已完成 |
| `ecpay-placeholder.md` | ECPay 整合佔位說明 | ⏳ 未來計劃 |
| `payment-gateway-reference.md` | 支付網關技術參考 | 參考資料 |

#### 🔧 問題修復 `/fixes`（6 個）

| 文件 | 內容 | 日期 |
|------|------|------|
| `recent-fixes-summary.md` | 最近修復總結 | 2025-10-22 |
| `cors-fix-deployment.md` | CORS 問題修復記錄 | 2025-10-22 |
| `edge-function-fix-report.md` | Edge Function 修復報告 | 2025-10-22 |
| `session-timeout-diagnosis.md` | Session 逾時問題診斷 | 2025-10-22 |
| `session-timeout-fix.md` | Session 逾時修復方案 | 2025-10-22 |
| `session-timeout-quick-fix.md` | Session 快速修復指南 | 2025-10-22 |

#### 📝 變更日誌 `/changelogs`（1 個）

| 文件 | 內容 | 格式 |
|------|------|------|
| `2025-10-22-fixes.md` | 2025-10-22 修復清單 | 時間線格式 |

#### ✅ 測試文檔 `/testing`（2 個）

| 文件 | 內容 | 用途 |
|------|------|------|
| `admin-testing-checklist.md` | Admin 功能測試檢查清單 | 測試指南 |
| `auth-fix-testing-guide.md` | 認證修復測試步驟 | 測試指南 |

#### 🔄 Admin 功能文檔 `/admin`（3 個）

| 文件 | 內容 | 功能範圍 |
|------|------|----------|
| `admin-ux-improvements.md` | Admin UX/UI 優化記錄 | Phase 6 |
| `admin-search-sort-export.md` | 搜索/排序/導出功能文檔 | Phase 7 |
| `admin-role-fix-guide.md` | Admin 角色權限修復指南 | 安全修復 |

#### 🗄️ 歸檔區 `/archive`（3 個）

| 文件 | 內容 | 狀態 |
|------|------|------|
| `README.md` | 歸檔文件說明 | 索引 |
| `ARCHIVED-FILES-INDEX.md` | 已歸檔文件清單 | 索引 |
| `phase-5-data-optimization.sql` | Phase 5 數據遷移 SQL | 歷史參考 |

---

## 🎨 樣式文件 `/styles`

| 文件 | 內容 | 技術 |
|------|------|------|
| `globals.css` | 全局樣式、Tailwind 配置、設計系統 | Tailwind v4.0 |

**設計系統包含：**
- ✅ CSS 變量（顏色、字體、間距）
- ✅ 排版階層（H1-H6）
- ✅ 暗色模式支持
- ✅ 響應式斷點

---

## ⚙️ 後端服務 `/supabase/functions`

### Edge Functions（3 個函數）

#### 主服務器 `/server`

| 文件 | 行數 | 功能 | 端點數 |
|------|------|------|--------|
| `index.tsx` | 2,200+ | 核心 API 服務器（**單文件完整版**） | 40 個 |
| `kv_store.tsx` | ~150 | KV Store 資料庫抽象層 | - |

**`index.tsx` 包含的模塊：**

1. **認證路由（4 個）**
   - `POST /auth/signup` - 用戶註冊
   - `GET /auth/profile` - 獲取用戶資料
   - `PUT /auth/update-role` - 更新用戶角色
   - `GET /auth/users` - 獲取用戶列表

2. **CMS 基礎設定（12 個）**
   - Regions CRUD（4 個端點）
   - Platforms CRUD（4 個端點）
   - Display Tags CRUD（4 個端點）

3. **CMS 遊戲與面額（8 個）**
   - Games CRUD（4 個端點）
   - Denominations CRUD（4 個端點）

4. **公開 API（1 個）**
   - `GET /products` - 獲取產品列表

5. **訂單管理（5 個）**
   - `POST /orders` - 創建訂單
   - `GET /orders/:orderId` - 查詢訂單
   - `POST /orders/:orderId/fulfill` - 訂單履行
   - `GET /admin/orders` - Admin 訂單列表
   - `GET /admin/orders/:orderId` - Admin 訂單詳情

6. **支付處理（3 個）**
   - `POST /payments/process` - 處理支付
   - `GET /admin/payments` - 支付歷史
   - `GET /admin/order-stats` - 訂單統計

7. **PayPal 整合（3 個）**
   - `POST /payments/paypal/create` - 創建 PayPal 訂單
   - `POST /payments/paypal/capture` - 捕獲 PayPal 支付
   - `POST /webhooks/paypal` - PayPal Webhook

8. **ECPay 整合（3 個 - Placeholder）**
   - `POST /payments/ecpay/create`
   - `POST /webhooks/ecpay`
   - `GET /payments/ecpay/return`

9. **基礎端點（1 個）**
   - `GET /health` - 健康檢查

**核心工具函數：**
- `encryptPassword()` - AES-256-GCM 加密
- `decryptPassword()` - 密碼解密
- `getPayPalAccessToken()` - PayPal OAuth
- `requireAuth` - 認證中間件
- `requireAdmin` - Admin 中間件
- `requireAdminOrCS` - Admin/CS 中間件

#### 共享模組 `/_shared`

| 文件 | 功能 | 依賴 |
|------|------|------|
| `cors.ts` | CORS 配置與預檢處理 | 所有 Edge Functions |

#### 搜索服務 `/search-games`

| 文件 | 功能 | 狀態 |
|------|------|------|
| `index.ts` | 遊戲搜索 API（未使用） | ⚠️ 待整合 |

---

## 🛠️ 工具函數 `/utils`

### Supabase 工具 `/utils/supabase`

| 文件 | 導出內容 | 用途 |
|------|----------|------|
| `client.tsx` | `createClient()` | 創建 Supabase 客戶端實例 |
| `info.tsx` | `projectId`, `publicAnonKey` | 項目配置信息 |

**使用方式：**
```typescript
import { createClient } from './utils/supabase/client';
import { projectId, publicAnonKey } from './utils/supabase/info';

const supabase = createClient(projectId, publicAnonKey);
```

---

## 📖 開發指南 `/guidelines`

| 文件 | 內容 | 目標讀者 |
|------|------|----------|
| `Guidelines.md` | 開發規範、代碼風格、最佳實踐 | 開發團隊 |

---

## 📊 統計總結

### 文件數量統計

| 類別 | 數量 | 百分比 |
|------|------|--------|
| 前端組件 | 19 | 15% |
| UI 組件（ShadCN） | 58 | 46% |
| 文檔文件 | 31 | 25% |
| 後端函數 | 5 | 4% |
| 配置/工具 | 7 | 6% |
| 樣式文件 | 1 | 1% |
| **總計** | **121** | **100%** |

### 代碼行數估算

| 類別 | 行數 | 百分比 |
|------|------|--------|
| 後端 TypeScript (`/supabase/functions/server/index.tsx`) | ~2,200 | 35% |
| 前端組件 (`/components/*.tsx`) | ~2,500 | 40% |
| UI 組件 (`/components/ui/*.tsx`) | ~1,200 | 19% |
| 文檔 Markdown (`/docs/**/*.md`) | ~3,000 | 48% |
| 工具函數 (`/utils`) | ~150 | 2% |
| 樣式 CSS (`/styles`) | ~300 | 5% |
| **總計** | **~6,350** | **100%** |

### 技術棧分佈

| 技術 | 用途 | 文件數 |
|------|------|--------|
| React + TypeScript | 前端框架 | 77 |
| Supabase | 後端服務 | 5 |
| Tailwind CSS | 樣式系統 | 1 |
| ShadCN/UI | UI 組件庫 | 58 |
| Markdown | 文檔系統 | 31 |
| Hono | API 框架 | 1 |

---

## 🔍 關鍵文件速查

### 🚀 新手必讀（前 5 名）

1. **`/docs/README.md`** - 文檔中心主頁
2. **`/docs/getting-started/quick-start.md`** - 5 分鐘快速啟動
3. **`/docs/getting-started/project-overview.md`** - 項目架構總覽
4. **`/docs/setup/environment-setup.md`** - 環境配置指南
5. **`/START-HERE.md`** - 項目入門指南

### 🛠️ 開發者必讀（前 5 名）

1. **`/supabase/functions/server/index.tsx`** - 核心 API 服務器
2. **`/components/admin-dashboard.tsx`** - Admin 後台主組件
3. **`/components/auth-provider.tsx`** - 認證狀態管理
4. **`/components/router.tsx`** - 路由配置
5. **`/guidelines/Guidelines.md`** - 開發規範

### 🚢 部署運維必讀（前 5 名）

1. **`/docs/deployment/deployment-guide.md`** - 部署指南
2. **`/docs/deployment/deployment-checklist.md`** - 部署檢查清單
3. **`/docs/setup/final-environment-checklist.md`** - 環境變量檢查
4. **`/docs/security/rls-implementation.md`** - 安全配置
5. **`/docs/integrations/paypal-integration-guide.md`** - PayPal 配置

### 🔧 問題排查（前 5 名）

1. **`/docs/fixes/recent-fixes-summary.md`** - 最近問題修復
2. **`/docs/fixes/cors-fix-deployment.md`** - CORS 問題
3. **`/docs/fixes/session-timeout-fix.md`** - Session 問題
4. **`/docs/testing/admin-testing-checklist.md`** - Admin 測試
5. **`/docs/testing/auth-fix-testing-guide.md`** - 認證測試

---

## 🎯 文件維護指南

### 文件更新頻率

| 類別 | 更新頻率 | 負責人 |
|------|----------|--------|
| `/components` | 每個功能迭代 | 前端開發者 |
| `/supabase/functions` | 每個 API 變更 | 後端開發者 |
| `/docs/fixes` | 每次問題修復 | 技術團隊 |
| `/docs/changelogs` | 每個版本發布 | 項目管理者 |
| `README.md` | 重大變更時 | 技術主管 |

### 文檔質量檢查

✅ **完成度檢查**
- [x] 所有組件都有功能說明
- [x] 所有 API 端點都有文檔
- [x] 所有環境變量都有說明
- [x] 部署流程有完整指南

✅ **可維護性檢查**
- [x] 文件結構清晰（9 個分類）
- [x] 索引文件齊全（README + INDEX）
- [x] 歷史記錄有歸檔（/archive）
- [x] 日期標記統一（2025-10-22）

---

## 📌 下一步行動

### 建議的文檔改進

1. **新增文檔**
   - [ ] API 端點完整參考手冊
   - [ ] 資料庫 Schema 文檔
   - [ ] 前端狀態管理流程圖
   - [ ] 性能優化指南

2. **優化現有文檔**
   - [ ] 添加更多代碼範例
   - [ ] 增加架構圖與流程圖
   - [ ] 補充常見問題 FAQ
   - [ ] 翻譯成英文版本

3. **清理工作**
   - [x] 移除冗餘文件 ✅
   - [x] 統一日期格式 ✅
   - [x] 整理歸檔區 ✅
   - [ ] 刪除未使用的組件

---

## 🔗 相關文檔鏈接

- 📖 [文檔中心主頁](./README.md)
- 📋 [完整文檔索引](./DOCUMENTATION-INDEX.md)
- 🚀 [快速開始指南](./getting-started/quick-start.md)
- 🏗️ [項目架構總覽](./getting-started/project-overview.md)
- 🔧 [環境配置指南](./setup/environment-setup.md)

---

## 📞 聯繫與支持

如有問題或建議，請：
1. 查閱 [文檔中心](./README.md)
2. 參考 [問題修復文檔](./fixes/recent-fixes-summary.md)
3. 聯繫項目維護者

---

**文檔版本**: v1.0  
**創建日期**: 2025-10-22  
**最後更新**: 2025-10-22  
**維護者**: NomosX 開發團隊