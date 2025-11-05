# ECPay 集成佔位符 (Phase 4.2 待實現)

## 概述

ECPay（綠界科技）是台灣領先的第三方支付服務提供商，提供多元化的支付方式。此文檔說明 Phase 4.2 中將實現的 ECPay 集成計劃。

---

## 📋 當前狀態

### ✅ 已完成

1. **前端 UI 佔位符**
   - 支付頁面顯示 ECPay 選項
   - 標記為「維護中」
   - 禁用選擇（disabled）
   - 視覺上透明度降低以示不可用

2. **後端 API 佔位符**
   - `/payments/ecpay/create` - 創建 ECPay 訂單
   - `/webhooks/ecpay` - ECPay Webhook 處理器
   - `/payments/ecpay/return` - ECPay 客戶返回處理
   - 所有端點返回 503 維護中錯誤

3. **代碼註釋**
   - 清晰的 `TODO: Implement ECPay logic in Phase 4.2` 標記
   - 詳細的實現步驟說明
   - CheckMacValue 計算方法註釋
   - 必需參數列表

### ⏳ 待實現 (Phase 4.2)

- [ ] ECPay API 集成
- [ ] CheckMacValue 加密/驗證
- [ ] 表單數據生成
- [ ] Webhook 處理邏輯
- [ ] 訂單狀態更新
- [ ] 防重複處理機制
- [ ] 審計日誌記錄
- [ ] 前端自動提交表單
- [ ] 測試環境配置
- [ ] 生產環境配置

---

## 🎯 Phase 4.2 實現計劃

### 支付方式支援

ECPay AIO (All In One) 將支援以下支付方式：

| 支付方式 | 代碼 | 說明 | 處理時間 |
|---------|------|------|---------|
| 信用卡 | Credit | Visa, MasterCard, JCB | 即時 |
| 網路 ATM | WebATM | 線上 ATM 轉帳 | 即時 |
| ATM 轉帳 | ATM | 虛擬帳號轉帳 | 1-3 工作天 |
| 超商代碼 | CVS | 7-11, 全家, 萊爾富, OK超商 | 1-3 工作天 |
| 超商條碼 | BARCODE | 超商條碼繳費 | 1-3 工作天 |
| Apple Pay | ApplePay | Apple 行動支付 | 即時 |
| Google Pay | GooglePay | Google 行動支付 | 即時 |

---

## 🔧 技術架構

### API 流程

```
前端                     後端                      ECPay
  |                        |                         |
  |-- POST /create ------->|                         |
  |                        |-- 生成表單數據 -------->|
  |<-- Form Data ----------|                         |
  |                        |                         |
  |-- 自動提交表單 ----------------------------->|
  |                        |                         |
  |                        |                         | (用戶支付)
  |                        |                         |
  |<-- 返回 ClientBackURL -------------------------|
  |                        |                         |
  |                        |<-- POST /webhooks ------ |
  |                        |-- 驗證 CheckMacValue -->|
  |                        |-- 更新訂單狀態 -------->|
  |                        |-- 返回 "1|OK" -------->|
```

### 數據結構

#### ECPay 訂單創建請求

```typescript
interface ECPayCreateRequest {
  orderId: string  // 我們的訂單 ID
}
```

#### ECPay 表單數據（返回給前端）

```typescript
interface ECPayFormData {
  action: string  // ECPay API URL
  method: 'POST'
  fields: {
    MerchantID: string           // 商店代號
    MerchantTradeNo: string      // 商店訂單編號 (orderId)
    MerchantTradeDate: string    // 交易日期 (yyyy/MM/dd HH:mm:ss)
    PaymentType: 'aio'           // 固定值
    TotalAmount: string          // 交易金額 (整數)
    TradeDesc: string            // 交易描述
    ItemName: string             // 商品名稱
    ReturnURL: string            // 付款結果通知 URL (Webhook)
    ClientBackURL: string        // 付款完成返回商店 URL
    ChoosePayment: string        // 付款方式 (ALL, Credit, WebATM, etc.)
    EncryptType: '1'             // 加密類型 (1=SHA256)
    CheckMacValue: string        // 檢查碼
  }
}
```

#### ECPay Webhook 通知

```typescript
interface ECPayWebhookData {
  MerchantID: string
  MerchantTradeNo: string      // orderId
  StoreID: string
  RtnCode: string              // 1=成功, 其他=失敗
  RtnMsg: string               // 交易訊息
  TradeNo: string              // ECPay 交易編號
  TradeAmt: string             // 交易金額
  PaymentDate: string          // 付款時間
  PaymentType: string          // 付款方式
  PaymentTypeChargeFee: string // 通路費
  TradeDate: string            // 訂單成立時間
  SimulatePaid: string         // 0=模擬付款, 1=真實付款
  CheckMacValue: string        // 檢查碼
  // ... 其他欄位依付款方式而定
}
```

---

## 🔒 CheckMacValue 計算方法

ECPay 使用 CheckMacValue 確保資料完整性和真實性。

### 步驟 1: 參數排序

將所有參數（除了 CheckMacValue 本身）按照 **鍵名的英文字母順序（A-Z, a-z）** 排序。

### 步驟 2: 組合字串

格式：`Key1=Value1&Key2=Value2&...`

前後加上 HashKey 和 HashIV：

```
HashKey={HashKey}&Key1=Value1&Key2=Value2&...&HashIV={HashIV}
```

### 步驟 3: URL Encode

對整個字串進行 URL Encode（小寫轉大寫）

### 步驟 4: SHA256 Hash

對 URL Encoded 字串進行 SHA256 雜湊

### 步驟 5: 轉大寫

將雜湊結果轉為大寫

### 範例代碼（TODO in Phase 4.2）

```typescript
// TODO: Implement in Phase 4.2
function generateCheckMacValue(params: Record<string, string>, hashKey: string, hashIV: string): string {
  // Step 1: Sort parameters
  const sortedKeys = Object.keys(params).sort((a, b) => a.localeCompare(b));
  
  // Step 2: Combine string
  const paramStr = sortedKeys
    .map(key => `${key}=${params[key]}`)
    .join('&');
  
  const rawStr = `HashKey=${hashKey}&${paramStr}&HashIV=${hashIV}`;
  
  // Step 3: URL Encode
  const urlEncoded = encodeURIComponent(rawStr)
    .replace(/%20/g, '+')
    .replace(/%2d/g, '-')
    .replace(/%5f/g, '_')
    .replace(/%2e/g, '.')
    .replace(/%21/g, '!')
    .replace(/%2a/g, '*')
    .replace(/%28/g, '(')
    .replace(/%29/g, ')');
  
  // Step 4: SHA256 Hash
  const crypto = await import('node:crypto');
  const hash = crypto.createHash('sha256').update(urlEncoded, 'utf8').digest('hex');
  
  // Step 5: Uppercase
  return hash.toUpperCase();
}
```

---

## 🗄️ 環境變數

### 測試環境

```bash
# ECPay 測試環境憑證
ECPAY_MERCHANT_ID=2000132  # 測試商店代號
ECPAY_HASH_KEY=5294y06JbISpM5x9  # 測試 HashKey
ECPAY_HASH_IV=v77hoKGq4kWxNNIS   # 測試 HashIV
ECPAY_MODE=test  # test 或 production

# ECPay API URLs
# Test: https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5
# Production: https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5
```

### 生產環境

```bash
# ECPay 生產環境憑證（需向 ECPay 申請）
ECPAY_MERCHANT_ID=your_merchant_id
ECPAY_HASH_KEY=your_hash_key
ECPAY_HASH_IV=your_hash_iv
ECPAY_MODE=production
```

---

## 📝 實現檢查清單

### 後端 (Edge Function)

#### 創建 ECPay 訂單 (`/payments/ecpay/create`)

- [ ] 從 KV store 獲取訂單
- [ ] 驗證訂單狀態為 `pending_payment`
- [ ] 檢查 `gateway_transaction_id` 是否已存在
- [ ] 生成 MerchantTradeNo（使用 orderId）
- [ ] 生成 MerchantTradeDate（台灣時區）
- [ ] 設置 ReturnURL (Webhook URL)
- [ ] 設置 ClientBackURL (前端返回 URL)
- [ ] 計算 CheckMacValue
- [ ] 返回表單數據給前端
- [ ] 創建審計日誌

#### ECPay Webhook (`/webhooks/ecpay`)

- [ ] 接收 POST 數據
- [ ] 重新計算 CheckMacValue
- [ ] 驗證 CheckMacValue 是否匹配
- [ ] 檢查 RtnCode (1 = 成功)
- [ ] 從 KV store 獲取訂單
- [ ] 檢查是否已處理（防重複）
- [ ] 更新訂單狀態：
  - [ ] status = 'processing'
  - [ ] payment_gateway = 'ecpay'
  - [ ] gateway_transaction_id = TradeNo
  - [ ] paid_at = PaymentDate
- [ ] 創建審計日誌
- [ ] 返回 `"1|OK"` 給 ECPay

#### 客戶返回處理 (`/payments/ecpay/return`)

- [ ] 接收 GET 參數
- [ ] 提取 orderId
- [ ] 重定向到前端結果頁面

### 前端

#### 支付頁面更新

- [ ] 移除 ECPay 選項的 `disabled` 屬性
- [ ] 移除 "維護中" 標籤
- [ ] 恢復正常樣式（移除 opacity-60）
- [ ] 添加 ECPay 支付處理邏輯

#### ECPay 表單自動提交

- [ ] 創建隱藏表單元素
- [ ] 設置 action 和 method
- [ ] 添加所有隱藏欄位
- [ ] 自動提交表單到 ECPay
- [ ] 用戶在 ECPay 頁面完成支付
- [ ] 返回到 ClientBackURL

#### ECPay 返回處理器

- [ ] 創建 `/payment/ecpay/return` 組件
- [ ] 顯示處理中狀態
- [ ] 查詢訂單狀態
- [ ] 顯示支付結果
- [ ] 提供返回按鈕

---

## 🧪 測試計劃

### 測試環境

1. **設置測試憑證**
   ```bash
   ECPAY_MERCHANT_ID=2000132
   ECPAY_HASH_KEY=5294y06JbISpM5x9
   ECPAY_HASH_IV=v77hoKGq4kWxNNIS
   ECPAY_MODE=test
   ```

2. **測試支付方式**
   - [ ] 信用卡測試卡
   - [ ] WebATM 測試
   - [ ] ATM 虛擬帳號
   - [ ] 超商代碼
   - [ ] 超商條碼

3. **測試場景**
   - [ ] 成功支付
   - [ ] 支付失敗
   - [ ] 支付超時
   - [ ] 取消支付
   - [ ] Webhook 重複通知
   - [ ] CheckMacValue 驗證失敗

### 測試卡號（ECPay 提供）

| 卡別 | 卡號 | 到期日 | CVV |
|------|------|--------|-----|
| Visa | 4311-9522-2222-2222 | 未來任意 | 222 |
| MasterCard | 5555-4444-3333-1111 | 未來任意 | 111 |
| JCB | 3566-0020-2036-0505 | 未來任意 | 222 |

---

## 🚨 注意事項

### 重要提醒

1. **時區問題**
   - ECPay 使用台灣時區 (UTC+8)
   - MerchantTradeDate 必須使用正確時區

2. **CheckMacValue 計算**
   - URL Encode 必須正確處理特殊字符
   - 參數排序必須準確
   - HashKey 和 HashIV 不能外洩

3. **Webhook 響應**
   - 必須返回 `"1|OK"` 才算成功
   - 其他響應 ECPay 會重複發送

4. **金額處理**
   - TotalAmount 必須是整數
   - 不支持小數點

5. **訂單編號**
   - MerchantTradeNo 最長 20 字符
   - 必須唯一

---

## 📚 參考資源

### 官方文檔

- [ECPay 官方網站](https://www.ecpay.com.tw/)
- [ECPay API 文檔](https://developers.ecpay.com.tw/)
- [ECPay 測試環境](https://payment-stage.ecpay.com.tw/)
- [ECPay SDK](https://github.com/ECPay)

### 申請流程

1. 訪問 ECPay 官網
2. 註冊商家帳號
3. 完成實名驗證
4. 設置銀行帳戶
5. 獲取測試憑證
6. 開發和測試
7. 申請上線審核
8. 獲取正式憑證
9. 切換到生產環境

---

## ✅ Phase 4.2 完成標準

### 功能完整性

- [ ] 所有 3 個 API 端點完全實現
- [ ] 前端 UI 完全可用
- [ ] CheckMacValue 計算和驗證正確
- [ ] 訂單狀態更新邏輯正確
- [ ] 審計日誌完整

### 安全性

- [ ] CheckMacValue 驗證
- [ ] 防重複處理
- [ ] 環境變數保護
- [ ] 錯誤處理完善

### 測試覆蓋

- [ ] 所有支付方式測試通過
- [ ] 異常場景處理正確
- [ ] Webhook 測試通過
- [ ] 端到端測試通過

### 文檔完整

- [ ] API 文檔更新
- [ ] 環境變數文檔
- [ ] 測試指南
- [ ] 部署指南

---

## 📊 時程規劃

### Phase 4.2 預估時程

| 任務 | 時間 | 負責 |
|------|------|------|
| 環境設置 | 0.5 天 | 後端 |
| CheckMacValue 實現 | 1 天 | 後端 |
| 創建訂單 API | 1 天 | 後端 |
| Webhook 處理 | 1 天 | 後端 |
| 前端自動提交表單 | 0.5 天 | 前端 |
| 前端返回處理 | 0.5 天 | 前端 |
| 測試和調試 | 2 天 | 全端 |
| 文檔更新 | 0.5 天 | 全端 |
| **總計** | **7 天** | |

---

## 🎉 總結

ECPay 集成的佔位符已經完成：

- ✅ 前端 UI 顯示選項但禁用
- ✅ 後端 API 端點已創建但返回維護中錯誤
- ✅ 詳細的 TODO 註釋和實現指南
- ✅ 完整的技術文檔

**下一步：Phase 4.2** 將實現完整的 ECPay 集成，為台灣用戶提供本地化的支付體驗！

---

**文檔版本**: 1.0.0  
**創建日期**: 2025-10-22  
**更新日期**: 2025-10-22  
**狀態**: 佔位符 - 待 Phase 4.2 實現