# ⚡ 快速啟動指南

**目標時間：** 30 分鐘  
**難度：** 🟢 簡單

---

## 📋 前置檢查

在開始之前，確認你已經：
- ✅ 有 Supabase 專案（已自動部署）
- ✅ 有 PayPal Developer 帳號
- ✅ 可以訪問 Supabase Dashboard

---

## 🚀 三步啟動

### 步驟 1：配置環境變量（15 分鐘）

#### 1.1 登入 Supabase Dashboard
```
https://app.supabase.com/project/[your-project-id]
```

#### 1.2 生成加密密鑰
```bash
# 在終端執行（選擇一種方式）：

# 方式 A - 使用 OpenSSL
openssl rand -base64 32

# 方式 B - 使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 複製生成的密鑰，稍後使用
```

#### 1.3 獲取 PayPal 憑證

1. 訪問 [PayPal Developer Dashboard](https://developer.paypal.com/)
2. 登入你的帳號
3. 點擊 **Apps & Credentials**
4. 切換到 **Sandbox** 標籤
5. 創建新應用或使用現有應用
6. 複製 **Client ID** 和 **Secret**

#### 1.4 添加到 Supabase Secrets

在 Supabase Dashboard 中：

1. 導航到：**Project Settings > Edge Functions > Secrets**
2. 點擊 **New secret** 並添加以下 3 個變量：

| Name | Value | 說明 |
|------|-------|------|
| `ORDER_ENCRYPTION_KEY` | [步驟 1.2 生成的密鑰] | 訂單加密密鑰 |
| `PAYPAL_CLIENT_ID` | [步驟 1.3 的 Client ID] | PayPal Client ID |
| `PAYPAL_CLIENT_SECRET` | [步驟 1.3 的 Secret] | PayPal Secret |

3. （可選）添加第 4 個變量：

| Name | Value | 說明 |
|------|-------|------|
| `PAYPAL_MODE` | `sandbox` | PayPal 模式（測試環境）|

**✅ 完成標記：** 你應該看到至少 7 個環境變量（4 個自動 + 3 個手動）

---

### 步驟 2：創建 Admin 用戶（5 分鐘）

#### 2.1 註冊第一個用戶

1. 在前端頁面點擊「登入/註冊」
2. 使用你的 Email 註冊新用戶
3. 記住這個 Email，稍後升級為 Admin

#### 2.2 升級為 Admin

1. 返回 Supabase Dashboard
2. 導航到：**SQL Editor**
3. 點擊 **New query**
4. 複製並執行以下 SQL（替換成你的 Email）：

```sql
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'your-email@example.com';
```

5. 點擊 **Run** 執行

#### 2.3 驗證 Admin 訪問

1. 在瀏覽器訪問：`/enen`（Admin 登入頁）
2. 使用剛才的帳號登入
3. 應該看到 Admin Dashboard

**✅ 完成標記：** 成功訪問 Admin Dashboard

---

### 步驟 3：初始化基礎數據（10 分鐘）

#### 3.1 創建區域（Regions）

在 Admin Dashboard > **基礎設定** 標籤：

1. 點擊區域管理的「新增區域」
2. 添加以下區域：

| 名稱 | 代碼 |
|------|------|
| 台灣 | TW |
| 北美 | NA |
| 歐洲 | EU |
| 亞洲 | ASIA |

#### 3.2 創建平台（Platforms）

1. 點擊平台管理的「新增平台」
2. 添加以下平台：

| 名稱 | 代碼 |
|------|------|
| iOS | IOS |
| Android | ANDROID |
| PC | PC |

#### 3.3 創建促銷標籤（Display Tags）

1. 點擊促銷標籤的「新增標籤」
2. 添加以下標籤：

| 名稱 | 顏色代碼 |
|------|----------|
| 熱門 | #FF5722 |
| 新品 | #4CAF50 |
| 限時 | #FFC107 |

#### 3.4 創建第一個遊戲

在 Admin Dashboard > **遊戲管理** 標籤：

1. 點擊「新增遊戲」
2. 填寫資訊：
   - **名稱：** 原神
   - **區域代碼：** ASIA
   - **描述：** 開放世界冒險遊戲

#### 3.5 創建第一個產品

在 Admin Dashboard > **產品面額管理** 標籤：

1. 點擊「新增面額」
2. 填寫資訊：
   - **面額名稱：** 60 創世結晶
   - **遊戲：** 原神
   - **平台：** iOS
   - **促銷標籤：** 熱門
   - **價格 (USD)：** 0.99
   - **成本：** 0.70
   - **SKU 代碼：** GENSHIN-60-IOS
   - **可購買：** ✅ 是

**✅ 完成標記：** 看到至少 1 個遊戲和 1 個產品

---

## 🧪 測試流程（額外 10 分鐘）

### 測試 1：訂單提交

1. 訪問前端產品頁面
2. 選擇剛才創建的產品
3. 填寫訂單資訊：
   - 遊戲帳號：test@example.com
   - 遊戲密碼：TestPassword123
   - 客戶信箱：customer@example.com
   - 數量：1
4. 提交訂單
5. ✅ 看到「訂單提交成功」

### 測試 2：PayPal 支付（Sandbox）

1. 在支付頁面點擊 **PayPal** 按鈕
2. 應該跳轉到 PayPal Sandbox 登入頁
3. 使用 PayPal Sandbox 測試帳號登入
4. 完成支付流程
5. ✅ 返回成功頁面，看到「支付成功」

### 測試 3：訂單履行

1. 返回 Admin Dashboard
2. 切換到 **訂單管理** 標籤
3. 應該看到剛才創建的訂單
4. 點擊訂單旁的「查看詳情」圖標
5. 將「履行狀態」更新為「處理中」
6. 添加履行備註
7. 點擊「完成履行」
8. ✅ 訂單狀態變為「已完成」

---

## ✅ 啟動完成檢查清單

### 環境配置
- [ ] ORDER_ENCRYPTION_KEY 已配置
- [ ] PAYPAL_CLIENT_ID 已配置
- [ ] PAYPAL_CLIENT_SECRET 已配置
- [ ] PAYPAL_MODE 已配置（或使用默認 sandbox）

### 用戶與權限
- [ ] 創建了至少一個 Admin 用戶
- [ ] Admin 可以訪問 `/enen` 管理後台

### 基礎數據
- [ ] 創建了至少 1 個區域（Region）
- [ ] 創建了至少 1 個平台（Platform）
- [ ] 創建了至少 1 個促銷標籤（Display Tag）
- [ ] 創建了至少 1 個遊戲（Game）
- [ ] 創建了至少 1 個產品面額（Denomination）

### 功能測試
- [ ] 訂單提交功能正常
- [ ] PayPal Sandbox 支付測試成功
- [ ] 訂單履行流程完整
- [ ] 搜索、排序、導出功能正常

---

## 🎉 恭喜！系統已準備就緒

你現在擁有一個完整運行的遊戲儲值平台，包含：

- ✅ 用戶認證系統
- ✅ 角色權限控制（Admin / CS / User）
- ✅ CMS 內容管理
- ✅ 訂單管理系統
- ✅ PayPal 支付集成
- ✅ 加密安全存儲
- ✅ 完整審計追蹤
- ✅ Admin Dashboard 管理介面

---

## 📚 下一步學習

### 新手推薦
1. 閱讀 [環境變量詳解](../setup/environment-variables.md)
2. 了解 [PayPal 集成指南](../integrations/paypal-integration-guide.md)
3. 查看 [Admin Dashboard 功能](../admin/admin-search-sort-export.md)

### 進階配置
1. [生產環境部署指南](../deployment/deployment-guide.md)
2. [安全檢查清單](../security/security-best-practices.md)

### 開發相關
1. [RLS 實施](../security/rls-implementation.md)
2. [完整變更日誌](../changelogs/)

---

## 🆘 遇到問題？

### 常見問題快速解決

#### PayPal 按鈕不顯示
```
檢查：PAYPAL_CLIENT_ID 是否配置正確
位置：Supabase Dashboard > Edge Functions > Secrets
```

#### 訂單密碼加密失敗
```
檢查：ORDER_ENCRYPTION_KEY 是否已配置
解決：生成並配置新的加密密鑰
```

#### Admin Dashboard 無法訪問
```
檢查：用戶角色是否為 admin
解決：重新執行步驟 2.2 的 SQL 更新
```

---

**準備時間：** 30 分鐘  
**最後更新：** 2025-10-22  
**開始你的遊戲儲值平台之旅！** 🎮✨