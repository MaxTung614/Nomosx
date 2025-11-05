# Admin Dashboard 搜索、排序與導出功能

**版本：** 1.0  
**發布日期：** 2025-10-22  
**功能類型：** 核心功能增強

---

## 📋 功能概述

為 Admin Dashboard 的所有主要列表（訂單、遊戲、產品面額）實現了三大核心功能：

1. **全局搜索** - 快速篩選和定位數據
2. **列排序** - 靈活的數據排序
3. **CSV 導出** - 完整數據導出

---

## 🔍 搜索功能

### 實現方式
- 客戶端模糊搜索（LIKE 查詢邏輯）
- 實時搜索反饋
- 自動重置分頁到第一頁

### 各列表搜索欄位

#### 訂單管理 (Orders)
搜索以下欄位：
- `customer_email` - 客戶信箱
- `game_login_username` - 遊戲帳號
- `id` - 訂單 ID
- `denominations.name` - 產品名稱

**搜索框提示：** 「搜索訂單 ID、客戶信箱、遊戲帳號或產品名稱...」

#### 遊戲管理 (Games)
搜索以下欄位：
- `name` - 遊戲名稱
- `code` - 遊戲代碼
- `description` - 遊戲描述

**搜索框提示：** 「搜索遊戲名稱、代碼或描述...」

#### 產品面額管理 (Denominations)
搜索以下欄位：
- `name` - 面額名稱
- `sku_code` - SKU 代碼
- `game_name` - 關聯遊戲名稱（通過 game_id 解析）
- `platform_name` - 關聯平台名稱（通過 platform_id 解析）

**搜索框提示：** 「搜索面額名稱、SKU 代碼、遊戲或平台...」

### 技術實現

```typescript
const filterOrders = (orders: Order[], query: string): Order[] => {
  if (!query.trim()) return orders
  const lowerQuery = query.toLowerCase()
  return orders.filter(order => 
    order.customer_email.toLowerCase().includes(lowerQuery) ||
    order.game_login_username.toLowerCase().includes(lowerQuery) ||
    order.id.toLowerCase().includes(lowerQuery) ||
    order.denominations?.name?.toLowerCase().includes(lowerQuery)
  )
}
```

### 用戶體驗
- **搜索後無結果：** 顯示 「沒有符合搜索條件的[列表名稱]」
- **清空搜索：** 清空輸入框立即恢復完整列表
- **分頁重置：** 搜索時自動回到第一頁

---

## 🔀 排序功能

### 實現方式
- 點擊列標題進行排序
- 支持升序 (ASC) 和降序 (DESC)
- 視覺指示器顯示當前排序狀態

### 各列表可排序欄位

#### 訂單管理 (Orders)
- ✅ **客戶信箱** (customer_email) - 字母排序
- ✅ **數量** (quantity) - 數字排序
- ✅ **總價** (total_price) - 數字排序
- ✅ **支付狀態** (payment_status) - 字母排序
- ✅ **履行狀態** (fulfillment_status) - 字母排序
- ✅ **創建時間** (created_at) - 日期排序 **(默認：降序)**

#### 遊戲管理 (Games)
- ✅ **遊戲名稱** (name) - 字母排序
- ✅ **代碼** (code) - 字母排序
- ✅ **建立時間** (created_at) - 日期排序 **(默認：降序)**

#### 產品面額管理 (Denominations)
- ✅ **面額名稱** (name) - 字母排序
- ✅ **價格 (USD)** (display_price) - 數字排序
- ✅ **成本** (cost_price) - 數字排序
- ✅ **創建時間** (created_at) - 日期排序 **(默認：降序)**

### 排序邏輯

```typescript
const sortData = <T extends Record<string, any>>(
  data: T[], 
  sortBy: string, 
  sortOrder: 'asc' | 'desc'
): T[] => {
  return [...data].sort((a, b) => {
    let aValue = a[sortBy]
    let bValue = b[sortBy]

    // Handle null/undefined
    if (aValue == null) return 1
    if (bValue == null) return -1

    // String comparison
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }

    // Number comparison
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
    }

    // Date comparison
    if (aValue instanceof Date || bValue instanceof Date) {
      const dateA = new Date(aValue).getTime()
      const dateB = new Date(bValue).getTime()
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
    }

    return 0
  })
}
```

### 視覺指示器

| 狀態 | 圖標 | 說明 |
|------|------|------|
| 未排序 | <ArrowUpDown /> | 半透明圖標，可點擊排序 |
| 升序排序 | <ArrowUp /> | 實心向上箭頭 |
| 降序排序 | <ArrowDown /> | 實心向下箭頭 |

### 交互行為
1. **首次點擊：** 按該列降序排序（最新/最大在前）
2. **再次點擊：** 切換為升序排序
3. **點擊其他列：** 新列降序排序，原列恢復未排序狀態

---

## 📥 CSV 導出功能

### 實現方式
- 一鍵導出為 CSV 文件
- **尊重搜索過濾**（僅導出篩選後的數據）
- **忽略分頁限制**（導出所有符合條件的數據）
- UTF-8 BOM 編碼（Excel 正確顯示中文）

### 各列表導出欄位

#### 訂單管理 (Orders)
導出 12 個欄位：
1. 訂單 ID (id)
2. 客戶信箱 (customer_email)
3. 遊戲帳號 (game_login_username)
4. 產品 (denominations.name)
5. 數量 (quantity)
6. 總價 (USD) (total_price)
7. 支付狀態 (payment_status)
8. 履行狀態 (fulfillment_status)
9. 創建時間 (created_at)
10. 支付時間 (paid_at)
11. 履行時間 (fulfilled_at)
12. 履行備註 (fulfillment_notes)

**文件名格式：** `orders_2025-10-22.csv`

#### 遊戲管理 (Games)
導出 8 個欄位：
1. 遊戲 ID (id)
2. 遊戲名稱 (name)
3. 代碼 (code)
4. 區域代碼 (region_code)
5. 描述 (description)
6. 已歸檔 (is_archived)
7. 創建時間 (created_at)
8. 更新時間 (updated_at)

**文件名格式：** `games_2025-10-22.csv`

#### 產品面額管理 (Denominations)
導出 13 個欄位：
1. 產品 ID (id)
2. 面額名稱 (name)
3. 遊戲 (game_name - 已解析)
4. 平台 (platform_name - 已解析)
5. 促銷標籤 (display_tag_name - 已解析)
6. 價格 (USD) (display_price)
7. 成本 (cost_price)
8. SKU 代碼 (sku_code)
9. 可購買 (is_available)
10. 已歸檔 (is_archived)
11. 描述 (description)
12. 創建時間 (created_at)
13. 更新時間 (updated_at)

**文件名格式：** `denominations_2025-10-22.csv`

### CSV 導出邏輯

```typescript
const exportToCSV = (data: any[], filename: string, headers: { key: string; label: string }[]) => {
  // Create CSV header row
  const headerRow = headers.map(h => escapeCSV(h.label)).join(',')
  
  // Create data rows
  const dataRows = data.map(row => {
    return headers.map(header => {
      let value = row[header.key]
      
      // Handle nested properties (e.g., denominations.name)
      if (header.key.includes('.')) {
        const keys = header.key.split('.')
        value = keys.reduce((obj, key) => obj?.[key], row)
      }
      
      // Format dates
      if (value instanceof Date || (typeof value === 'string' && header.key.includes('_at'))) {
        value = new Date(value).toLocaleString('zh-TW')
      }
      
      return escapeCSV(value)
    }).join(',')
  })

  // Combine and download
  const csv = [headerRow, ...dataRows].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  // ... download logic
}
```

### CSV 格式處理
- **逗號轉義：** 包含逗號的值用雙引號包裹
- **引號轉義：** 雙引號轉義為兩個雙引號 (`""`)
- **日期格式化：** 所有日期字段格式化為 `YYYY/MM/DD HH:mm:ss`
- **UTF-8 BOM：** 添加 `\uFEFF` 確保 Excel 正確識別中文

### 用戶反饋
- **成功提示：** `已導出 X 條記錄到 CSV 文件`（使用 toast）
- **自動下載：** 瀏覽器自動觸發文件下載
- **文件命名：** 包含列表類型和當前日期

---

## 🎯 功能整合

### 數據處理管道

**訂單列表處理流程：**
```
原始數據 (orders)
  ↓
篩選 (filterOrders)
  ↓
排序 (sortData)
  ↓
分頁 (paginateData)
  ↓
渲染 (Table)
```

**CSV 導出處理流程：**
```
原始數據 (orders)
  ↓
篩選 (filterOrders) ✅
  ↓
跳過分頁 ❌
  ↓
格式化 (exportToCSV)
  ↓
下載 (Browser Download)
```

### 狀態管理

```typescript
// Search states
const [ordersSearchQuery, setOrdersSearchQuery] = useState('')
const [gamesSearchQuery, setGamesSearchQuery] = useState('')
const [denominationsSearchQuery, setDenominationsSearchQuery] = useState('')

// Sort states
const [ordersSortBy, setOrdersSortBy] = useState<string>('created_at')
const [ordersSortOrder, setOrdersSortOrder] = useState<'asc' | 'desc'>('desc')
const [gamesSortBy, setGamesSortBy] = useState<string>('created_at')
const [gamesSortOrder, setGamesSortOrder] = useState<'asc' | 'desc'>('desc')
const [denominationsSortBy, setDenominationsSortBy] = useState<string>('created_at')
const [denominationsSortOrder, setDenominationsSortOrder] = useState<'asc' | 'desc'>('desc')
```

---

## 📱 UI/UX 設計

### 搜索框設計
```tsx
<div className="relative">
  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
  <Input
    placeholder="搜索訂單 ID、客戶信箱、遊戲帳號或產品名稱..."
    value={ordersSearchQuery}
    onChange={(e) => {
      setOrdersSearchQuery(e.target.value)
      setOrdersCurrentPage(1) // Reset to first page
    }}
    className="pl-10"
  />
</div>
```

**特性：**
- 左側搜索圖標
- 清晰的佔位符文字
- 響應式輸入

### 排序列標題設計
```tsx
<TableHead 
  className="cursor-pointer hover:bg-muted/50"
  onClick={() => handleSort(ordersSortBy, ordersSortOrder, 'total_price', setOrdersSortBy, setOrdersSortOrder)}
>
  <div className="flex items-center">
    總價
    {renderSortIcon('total_price', ordersSortBy, ordersSortOrder)}
  </div>
</TableHead>
```

**特性：**
- 懸停時背景高亮
- 鼠標指針變為手型
- 排序圖標緊貼文字

### 導出按鈕設計
```tsx
<Button variant="outline" onClick={exportOrders}>
  <Download className="h-4 w-4 mr-2" />
  導出 CSV
</Button>
```

**特性：**
- Outline 樣式（不搶焦點）
- 下載圖標
- 與其他操作按鈕對齊

---

## 🚀 性能優化

### 客戶端處理優勢
- **快速響應：** 無需服務器請求
- **即時反饋：** 搜索和排序即時生效
- **減少服務器負載：** 所有操作在客戶端完成

### 數據量考量
- **當前限制：** 每個列表最多 100 條記錄（loadOrders 默認）
- **適用場景：** 中小型數據集（< 1000 條）
- **未來優化：** 如需處理大數據集，可改為服務器端搜索和排序

### 內存使用
- **篩選和排序：** 創建數組副本，不修改原數據
- **CSV 導出：** 一次性加載到內存，適合當前數據量

---

## ✅ 測試建議

### 搜索功能測試
1. **基礎搜索**
   - [ ] 輸入關鍵字能正確篩選數據
   - [ ] 清空搜索框恢復完整列表
   - [ ] 無結果時顯示提示信息

2. **特殊字符**
   - [ ] 搜索包含特殊字符的內容（@, #, -, _）
   - [ ] 搜索部分 UUID（訂單 ID）
   - [ ] 大小寫不敏感

3. **分頁交互**
   - [ ] 搜索後自動回到第一頁
   - [ ] 分頁數量根據搜索結果更新
   - [ ] 清空搜索後分頁恢復

### 排序功能測試
1. **排序邏輯**
   - [ ] 點擊列標題觸發排序
   - [ ] 首次點擊降序排序
   - [ ] 再次點擊切換為升序
   - [ ] 點擊其他列重置原列

2. **數據類型**
   - [ ] 字符串排序正確（中文、英文、數字混合）
   - [ ] 數字排序正確（整數、小數）
   - [ ] 日期排序正確（最新/最舊）

3. **視覺反饋**
   - [ ] 排序圖標正確顯示
   - [ ] 懸停時列標題高亮
   - [ ] 當前排序列有視覺區分

### CSV 導出測試
1. **導出內容**
   - [ ] 所有欄位正確導出
   - [ ] 日期格式化正確
   - [ ] 中文顯示正確（UTF-8 BOM）
   - [ ] 嵌套欄位正確解析（如 denominations.name）

2. **篩選整合**
   - [ ] 搜索後導出僅包含篩選結果
   - [ ] 清空搜索後導出包含所有數據
   - [ ] 數據量提示正確（toast 顯示記錄數）

3. **文件格式**
   - [ ] 文件名包含日期
   - [ ] CSV 格式正確（Excel 可打開）
   - [ ] 逗號和引號正確轉義
   - [ ] 換行符處理正確

### 整合測試
1. **組合操作**
   - [ ] 搜索 + 排序
   - [ ] 搜索 + 分頁
   - [ ] 搜索 + 排序 + 導出
   - [ ] 切換標籤保留各自狀態

2. **邊界情況**
   - [ ] 空數據集
   - [ ] 單條記錄
   - [ ] 大量記錄（接近限制）
   - [ ] 特殊字符在所有功能中正常工作

---

## 📚 使用指南

### 管理員操作流程

#### 搜索訂單
1. 進入「訂單管理」標籤
2. 在搜索框輸入關鍵字（信箱、帳號、訂單 ID）
3. 查看實時篩選結果
4. 點擊訂單查看詳情

#### 排序數據
1. 點擊任意可排序的列標題
2. 觀察排序圖標變化
3. 再次點擊切換排序方向
4. 點擊其他列更改排序依據

#### 導出 CSV
1. （可選）使用搜索篩選需要的數據
2. 點擊「導出 CSV」按鈕
3. 等待文件自動下載
4. 使用 Excel 或其他工具打開 CSV 文件

---

## 🔮 未來增強建議

### 短期（1-2 週）
1. ✅ 添加高級篩選器（下拉選單篩選狀態）
2. ✅ 保存搜索和排序偏好到 localStorage
3. ✅ 添加「清除所有篩選」按鈕

### 中期（1 個月）
1. ✅ 服務器端搜索和排序（處理大數據集）
2. ✅ 支持導出為 Excel 格式 (.xlsx)
3. ✅ 自定義導出欄位選擇

### 長期（3 個月）
1. ✅ 保存的搜索條件（命名搜索）
2. ✅ 搜索歷史記錄
3. ✅ 批量導出多個列表

---

## 🐛 已知限制

1. **客戶端搜索**
   - 僅搜索當前已加載的數據
   - 如果訂單超過 100 條，未加載的訂單不會被搜索

2. **排序精度**
   - 中文排序使用 `localeCompare`，可能不完全符合筆畫順序

3. **CSV 格式**
   - 某些 Excel 版本可能需要手動設置編碼
   - 複雜的嵌套結構需要手動展平

---

## 📞 支持

如有問題或建議，請參考：
- **測試清單：** `/docs/testing/admin-testing-checklist.md`
- **UX 優化報告：** `/docs/admin/admin-ux-improvements.md`
- **文檔索引：** `/docs/README.md`

---

**文檔版本：** 1.0  
**創建日期：** 2025-10-22  
**最後更新：** 2025-10-22  
**作者：** AI Assistant
