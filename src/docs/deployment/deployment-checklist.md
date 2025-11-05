# 🚀 部署檢查清單

**部署日期**: _____________  
**部署人員**: _____________  
**環境**: [ ] Development [ ] Staging [ ] Production

---

## 📋 部署前檢查

### 1. 環境變量配置

```bash
必需的環境變量:
[ ] SUPABASE_URL
[ ] SUPABASE_ANON_KEY
[ ] SUPABASE_SERVICE_ROLE_KEY
[ ] ORDER_ENCRYPTION_KEY
[ ] PAYPAL_CLIENT_ID
[ ] PAYPAL_CLIENT_SECRET
[ ] PAYPAL_MODE (sandbox/production)
```

**驗證方式**:
- 訪問 Supabase Dashboard > Settings > Edge Functions > Secrets
- 確認所有變量都已設置

### 2. 代碼檢查

- [ ] 所有代碼已提交到版本控制
- [ ] 沒有 console.log 洩漏敏感信息
- [ ] 錯誤處理完整
- [ ] TypeScript 編譯無錯誤

**驗證命令**:
```bash
npm install
npm run build
```

### 3. Edge Function 部署

- [ ] 共享 CORS 配置文件存在 (`/supabase/functions/_shared/cors.ts`)
- [ ] Edge Function 代碼已更新
- [ ] 準備好部署命令

**部署命令**:
```bash
supabase login
supabase functions deploy server
supabase functions deploy search-games
```

---

## 🧪 部署後測試

### 1. 連接測試
訪問 `/enen` 並檢查：
- [ ] Supabase Connection Test 全部通過 (綠色)
- [ ] CORS Test Panel 全部通過 (4/4)
- [ ] Edge Function 健康狀態正常

### 2. 認證測試
- [ ] 普通用戶登入正常
- [ ] Admin 登入 (`/enen`) 正常
- [ ] 角色正確顯示（不會降級）
- [ ] 頁面刷新後角色保持

### 3. 功能測試
- [ ] 產品列表加載正常
- [ ] 訂單提交成功
- [ ] PayPal 支付流程正常
- [ ] Admin Dashboard 所有功能可用

### 4. 性能測試
使用 Auth Debug Panel 檢查：
- [ ] Session 檢查 < 500ms
- [ ] 角色檢查 < 200ms
- [ ] 總登入時間 < 1000ms

---

## 🔐 安全檢查

- [ ] RLS 政策已啟用
- [ ] 敏感數據已加密
- [ ] API Keys 未洩漏到前端
- [ ] CORS 配置正確（僅允許必要的 Origin）

---

## 📊 監控設置

### 檢查清單
- [ ] Supabase Dashboard > Logs 可訪問
- [ ] Edge Function 日誌正常
- [ ] 錯誤追蹤配置（如有）

### 關鍵指標
監控以下指標：
- 登入成功率 (目標: > 99%)
- 平均登入時間 (目標: < 1500ms)
- CORS 錯誤率 (目標: 0%)
- API 錯誤率 (目標: < 1%)

---

## 🐛 故障回滾計劃

### 如需回滾

1. **Edge Function 回滾**:
```bash
# 在 Supabase Dashboard > Edge Functions
# 選擇之前的版本並重新部署
```

2. **代碼回滾**:
```bash
git revert <commit-hash>
git push
```

3. **驗證回滾**:
- [ ] 運行所有測試
- [ ] 確認系統恢復正常

---

## ✅ 部署完成確認

### 最終檢查
- [ ] 所有測試通過
- [ ] 性能指標正常
- [ ] 無控制台錯誤
- [ ] 團隊已通知

### 文檔更新
- [ ] 更新變更日誌
- [ ] 更新版本號
- [ ] 記錄已知問題（如有）

---

## 📞 緊急聯繫

如遇到嚴重問題：
1. 立即回滾到上一個穩定版本
2. 通知團隊
3. 記錄問題詳情
4. 查看診斷工具 (`/enen`)

---

**部署狀態**: [ ] 成功 [ ] 失敗 [ ] 部分成功  
**備註**: ________________________________________________

**簽名**: _______________ **日期**: _______________
