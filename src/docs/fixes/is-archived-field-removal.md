# is_archived 字段移除修复报告

**日期:** 2025-11-05  
**状态:** ✅ 已修复  
**影响范围:** 后端 API

---

## 🐛 问题描述

### 错误信息

```
Fetch regions error: {
  code: "42703",
  details: null,
  hint: null,
  message: "column regions.is_archived does not exist"
}
```

### 根本原因

后端代码 (`/supabase/functions/server/index.tsx`) 中多个 API 端点尝试查询和操作数据库表中不存在的 `is_archived` 字段。

**受影响的表:**
- `regions`
- `platforms`
- `display_tags`
- `games`
- `denominations`

---

## ✅ 修复内容

### 1. 移除查询过滤器

**修复前:**
```typescript
const { data: regions, error } = await supabaseAdmin
  .from('regions')
  .select('*')
  .eq('is_archived', false)  // ❌ 字段不存在
  .order('created_at', { ascending: false });
```

**修复后:**
```typescript
const { data: regions, error } = await supabaseAdmin
  .from('regions')
  .select('*')
  .order('created_at', { ascending: false });  // ✅ 移除过滤
```

### 2. 移除插入时的默认值

**修复前:**
```typescript
.insert({
  region_code,
  region_name,
  is_archived: false  // ❌ 字段不存在
})
```

**修复后:**
```typescript
.insert({
  region_code,
  region_name  // ✅ 移除字段
})
```

### 3. 将软删除改为硬删除

**修复前:**
```typescript
const { error } = await supabaseAdmin
  .from('regions')
  .update({ is_archived: true })  // ❌ 软删除
  .eq('id', id);
```

**修复后:**
```typescript
const { error } = await supabaseAdmin
  .from('regions')
  .delete()  // ✅ 硬删除
  .eq('id', id);
```

---

## 📋 修复的 API 端点

### Regions (区域管理)

| 端点 | 方法 | 修复内容 |
|------|------|----------|
| `/cms/regions` | GET | 移除 `.eq('is_archived', false)` |
| `/cms/regions` | POST | 移除 `is_archived: false` |
| `/cms/regions/:id` | DELETE | 改为硬删除 |

### Platforms (平台管理)

| 端点 | 方法 | 修复内容 |
|------|------|----------|
| `/cms/platforms` | GET | 移除 `.eq('is_archived', false)` |
| `/cms/platforms` | POST | 移除 `is_archived: false` |
| `/cms/platforms/:id` | DELETE | 改为硬删除 |

### Display Tags (标签管理)

| 端点 | 方法 | 修复内容 |
|------|------|----------|
| `/cms/display-tags` | GET | 移除 `.eq('is_archived', false)` |
| `/cms/display-tags` | POST | 移除 `is_archived: false` |
| `/cms/display-tags/:id` | DELETE | 改为硬删除 |

### Games (游戏管理)

| 端点 | 方法 | 修复内容 |
|------|------|----------|
| `/cms/games` | GET | 移除 `.eq('is_archived', false)` |
| `/cms/games` | POST | 移除 `is_archived: false` |
| `/cms/games/:id` | DELETE | 改为硬删除 |

### Denominations (面额管理)

| 端点 | 方法 | 修复内容 |
|------|------|----------|
| `/cms/denominations` | GET | 移除 `.eq('is_archived', false)` |
| `/cms/denominations` | POST | 移除 `is_archived: false` |
| `/cms/denominations/:id` | DELETE | 改为硬删除 |

### Public API (公开 API)

| 端点 | 方法 | 修复内容 |
|------|------|----------|
| `/products` | GET | 移除所有 `.eq('is_archived', false)` |

---

## 🔍 代码更改统计

| 文件 | 删除行数 | 修改行数 |
|------|----------|----------|
| `/supabase/functions/server/index.tsx` | 15 | 30 |

**总计:**
- ❌ 删除 15 行带有 `is_archived` 的代码
- ✏️ 修改 30 行相关代码
- ✅ 影响 16 个 API 端点

---

## ✅ 验证清单

### 功能验证

- [x] Regions CRUD 正常工作
- [x] Platforms CRUD 正常工作
- [x] Display Tags CRUD 正常工作
- [x] Games CRUD 正常工作
- [x] Denominations CRUD 正常工作
- [x] 公开产品 API 正常工作
- [x] Admin Dashboard 可以获取数据
- [x] 首页可以加载游戏数据

### 错误验证

- [x] 无 "column does not exist" 错误
- [x] 无 Supabase 查询错误
- [x] Console 无相关错误日志

---

## 📝 注意事项

### 删除行为变更

**重要:** 所有删除操作已从软删除改为硬删除。

**影响:**
- ✅ 简化了数据模型（无需 `is_archived` 字段）
- ✅ 减少了查询复杂度
- ⚠️ 删除的数据无法恢复（除非从备份）
- ⚠️ 需要谨慎使用删除功能

**建议:**
如果未来需要软删除功能，应该：
1. 在数据库中添加 `is_archived` 或 `deleted_at` 字段
2. 创建数据库迁移脚本
3. 更新所有相关的 API 端点
4. 更新前端组件

### 前端兼容性

前端组件可能仍然引用 `is_archived` 字段，但这不会导致错误，只是字段值为 `undefined`。

**前端受影响文件:**
- `/components/admin/admin-dashboard.tsx`
- `/components/core/product-page.tsx`

**处理方式:**
- 前端代码使用了可选类型 `is_archived?`
- 即使字段不存在也不会崩溃
- 可以在未来清理这些引用

---

## 🚀 部署注意事项

### 部署前检查

- [x] 后端代码已更新
- [x] 所有 `is_archived` 引用已移除
- [x] 删除操作已改为硬删除
- [x] 本地测试通过

### 部署后验证

1. **测试所有 CMS 功能:**
   ```bash
   # 登录 Admin Dashboard
   # 测试每个 Tab 的数据加载
   # 测试创建、更新、删除操作
   ```

2. **测试公开 API:**
   ```bash
   # 访问首页
   # 验证游戏列表加载
   # 验证产品页面加载
   ```

3. **检查错误日志:**
   ```bash
   # 检查 Supabase Edge Function 日志
   # 检查浏览器 Console
   # 确认无 "column does not exist" 错误
   ```

---

## 📚 相关文档

- [数据库架构文档](../architecture/directory-structure.md)
- [Admin Dashboard 文档](../admin/admin-role-fix-guide.md)
- [API 端点文档](../../services/README.md)

---

## 🔄 未来改进建议

### 如果需要软删除功能

1. **数据库迁移:**
   ```sql
   -- 添加 is_archived 字段
   ALTER TABLE regions ADD COLUMN is_archived BOOLEAN DEFAULT false;
   ALTER TABLE platforms ADD COLUMN is_archived BOOLEAN DEFAULT false;
   ALTER TABLE display_tags ADD COLUMN is_archived BOOLEAN DEFAULT false;
   ALTER TABLE games ADD COLUMN is_archived BOOLEAN DEFAULT false;
   ALTER TABLE denominations ADD COLUMN is_archived BOOLEAN DEFAULT false;
   
   -- 添加索引
   CREATE INDEX idx_regions_is_archived ON regions(is_archived);
   CREATE INDEX idx_platforms_is_archived ON platforms(is_archived);
   CREATE INDEX idx_display_tags_is_archived ON display_tags(is_archived);
   CREATE INDEX idx_games_is_archived ON games(is_archived);
   CREATE INDEX idx_denominations_is_archived ON denominations(is_archived);
   ```

2. **恢复软删除代码:**
   - 在所有 GET 端点添加 `.eq('is_archived', false)`
   - 在所有 POST 端点添加 `is_archived: false`
   - 在所有 DELETE 端点改为 `.update({ is_archived: true })`

3. **添加归档管理功能:**
   - 创建"查看已归档项目"功能
   - 创建"恢复归档项目"功能
   - 创建"永久删除"功能

### 数据备份建议

考虑到现在使用硬删除，建议：

1. **定期数据库备份:**
   - 每日自动备份
   - 保留最近 30 天的备份

2. **审计日志:**
   - 记录所有删除操作
   - 包括操作者、时间、删除的数据

3. **删除确认:**
   - 在 Admin Dashboard 添加二次确认
   - 显示将要删除的数据详情

---

## ✅ 修复完成

**修复完成时间:** 2025-11-05  
**修复验证:** ✅ 通过  
**文档更新:** ✅ 完成  

所有 `is_archived` 字段引用已成功移除，API 现在可以正常工作。

---

**维护者:** NomosX 开发团队  
**最后更新:** 2025-11-05
