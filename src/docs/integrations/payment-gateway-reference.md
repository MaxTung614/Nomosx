# 支付網關快速參考

## 訂單數據結構

### 完整的訂單對象

```typescript
interface Order {
  // 基本信息
  id: string                          // 訂單ID: order_${timestamp}_${random}
  gameId: string                      // 遊戲ID
  denominationId: string              // 面額ID
  
  // 客戶信息
  customer_email: string              // 客戶信箱
  customer_phone: string              // 客戶電話（可選）
  
  // 遊戲帳號信息
  game_login_username: string         // 遊戲帳號
  game_login_password: string         // 加密後的遊戲密碼
  
  // 訂單詳情
  quantity: number                    // 購買數量
  pricePerUnit: number                // 單價
  totalPrice: number                  // 總價
  notes: string                       // 備註
  
  // 狀態信息
  status: OrderStatus                 // 訂單狀態
  
  // 支付信息
  payment_method: string | null       // 用戶選擇的支付方式
  payment_gateway: string | null      // 支付網關: 'paypal' | 'ecpay'
  gateway_transaction_id: string | null // 網關交易ID（唯一）
  
  // 時間戳
  created_at: string                  // 創建時間
  updated_at: string                  // 更新時間
  paid_at?: string                    // 支付時間（可選）
}
```

### 訂單狀態

```typescript
type OrderStatus = 
  | 'pending_payment'  // 等待支付
  | 'paid'            // 已支付
  | 'processing'      // 處理中
  | 'completed'       // 已完成
  | 'failed'          // 支付失敗
  | 'cancelled'       // 已取消
  | 'refunded'        // 已退款
```

---

## 支付方式映射

### 前端 → 後端映射

| 前端選擇 | payment_method | payment_gateway | 說明 |
|---------|---------------|-----------------|------|
| 信用卡 | credit_card | ecpay | 透過 ECPay 處理 |
| PayPal | paypal | paypal | 透過 PayPal 處理 |
| 銀行轉帳 | bank_transfer | ecpay | 透過 ECPay 處理 |
| 行動支付 | mobile_payment | ecpay | 透過 ECPay 處理 |

### 代碼實現

```typescript
const gatewayMap: Record<string, string> = {
  'paypal': 'paypal',
  'credit_card': 'ecpay',
  'bank_transfer': 'ecpay',
  'mobile_payment': 'ecpay'
};

const paymentGateway = gatewayMap[paymentMethod] || 'ecpay';
```

---

## API 端點

### 1. 創建訂單

```http
POST /make-server-04b375d8/orders
Content-Type: application/json
Authorization: Bearer {publicAnonKey}

{
  "gameId": "game_xxx",
  "denominationId": "denomination_xxx",
  "game_login_username": "player123",
  "game_login_password": "password123",
  "customer_email": "user@example.com",
  "customer_phone": "+886912345678",
  "quantity": 1,
  "notes": "備註信息"
}
```

**響應**：
```json
{
  "success": true,
  "order": {
    "id": "order_1728388800000_abc123",
    "gameId": "game_xxx",
    "denominationId": "denomination_xxx",
    "game_login_username": "player123",
    "customer_email": "user@example.com",
    "quantity": 1,
    "totalPrice": 100.00,
    "status": "pending_payment",
    "created_at": "2025-10-08T12:00:00Z"
  }
}
```

---

### 2. 處理支付

```http
POST /make-server-04b375d8/payments/process
Content-Type: application/json
Authorization: Bearer {publicAnonKey}

{
  "orderId": "order_xxx",
  "paymentMethod": "paypal",
  "amount": 100.00,
  "currency": "USD",
  "paymentDetails": {
    // 根據支付方式提供不同的詳情
  }
}
```

**響應**：
```json
{
  "success": true,
  "payment": {
    "orderId": "order_xxx",
    "transactionId": "txn_xxx",
    "paymentGateway": "paypal",
    "amount": 100.00,
    "currency": "USD",
    "paymentMethod": "paypal",
    "status": "paid",
    "paidAt": "2025-10-08T12:05:00Z"
  }
}
```

---

### 3. 查詢訂單

```http
GET /make-server-04b375d8/orders/{orderId}
Authorization: Bearer {publicAnonKey}
```

**響應**：
```json
{
  "order": {
    "id": "order_xxx",
    "gameId": "game_xxx",
    "denominationId": "denomination_xxx",
    "game_login_username": "player123",
    "customer_email": "user@example.com",
    "customer_phone": "+886912345678",
    "quantity": 1,
    "pricePerUnit": 100.00,
    "totalPrice": 100.00,
    "notes": "",
    "status": "paid",
    "payment_method": "paypal",
    "payment_gateway": "paypal",
    "gateway_transaction_id": "txn_xxx",
    "created_at": "2025-10-08T12:00:00Z",
    "updated_at": "2025-10-08T12:05:00Z",
    "paid_at": "2025-10-08T12:05:00Z"
  }
}
```

---

### 4. 管理員查詢支付歷史

```http
GET /make-server-04b375d8/admin/payments
Authorization: Bearer {adminAccessToken}
```

**響應**：
```json
{
  "payments": [
    {
      "id": "txn_xxx",
      "orderId": "order_xxx",
      "customer_email": "user@example.com",
      "amount": 100.00,
      "currency": "USD",
      "paymentMethod": "paypal",
      "paymentGateway": "paypal",
      "gatewayTransactionId": "txn_xxx",
      "status": "paid",
      "paidAt": "2025-10-08T12:05:00Z",
      "createdAt": "2025-10-08T12:00:00Z"
    }
  ]
}
```

---

## 支付流程

### 標準流程

```
1. 用戶提交訂單
   ↓
   POST /orders
   ↓
   status: pending_payment
   payment_gateway: null
   gateway_transaction_id: null

2. 用戶選擇支付方式並支付
   ↓
   POST /payments/process
   ↓
   status: paid
   payment_gateway: 'paypal' | 'ecpay'
   gateway_transaction_id: 'txn_xxx'

3. (可選) 支付網關 Webhook 確認
   ↓
   POST /webhooks/{gateway}
   ↓
   檢查 gateway_transaction_id
   防止重複處理
   更新狀態為 processing

4. 管理員處理訂單
   ↓
   手動或自動加值
   ↓
   status: completed
```

### 失敗流程

```
1. 支付失敗
   ↓
   POST /payments/process 返回錯誤
   ↓
   status: failed
   payment_error: 錯誤信息

2. 用戶可以重試
   ↓
   返回支付頁面
   ↓
   重新選擇支付方式
```

---

## Webhook 處理（未來實現）

### PayPal Webhook

```http
POST /make-server-04b375d8/webhooks/paypal
Content-Type: application/json
X-PayPal-Transmission-Sig: {signature}

{
  "event_type": "PAYMENT.CAPTURE.COMPLETED",
  "resource": {
    "id": "paypal_transaction_id",
    "amount": {
      "value": "100.00",
      "currency_code": "USD"
    }
  }
}
```

**處理邏輯**：
1. 驗證簽名
2. 檢查 `gateway_transaction_id` 是否已存在
3. 更新訂單狀態為 `processing`
4. 記錄審計日誌

---

### ECPay Webhook

```http
POST /make-server-04b375d8/webhooks/ecpay
Content-Type: application/x-www-form-urlencoded

MerchantID=xxx&
MerchantTradeNo=order_xxx&
RtnCode=1&
RtnMsg=交易成功&
TradeNo=ecpay_transaction_id&
TradeAmt=100&
CheckMacValue=xxx
```

**處理邏輯**：
1. 驗證 CheckMacValue
2. 檢查 `gateway_transaction_id` 是否已存在
3. 更新訂單狀態為 `processing`
4. 記錄審計日誌

---

## 審計日誌

### 訂單提交日誌

```typescript
{
  id: "audit_xxx",
  action: "order_submitted",
  description: "用戶成功提交訂單",
  orderId: "order_xxx",
  customer_email: "user@example.com",
  gameId: "game_xxx",
  denominationId: "denomination_xxx",
  totalPrice: 100.00,
  ip_address: "1.2.3.4",
  user_agent: "Mozilla/5.0...",
  timestamp: "2025-10-08T12:00:00Z"
}
```

### 支付成功日誌

```typescript
{
  id: "audit_xxx",
  action: "payment_successful",
  description: "支付處理成功",
  orderId: "order_xxx",
  customer_email: "user@example.com",
  payment_method: "paypal",
  payment_gateway: "paypal",
  gateway_transaction_id: "txn_xxx",
  amount: 100.00,
  ip_address: "1.2.3.4",
  user_agent: "Mozilla/5.0...",
  timestamp: "2025-10-08T12:05:00Z"
}
```

### 支付失敗日誌

```typescript
{
  id: "audit_xxx",
  action: "payment_failed",
  description: "支付處理失敗",
  orderId: "order_xxx",
  customer_email: "user@example.com",
  payment_method: "credit_card",
  amount: 100.00,
  error: "信用卡被拒絕",
  ip_address: "1.2.3.4",
  user_agent: "Mozilla/5.0...",
  timestamp: "2025-10-08T12:05:00Z"
}
```

---

## 錯誤處理

### 常見錯誤

| 錯誤代碼 | 錯誤信息 | 原因 | 解決方案 |
|---------|---------|------|---------|
| 400 | Order ID, payment method, and amount are required | 缺少必填字段 | 檢查請求參數 |
| 400 | Invalid payment method | 無效的支付方式 | 使用正確的支付方式代碼 |
| 404 | Order not found | 訂單不存在 | 檢查訂單ID |
| 400 | Cannot process payment for order with status: {status} | 訂單狀態不正確 | 確保訂單狀態為 pending_payment |
| 400 | Payment amount does not match order total | 金額不匹配 | 確保支付金額與訂單總額一致 |

### 前端錯誤處理示例

```typescript
try {
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const error = await response.json();
    toast.error(error.error || '操作失敗');
    return;
  }
  
  const data = await response.json();
  // 處理成功響應
  
} catch (error) {
  console.error('Request error:', error);
  
  if (error instanceof Error && error.name === 'TimeoutError') {
    toast.error('請求超時，請檢查網路連線');
  } else {
    toast.error('發生未知錯誤，請稍後再試');
  }
}
```

---

## 測試數據

### 測試訂單

```json
{
  "gameId": "game_test_001",
  "denominationId": "denomination_test_001",
  "game_login_username": "test_player",
  "game_login_password": "test_password",
  "customer_email": "test@example.com",
  "customer_phone": "+886912345678",
  "quantity": 1,
  "notes": "測試訂單"
}
```

### 模擬支付成功率

```typescript
const successRates = {
  credit_card: 0.95,    // 95% 成功率
  paypal: 0.98,         // 98% 成功率
  bank_transfer: 0.90,  // 90% 成功率
  mobile_payment: 0.96  // 96% 成功率
};
```

---

## 安全建議

### 1. API Key 管理

```bash
# 環境變數（未來需要）
PAYPAL_CLIENT_ID=xxx
PAYPAL_CLIENT_SECRET=xxx
ECPAY_MERCHANT_ID=xxx
ECPAY_HASH_KEY=xxx
ORDER_ENCRYPTION_KEY=xxx  # 已配置
```

### 2. Webhook 安全

- ✅ 驗證簽名
- ✅ 檢查時間戳（防止重放攻擊）
- ✅ 檢查 `gateway_transaction_id`（防止重複處理）
- ✅ IP 白名單

### 3. 敏感數據保護

- ✅ `game_login_password` 使用 AES-256-GCM 加密
- ✅ 訂單查詢時不返回密碼
- ✅ 審計日誌不記錄密碼
- ✅ HTTPS 傳輸

### 4. 速率限制

```typescript
// 建議實現
const rateLimits = {
  orders: {
    perMinute: 10,
    perHour: 50
  },
  payments: {
    perMinute: 5,
    perHour: 20
  }
};
```

---

## 開發工具

### cURL 測試示例

```bash
# 創建訂單
curl -X POST https://{projectId}.supabase.co/functions/v1/make-server-04b375d8/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {publicAnonKey}" \
  -d '{
    "gameId": "game_xxx",
    "denominationId": "denomination_xxx",
    "game_login_username": "player123",
    "game_login_password": "password123",
    "customer_email": "user@example.com",
    "quantity": 1
  }'

# 處理支付
curl -X POST https://{projectId}.supabase.co/functions/v1/make-server-04b375d8/payments/process \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {publicAnonKey}" \
  -d '{
    "orderId": "order_xxx",
    "paymentMethod": "paypal",
    "amount": 100.00,
    "currency": "USD"
  }'

# 查詢訂單
curl -X GET https://{projectId}.supabase.co/functions/v1/make-server-04b375d8/orders/order_xxx \
  -H "Authorization: Bearer {publicAnonKey}"
```

---

## 常見問題

### Q: 為什麼要同時記錄 payment_method 和 payment_gateway？

A: 
- `payment_method` 記錄用戶選擇的支付方式（前端選擇）
- `payment_gateway` 記錄實際處理支付的網關（後端決定）
- 這樣可以靈活調整網關映射，而不影響用戶體驗

### Q: gateway_transaction_id 如何保證唯一性？

A: 
- 使用 `txn_${timestamp}_${random}` 格式生成
- 在 Webhook 處理前檢查是否已存在
- 支付網關返回的實際交易ID會覆蓋此值

### Q: 如何測試支付流程？

A:
1. 使用模擬支付（當前實現）
2. 使用支付網關的沙盒環境（未來實現）
3. 配置不同的成功率進行測試

### Q: 如何處理支付超時？

A:
1. 前端設置合理的超時時間（30秒）
2. 後端記錄支付請求
3. 使用 Webhook 異步確認支付結果
4. 提供訂單查詢功能讓用戶確認狀態

---

## 相關資源

- [Phase 4 數據架構文檔](/docs/phase-4-data-schema.md)
- [Phase 4 遷移總結](/docs/phase-4-migration-summary.md)
- [PayPal REST API 文檔](https://developer.paypal.com/docs/api/)
- [ECPay 文檔](https://www.ecpay.com.tw/Service/API_Dwnld)
