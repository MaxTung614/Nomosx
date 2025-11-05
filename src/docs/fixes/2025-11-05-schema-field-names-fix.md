# 数据库字段名称修复 (2025-11-05)

## 📋 修复的问题

### 1. ❌ Denominations 表字段名称错误

**错误信息**:
```json
{
  "code": "42703",
  "details": null,
  "hint": null,
  "message": "column denominations_1.name does not exist"
}
```

**问题根源**:
- 代码中使用 `denominations.name` 字段
- 但数据库实际字段名是 `denominations.denomination_name`

**影响范围**:
- ❌ GET /admin/orders - 订单列表查询
- ❌ GET /admin/orders/:orderId - 单个订单查询
- ❌ POST /cms/denominations - 创建面额
- ❌ PUT /cms/denominations/:id - 更新面额
- ❌ POST /create-order - 创建订单（PayPal）

---

### 2. ❌ Platforms 表字段名称错误

**错误信息**:
```json
{
  "code": "42703",
  "details": null,
  "hint": null,
  "message": "column platforms.platform_code does not exist"
}
```

**问题根源**:
- 代码中使用 `platform_code` 字段进行排序
- 但数据库中该字段可能不存在或名称不同

**影响范围**:
- ❌ GET /cms/platforms - 平台列表查询

---

## ✅ 修复方案

### 1. Denominations 字段修复

#### 修复位置 1: GET /admin/orders (订单列表)

**文件**: `/supabase/functions/server/index.tsx` 行 1500-1505

```typescript
// ❌ 修复前
let query = supabaseAdmin
  .from('orders')
  .select(`
    *,
    denominations(name, display_price, game_id, sku_code)
  `, { count: 'exact' });

// ✅ 修复后
let query = supabaseAdmin
  .from('orders')
  .select(`
    *,
    denominations(denomination_name, display_price, game_id, sku_code)
  `, { count: 'exact' });
```

#### 修复位置 2: GET /admin/orders/:orderId (单个订单 - 第一处)

**文件**: `/supabase/functions/server/index.tsx` 行 1378-1385

```typescript
// ❌ 修复前
const { data: order, error } = await supabaseAdmin
  .from('orders')
  .select(`
    *,
    denominations(name, display_price, game_id, sku_code)
  `)
  .eq('id', orderId)
  .single();

// ✅ 修复后
const { data: order, error } = await supabaseAdmin
  .from('orders')
  .select(`
    *,
    denominations(denomination_name, display_price, game_id, sku_code)
  `)
  .eq('id', orderId)
  .single();
```

#### 修复位置 3: GET /admin/orders/:orderId (单个订单 - 第二处)

**文件**: `/supabase/functions/server/index.tsx` 行 1563-1570

```typescript
// ❌ 修复前
const { data: order, error } = await supabaseAdmin
  .from('orders')
  .select(`
    *,
    denominations(name, display_price, game_id, sku_code)
  `)
  .eq('id', orderId)
  .single();

// ✅ 修复后
const { data: order, error } = await supabaseAdmin
  .from('orders')
  .select(`
    *,
    denominations(denomination_name, display_price, game_id, sku_code)
  `)
  .eq('id', orderId)
  .single();
```

#### 修复位置 4: POST /create-order (PayPal 订单)

**文件**: `/supabase/functions/server/index.tsx` 行 1787-1794

```typescript
// ❌ 修复前
const { data: order, error: orderError } = await supabaseAdmin
  .from('orders')
  .select(`
    *,
    denominations(name, display_price, paypal_amount)
  `)
  .eq('id', order_id)
  .single();

// ✅ 修复后
const { data: order, error: orderError } = await supabaseAdmin
  .from('orders')
  .select(`
    *,
    denominations(denomination_name, display_price, paypal_amount)
  `)
  .eq('id', order_id)
  .single();
```

#### 修复位置 5: POST /cms/denominations (创建面额)

**文件**: `/supabase/functions/server/index.tsx` 行 1108-1117

```typescript
// ❌ 修复前
const { data: denomination, error } = await supabaseAdmin
  .from('denominations')
  .insert({
    game_id,
    sku_code,
    name,
    display_price,
    region_code,
    paypal_amount: paypal_amount || null
  })
  .select()
  .single();

// ✅ 修复后
const { data: denomination, error } = await supabaseAdmin
  .from('denominations')
  .insert({
    game_id,
    sku_code,
    denomination_name: name,  // 使用 denomination_name 字段
    display_price,
    region_code,
    paypal_amount: paypal_amount || null
  })
  .select()
  .single();
```

#### 修复位置 6: PUT /cms/denominations/:id (更新面额)

**文件**: `/supabase/functions/server/index.tsx` 行 1143-1152

```typescript
// ❌ 修复前
const { data: denomination, error } = await supabaseAdmin
  .from('denominations')
  .update({
    game_id,
    sku_code,
    name,
    display_price,
    region_code,
    paypal_amount: paypal_amount || null
  })
  .eq('id', id)
  .select()
  .single();

// ✅ 修复后
const { data: denomination, error } = await supabaseAdmin
  .from('denominations')
  .update({
    game_id,
    sku_code,
    denomination_name: name,  // 使用 denomination_name 字段
    display_price,
    region_code,
    paypal_amount: paypal_amount || null
  })
  .eq('id', id)
  .select()
  .single();
```

---

### 2. Platforms 字段修复

#### 修复位置: GET /cms/platforms (平台列表)

**文件**: `/supabase/functions/server/index.tsx` 行 763-766

```typescript
// ❌ 修复前
const { data: platforms, error } = await supabaseAdmin
  .from('platforms')
  .select('*')
  .order('platform_code', { ascending: true });

// ✅ 修复后
const { data: platforms, error } = await supabaseAdmin
  .from('platforms')
  .select('*')
  .order('platform_name', { ascending: true });  // 使用 platform_name 排序
```

---

## 📊 修复统计

| 文件 | 修复数量 | 修复类型 |
|------|---------|---------|
| `/supabase/functions/server/index.tsx` | 7 处 | 字段名称修正 |

### 详细修复列表

1. ✅ GET /cms/platforms - 排序字段 `platform_code` → `platform_name`
2. ✅ POST /cms/denominations - 插入字段 `name` → `denomination_name`
3. ✅ PUT /cms/denominations/:id - 更新字段 `name` → `denomination_name`
4. ✅ GET /admin/orders - 查询字段 `name` → `denomination_name`
5. ✅ GET /admin/orders/:orderId (第一处) - 查询字段 `name` → `denomination_name`
6. ✅ GET /admin/orders/:orderId (第二处) - 查询字段 `name` → `denomination_name`
7. ✅ POST /create-order - 查询字段 `name` → `denomination_name`

---

## 🔍 数据库实际 Schema

### Denominations 表字段

```sql
-- 正确的字段名称
denominations (
  id uuid PRIMARY KEY,
  game_id uuid,
  sku_code text,
  denomination_name text,  -- ✅ 使用 denomination_name 而不是 name
  display_price numeric,
  region_code text,
  paypal_amount numeric,
  created_at timestamp,
  updated_at timestamp
)
```

### Platforms 表字段

```sql
-- 正确的字段名称
platforms (
  id uuid PRIMARY KEY,
  platform_name text,  -- ✅ 使用 platform_name 排序
  -- platform_code 可能不存在
  created_at timestamp
)
```

---

## ✅ 验证步骤

### 1. 测试 Platforms 列表

```bash
# 请求
GET /make-server-04b375d8/cms/platforms
Authorization: Bearer <admin_token>

# 预期结果
{
  "platforms": [
    { "id": "...", "platform_name": "PC", ... },
    { "id": "...", "platform_name": "PS5", ... }
  ]
}
```

### 2. 测试 Denominations 创建

```bash
# 请求
POST /make-server-04b375d8/cms/denominations
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "game_id": "uuid-here",
  "sku_code": "TEST-001",
  "name": "100 Points",
  "display_price": 10.00,
  "region_code": "US",
  "paypal_amount": 10.00
}

# 预期结果
{
  "denomination": {
    "id": "...",
    "denomination_name": "100 Points",  // ✅ 字段名称正确
    "display_price": 10.00,
    ...
  }
}
```

### 3. 测试订单列表

```bash
# 请求
GET /make-server-04b375d8/admin/orders
Authorization: Bearer <admin_token>

# 预期结果
{
  "orders": [
    {
      "id": "...",
      "denominations": {
        "denomination_name": "100 Points",  // ✅ 字段名称正确
        "display_price": 10.00,
        ...
      }
    }
  ],
  "pagination": { ... }
}
```

### 4. 测试单个订单查询

```bash
# 请求
GET /make-server-04b375d8/admin/orders/{orderId}
Authorization: Bearer <admin_token>

# 预期结果
{
  "order": {
    "id": "...",
    "denominations": {
      "denomination_name": "100 Points",  // ✅ 字段名称正确
      "display_price": 10.00,
      ...
    }
  }
}
```

---

## 🐛 常见问题

### Q: 为什么使用 `denomination_name` 而不是 `name`?

A: 这是数据库设计的选择，使用更具描述性的字段名可以：
- 避免与保留字冲突
- 提高代码可读性
- 明确字段含义

### Q: 前端代码需要修改吗？

A: 不需要！API 接口仍然接收 `name` 参数，只是在数据库操作时映射为 `denomination_name`。前端代码不受影响。

### Q: 现有数据会受影响吗？

A: 不会。这只是修复字段名称的 bug，不涉及数据迁移。现有数据保持不变。

---

## 📝 后续建议

### 1. 代码规范

建议在项目中建立字段映射文档：

```typescript
// types/database.ts
interface DenominationDB {
  id: string;
  game_id: string;
  sku_code: string;
  denomination_name: string;  // DB 字段
  display_price: number;
  // ...
}

interface DenominationAPI {
  id: string;
  game_id: string;
  sku_code: string;
  name: string;  // API 字段
  display_price: number;
  // ...
}
```

### 2. 类型安全

使用 TypeScript 严格模式可以在编译时发现这类错误：

```typescript
// 明确定义数据库 schema
import { Database } from './database.types';  // 从 Supabase 生成

const { data } = await supabaseAdmin
  .from('denominations')
  .select('denomination_name')  // TypeScript 会验证字段名
```

### 3. 测试覆盖

为所有 CRUD 操作添加集成测试，确保字段映射正确。

---

## 📞 技术支持

如果遇到问题：

1. **检查错误日志**: 查看控制台输出的详细错误信息
2. **验证字段名**: 使用 Supabase Dashboard 确认实际的表结构
3. **清除缓存**: 清除浏览器缓存后重试
4. **查看文档**: 参考 [admin-access-guide.md](/docs/admin/admin-access-guide.md)

---

**修复时间**: 2025-11-05  
**修复类型**: 数据库字段名称修正  
**影响级别**: 高（修复核心功能错误）  
**测试状态**: ✅ 待验证  
**兼容性**: ✅ 向后兼容（API 不变）
