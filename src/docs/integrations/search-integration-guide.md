# 🔍 搜索功能整合指南

> **最後更新**: 2025-10-22  
> **狀態**: ✅ 已實現  
> **組件**: SearchBar.tsx  
> **Edge Function**: search-games

---

## 📋 目錄

- [功能概覽](#功能概覽)
- [架構設計](#架構設計)
- [部署步驟](#部署步驟)
- [使用方式](#使用方式)
- [API 參考](#api-參考)
- [疑難排解](#疑難排解)

---

## 🎯 功能概覽

### 已實現功能

✅ **前端組件** (`/components/SearchBar.tsx`)
- 黑金主題 UI 設計
- 500ms Debounce 優化
- 實時搜索結果展示
- 加載狀態顯示
- 錯誤處理
- 響應式設計

✅ **後端 API** (`/supabase/functions/search-games/index.ts`)
- PGroonga 全文搜索
- CORS 支持
- 錯誤處理
- 格式化 JSON 響應

### 核心特性

| 特性 | 說明 |
|------|------|
| 🚀 實時搜索 | 輸入後 500ms 自動觸發搜索 |
| 🎨 黑金主題 | 與 NomosX 品牌風格一致 |
| 📱 響應式 | 支持桌面與移動端 |
| ⚡ 性能優化 | Debounce 減少 API 請求 |
| 🔐 安全 | CORS 正確配置 |

---

## 🏗️ 架構設計

### 數據流程圖

```
用戶輸入
    ↓
Debounce (500ms)
    ↓
SearchBar Component
    ↓
Edge Function: search-games
    ↓
Supabase RPC: search_games_pgroonga
    ↓
PGroonga 全文索引
    ↓
返回結果 (JSON)
    ↓
Popover 展示結果
```

### 組件結構

```
SearchBar.tsx
├── useDebounce Hook          # 延遲搜索觸發
├── GameSearchResult Interface # TypeScript 類型定義
├── SearchBar Component        # 主組件
│   ├── Input (ShadCN)        # 輸入框
│   ├── Popover (ShadCN)      # 結果彈窗
│   └── Separator (ShadCN)    # 分隔線
└── API 集成邏輯               # Fetch + 錯誤處理
```

---

## 🚀 部署步驟

### 1️⃣ 部署 Edge Function

#### 方法 A：使用 Supabase CLI（推薦）

```bash
# 確保已登入 Supabase CLI
supabase login

# 部署 search-games 函數
supabase functions deploy search-games

# 驗證部署
curl "https://oxjsfaivmtwlosakqqqa.supabase.co/functions/v1/search-games?q=test"
```

#### 方法 B：使用 Supabase Dashboard

1. 前往 **Supabase Dashboard** → **Edge Functions**
2. 點擊 **New Function** 或選擇 `search-games`
3. 貼上 `/supabase/functions/search-games/index.ts` 的內容
4. **關鍵設定**：
   - ✅ **JWT 驗證**: OFF（公開搜索）
   - ✅ **CORS**: 已在代碼中處理
5. 點擊 **Deploy**

### 2️⃣ 配置數據庫（如果尚未完成）

```sql
-- 創建 PGroonga 搜索函數
CREATE OR REPLACE FUNCTION search_games_pgroonga(query_text TEXT)
RETURNS TABLE (
  game_id UUID,
  name TEXT,
  slug TEXT,
  rank FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    id AS game_id,
    name,
    COALESCE(slug, lower(replace(name, ' ', '-'))) AS slug,
    pgroonga_score(tableoid, ctid) AS rank
  FROM games
  WHERE 
    name &@~ query_text
    AND is_archived = false
  ORDER BY rank DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;
```

### 3️⃣ 驗證 API 端點

```bash
# 測試搜索功能
curl "https://oxjsfaivmtwlosakqqqa.supabase.co/functions/v1/search-games?q=valorant"

# 預期響應
{
  "data": [
    {
      "game_id": "uuid-here",
      "name": "Valorant",
      "slug": "valorant",
      "rank": 1.5
    }
  ],
  "count": 1,
  "success": true
}
```

### 4️⃣ 前端集成（已自動完成）

SearchBar 組件已自動配置正確的 API URL：

```typescript
// ✅ 自動從 utils/supabase/info.tsx 讀取 projectId
const SEARCH_API_URL = `https://${projectId}.supabase.co/functions/v1/search-games`;
```

**無需手動配置！**

---

## 💻 使用方式

### 基本使用

#### 在任何頁面中添加搜索欄

```tsx
import { SearchBar } from './components/SearchBar';

function Header() {
  return (
    <header className="bg-gray-950 p-4">
      <div className="container mx-auto">
        <SearchBar />
      </div>
    </header>
  );
}
```

#### 在導航欄中使用

```tsx
import { SearchBar } from './components/SearchBar';

function Navbar() {
  return (
    <nav className="flex items-center justify-between p-4">
      <Logo />
      <SearchBar />
      <UserMenu />
    </nav>
  );
}
```

### 進階自定義

#### 修改搜索延遲時間

```tsx
// 在 SearchBar.tsx 中修改
const debouncedSearchTerm = useDebounce(searchTerm, 300); // 改為 300ms
```

#### 修改最大結果數

在 Edge Function 中修改：

```sql
-- 修改 LIMIT 10 為其他數值
LIMIT 20
```

#### 自定義結果顯示

```tsx
// 修改 SearchBar.tsx 中的渲染邏輯
<a href={`/game/${game.slug}`}>
  <div className="flex items-center gap-3">
    <img src={game.image_url} className="w-10 h-10 rounded" />
    <div>
      <span className="text-white">{game.name}</span>
      <span className="text-xs text-gray-500">{game.platform}</span>
    </div>
  </div>
</a>
```

---

## 📚 API 參考

### Edge Function: `search-games`

#### 端點

```
GET https://oxjsfaivmtwlosakqqqa.supabase.co/functions/v1/search-games
```

#### 請求參數

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `q` | string | ✅ | 搜索關鍵字 |

#### 響應格式

**成功響應 (200 OK)**

```json
{
  "data": [
    {
      "game_id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Valorant",
      "slug": "valorant",
      "rank": 1.5
    }
  ],
  "count": 1,
  "success": true
}
```

**錯誤響應 (400 Bad Request)**

```json
{
  "error": "Missing or empty search query (q)",
  "success": false
}
```

**錯誤響應 (500 Internal Server Error)**

```json
{
  "error": "Database query failed: ...",
  "success": false
}
```

#### TypeScript 類型

```typescript
interface GameSearchResult {
  game_id: string;
  name: string;
  slug: string;
  rank?: number;
}

interface SearchAPIResponse {
  data: GameSearchResult[];
  count: number;
  success: boolean;
  error?: string;
}
```

---

## 🔧 疑難排解

### 常見問題

#### 1. 搜索無結果

**症狀**: 輸入關鍵字後，顯示「沒有找到相關遊戲」

**解決方案**:
```sql
-- 檢查 games 表是否有數據
SELECT * FROM games WHERE is_archived = false LIMIT 5;

-- 檢查 PGroonga 索引
SELECT * FROM pg_indexes WHERE tablename = 'games';

-- 重建索引（如果需要）
REINDEX INDEX games_name_pgroonga_index;
```

#### 2. CORS 錯誤

**症狀**: 瀏覽器控制台顯示 CORS 錯誤

**解決方案**:
```typescript
// 確保 search-games/index.ts 包含 CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

// 確保處理 OPTIONS 請求
if (req.method === 'OPTIONS') {
  return new Response('ok', { headers: corsHeaders });
}
```

#### 3. API 404 錯誤

**症狀**: `fetch` 返回 404

**檢查清單**:
- ✅ Edge Function 是否已部署？
- ✅ URL 是否正確？
- ✅ projectId 是否正確？

**驗證方法**:
```bash
# 檢查 Edge Function 是否存在
curl -I "https://oxjsfaivmtwlosakqqqa.supabase.co/functions/v1/search-games"

# 應該返回 400（缺少參數），而不是 404
```

#### 4. 搜索速度慢

**症狀**: 搜索超過 2 秒才返回結果

**優化方案**:
```sql
-- 1. 檢查索引是否存在
SELECT * FROM pg_indexes WHERE tablename = 'games' AND indexname LIKE '%pgroonga%';

-- 2. 如果沒有索引，創建索引
CREATE INDEX IF NOT EXISTS games_name_pgroonga_index 
ON games USING pgroonga (name);

-- 3. 分析查詢性能
EXPLAIN ANALYZE 
SELECT * FROM games WHERE name &@~ 'valorant';
```

#### 5. TypeScript 類型錯誤

**症狀**: IDE 顯示類型錯誤

**解決方案**:
```typescript
// 確保正確導入類型
import type { GameSearchResult } from './components/SearchBar';

// 或在組件內部定義
interface GameSearchResult {
  game_id: string;
  name: string;
  slug: string;
}
```

---

## 📊 性能監控

### 關鍵指標

| 指標 | 目標值 | 測量方法 |
|------|--------|----------|
| 搜索延遲 | < 500ms | Network tab |
| API 響應時間 | < 200ms | Edge Function logs |
| Debounce 延遲 | 500ms | 代碼配置 |
| 最大結果數 | 10 | SQL LIMIT |

### 監控查詢

```sql
-- 查看最常搜索的關鍵字（需要日誌表）
SELECT search_term, COUNT(*) as count
FROM search_logs
GROUP BY search_term
ORDER BY count DESC
LIMIT 10;

-- 查看平均搜索性能
SELECT AVG(response_time_ms) as avg_response_time
FROM search_logs
WHERE created_at > NOW() - INTERVAL '24 hours';
```

---

## 🔐 安全考量

### 已實現的安全措施

✅ **輸入驗證**: 檢查空查詢
✅ **CORS 配置**: 允許所有來源（公開搜索）
✅ **SQL 注入防護**: 使用參數化查詢
✅ **結果限制**: LIMIT 10 防止大量數據返回
✅ **錯誤處理**: 不暴露內部錯誤細節

### 建議的額外措施

```typescript
// 1. 添加速率限制（如果需要）
// 在 Edge Function 中添加
const rateLimitKey = `search:${clientIp}:${Date.now() / 60000}`;
// 使用 KV Store 或 Redis 實現

// 2. 添加搜索日誌
await supabase
  .from('search_logs')
  .insert({
    search_term: query,
    user_id: userId || null,
    results_count: games.length
  });

// 3. 過濾敏感內容
const sanitizedQuery = query.replace(/[<>]/g, '');
```

---

## 📝 下一步優化

### 短期優化（1-2 週）

- [ ] 添加搜索歷史記錄
- [ ] 實現熱門搜索推薦
- [ ] 添加搜索建議（自動完成）
- [ ] 優化移動端 UI

### 中期優化（1-2 月）

- [ ] 實現多語言搜索
- [ ] 添加模糊搜索（拼寫糾正）
- [ ] 集成搜索分析（Google Analytics）
- [ ] 添加搜索過濾器（平台、地區）

### 長期優化（3-6 月）

- [ ] 機器學習排序優化
- [ ] 個性化搜索結果
- [ ] 語音搜索支持
- [ ] 圖像搜索功能

---

## 🔗 相關文檔

- [Supabase Edge Functions 文檔](https://supabase.com/docs/guides/functions)
- [PGroonga 文檔](https://pgroonga.github.io/)
- [ShadCN/UI Popover](https://ui.shadcn.com/docs/components/popover)
- [React Hooks 最佳實踐](https://react.dev/reference/react)

---

## 📞 支持

如有問題或建議，請：
1. 查閱本文檔的疑難排解章節
2. 查看 Edge Function 日誌
3. 聯繫項目維護者

---

**文檔版本**: v1.0  
**創建日期**: 2025-10-22  
**維護者**: NomosX 開發團隊
