# 🎨 NomosX 設計文檔

本目錄包含 NomosX 平台的設計系統、品牌指南和視覺規範。

---

## 📚 文檔列表

### 主題與品牌

- **[homepage-redesign-complete.md](./homepage-redesign-complete.md)** - 首頁完整重新設計報告 🆕
  - ✅ 從商務儀表板到專業遊戲商城
  - ✅ 黑金電競美學 + 賽博朋克藍色
  - ✅ 完整的動畫與互動系統
  - ✅ 6 個主要區塊設計
  - ✅ 響應式佈局與性能優化

- **[nomosx-theme-transformation.md](./nomosx-theme-transformation.md)** - 黑金主題轉換完整報告
  - ✅ 從 Vibe 淺色模板到 NomosX 黑金電競風格
  - ✅ 完整的樣式變更記錄
  - ✅ 配色方案與無障礙檢查
  - ✅ 質量檢查清單與優化建議

---

## 🎨 NomosX 品牌色彩

### 核心配色

| 顏色 | 用途 | Tailwind 類名 | 色碼 |
|------|------|--------------|------|
| 🟡 **品牌金** | 主要強調色 | `text-yellow-500` | #EAB308 |
| ⚫ **深黑** | 主背景 | `bg-gray-900` / `bg-black` | #111827 / #000000 |
| ⚪ **純白** | 主要文字 | `text-white` | #FFFFFF |
| 🔘 **淺灰** | 次要文字 | `text-gray-400` | #9CA3AF |
| ⬛ **暗灰** | 卡片背景 | `bg-gray-900` | #111827 |

### 語意色彩

| 類型 | 顏色 | 用途 |
|------|------|------|
| 成功 | 🟢 Green-500 | 訂單完成、支付成功 |
| 警告 | 🟡 Yellow-500 | 待處理狀態 |
| 錯誤 | 🔴 Red-500 | 錯誤提示、失敗狀態 |
| 信息 | 🔵 Blue-500 | 一般提示 |

---

## 📏 設計原則

### 1. 極簡主義
- ✅ 清晰的視覺層次
- ✅ 留白空間充足
- ✅ 信息密度適中

### 2. 電競風格
- ✅ 黑金配色方案
- ✅ 銳利的線條與邊角
- ✅ 科技感光影效果

### 3. 用戶體驗
- ✅ 高對比度（無障礙）
- ✅ 清晰的交互反饋
- ✅ 響應式設計

### 4. 品牌一致性
- ✅ 統一的視覺語言
- ✅ 可識別的設計元素
- ✅ 專業的品質感

---

## 🖼️ 設計資源

### Figma 文件
- [ ] NomosX 設計系統（待創建）
- [ ] 組件庫（待創建）
- [ ] 圖標集（待創建）

### 品牌資產
- [ ] Logo 文件（SVG/PNG）
- [ ] 配色指南
- [ ] 字體規範
- [ ] 圖示集

---

## 🔧 技術實現

### CSS 框架
- **Tailwind CSS v4.0** - 實用優先的 CSS 框架
- **ShadCN/UI** - 高質量的 React 組件庫

### 關鍵文件
- `/styles/globals.css` - 全局樣式與設計 Token
- `/components/ui/` - UI 組件庫
- `/components/main-app.tsx` - 主應用（黑金主題）

---

## 📋 設計檢查清單

### 新組件設計

創建新組件時，請確保：

- [ ] 遵循 NomosX 配色方案
- [ ] 使用 Tailwind 標準類名
- [ ] 保持高對比度（無障礙）
- [ ] 實現響應式佈局
- [ ] 添加懸停/聚焦狀態
- [ ] 測試暗色主題顯示

### 視覺審查

發布前請檢查：

- [ ] 所有文字可讀性
- [ ] 按鈕與鏈接可點擊
- [ ] 間距與對齊一致
- [ ] 陰影與圓角統一
- [ ] 移動端顯示正常
- [ ] 無障礙標準符合

---

## 🎯 設計系統路線圖

### Phase 1: 基礎建設 ✅
- [x] 定義核心配色方案
- [x] 建立組件庫（ShadCN/UI）
- [x] 實現黑金主題
- [x] 創建設計文檔

### Phase 2: 組件擴展 🚧
- [ ] 創建自定義圖標集
- [ ] 設計動畫規範
- [ ] 建立間距系統
- [ ] 定義字體階層

### Phase 3: 進階功能 📅
- [ ] 主題切換功能
- [ ] 多配色方案
- [ ] 動態主題生成
- [ ] 品牌定制工具

### Phase 4: 生態系統 📅
- [ ] Figma 插件
- [ ] 設計資源網站
- [ ] 開發者文檔
- [ ] 社群分享

---

## 📖 延伸閱讀

### 設計靈感
- [Behance - Gaming UI](https://www.behance.net/search/projects?search=gaming%20ui)
- [Dribbble - Dark Theme](https://dribbble.com/tags/dark-theme)
- [Awwwards - Dark Mode](https://www.awwwards.com/websites/dark-mode/)

### 技術參考
- [Tailwind CSS 文檔](https://tailwindcss.com/docs)
- [ShadCN/UI 組件](https://ui.shadcn.com/)
- [WCAG 無障礙指南](https://www.w3.org/WAI/WCAG21/quickref/)

---

## 💡 貢獻指南

### 如何貢獻設計

1. **提出設計建議**
   - 在 GitHub Issues 中創建設計提案
   - 附上設計稿或參考圖片
   - 說明設計目標與預期效果

2. **提交設計資產**
   - Fork 項目
   - 在 `/docs/design/` 添加文檔
   - 提交 Pull Request

3. **設計審查流程**
   - 團隊審查設計提案
   - 討論實現可行性
   - 測試用戶體驗
   - 合併到主分支

---

## 📞 設計支持

如有設計相關問題，請：
1. 查閱本目錄的設計文檔
2. 參考 [主題轉換報告](./nomosx-theme-transformation.md)
3. 查看 `/styles/globals.css` 設計系統
4. 聯繫設計團隊

---

**最後更新**: 2025-10-22  
**維護者**: NomosX 設計團隊