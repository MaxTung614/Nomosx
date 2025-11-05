# 🚀 完整部署指南

本指南將引導您完成從開發環境到生產環境的完整部署流程。

---

## 📋 前置準備

### 必需的賬號和權限
- ✅ Supabase 專案（Production）
- ✅ Supabase CLI 已安裝
- ✅ PayPal Business 帳號（Production）
- ✅ Git 版本控制權限
- ✅ 部署環境訪問權限

### 安裝 Supabase CLI
```bash
npm install -g supabase

# 驗證安裝
supabase --version
```

---

## 🔧 步驟 1：環境配置

### 1.1 配置 Production 環境變量

在 Supabase Dashboard（Production 專案）中配置：

**導航**: Settings > Edge Functions > Secrets

添加以下變量：

| 變量名 | 獲取方式 | 示例值 |
|--------|---------|--------|
| `ORDER_ENCRYPTION_KEY` | `openssl rand -base64 32` | 自動生成 |
| `PAYPAL_CLIENT_ID` | PayPal Business Dashboard | `AXk...` |
| `PAYPAL_CLIENT_SECRET` | PayPal Business Dashboard | `ED5...` |
| `PAYPAL_MODE` | 手動設置 | `production` |

### 1.2 驗證 Supabase 內建變量

確認以下變量自動可用：
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`

---

## 📦 步驟 2：代碼準備

### 2.1 代碼審查
```bash
# 確保所有更改已提交
git status

# 創建 production 分支（如需要）
git checkout -b production
```

### 2.2 構建測試
```bash
# 安裝依賴
npm install

# 運行測試（如有）
npm test

# 構建代碼
npm run build
```

### 2.3 清理代碼
- [ ] 移除所有 `console.log` 調試語句
- [ ] 移除測試代碼
- [ ] 確認無 TODO 標記的未完成功能

---

## 🌐 步驟 3：Edge Function 部署

### 3.1 登入 Supabase
```bash
supabase login
```

### 3.2 鏈接到 Production 專案
```bash
# 查看專案 ID
# Supabase Dashboard > Settings > General

supabase link --project-ref YOUR_PROJECT_ID
```

### 3.3 部署 Edge Functions
```bash
# 部署主服務器
supabase functions deploy server

# 部署搜索功能
supabase functions deploy search-games

# 驗證部署
supabase functions list
```

### 3.4 測試 Edge Function
```bash
# 測試健康檢查端點
curl https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-04b375d8/health

# 預期響應: { "status": "ok", "timestamp": "..." }
```

---

## 🗄️ 步驟 4：數據庫設置

### 4.1 確認表結構

確認以下表已創建：
- `orders`
- `audit_logs`
- `payment_transactions`
- `kv_store_04b375d8`

### 4.2 啟用 RLS 政策

在 SQL Editor 中執行：
```sql
-- 確認 RLS 已啟用
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('orders', 'audit_logs', 'payment_transactions');
```

所有表的 `rowsecurity` 應為 `true`。

### 4.3 創建 Admin 用戶

```sql
-- 將您的 email 替換為實際的 admin email
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'admin@yourdomain.com';
```

---

## 🎨 步驟 5：前端部署

### 5.1 更新前端配置

確認 `/utils/supabase/info.tsx` 使用正確的 Production 值：
```typescript
export const projectId = 'YOUR_PRODUCTION_PROJECT_ID'
export const publicAnonKey = 'YOUR_PRODUCTION_ANON_KEY'
```

### 5.2 構建前端
```bash
npm run build
```

### 5.3 部署到主機

根據您的主機服務商：

**Vercel**:
```bash
vercel --prod
```

**Netlify**:
```bash
netlify deploy --prod
```

**其他靜態主機**:
- 上傳 `dist/` 或 `build/` 目錄

---

## ✅ 步驟 6：部署後驗證

### 6.1 運行自動測試

訪問 `https://yourdomain.com/enen` 並檢查診斷面板：

1. **Supabase Connection Test**
   - [ ] 所有測試通過 (綠色)
   - [ ] 響應時間 < 1000ms

2. **CORS Test Panel**
   - [ ] 4/4 測試通過
   - [ ] OPTIONS 響應 < 100ms

3. **Auth Debug Panel**
   - [ ] Admin 角色正確
   - [ ] 性能指標正常

### 6.2 手動功能測試

- [ ] 用戶註冊/登入
- [ ] Admin 登入 (`/enen`)
- [ ] 產品瀏覽
- [ ] 訂單提交
- [ ] PayPal 支付（使用真實 PayPal 帳號測試）
- [ ] 訂單履行流程

### 6.3 性能檢查

使用瀏覽器 DevTools：
- [ ] 首次載入 < 3 秒
- [ ] 登入時間 < 1 秒
- [ ] API 響應 < 500ms

---

## 📊 步驟 7：監控設置

### 7.1 Supabase Dashboard 監控

**導航**: Dashboard > Logs

監控：
- Edge Function 日誌
- Database 查詢
- Auth 事件

### 7.2 設置告警（推薦）

配置以下告警：
- Edge Function 錯誤率 > 5%
- API 響應時間 > 2 秒
- 數據庫連接錯誤

### 7.3 性能基準

記錄初始性能指標：
```
登入成功率: ____%
平均登入時間: ____ms
API 平均響應: ____ms
錯誤率: ____%
```

---

## 🔐 步驟 8：安全最終檢查

### 8.1 環境變量安全
- [ ] `SERVICE_ROLE_KEY` 未洩漏到前端
- [ ] `PAYPAL_CLIENT_SECRET` 僅在後端使用
- [ ] `ORDER_ENCRYPTION_KEY` 安全存儲

### 8.2 CORS 配置
- [ ] 僅允許 Production 域名（如需限制）
- [ ] OPTIONS 請求正常處理

### 8.3 RLS 政策
- [ ] 所有敏感表啟用 RLS
- [ ] 測試用戶權限隔離
- [ ] Admin 權限正確

---

## 🐛 故障排查

### 常見問題

#### Edge Function 404 錯誤
```bash
# 重新部署
supabase functions deploy server

# 檢查函數列表
supabase functions list
```

#### CORS 錯誤
- 檢查 `/supabase/functions/_shared/cors.ts`
- 確認 OPTIONS 處理器已部署
- 清除瀏覽器緩存

#### 認證失敗
- 檢查 Supabase Dashboard > Authentication
- 確認用戶角色設置正確
- 查看 Auth Debug Panel

---

## 📝 部署清單

使用完整的 [部署檢查清單](./deployment-checklist.md) 確保所有步驟完成。

---

## 🔄 回滾程序

### 如需回滾：

1. **Edge Function 回滾**
   ```bash
   # 在 Supabase Dashboard 選擇之前版本重新部署
   ```

2. **前端回滾**
   ```bash
   git revert <commit-hash>
   vercel --prod  # 或您的部署命令
   ```

3. **數據庫回滾**
   - 如有破壞性更改，使用數據庫備份恢復

---

## 📞 部署後支持

### 監控前 24 小時
- 密切關注錯誤日誌
- 收集用戶反饋
- 監控性能指標

### 團隊通知
通知以下人員部署完成：
- [ ] 開發團隊
- [ ] 測試團隊
- [ ] 客戶支持
- [ ] 項目經理

---

## ✅ 部署成功！

恭喜！您的遊戲儲值平台已成功部署到生產環境。

### 下一步
1. 監控系統穩定性
2. 收集用戶反饋
3. 計劃下一次更新

---

**部署完成日期**: _______________  
**部署人員**: _______________  
**版本號**: _______________
