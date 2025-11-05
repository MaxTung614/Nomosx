-- =====================================================================
-- Phase 5: 系統優化 - 數據結構精煉 SQL 遷移腳本
-- =====================================================================
-- 執行說明：
-- 1. 登入 Supabase Dashboard
-- 2. 前往 SQL Editor
-- 3. 複製並執行此腳本
-- 4. 執行完成後，通知開發團隊更新應用代碼
-- =====================================================================

-- =====================================================================
-- PART 1: 創建 games 遊戲清單表格
-- =====================================================================

-- 創建 games 表格
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  region_code TEXT NOT NULL,
  description TEXT,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 為 games 表格添加註釋
COMMENT ON TABLE games IS '遊戲清單主表 - 存儲所有遊戲的基本資訊';
COMMENT ON COLUMN games.id IS '主鍵 UUID';
COMMENT ON COLUMN games.name IS '遊戲名稱（唯一）';
COMMENT ON COLUMN games.region_code IS '區域代碼（如 TW, US, JP）';
COMMENT ON COLUMN games.description IS '遊戲描述（可選）';
COMMENT ON COLUMN games.is_archived IS '軟刪除標記 - true 表示已歸檔';
COMMENT ON COLUMN games.created_at IS '創建時間';
COMMENT ON COLUMN games.updated_at IS '最後更新時間';

-- 創建 games 表格的索引
CREATE INDEX IF NOT EXISTS idx_games_name ON games(name);
CREATE INDEX IF NOT EXISTS idx_games_region_code ON games(region_code);
CREATE INDEX IF NOT EXISTS idx_games_is_archived ON games(is_archived);

-- 為 games 表格創建 updated_at 自動更新觸發器
CREATE OR REPLACE FUNCTION update_games_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_games_updated_at
  BEFORE UPDATE ON games
  FOR EACH ROW
  EXECUTE FUNCTION update_games_updated_at();

-- =====================================================================
-- PART 2: 更新 denominations 產品面額表格
-- =====================================================================

-- 添加新欄位到 denominations 表格
ALTER TABLE denominations 
  ADD COLUMN IF NOT EXISTS game_id UUID,
  ADD COLUMN IF NOT EXISTS sku_code TEXT,
  ADD COLUMN IF NOT EXISTS is_available BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT false;

-- 添加外鍵約束：denominations.game_id -> games.id
ALTER TABLE denominations
  DROP CONSTRAINT IF EXISTS fk_denominations_game_id;

ALTER TABLE denominations
  ADD CONSTRAINT fk_denominations_game_id
  FOREIGN KEY (game_id)
  REFERENCES games(id)
  ON DELETE SET NULL;

-- 添加 sku_code 唯一約束
ALTER TABLE denominations
  DROP CONSTRAINT IF EXISTS uq_denominations_sku_code;

ALTER TABLE denominations
  ADD CONSTRAINT uq_denominations_sku_code
  UNIQUE (sku_code);

-- 為 denominations 新增欄位添加註釋
COMMENT ON COLUMN denominations.game_id IS '關聯的遊戲 ID（外鍵）';
COMMENT ON COLUMN denominations.sku_code IS '產品 SKU 代碼（唯一）';
COMMENT ON COLUMN denominations.is_available IS '產品可用性標記 - false 表示暫時下架';
COMMENT ON COLUMN denominations.is_archived IS '軟刪除標記 - true 表示已歸檔';

-- 為 denominations 表格的外鍵創建索引
CREATE INDEX IF NOT EXISTS idx_denominations_game_id ON denominations(game_id);
CREATE INDEX IF NOT EXISTS idx_denominations_sku_code ON denominations(sku_code);
CREATE INDEX IF NOT EXISTS idx_denominations_is_available ON denominations(is_available);
CREATE INDEX IF NOT EXISTS idx_denominations_is_archived ON denominations(is_archived);

-- =====================================================================
-- PART 3: 為現有表格添加軟刪除欄位（如果需要）
-- =====================================================================

-- 為 regions 表格添加軟刪除
ALTER TABLE regions 
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_regions_is_archived ON regions(is_archived);

COMMENT ON COLUMN regions.is_archived IS '軟刪除標記 - true 表示已歸檔';

-- 為 platforms 表格添加軟刪除
ALTER TABLE platforms 
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_platforms_is_archived ON platforms(is_archived);

COMMENT ON COLUMN platforms.is_archived IS '軟刪除標記 - true 表示已歸檔';

-- 為 display_tags 表格添加軟刪除
ALTER TABLE display_tags 
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_display_tags_is_archived ON display_tags(is_archived);

COMMENT ON COLUMN display_tags.is_archived IS '軟刪除標記 - true 表示已歸檔';

-- =====================================================================
-- PART 4: 為所有外鍵創建 B-tree 索引（性能優化）
-- =====================================================================

-- 為 orders 表格的外鍵創建索引
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_denomination_id ON orders(denomination_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- 為 audit_logs 表格的外鍵創建索引
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- 為 payment_transactions 表格創建索引（如果存在）
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_payment_provider ON payment_transactions(payment_provider);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON payment_transactions(created_at);

-- =====================================================================
-- PART 5: 創建有用的複合索引（進階性能優化）
-- =====================================================================

-- denominations: 常用查詢組合索引
CREATE INDEX IF NOT EXISTS idx_denominations_available_not_archived 
  ON denominations(is_available, is_archived) 
  WHERE is_archived = false;

-- orders: 用戶訂單查詢優化
CREATE INDEX IF NOT EXISTS idx_orders_user_status 
  ON orders(user_id, status, created_at DESC);

-- games: 區域 + 未歸檔查詢優化
CREATE INDEX IF NOT EXISTS idx_games_region_active 
  ON games(region_code, is_archived) 
  WHERE is_archived = false;

-- =====================================================================
-- PART 6: 數據完整性檢查與清理（可選）
-- =====================================================================

-- 檢查是否有 denominations 記錄沒有關聯到有效的 game
-- 執行前請先確保已有適當的數據遷移策略
-- SELECT COUNT(*) FROM denominations WHERE game_id IS NULL;

-- =====================================================================
-- PART 7: 權限設定（RLS 政策）
-- =====================================================================

-- 啟用 games 表格的 Row Level Security
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- 允許所有人讀取未歸檔的遊戲
CREATE POLICY "Public read access for active games"
  ON games
  FOR SELECT
  USING (is_archived = false);

-- 只允許 admin 和 cs 用戶進行 INSERT/UPDATE/DELETE
CREATE POLICY "Admin and CS can manage games"
  ON games
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (
        auth.users.raw_user_meta_data->>'role' = 'admin'
        OR auth.users.raw_user_meta_data->>'role' = 'cs'
      )
    )
  );

-- 更新 denominations RLS 政策（如果需要調整）
-- 注意：這裡假設 denominations 已經有 RLS 啟用
DROP POLICY IF EXISTS "Public read access for available denominations" ON denominations;

CREATE POLICY "Public read access for available denominations"
  ON denominations
  FOR SELECT
  USING (is_available = true AND is_archived = false);

-- =====================================================================
-- PART 8: 創建實用的 View（可選）
-- =====================================================================

-- 創建一個 View 用於顯示活躍的遊戲和面額
CREATE OR REPLACE VIEW v_active_products AS
SELECT 
  g.id AS game_id,
  g.name AS game_name,
  g.region_code,
  g.description AS game_description,
  d.id AS denomination_id,
  d.sku_code,
  d.name AS denomination_name,
  d.display_price,
  d.cost_price,
  d.is_available
FROM games g
INNER JOIN denominations d ON d.game_id = g.id
WHERE g.is_archived = false 
  AND d.is_archived = false;

COMMENT ON VIEW v_active_products IS '活躍產品視圖 - 顯示所有未歸檔且可用的遊戲和面額';

-- =====================================================================
-- 執行完成檢查清單
-- =====================================================================
-- [ ] games 表格已創建
-- [ ] denominations 表格已更新（game_id, sku_code, is_archived 欄位）
-- [ ] 所有索引已創建
-- [ ] RLS 政策已設定
-- [ ] View 已創建
-- [ ] 通知開發團隊更新應用代碼

-- =====================================================================
-- 結束
-- =====================================================================
