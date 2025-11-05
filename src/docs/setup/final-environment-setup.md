# 🚀 最終環境配置檢查與項目收尾指南

**版本：** 1.0  
**日期：** 2025-10-09  
**狀態：** Production Ready

---

## 📋 目錄

1. [環境變量完整清單](#環境變量完整清單)
2. [三步啟動指南](#三步啟動指南)
3. [監控與維護建議](#監控與維護建議)
4. [安全檢查清單](#安全檢查清單)
5. [故障排查指南](#故障排查指南)

---

## 🔐 環境變量完整清單

### 必須配置的環境變量（Supabase Secrets）

以下環境變量必須在 Supabase Dashboard > Edge Functions > Secrets 中配置：

#### 1. Supabase 核心配置（自動配置）✅

| 變量名 | 用途 | 狀態 | 獲取方式 |
|--------|------|------|----------|
| `SUPABASE_URL` | Supabase 項目 URL | ✅ 已配置 | Supabase Dashboard 自動提供 |
| `SUPABASE_ANON_KEY` | 公開匿名密鑰 | ✅ 已配置 | Supabase Dashboard 自動提供 |
| `SUPABASE_SERVICE_ROLE_KEY` | 服務端角色密鑰 | ✅ 已配置 | Supabase Dashboard 自動提供 |
| `SUPABASE_DB_URL` | 數據庫連接 URL | ✅ 已配置 | Supabase Dashboard 自動提供 |

**使用位置：**
- `/supabase/functions/server/index.tsx` (第 128-129 行)
- `/supabase/functions/server/kv_store.tsx` (第 16-17 行)

---

#### 2. 訂單加密密鑰（必須手動配置）⚠️

| 變量名 | 用途 | 狀態 | 優先級 |
|--------|------|------|--------|
| `ORDER_ENCRYPTION_KEY` | 訂單密碼 AES-256-GCM 加密 | ⚠️ 必須配置 | 🔴 **極高** |

**使用位置：**
- `/supabase/functions/server/index.tsx` (第 1076 行)

**配置說明：**
```bash
# 生成安全的加密密鑰（32 字符）
openssl rand -base64 32

# 或使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**重要性：** 🔴 **極高優先級**
- 用於加密所有訂單中的遊戲登入密碼
- 使用 AES-256-GCM 加密算法
- 如果不配置，將使用不安全的默認值（'default-encryption-key-change-in-production'）
- **生產環境必須更換！**

**安全建議：**
- ✅ 使用至少 32 字符的隨機密鑰
- ✅ 密鑰包含大小寫字母、數字和特殊符號
- ✅ 定期輪換密鑰（每 6-12 個月）
- ❌ 絕不提交到版本控制系統
- ❌ 絕不在前端代碼中暴露

---

#### 3. PayPal 支付網關配置（必須手動配置）⚠️

| 變量名 | 用途 | 狀態 | 優先級 |
|--------|------|------|--------|
| `PAYPAL_CLIENT_ID` | PayPal 應用 Client ID | ⚠️ 必須配置 | 🔴 **極高** |
| `PAYPAL_CLIENT_SECRET` | PayPal 應用 Secret | ⚠️ 必須配置 | 🔴 **極高** |
| `PAYPAL_MODE` | PayPal 模式（sandbox/production） | 🟡 可選 | 🟡 **中** |
| `PAYPAL_WEBHOOK_ID` | PayPal Webhook ID（用於驗證回調） | 🟡 可選 | 🟢 **低** |

**使用位置：**
- `/supabase/functions/server/index.tsx` (第 1670, 1677-1678, 1973 行)

**配置說明：**

1. **獲取 PayPal 憑證：**
   - 訪問 [PayPal Developer Dashboard](https://developer.paypal.com/)
   - 創建應用（Sandbox 或 Production）
   - 獲取 Client ID 和 Secret

2. **配置 Sandbox（測試環境）：**
   ```bash
   PAYPAL_CLIENT_ID=AYourSandboxClientID...
   PAYPAL_CLIENT_SECRET=EYourSandboxSecret...
   PAYPAL_MODE=sandbox
   ```

3. **配置 Production（生產環境）：**
   ```bash
   PAYPAL_CLIENT_ID=AYourProductionClientID...
   PAYPAL_CLIENT_SECRET=EYourProductionSecret...
   PAYPAL_MODE=production
   ```

**重要性：** 🔴 **極高優先級**
- 沒有這些憑證，PayPal 支付功能將無法工作
- 用於創建 PayPal 訂單和捕獲支付
- 錯誤配置會導致所有 PayPal 交易失敗

**安全建議：**
- ✅ Sandbox 和 Production 使用不同的憑證
- ✅ 生產環境憑證僅在上線前配置
- ✅ 定期檢查 PayPal 應用狀態
- ❌ 絕不在前端代碼中暴露 Secret

**Webhook 配置（可選但建議）：**
- 在 PayPal Developer Dashboard 配置 Webhook URL：
  ```
  https://[your-project-id].supabase.co/functions/v1/make-server-04b375d8/payments/paypal/webhook
  ```
- 訂閱事件：`CHECKOUT.ORDER.APPROVED`, `PAYMENT.CAPTURE.COMPLETED`
- 獲取 Webhook ID 並配置到 `PAYPAL_WEBHOOK_ID`

---

### 環境變量總結表

| 優先級 | 變量名 | 配置狀態 | 用途 |
|--------|--------|----------|------|
| 🟢 自動 | `SUPABASE_URL` | ✅ 已配置 | Supabase URL |
| 🟢 自動 | `SUPABASE_ANON_KEY` | ✅ 已配置 | 公開密鑰 |
| 🟢 自動 | `SUPABASE_SERVICE_ROLE_KEY` | ✅ 已配置 | 服務端密鑰 |
| 🟢 自動 | `SUPABASE_DB_URL` | ✅ 已配置 | 數據庫 URL |
| 🔴 **手動** | `ORDER_ENCRYPTION_KEY` | ⚠️ **必須配置** | 訂單加密 |
| 🔴 **手動** | `PAYPAL_CLIENT_ID` | ⚠️ **必須配置** | PayPal Client ID |
| 🔴 **手動** | `PAYPAL_CLIENT_SECRET` | ⚠️ **必須配置** | PayPal Secret |
| 🟡 手動 | `PAYPAL_MODE` | 🟡 建議配置 | PayPal 模式 |
| 🟢 手動 | `PAYPAL_WEBHOOK_ID` | 🟢 可選 | Webhook 驗證 |

**配置進度：** 4/9 已配置 (44%)  
**必須配置：** 3 個 ⚠️  
**建議配置：** 1 個 🟡

---

## 🚀 三步啟動指南

### 第一步：配置環境變量（15 分鐘）

#### 1.1 登入 Supabase Dashboard
```
https://app.supabase.com/project/[your-project-id]
```

#### 1.2 導航到 Edge Functions Secrets
```
Project Settings > Edge Functions > Secrets
```

#### 1.3 添加必須的環境變量

**A. 添加 ORDER_ENCRYPTION_KEY：**
```bash
# 生成密鑰
openssl rand -base64 32

# 在 Supabase Dashboard 添加：
Name: ORDER_ENCRYPTION_KEY
Value: [剛才生成的密鑰]
```

**B. 添加 PayPal 憑證（Sandbox 測試）：**
```bash
# 從 PayPal Developer Dashboard 獲取憑證

Name: PAYPAL_CLIENT_ID
Value: [你的 Sandbox Client ID]

Name: PAYPAL_CLIENT_SECRET
Value: [你的 Sandbox Secret]

Name: PAYPAL_MODE
Value: sandbox
```

**C. 驗證配置：**
```bash
# 所有環境變量應該在列表中顯示
✅ SUPABASE_URL (自動)
✅ SUPABASE_ANON_KEY (自動)
✅ SUPABASE_SERVICE_ROLE_KEY (自動)
✅ SUPABASE_DB_URL (自動)
✅ ORDER_ENCRYPTION_KEY (手動)
✅ PAYPAL_CLIENT_ID (手動)
✅ PAYPAL_CLIENT_SECRET (手動)
✅ PAYPAL_MODE (手動)
```

---

### 第二步：部署後端服務（5 分鐘）

#### 2.1 確認 Edge Function 已部署
```bash
# Supabase 自動部署，無需手動操作
# 檢查 Dashboard > Edge Functions
✅ make-server-04b375d8 (應該顯示為 Active)
```

#### 2.2 測試健康檢查端點
```bash
curl https://[your-project-id].supabase.co/functions/v1/make-server-04b375d8/health

# 預期響應：
{"status":"ok"}
```

#### 2.3 測試環境變量配置
```bash
# 創建測試訂單（會使用加密密鑰）
# 前端測試 PayPal 按鈕（會使用 PayPal 憑證）
```

---

### 第三步：初始化數據與測試（10 分鐘）

#### 3.1 創建第一個 Admin 用戶

**方式 1：使用前端註冊 + 手動升級**
```sql
-- 在 Supabase SQL Editor 執行：
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'your-admin-email@example.com';
```

**方式 2：直接使用 SQL 創建**
```sql
-- 使用 Supabase Dashboard > Authentication > Users > Add User
-- 然後執行上面的 SQL 更新角色
```

#### 3.2 登入 Admin Dashboard
```
訪問：/enen
使用剛才創建的 Admin 帳號登入
```

#### 3.3 配置基礎數據（透過 Admin Dashboard）

**A. 創建區域（Regions）：**
```
- 北美 (NA)
- 歐洲 (EU)  
- 亞洲 (ASIA)
- 台灣 (TW)
```

**B. 創建平台（Platforms）：**
```
- iOS
- Android
- PC
- PlayStation
- Xbox
```

**C. 創建促銷標籤（Display Tags）：**
```
- 熱門 (#FF5722)
- 新品 (#4CAF50)
- 限時 (#FFC107)
```

**D. 創建遊戲（Games）：**
```
示例：
- 名稱：原神
- 區域：ASIA
- 描述：開放世界冒險遊戲
```

**E. 創建產品面額（Denominations）：**
```
示例：
- 名稱：60 創世結晶
- 遊戲：原神
- 平台：iOS
- 價格：$0.99
- 成本：$0.70
- SKU：GENSHIN-60-IOS
```

#### 3.4 端到端測試流程

**1. 測試訂單提交：**
- 訪問前端產品頁面
- 選擇產品並提交訂單
- 驗證訂單創建成功
- 檢查密碼是否已加密存儲

**2. 測試 PayPal 支付：**
- 點擊 PayPal 按鈕
- 使用 PayPal Sandbox 測試帳號登入
- 完成支付流程
- 驗證支付回調成功

**3. 測試訂單履行：**
- 登入 Admin Dashboard
- 查看待履行訂單
- 更新履行狀態為「處理中」
- 完成訂單履行

**4. 測試數據導出：**
- 在各管理列表中測試搜索功能
- 測試列排序功能
- 導出 CSV 並驗證數據完整性

---

## 📊 監控與維護建議

### 生產環境日誌監控

#### 1. Supabase Logs Dashboard

**訪問位置：**
```
Supabase Dashboard > Logs > Edge Functions
```

**重要日誌類型：**

| 日誌類型 | 監控頻率 | 關鍵指標 |
|----------|----------|----------|
| Error Logs | 實時 | 錯誤率 < 1% |
| Payment Logs | 每小時 | 成功率 > 95% |
| Order Logs | 每天 | 完成率 > 90% |
| Auth Logs | 每天 | 失敗嘗試 < 10/天 |

#### 2. 關鍵錯誤監控

**設置告警的錯誤模式：**

```javascript
// 支付相關錯誤
"PayPal auth error"
"Payment processing error"
"Failed to capture PayPal payment"

// 加密相關錯誤
"Password encryption error"
"Password decryption error"
"Failed to encrypt password"

// 訂單相關錯誤
"Order creation error"
"Order fulfillment error"
"Credential storage error"

// 數據庫錯誤
"Supabase query error"
"Database connection error"
```

#### 3. 性能指標監控

**關鍵性能指標（KPI）：**

| 指標 | 目標值 | 監控方式 |
|------|--------|----------|
| API 響應時間 | < 500ms | Supabase Dashboard |
| 訂單提交成功率 | > 99% | Audit Logs |
| PayPal 支付成功率 | > 95% | Payment Logs |
| 訂單履行時間 | < 24h | Admin Dashboard |
| 數據庫查詢時間 | < 100ms | Supabase Logs |

---

### 定期維護任務

#### 每日任務（5 分鐘）

- [ ] 檢查 Error Logs 有無新錯誤
- [ ] 查看待履行訂單數量
- [ ] 驗證 PayPal 支付是否正常
- [ ] 檢查數據庫存儲空間使用率

#### 每週任務（15 分鐘）

- [ ] 分析訂單完成率趨勢
- [ ] 審查異常交易記錄
- [ ] 檢查 Audit Logs 有無可疑活動
- [ ] 驗證備份是否正常運行
- [ ] 測試關鍵用戶流程（註冊、下單、支付）

#### 每月任務（30 分鐘）

- [ ] 導出並分析銷售數據
- [ ] 審查安全日誌
- [ ] 更新不活躍用戶列表
- [ ] 檢查並清理過期數據
- [ ] 驗證所有環境變量仍然有效
- [ ] 測試災難恢復流程

#### 每季度任務（1 小時）

- [ ] 輪換 ORDER_ENCRYPTION_KEY（需要遷移舊數據）
- [ ] 審查並更新安全策略
- [ ] 性能優化和數據庫索引檢查
- [ ] 更新第三方 API 密鑰
- [ ] 進行安全滲透測試

---

### 監控工具推薦

#### 1. Supabase 原生工具 ✅

```
優勢：
- 無需額外配置
- 與項目完全集成
- 實時日誌查看
- SQL 查詢分析

使用方式：
Supabase Dashboard > Logs
```

#### 2. 自定義監控（可選）

**A. 創建監控 Dashboard：**
```sql
-- 創建監控視圖
CREATE VIEW monitoring_dashboard AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_orders,
  COUNT(*) FILTER (WHERE payment_status = 'paid') as paid_orders,
  COUNT(*) FILTER (WHERE fulfillment_status = 'completed') as fulfilled_orders,
  SUM(total_price) FILTER (WHERE payment_status = 'paid') as daily_revenue
FROM orders
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

**B. 定期導出報表：**
```javascript
// 使用 Admin Dashboard 的 CSV 導出功能
// 或設置自動化腳本
```

#### 3. 告警配置（建議）

**設置 Email 告警（Supabase 功能）：**
```
1. Supabase Dashboard > Project Settings > Alerts
2. 配置告警條件：
   - Edge Function 錯誤率 > 5%
   - Database CPU > 80%
   - Storage 使用率 > 90%
```

---

## 🔒 安全檢查清單

### 部署前必須完成的安全檢查

#### ✅ 環境變量安全

- [ ] `ORDER_ENCRYPTION_KEY` 使用強隨機密鑰（32+ 字符）
- [ ] `PAYPAL_CLIENT_SECRET` 未暴露在前端代碼
- [ ] 所有環境變量都在 Supabase Secrets 中配置
- [ ] 沒有環境變量被提交到 Git

#### ✅ 數據庫安全

- [ ] RLS (Row Level Security) 已在所有表上啟用
- [ ] `orders` 表密碼欄位已移除（使用 `order_credentials` 表）
- [ ] Audit logs 記錄所有敏感操作
- [ ] 數據庫備份已配置

#### ✅ API 安全

- [ ] 所有 Admin API 端點都有 `requireAdmin` 中間件
- [ ] 所有 CS API 端點都有 `requireAdminOrCS` 中間件
- [ ] CORS 配置正確（生產環境應限制 origin）
- [ ] Rate limiting 已配置（Supabase 默認啟用）

#### ✅ 認證安全

- [ ] Email 確認已啟用（auto-confirm 僅用於測試）
- [ ] 密碼強度要求已配置（Supabase Auth 設置）
- [ ] Session 過期時間合理（默認 7 天）
- [ ] Admin 初始化端點已禁用（第 1200 行註釋確認）

#### ✅ 支付安全

- [ ] PayPal Webhook 簽名驗證已實施
- [ ] 訂單金額驗證正確
- [ ] 重複支付檢查已實施
- [ ] 所有支付交易都有 Audit Log

#### ✅ 加密安全

- [ ] 遊戲密碼使用 AES-256-GCM 加密
- [ ] IV (Initialization Vector) 隨機生成
- [ ] Auth Tag 用於驗證數據完整性
- [ ] 加密元數據記錄版本信息

---

### 生產環境安全建議

#### 1. CORS 配置更新

**當前配置（開發）：**
```javascript
origin: "*" // 允許所有來源
```

**生產環境配置：**
```javascript
origin: "https://yourdomain.com" // 僅允許你的域名
```

**修改位置：** `/supabase/functions/server/index.tsx` 第 138 行

#### 2. Email 確認啟用

**當前狀態：**
```javascript
email_confirm: true // 自動確認（測試用）
```

**生產環境：**
```
1. Supabase Dashboard > Authentication > Settings
2. 配置 SMTP 郵件服務器
3. 移除代碼中的 email_confirm: true
4. 啟用 Email Confirmation Required
```

#### 3. PayPal 模式切換

**測試環境：**
```bash
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=[Sandbox Client ID]
PAYPAL_CLIENT_SECRET=[Sandbox Secret]
```

**生產環境：**
```bash
PAYPAL_MODE=production
PAYPAL_CLIENT_ID=[Production Client ID]
PAYPAL_CLIENT_SECRET=[Production Secret]
```

#### 4. 數據庫備份策略

**Supabase 自動備份：**
- 免費方案：每日備份，保留 7 天
- 專業方案：每日備份，保留 30 天
- 企業方案：自定義備份策略

**手動備份建議：**
```bash
# 每週手動導出重要數據
# 使用 Admin Dashboard 的 CSV 導出功能
```

---

## 🔧 故障排查指南

### 常見問題與解決方案

#### 問題 1：PayPal 支付按鈕無法顯示

**症狀：**
```
前端顯示：「PayPal 初始化失敗」
```

**可能原因：**
1. `PAYPAL_CLIENT_ID` 未配置
2. `PAYPAL_CLIENT_ID` 配置錯誤
3. PayPal 應用未激活

**解決方案：**
```bash
# 1. 檢查環境變量
Supabase Dashboard > Edge Functions > Secrets
確認 PAYPAL_CLIENT_ID 存在且正確

# 2. 檢查 PayPal Dashboard
https://developer.paypal.com/developer/applications
確認應用狀態為 Active

# 3. 驗證前端配置
確認前端使用正確的 Client ID
```

---

#### 問題 2：訂單密碼加密失敗

**症狀：**
```
Error: Failed to encrypt password
```

**可能原因：**
1. `ORDER_ENCRYPTION_KEY` 未配置
2. 使用了不安全的默認值

**解決方案：**
```bash
# 1. 檢查環境變量
Supabase Dashboard > Edge Functions > Secrets
確認 ORDER_ENCRYPTION_KEY 存在

# 2. 如果不存在，生成並配置
openssl rand -base64 32

# 3. 重新部署 Edge Function（自動）
# 4. 測試訂單提交
```

---

#### 問題 3：Admin Dashboard 無法訪問

**症狀：**
```
403 Forbidden 或 「Insufficient permissions」
```

**可能原因：**
1. 用戶角色不是 admin
2. Token 過期
3. RLS 策略配置錯誤

**解決方案：**
```sql
-- 1. 檢查用戶角色
SELECT email, raw_user_meta_data->>'role' as role
FROM auth.users
WHERE email = 'your-email@example.com';

-- 2. 升級用戶為 admin
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'your-email@example.com';

-- 3. 重新登入
```

---

#### 問題 4：搜索或導出功能不工作

**症狀：**
```
搜索無結果 或 CSV 導出失敗
```

**可能原因：**
1. 數據為空
2. 前端過濾邏輯錯誤
3. 瀏覽器兼容性問題

**解決方案：**
```javascript
// 1. 檢查瀏覽器控制台錯誤
F12 > Console

// 2. 檢查數據是否存在
Admin Dashboard > 相應列表

// 3. 清除瀏覽器緩存
Ctrl + Shift + R (強制重新加載)

// 4. 測試不同瀏覽器
Chrome, Firefox, Safari, Edge
```

---

#### 問題 5：Edge Function 超時

**症狀：**
```
504 Gateway Timeout
或 Request timeout
```

**可能原因：**
1. 數據庫查詢過慢
2. 外部 API 調用超時（PayPal）
3. 資源不足

**解決方案：**
```bash
# 1. 檢查 Supabase Logs
Dashboard > Logs > Edge Functions
查找超時的具體端點

# 2. 優化數據庫查詢
# 添加索引、限制返回數據量

# 3. 增加超時配置
# 代碼中已設置 10 秒超時
signal: AbortSignal.timeout(10000)

# 4. 聯繫 Supabase 支持
# 如果是資源限制問題
```

---

### 調試技巧

#### 1. 查看實時日誌

```bash
# Supabase Dashboard > Logs
# 篩選條件：
- 時間範圍：最近 1 小時
- 級別：Error
- 函數：make-server-04b375d8
```

#### 2. 測試 API 端點

```bash
# 使用 curl 測試
curl -X GET \
  'https://[your-project-id].supabase.co/functions/v1/make-server-04b375d8/health' \
  -H 'Authorization: Bearer [your-anon-key]'
```

#### 3. 檢查數據庫狀態

```sql
-- 查看最近的訂單
SELECT * FROM orders 
ORDER BY created_at DESC 
LIMIT 10;

-- 查看最近的 Audit Logs
SELECT * FROM audit_logs 
ORDER BY created_at DESC 
LIMIT 20;

-- 檢查加密憑證
SELECT order_id, encryption_metadata 
FROM order_credentials 
ORDER BY created_at DESC 
LIMIT 5;
```

---

## 📚 相關文檔索引

### 核心文檔

1. **環境變量詳解**
   - 路徑：`/docs/environment-variables.md`
   - 內容：所有環境變量的詳細說明

2. **PayPal 集成指南**
   - 路徑：`/docs/paypal-integration-guide.md`
   - 內容：PayPal 配置、測試、生產部署

3. **Admin Dashboard 功能**
   - 路徑：`/docs/admin-search-sort-export.md`
   - 內容：搜索、排序、導出功能使用

4. **RLS 安全實施**
   - 路徑：`/docs/phase-3-rls-implementation.md`
   - 內容：Row Level Security 配置

5. **數據結構優化**
   - 路徑：`/docs/archive/phase-5-data-optimization.sql`
   - 內容：Postgres 表結構和索引

### 快速鏈接

| 文檔 | 用途 | 優先級 |
|------|------|--------|
| [PayPal Integration Guide](/docs/paypal-integration-guide.md) | PayPal 配置 | 🔴 高 |
| [Environment Variables](/docs/environment-variables.md) | 環境配置 | 🔴 高 |
| [Admin Testing Checklist](/docs/admin-testing-checklist.md) | 測試清單 | 🟡 中 |
| [Admin UX Improvements](/docs/admin-ux-improvements.md) | UX 優化 | 🟢 低 |

---

## ✅ 部署前檢查清單

### 環境配置 (5/9)

- [x] SUPABASE_URL（自動）
- [x] SUPABASE_ANON_KEY（自動）
- [x] SUPABASE_SERVICE_ROLE_KEY（自動）
- [x] SUPABASE_DB_URL（自動）
- [ ] **ORDER_ENCRYPTION_KEY（必須手動配置）⚠️**
- [ ] **PAYPAL_CLIENT_ID（必須手動配置）⚠️**
- [ ] **PAYPAL_CLIENT_SECRET（必須手動配置）⚠️**
- [ ] PAYPAL_MODE（建議配置）
- [ ] PAYPAL_WEBHOOK_ID（可選）

### 數據初始化

- [ ] 創建第一個 Admin 用戶
- [ ] 創建基礎區域數據（Regions）
- [ ] 創建平台數據（Platforms）
- [ ] 創建促銷標籤（Display Tags）
- [ ] 創建至少一個遊戲（Games）
- [ ] 創建至少一個產品面額（Denominations）

### 功能測試

- [ ] 用戶註冊功能正常
- [ ] 用戶登入功能正常
- [ ] Admin Dashboard 可訪問
- [ ] 產品頁面顯示正常
- [ ] 訂單提交成功（測試加密）
- [ ] PayPal 支付流程完整
- [ ] 訂單履行功能正常
- [ ] 搜索功能正常
- [ ] 排序功能正常
- [ ] CSV 導出正常

### 安全檢查

- [ ] RLS 已在所有表上啟用
- [ ] 密碼已加密存儲（AES-256-GCM）
- [ ] Admin API 有權限驗證
- [ ] Audit Logs 記錄所有操作
- [ ] 環境變量未暴露在前端
- [ ] CORS 配置正確

### 監控配置

- [ ] Supabase Logs 可訪問
- [ ] 錯誤告警已配置
- [ ] 性能指標監控已設置
- [ ] 備份策略已確認

---

## 🎉 部署成功標準

當以下所有條件都滿足時，視為部署成功：

1. ✅ 所有必須的環境變量已配置（3 個）
2. ✅ 創建了至少一個 Admin 用戶
3. ✅ 初始化了基礎數據（區域、平台、遊戲、產品）
4. ✅ 完整測試了端到端流程（註冊 → 下單 → 支付 → 履行）
5. ✅ PayPal Sandbox 支付測試成功
6. ✅ 無嚴重錯誤在 Logs 中出現
7. ✅ Admin Dashboard 所有功能正常
8. ✅ 數據導出功能測試成功

---

## 📞 支持與資源

### Supabase 官方資源

- **官方文檔：** https://supabase.com/docs
- **Edge Functions：** https://supabase.com/docs/guides/functions
- **Auth 指南：** https://supabase.com/docs/guides/auth
- **數據庫指南：** https://supabase.com/docs/guides/database

### PayPal 開發資源

- **Developer Dashboard：** https://developer.paypal.com/
- **API 文檔：** https://developer.paypal.com/docs/api/overview/
- **Sandbox 測試：** https://developer.paypal.com/tools/sandbox/

### 項目文檔

- **主文檔索引：** `/docs/README.md`
- **變更日誌：** `/CHANGELOG-2025-10-09.md`
- **歸檔文檔：** `/docs/archive/`

---

## 📝 版本歷史

| 版本 | 日期 | 變更內容 |
|------|------|----------|
| 1.0 | 2025-10-09 | 初始版本，完整環境配置指南 |

---

**最後更新：** 2025-10-09  
**文檔狀態：** ✅ Production Ready  
**下一步：** 完成環境變量配置並開始測試

---

## 🚨 重要提醒

### 部署前必讀

1. **ORDER_ENCRYPTION_KEY** 是最關鍵的環境變量
   - 如果不配置，所有訂單密碼都使用不安全的默認值
   - **必須在接受第一個真實訂單前配置！**

2. **PayPal 憑證** 是支付功能的核心
   - 沒有這些憑證，PayPal 支付完全無法工作
   - Sandbox 和 Production 使用不同的憑證

3. **生產環境切換清單**
   - [ ] 更新 `PAYPAL_MODE` 為 `production`
   - [ ] 更換 PayPal 憑證為 Production 版本
   - [ ] 禁用 `email_confirm: true`（啟用郵件驗證）
   - [ ] 限制 CORS `origin` 為你的域名
   - [ ] 測試所有關鍵流程

**準備好了嗎？開始配置環境變量！** 🚀
