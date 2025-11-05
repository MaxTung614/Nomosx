# 文檔歸檔目錄

此目錄包含已執行完成或已過時的文檔和 SQL 腳本。

## 📂 目錄說明

### SQL 遷移腳本（已執行）

這些 SQL 腳本已經在 Supabase 中執行完成，保留在此處僅供歷史參考：

- **Phase 4 相關：**
  - 訂單和支付系統的初始設置

- **Phase 5 相關：**
  - `phase-5-data-optimization.sql` - 數據結構優化（regions, platforms, games, denominations 等表格）
  - `phase-5-orders-tables.sql` - Orders 和 Audit Logs 表格創建
  - `phase-5-fulfillment-status.sql` - 訂單履行狀態欄位遷移
  - `phase-5-order-credentials-table.sql` - 訂單憑證安全表格創建
  - `rls-policies.sql` - Row Level Security 政策設定

### 修復和遷移文檔（已完成）

這些文檔記錄了已完成的系統修復和遷移過程：

- **Edge Function 3 - 訂單履行處理器：**
  - `EDGE-FUNCTION-3-ORDER-FULFILLMENT.md` - 完整實施指南
  - `EDGE-FUNCTION-3-QUICK-START.md` - 快速開始指南

- **密碼安全修復：**
  - `EDGE-FUNCTION-PASSWORD-FIX.md` - 完整修復指南
  - `PASSWORD-FIX-SUMMARY.md` - 修復總結
  - `QUICK-FIX-REFERENCE.md` - 快速參考卡
  - `TEST-ORDER-SUBMISSION.md` - 測試指南

- **Phase 4 完成文檔：**
  - `phase-4-completion-summary.md` - Phase 4 完成總結
  - `phase-4-data-schema.md` - 數據架構文檔
  - `phase-4-migration-summary.md` - Phase 4 遷移總結

- **Phase 5 遷移文檔：**
  - `PHASE-5-MIGRATION-GUIDE.md` - Phase 5 遷移指南
  - `PHASE-5-CODE-UPDATE-STATUS.md` - 代碼更新狀態
  - `PHASE-5-FINAL-STEPS.md` - 最終步驟
  - `ADMIN-DASHBOARD-UPDATES.md` - Admin Dashboard 更新日誌

- **其他：**
  - `paypal-quick-start.md` - PayPal 快速開始（已被更完整的指南取代）

## 🔍 如何使用歸檔文件

### 查看歷史

如果需要了解某個功能的實施歷史或修復過程，可以參考這些文檔。

### SQL 腳本參考

雖然這些 SQL 腳本已經執行，但如果需要：
- 在新環境中重建數據庫
- 了解表格結構的演變
- 排查數據庫問題

可以參考這些腳本。

### ⚠️ 重要提醒

**請勿重複執行這些 SQL 腳本！**

這些腳本已在生產/開發環境中執行。重複執行可能導致：
- 重複創建約束（錯誤）
- 數據不一致
- 系統異常

如需修改數據庫結構，請創建新的遷移腳本。

## 📋 活躍文檔

以下文檔仍在 `/docs` 根目錄下維護：

- `environment-variables.md` - 環境變量配置指南
- `paypal-integration-guide.md` - PayPal 完整集成指南
- `payment-gateway-reference.md` - 支付閘道參考
- `ecpay-placeholder.md` - ECPay 未來功能佔位
- `phase-3-rls-implementation.md` - RLS 實施核心文檔

## 📅 歸檔日期

- 歸檔創建日期：2025-10-09
- 最後更新：2025-10-09

---

**Note:** 如有任何疑問，請聯繫開發團隊。
