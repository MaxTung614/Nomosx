# 登入流程修復測試指南

## 🎯 測試目標

驗證登入流程修復是否成功解決阻塞問題，確保所有登入場景都能正常工作。

---

## 🛠️ 測試準備

### 1. 啟用調試面板

在需要測試的頁面添加 `<AuthDebugPanel />` 組件：

```tsx
import { AuthDebugPanel } from './components/auth-debug-panel'

// 在你的組件中
<AuthDebugPanel />
```

### 2. 打開瀏覽器開發者工具

- 按 `F12` 或 `Cmd+Option+I` (Mac)
- 切換到 Console 標籤
- 確保能看到日誌輸出

### 3. 準備測試帳號

確保你有以下測試帳號：
- **普通用戶**: email + 密碼
- **管理員**: admin role 帳號
- **客服**: cs role 帳號

---

## ✅ 測試場景

### 場景 1: 普通用戶登入（Email/密碼）

**步驟**:
1. 打開主頁面
2. 點擊「登入」按鈕
3. 輸入有效的 email 和密碼
4. 點擊「登入」

**預期結果**:
- ✅ 登入按鈕顯示「登入中...」
- ✅ 在 15 秒內完成登入（通常 < 2秒）
- ✅ 彈窗關閉
- ✅ 顯示「登入成功！」toast 消息
- ✅ 用戶頭像/名稱顯示在頁面頂部
- ✅ Console 顯示性能指標（< 1000ms）

**Console 日誌示例**:
```
Auth state change: SIGNED_IN user@example.com
Session fetch took 150.23ms: {session: {...}}
User fetch took 234.56ms: {user: {...}}
Role check took 78.90ms: user
=== Total Debug Refresh Time: 463.69ms ===
```

**如果失敗**:
- 檢查 Console 錯誤消息
- 查看調試面板的性能指標
- 確認哪個步驟超過 1000ms（橙色標記）

---

### 場景 2: Google OAuth 登入

**步驟**:
1. 打開登入彈窗
2. 點擊「Google 登入」按鈕
3. 完成 Google 授權流程
4. 返回應用

**預期結果**:
- ✅ 重定向到 Google 授權頁面
- ✅ 授權後重定向回應用
- ✅ 自動登入並顯示用戶信息
- ✅ 顯示「登入成功！」toast

**注意**: 
- 如果出現 "provider is not enabled" 錯誤
- 請參考 https://supabase.com/docs/guides/auth/social-login/auth-google
- 完成 Google OAuth 設置

---

### 場景 3: Admin 登入（/enen 頁面）

**步驟**:
1. 訪問 `/enen` 路由
2. 輸入 admin 帳號密碼
3. 點擊「登入」

**預期結果**:
- ✅ 登入按鈕顯示加載動畫
- ✅ 在 5 秒內完成登入
- ✅ 正確檢測到 admin 角色
- ✅ 重定向到 Admin Dashboard
- ✅ Console 顯示 "User role detected: admin"

**Console 日誌示例**:
```
User role detected: admin
Auth state change: SIGNED_IN admin@example.com
```

**如果角色檢查失敗**:
- 應該回退到 'user' 角色並繼續
- 不應該卡住或無限加載
- Console 應顯示錯誤但不阻塞流程

---

### 場景 4: 已登入用戶刷新頁面

**步驟**:
1. 登入成功後
2. 刷新頁面 (F5 或 Cmd+R)

**預期結果**:
- ✅ 頁面加載時顯示 loading 狀態
- ✅ 在 1 秒內恢復登入狀態
- ✅ 用戶信息正確顯示
- ✅ 不需要重新登入

**調試面板檢查**:
- Session 狀態: ✅ 存在
- Access Token: ✅ 存在
- 用戶對象: ✅ 存在
- 角色檢查: ✅ 正確角色

---

### 場景 5: 錯誤憑證測試

**步驟**:
1. 打開登入彈窗
2. 輸入錯誤的密碼
3. 點擊「登入」

**預期結果**:
- ✅ 顯示錯誤消息
- ✅ 不會卡住或無限加載
- ✅ 可以重新輸入並嘗試
- ✅ 3 次失敗後顯示 CAPTCHA 區域

**不應該發生**:
- ❌ 無限加載
- ❌ 白屏
- ❌ 沒有錯誤提示

---

### 場景 6: 慢速網絡測試

**步驟**:
1. 打開 Chrome DevTools → Network 標籤
2. 選擇「Slow 3G」或「Fast 3G」
3. 嘗試登入

**預期結果**:
- ✅ 登入過程可能較慢但不會卡住
- ✅ 在 15 秒內完成或顯示超時錯誤
- ✅ 超時後顯示友好的錯誤消息
- ✅ 可以重試

**調試面板檢查**:
- 性能指標可能較高（> 1000ms 橙色標記）
- 但總時間應 < 15000ms

---

### 場景 7: 超時保護測試

**模擬方法**:
使用 Chrome DevTools 的 Network 功能：
1. Network → Throttling → Add custom profile
2. 設置超低速度或阻止特定請求
3. 嘗試登入

**預期結果**:
- ✅ 在超時時限內（5-15秒）顯示錯誤
- ✅ 錯誤消息：「登入請求超時，請重試」
- ✅ UI 解除加載狀態
- ✅ 用戶可以重試

**Console 應顯示**:
```
Login error: Error: 登入請求超時，請重試
```

---

### 場景 8: Session 恢復失敗測試

**步驟**:
1. 登入成功
2. 在 DevTools → Application → Local Storage
3. 刪除或修改 Supabase 相關的 localStorage 項目
4. 刷新頁面

**預期結果**:
- ✅ 應該優雅地處理錯誤
- ✅ 返回到登出狀態
- ✅ 不會白屏或拋出未捕獲的錯誤
- ✅ 用戶可以重新登入

---

## 📊 性能基準檢查

使用調試面板檢查以下指標：

### 優秀 (綠色)
- **Session 檢查**: < 200ms
- **User 獲取**: < 300ms
- **角色檢查**: < 100ms
- **總時間**: < 800ms

### 可接受 (黃色/橙色)
- **Session 檢查**: 200-1000ms
- **User 獲取**: 300-1000ms
- **角色檢查**: 100-1000ms
- **總時間**: 800-3000ms

### 需要調查 (紅色)
- **任何單步驟**: > 1000ms
- **總時間**: > 3000ms

如果看到紅色標記，可能的原因：
- 網絡連接問題
- Supabase API 響應慢
- RLS 政策過於複雜
- 數據庫查詢慢

---

## 🐛 常見問題排查

### 問題 1: 登入後仍然卡在 loading 狀態

**檢查**:
1. 調試面板中的「加載狀態」是否為「已加載」
2. Console 是否有錯誤
3. 性能指標是否超時

**可能原因**:
- AuthProvider 的 setIsLoading(false) 沒有執行
- 某個異步操作卡住了

**解決方法**:
- 檢查 Console 的性能日誌
- 查看是否有超時錯誤
- 刷新頁面重試

---

### 問題 2: 角色檢查失敗

**檢查**:
1. 用戶的 user_metadata 中是否有 role 字段
2. Console 是否顯示 "Role check failed"

**預期行為**:
- 即使角色檢查失敗，也應該回退到 'user' 角色
- 不應該阻塞登入流程

**手動檢查用戶角色**:
```javascript
// 在 Console 執行
const { data: { user } } = await supabase.auth.getUser()
console.log('User metadata:', user.user_metadata)
console.log('Role:', user.user_metadata?.role)
```

---

### 問題 3: 超時錯誤頻繁出現

**檢查**:
1. 網絡連接是否穩定
2. Supabase 服務狀態
3. 是否在防火牆/代理後面

**調整建議**:
如果網絡環境確實較慢，可以增加超時時限：

```typescript
// 在 client.tsx 或 auth-provider.tsx 中
const timeoutPromise = new Promise((_, reject) => 
  setTimeout(() => reject(new Error('Timeout')), 30000) // 增加到 30 秒
)
```

---

### 問題 4: Google OAuth 不工作

**檢查**:
1. Supabase Dashboard → Authentication → Providers
2. Google OAuth 是否已啟用
3. Client ID 和 Secret 是否正確配置

**參考文檔**:
https://supabase.com/docs/guides/auth/social-login/auth-google

**常見錯誤**:
- "provider is not enabled" → OAuth 提供者未啟用
- "redirect_uri mismatch" → 回調 URL 配置錯誤

---

## 📋 測試檢查清單

完成所有測試後，確認以下項目：

### 基本功能
- [ ] Email/密碼登入成功
- [ ] Google OAuth 登入成功（如已配置）
- [ ] Admin 登入成功
- [ ] 登出功能正常
- [ ] 刷新頁面後 session 恢復

### 錯誤處理
- [ ] 錯誤憑證顯示正確提示
- [ ] 超時錯誤正確處理
- [ ] 網絡錯誤不會卡住 UI
- [ ] 角色檢查失敗有回退機制

### 性能
- [ ] 正常網絡下登入 < 2 秒
- [ ] 慢速網絡下在超時前完成或顯示錯誤
- [ ] 性能指標在可接受範圍內
- [ ] 沒有明顯的 UI 卡頓

### 用戶體驗
- [ ] 加載狀態清晰可見
- [ ] 成功/錯誤消息及時顯示
- [ ] 可以重試失敗的登入
- [ ] CAPTCHA 在 3 次失敗後顯示

---

## 🚨 緊急回滾程序

如果修復導致新問題，可以快速回滾：

### 回滾文件清單
1. `/utils/supabase/client.tsx` - checkUserRole 函數
2. `/components/auth-provider.tsx` - 整個文件
3. `/components/admin-login-page.tsx` - handleSubmit 和 useEffect
4. `/components/auth-modal.tsx` - handleLogin 函數

### 回滾步驟
1. 從 git 歷史中恢復舊版本
2. 重新部署
3. 記錄新問題詳情
4. 通知開發團隊

---

## 📞 支持

如果測試中發現問題：

1. **記錄詳細信息**:
   - 瀏覽器和版本
   - 操作系統
   - 重現步驟
   - Console 日誌截圖
   - 調試面板截圖

2. **檢查相關文檔**:
   - `/CHANGELOG-AUTH-FIX-2025-10-09.md`
   - `/docs/environment-variables.md`
   - Supabase 官方文檔

3. **聯繫團隊**:
   - 提供上述所有信息
   - 說明已嘗試的解決方法

---

**文檔版本**: 1.0  
**最後更新**: 2025-10-22  
**維護者**: 開發團隊
