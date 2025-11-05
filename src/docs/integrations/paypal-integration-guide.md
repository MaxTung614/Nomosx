# PayPal 集成指南 (Phase 4.1)

## 概述

Phase 4.1 實現了完整的 PayPal 支付集成，包括 PayPal Orders API v2、Webhook 處理和安全驗證機制。

---

## 🎯 功能特性

### ✅ 已實現功能

1. **PayPal 訂單創建**
   - 使用 PayPal Orders API v2
   - 自動生成 approval URL
   - 支持訂單詳情和物品列表

2. **支付流程**
   - 前端創建 PayPal 訂單
   - 跳轉到 PayPal 結帳頁面
   - 用戶授權支付
   - 返回後自動捕獲支付

3. **Webhook 處理**
   - 接收 PayPal Webhook 通知
   - 驗證 Webhook 簽名
   - 防止重複處理
   - 自動更新訂單狀態

4. **安全機制**
   - gateway_transaction_id 唯一性檢查
   - PayPal 簽名驗證
   - 訂單狀態驗證
   - 詳細的審計日誌

---

## 🔧 環境變數配置

### 必需的環境變數

在 Supabase Dashboard → Edge Functions → Secrets 中配置以下環境變數：

```bash
# PayPal API 憑證
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret

# PayPal Webhook ID (用於驗證 Webhook 簽名)
PAYPAL_WEBHOOK_ID=your_webhook_id

# PayPal 模式 (sandbox 或 production)
PAYPAL_MODE=sandbox
```

### 獲取 PayPal 憑證

#### 1. 註冊 PayPal 開發者帳號

訪問：https://developer.paypal.com/

#### 2. 創建應用程式

1. 登入 PayPal Developer Dashboard
2. 進入 "Apps & Credentials"
3. 點擊 "Create App"
4. 選擇 "Sandbox" 或 "Live" 環境
5. 複製 Client ID 和 Secret

#### 3. 配置 Webhook

1. 在應用程式設定中找到 "Webhooks"
2. 點擊 "Add Webhook"
3. Webhook URL: `https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-04b375d8/webhooks/paypal`
4. 選擇事件類型：
   - `CHECKOUT.ORDER.APPROVED`
   - `PAYMENT.CAPTURE.COMPLETED`
5. 保存後複製 Webhook ID

---

## 📡 API 端點

### 1. 創建 PayPal 訂單

**端點**: `POST /make-server-04b375d8/payments/paypal/create`

**請求**:
```json
{
  "orderId": "order_1728388800000_abc123"
}
```

**響應**:
```json
{
  "success": true,
  "paypalOrderId": "8AB12345CD678901E",
  "approvalUrl": "https://www.sandbox.paypal.com/checkoutnow?token=8AB12345CD678901E"
}
```

**流程**:
1. 驗證訂單存在且狀態為 `pending_payment`
2. 檢查是否已有 `gateway_transaction_id`（防止重複）
3. 獲取 PayPal Access Token
4. 創建 PayPal Order
5. 返回 approval URL 供用戶跳轉
6. 記錄審計日誌

---

### 2. 捕獲 PayPal 支付

**端點**: `POST /make-server-04b375d8/payments/paypal/capture`

**請求**:
```json
{
  "orderId": "order_1728388800000_abc123",
  "paypalOrderId": "8AB12345CD678901E"
}
```

**響應**:
```json
{
  "success": true,
  "orderId": "order_1728388800000_abc123",
  "transactionId": "9XY98765ZW432109",
  "status": "processing"
}
```

**流程**:
1. 驗證訂單和 PayPal Order ID 匹配
2. 檢查是否已處理（防止重複）
3. 調用 PayPal Capture API
4. 更新訂單狀態為 `processing`
5. 設置 `payment_gateway` = 'paypal'
6. 設置 `gateway_transaction_id` = Capture ID
7. 記錄審計日誌

---

### 3. PayPal Webhook 處理器

**端點**: `POST /make-server-04b375d8/webhooks/paypal`

**接收的事件**:

#### CHECKOUT.ORDER.APPROVED
用戶在 PayPal 頁面點擊"同意並支付"時觸發

```json
{
  "event_type": "CHECKOUT.ORDER.APPROVED",
  "resource": {
    "id": "8AB12345CD678901E",
    "custom_id": "order_1728388800000_abc123",
    "status": "APPROVED"
  }
}
```

**處理**: 僅記錄審計日誌，不更新訂單狀態

#### PAYMENT.CAPTURE.COMPLETED
支付捕獲完成時觸發

```json
{
  "event_type": "PAYMENT.CAPTURE.COMPLETED",
  "resource": {
    "id": "9XY98765ZW432109",
    "custom_id": "order_1728388800000_abc123",
    "status": "COMPLETED"
  }
}
```

**處理**:
1. 驗證 Webhook 簽名
2. 檢查 `gateway_transaction_id` 是否已存在
3. 更新訂單狀態為 `processing`
4. 記錄審計日誌

**安全驗證**:
```typescript
// Webhook 簽名驗證
const verifyData = {
  transmission_id: headers['paypal-transmission-id'],
  transmission_time: headers['paypal-transmission-time'],
  cert_url: headers['paypal-cert-url'],
  auth_algo: headers['paypal-auth-algo'],
  transmission_sig: headers['paypal-transmission-sig'],
  webhook_id: PAYPAL_WEBHOOK_ID,
  webhook_event: webhookBody
}

// 調用 PayPal API 驗證
POST https://api.sandbox.paypal.com/v1/notifications/verify-webhook-signature
```

---

## 🔄 完整支付流程

### 用戶視角

```
1. 用戶提交訂單
   ↓
2. 選擇 PayPal 作為支付方式
   ↓
3. 點擊"確認支付"
   ↓
4. 跳轉到 PayPal 結帳頁面
   ↓
5. 用戶登入 PayPal 並授權支付
   ↓
6. 返回到網站處理頁面
   ↓
7. 自動捕獲支付
   ↓
8. 顯示支付成功頁面
```

### 技術流程

```
前端                     後端                      PayPal
  |                        |                         |
  |-- POST /create ------->|                         |
  |                        |-- Create Order -------> |
  |                        |<-- Approval URL ------- |
  |<-- Approval URL -------|                         |
  |                        |                         |
  |-- 跳轉到 PayPal -------------------------------->|
  |                        |                         |
  |                        |                         | (用戶授權)
  |                        |                         |
  |<-- 返回到 /payment-success ---------------------|
  |                        |                         |
  |-- POST /capture ------>|                         |
  |                        |-- Capture Payment ----> |
  |                        |<-- Capture ID --------- |
  |<-- Success ------------|                         |
  |                        |                         |
  |                        |<-- Webhook (async) ---- |
```

---

## 🎨 前端實現

### 1. 支付頁面更新

**文件**: `/components/payment-page.tsx`

```typescript
const processPayment = async () => {
  if (selectedPaymentMethod === 'paypal') {
    // 創建 PayPal 訂單
    const response = await fetch(
      `${API_URL}/payments/paypal/create`,
      {
        method: 'POST',
        body: JSON.stringify({ orderId: order.id })
      }
    )
    
    const result = await response.json()
    
    // 跳轉到 PayPal
    window.location.href = result.approvalUrl
  }
}
```

### 2. PayPal 返回處理器

**文件**: `/components/paypal-return-handler.tsx`

處理 PayPal 返回的 URL: `/payment-success?token=XXX&orderId=YYY`

```typescript
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search)
  const token = urlParams.get('token') // PayPal Order ID
  const orderId = urlParams.get('orderId')
  
  // 調用後端捕獲支付
  const response = await fetch(
    `${API_URL}/payments/paypal/capture`,
    {
      method: 'POST',
      body: JSON.stringify({ orderId, paypalOrderId: token })
    }
  )
  
  // 跳轉到結果頁面
  onPaymentSuccess(orderId)
}, [])
```

### 3. PayPal 取消處理器

**文件**: `/components/paypal-cancel-handler.tsx`

處理用戶取消支付: `/payment-cancel?orderId=YYY`

```typescript
// 顯示取消訊息
// 提供返回支付頁面或首頁的按鈕
```

### 4. 路由更新

**文件**: `/components/router.tsx`

```typescript
switch (currentPath) {
  case '/payment-success':
    return <PayPalReturnHandler />
  
  case '/payment-cancel':
    return <PayPalCancelHandler />
  
  // ... 其他路由
}
```

---

## 🗄️ 訂單數據結構

### 創建訂單時

```typescript
{
  id: "order_xxx",
  status: "pending_payment",
  payment_gateway: null,
  gateway_transaction_id: null,
  // ... 其他字段
}
```

### 創建 PayPal Order 後

```typescript
{
  id: "order_xxx",
  status: "pending_payment",
  paypal_order_id: "8AB12345CD678901E",  // 臨時存儲
  payment_gateway: null,
  gateway_transaction_id: null,
  // ... 其他字段
}
```

### 支付完成後

```typescript
{
  id: "order_xxx",
  status: "processing",
  paypal_order_id: "8AB12345CD678901E",
  payment_method: "paypal",
  payment_gateway: "paypal",
  gateway_transaction_id: "9XY98765ZW432109",  // Capture ID
  paid_at: "2025-10-08T12:05:00Z",
  // ... 其他字段
}
```

---

## 📝 審計日誌

### PayPal 訂單創建

```typescript
{
  id: "audit_xxx",
  action: "paypal_order_created",
  description: "PayPal 訂單已創建",
  orderId: "order_xxx",
  paypal_order_id: "8AB12345CD678901E",
  customer_email: "user@example.com",
  amount: 100.00,
  timestamp: "2025-10-08T12:00:00Z"
}
```

### PayPal 訂單批准（Webhook）

```typescript
{
  id: "audit_xxx",
  action: "paypal_order_approved",
  description: "PayPal 訂單已批准（用戶已同意支付）",
  orderId: "order_xxx",
  paypal_order_id: "8AB12345CD678901E",
  customer_email: "user@example.com",
  webhook_event_type: "CHECKOUT.ORDER.APPROVED",
  timestamp: "2025-10-08T12:03:00Z"
}
```

### PayPal 支付捕獲

```typescript
{
  id: "audit_xxx",
  action: "paypal_payment_captured",
  description: "PayPal 支付已完成",
  orderId: "order_xxx",
  paypal_order_id: "8AB12345CD678901E",
  gateway_transaction_id: "9XY98765ZW432109",
  customer_email: "user@example.com",
  amount: 100.00,
  timestamp: "2025-10-08T12:05:00Z"
}
```

---

## 🔒 安全機制

### 1. 防重複處理

**檢查點 1**: 創建 PayPal Order 前
```typescript
if (order.gateway_transaction_id) {
  return { error: "Order already has a payment transaction" }
}
```

**檢查點 2**: 捕獲支付前
```typescript
if (order.gateway_transaction_id) {
  console.log(`Order already processed`)
  return { success: true, message: "Payment already processed" }
}
```

**檢查點 3**: Webhook 處理前
```typescript
if (order.gateway_transaction_id) {
  console.log(`Webhook: Order already processed`)
  return { success: true, message: "Already processed" }
}
```

### 2. Webhook 簽名驗證

```typescript
// 1. 提取 Webhook 標頭
const headers = {
  'paypal-transmission-id': req.header('paypal-transmission-id'),
  'paypal-transmission-time': req.header('paypal-transmission-time'),
  'paypal-cert-url': req.header('paypal-cert-url'),
  'paypal-auth-algo': req.header('paypal-auth-algo'),
  'paypal-transmission-sig': req.header('paypal-transmission-sig')
}

// 2. 調用 PayPal API 驗證
const verifyResponse = await fetch(
  'https://api.paypal.com/v1/notifications/verify-webhook-signature',
  {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({
      ...headers,
      webhook_id: PAYPAL_WEBHOOK_ID,
      webhook_event: webhookBody
    })
  }
)

// 3. 檢查驗證結果
const result = await verifyResponse.json()
if (result.verification_status !== 'SUCCESS') {
  return { error: "Webhook verification failed" }
}
```

### 3. 訂單狀態驗證

```typescript
// 只允許 pending_payment 狀態的訂單創建支付
if (order.status !== 'pending_payment') {
  return { 
    error: `Cannot process payment for order with status: ${order.status}` 
  }
}
```

### 4. PayPal Order ID 匹配

```typescript
// 確保 PayPal Order ID 與訂單記錄匹配
if (order.paypal_order_id !== paypalOrderId) {
  return { error: "PayPal order ID mismatch" }
}
```

---

## 🧪 測試指南

### Sandbox 測試

#### 1. 使用 PayPal Sandbox 帳號

訪問：https://developer.paypal.com/dashboard/accounts

創建測試買家和賣家帳號

#### 2. 測試信用卡

PayPal Sandbox 提供測試信用卡：

```
Visa: 4032035762196610
Expiry: 任何未來日期
CVV: 任何3位數字
```

#### 3. 測試流程

```bash
# 1. 創建測試訂單
POST /orders
{
  "gameId": "game_test",
  "denominationId": "denom_test",
  "game_login_username": "test_user",
  "game_login_password": "test_pass",
  "customer_email": "buyer@example.com",
  "quantity": 1
}

# 2. 創建 PayPal 訂單
POST /payments/paypal/create
{
  "orderId": "order_xxx"
}

# 3. 訪問返回的 approvalUrl
# 登入 Sandbox 買家帳號
# 完成支付流程

# 4. 返回後自動捕獲支付

# 5. 檢查訂單狀態
GET /orders/order_xxx
```

---

## 🚨 錯誤處理

### 常見錯誤

| 錯誤 | 原因 | 解決方案 |
|------|------|---------|
| PayPal credentials not configured | 缺少環境變數 | 配置 PAYPAL_CLIENT_ID 和 PAYPAL_CLIENT_SECRET |
| Failed to authenticate with PayPal | 憑證錯誤 | 檢查 Client ID 和 Secret 是否正確 |
| Order not found | 訂單 ID 錯誤 | 確認訂單 ID 正確 |
| Cannot process payment for order with status: paid | 訂單已支付 | 訂單已經完成支付 |
| Order already has a payment transaction | 重複處理 | 訂單已有交易 ID |
| PayPal order ID mismatch | ID 不匹配 | 確保使用正確的 PayPal Order ID |
| Failed to capture PayPal payment | 捕獲失敗 | 檢查 PayPal Dashboard 的錯誤詳情 |
| Webhook verification failed | 簽名驗證失敗 | 檢查 PAYPAL_WEBHOOK_ID 是否正確 |

### 錯誤日誌

所有錯誤都會記錄到控制台：

```typescript
console.error('PayPal create order error:', error)
console.error('PayPal capture error:', error)
console.error('PayPal webhook error:', error)
```

---

## 📊 監控和調試

### 查看 Edge Function 日誌

```bash
# Supabase Dashboard
Project → Edge Functions → Logs

# 或使用 CLI
supabase functions logs make-server-04b375d8
```

### 查看 PayPal 交易

1. 登入 PayPal Developer Dashboard
2. Sandbox → Accounts → View details
3. 查看交易歷史

### 查看審計日誌

```bash
# 獲取所有 PayPal 相關審計日誌
GET /admin/audit-logs?action=paypal_order_created
GET /admin/audit-logs?action=paypal_payment_captured
```

---

## 🎉 下一步

### Phase 4.2: ECPay 集成

- 實現 ECPay API 集成
- 處理 ECPay 回傳和 Webhook
- 支持信用卡、ATM、超商付款

### Phase 4.3: 管理後台增強

- 支付管理介面
- 交易記錄查詢
- 退款處理
- 財務報表

---

## 📚 參考資源

- [PayPal Orders API v2](https://developer.paypal.com/docs/api/orders/v2/)
- [PayPal Webhooks](https://developer.paypal.com/docs/api-basics/notifications/webhooks/)
- [PayPal Sandbox Testing](https://developer.paypal.com/tools/sandbox/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

---

## 總結

✅ **已完成**:
- PayPal Orders API v2 集成
- 完整的支付流程（創建、授權、捕獲）
- Webhook 處理和簽名驗證
- 防重複處理機制
- 完整的審計日誌
- 前端 UI 和路由

🎯 **系統狀態**:
- 生產環境就緒
- 安全機制完善
- 錯誤處理完整
- 文檔齊全

⚠️ **注意事項**:
- 記得配置所有必需的環境變數
- Sandbox 測試後再切換到 Production
- 定期檢查 Webhook 日誌
- 監控支付成功率
