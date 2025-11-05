# 環境變數配置指南

## 概述

本文檔列出系統所需的所有環境變數及其配置方法。

---

## 🔧 配置方法

### Supabase Dashboard 配置

1. 登入 Supabase Dashboard
2. 選擇你的專案
3. 進入 **Settings** → **Edge Functions**
4. 點擊 **Add new secret**
5. 輸入環境變數名稱和值
6. 點擊 **Save**

### 使用 Supabase CLI 配置

```bash
# 設置單個環境變數
supabase secrets set VARIABLE_NAME=value

# 從 .env 文件批量設置
supabase secrets set --env-file .env

# 查看已配置的環境變數
supabase secrets list
```

---

## 📋 必需的環境變數

### 1. Supabase 配置（已自動配置）

這些環境變數由 Supabase 自動提供，無需手動配置：

| 變數名 | 說明 | 自動配置 |
|--------|------|---------|
| `SUPABASE_URL` | Supabase 專案 URL | ✅ |
| `SUPABASE_ANON_KEY` | Supabase 匿名 Key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服務角色 Key | ✅ |
| `SUPABASE_DB_URL` | PostgreSQL 數據庫連接 URL | ✅ |

---

### 2. 訂單加密（必需）

用於加密存儲遊戲帳號密碼。

| 變數名 | 說明 | 示例 | 必需 |
|--------|------|------|------|
| `ORDER_ENCRYPTION_KEY` | AES-256 加密密鑰 | `your-32-character-encryption-key-here-change-in-prod` | ✅ |

**生成方法**:
```bash
# 使用 OpenSSL 生成隨機密鑰
openssl rand -base64 32

# 或使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**配置**:
```bash
supabase secrets set ORDER_ENCRYPTION_KEY="your-generated-key-here"
```

---

### 3. PayPal 配置（Phase 4.1 - 必需）

用於 PayPal 支付集成。

| 變數名 | 說明 | 獲取方式 | 必需 |
|--------|------|---------|------|
| `PAYPAL_CLIENT_ID` | PayPal 應用程式 Client ID | PayPal Developer Dashboard | ✅ |
| `PAYPAL_CLIENT_SECRET` | PayPal 應用程式 Secret | PayPal Developer Dashboard | ✅ |
| `PAYPAL_WEBHOOK_ID` | PayPal Webhook ID | 創建 Webhook 後獲得 | ✅ |
| `PAYPAL_MODE` | 運行模式（sandbox 或 production） | 默認為 sandbox | ❌ |

#### 獲取 PayPal 憑證步驟

1. **註冊 PayPal 開發者帳號**
   - 訪問：https://developer.paypal.com/
   - 使用 PayPal 帳號登入

2. **創建應用程式**
   - 進入 Dashboard → Apps & Credentials
   - 點擊 "Create App"
   - 輸入應用程式名稱
   - 選擇 Sandbox 或 Live

3. **獲取憑證**
   - 應用程式創建後，複製 **Client ID** 和 **Secret**
   
4. **配置 Webhook**
   - 在應用程式設定中找到 "Webhooks"
   - 點擊 "Add Webhook"
   - Webhook URL: `https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-04b375d8/webhooks/paypal`
   - 選擇事件：
     - ✅ `CHECKOUT.ORDER.APPROVED`
     - ✅ `PAYMENT.CAPTURE.COMPLETED`
   - 保存後複製 **Webhook ID**

**配置命令**:
```bash
supabase secrets set PAYPAL_CLIENT_ID="YOUR_CLIENT_ID"
supabase secrets set PAYPAL_CLIENT_SECRET="YOUR_CLIENT_SECRET"
supabase secrets set PAYPAL_WEBHOOK_ID="YOUR_WEBHOOK_ID"
supabase secrets set PAYPAL_MODE="sandbox"  # 或 "production"
```

---

### 4. ECPay 配置（Phase 4.2 - 未來實現）

用於綠界 ECPay 支付集成。

| 變數名 | 說明 | 獲取方式 | 必需 |
|--------|------|---------|------|
| `ECPAY_MERCHANT_ID` | ECPay 商店代號 | ECPay 商家後台 | 🔜 |
| `ECPAY_HASH_KEY` | ECPay HashKey | ECPay 商家後台 | 🔜 |
| `ECPAY_HASH_IV` | ECPay HashIV | ECPay 商家後台 | 🔜 |
| `ECPAY_MODE` | 運行模式（test 或 production） | 默認為 test | 🔜 |

**注意**: ECPay 集成尚未實現，這些環境變數將在 Phase 4.2 中使用。

---

## 📝 環境變數檢查清單

### 開發環境（Sandbox/Test）

```bash
# ✅ 已自動配置
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
SUPABASE_DB_URL=postgresql://xxx

# ✅ 必須手動配置
ORDER_ENCRYPTION_KEY=your-dev-encryption-key

# ✅ PayPal Sandbox
PAYPAL_CLIENT_ID=your-sandbox-client-id
PAYPAL_CLIENT_SECRET=your-sandbox-secret
PAYPAL_WEBHOOK_ID=your-sandbox-webhook-id
PAYPAL_MODE=sandbox

# 🔜 ECPay Test (未來)
# ECPAY_MERCHANT_ID=your-test-merchant-id
# ECPAY_HASH_KEY=your-test-hash-key
# ECPAY_HASH_IV=your-test-hash-iv
# ECPAY_MODE=test
```

### 生產環境（Production）

```bash
# ✅ 已自動配置
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
SUPABASE_DB_URL=postgresql://xxx

# ⚠️ 必須使用強密鑰
ORDER_ENCRYPTION_KEY=your-production-strong-encryption-key

# ⚠️ PayPal Production
PAYPAL_CLIENT_ID=your-live-client-id
PAYPAL_CLIENT_SECRET=your-live-secret
PAYPAL_WEBHOOK_ID=your-live-webhook-id
PAYPAL_MODE=production

# 🔜 ECPay Production (未來)
# ECPAY_MERCHANT_ID=your-production-merchant-id
# ECPAY_HASH_KEY=your-production-hash-key
# ECPAY_HASH_IV=your-production-hash-iv
# ECPAY_MODE=production
```

---

## 🔒 安全最佳實踐

### 1. 環境變數命名

- ✅ 使用大寫字母和下劃線
- ✅ 使用描述性名稱
- ❌ 不要在變數名中包含敏感信息

### 2. 密鑰管理

- ✅ 生產環境使用強隨機密鑰
- ✅ 定期輪換密鑰
- ✅ 不要將密鑰提交到版本控制
- ❌ 不要在代碼中硬編碼密鑰

### 3. 訪問控制

- ✅ 只有必要的人員可以訪問環境變數
- ✅ 使用 Supabase 的權限管理
- ✅ 審計環境變數的更改

### 4. 環境隔離

- ✅ 開發、測試、生產環境使用不同的密鑰
- ✅ Sandbox 和 Production API 憑證分開
- ✅ 使用不同的 Webhook URL

---

## 🧪 驗證配置

### 檢查環境變數是否配置

創建一個測試端點（僅用於開發）：

```typescript
app.get("/make-server-04b375d8/check-env", (c) => {
  const checks = {
    ORDER_ENCRYPTION_KEY: !!Deno.env.get('ORDER_ENCRYPTION_KEY'),
    PAYPAL_CLIENT_ID: !!Deno.env.get('PAYPAL_CLIENT_ID'),
    PAYPAL_CLIENT_SECRET: !!Deno.env.get('PAYPAL_CLIENT_SECRET'),
    PAYPAL_WEBHOOK_ID: !!Deno.env.get('PAYPAL_WEBHOOK_ID'),
    PAYPAL_MODE: Deno.env.get('PAYPAL_MODE') || 'sandbox'
  }
  
  return c.json({ configured: checks })
})
```

**警告**: 生產環境中應移除此端點或添加嚴格的訪問控制。

### 測試 PayPal 連接

```bash
# 測試創建 PayPal 訂單
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/make-server-04b375d8/payments/paypal/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"orderId":"test_order_id"}'

# 如果返回錯誤 "PayPal credentials not configured"
# 說明環境變數未正確設置
```

---

## 🔄 環境變數更新流程

### 開發環境更新

1. 在本地 `.env` 文件中更新
2. 使用 CLI 推送到 Supabase
3. 重新部署 Edge Function（自動）

```bash
# 更新環境變數
supabase secrets set PAYPAL_MODE=production

# 查看更新結果
supabase secrets list
```

### 生產環境更新

1. **計劃停機時間**（如果需要）
2. 在 Supabase Dashboard 中更新
3. 測試新配置
4. 監控應用程式日誌

---

## 📊 環境變數使用情況

### 後端代碼中的使用

```typescript
// 訂單加密
const encryptionKey = Deno.env.get('ORDER_ENCRYPTION_KEY') || 'default-key'

// PayPal 認證
const paypalClientId = Deno.env.get('PAYPAL_CLIENT_ID')
const paypalSecret = Deno.env.get('PAYPAL_CLIENT_SECRET')

// PayPal 模式
const paypalMode = Deno.env.get('PAYPAL_MODE') || 'sandbox'
const paypalApiBase = paypalMode === 'production'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com'
```

### 錯誤處理

```typescript
if (!paypalClientId || !paypalSecret) {
  throw new Error('PayPal credentials not configured')
}
```

---

## 🚨 常見問題

### Q: 為什麼我的 PayPal 支付失敗了？

**A**: 檢查以下項目：
1. `PAYPAL_CLIENT_ID` 和 `PAYPAL_CLIENT_SECRET` 是否正確配置
2. `PAYPAL_MODE` 是否與使用的憑證匹配（Sandbox 憑證不能用於 Production）
3. 查看 Edge Function 日誌獲取詳細錯誤信息

### Q: 如何從 Sandbox 切換到 Production？

**A**: 
1. 在 PayPal Developer Dashboard 獲取 Live 憑證
2. 創建 Live Webhook
3. 更新環境變數：
   ```bash
   supabase secrets set PAYPAL_CLIENT_ID="live-client-id"
   supabase secrets set PAYPAL_CLIENT_SECRET="live-secret"
   supabase secrets set PAYPAL_WEBHOOK_ID="live-webhook-id"
   supabase secrets set PAYPAL_MODE="production"
   ```
4. 測試一筆小額交易

### Q: 環境變數更新後多久生效？

**A**: 
- Supabase Edge Functions 會自動重新部署
- 通常在 1-2 分鐘內生效
- 建議等待 5 分鐘後再測試

### Q: 如何查看當前配置的環境變數？

**A**:
```bash
# 使用 CLI
supabase secrets list

# 在 Dashboard
Settings → Edge Functions → Secrets
```

**注意**: 出於安全考慮，無法查看環境變數的值，只能查看名稱。

---

## 📚 相關文檔

- [PayPal 集成指南](/docs/paypal-integration-guide.md)
- [Phase 4 數據架構](/docs/phase-4-data-schema.md)
- [支付網關參考](/docs/payment-gateway-reference.md)
- [Supabase Edge Functions 文檔](https://supabase.com/docs/guides/functions)

---

## ✅ 配置完成檢查清單

在部署到生產環境前，確認以下項目：

- [ ] `ORDER_ENCRYPTION_KEY` 已設置為強隨機密鑰
- [ ] PayPal Live 憑證已配置
- [ ] PayPal Webhook 已創建並驗證
- [ ] `PAYPAL_MODE` 設置為 `production`
- [ ] 所有環境變數在 Supabase Dashboard 中可見
- [ ] 已測試一筆 Sandbox 交易成功
- [ ] 已測試一筆 Live 小額交易成功
- [ ] Edge Function 日誌沒有錯誤
- [ ] 備份了所有環境變數配置

---

**更新日期**: 2025-10-08  
**版本**: 1.0.0
