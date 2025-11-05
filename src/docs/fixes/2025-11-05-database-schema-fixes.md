# 数据库架构错误修复 (2025-11-05)

## 📋 修复的问题

### 1. ❌ Platforms `created_at` 字段不存在

**错误信息**:
```json
{
  "code": "42703",
  "details": null,
  "hint": null,
  "message": "column platforms.created_at does not exist"
}
```

**问题根源**:
- `/supabase/functions/server/index.tsx` 第 766 行
- 代码尝试使用 `.order('created_at', { ascending: false })` 对 platforms 表进行排序
- 但 platforms 表中不存在 `created_at` 字段

**解决方案**:
```typescript
// ❌ 修复前
.order('created_at', { ascending: false })

// ✅ 修复后
.order('platform_code', { ascending: true })
```

### 2. ❌ Orders `fulfilled_by` 关系不存在

**错误信息**:
```json
{
  "code": "PGRST200",
  "details": "Searched for a foreign key relationship between 'orders' and 'fulfilled_by' in the schema 'public', but no matches were found.",
  "hint": null,
  "message": "Could not find a relationship between 'orders' and 'fulfilled_by' in the schema cache"
}
```

**问题根源**:
- `/supabase/functions/server/index.tsx` 第 1505 行和 1547 行
- 代码尝试使用 `fulfilled_by_user:fulfilled_by(email, raw_user_meta_data)` 进行关系查询
- `fulfilled_by` 字段只是一个 UUID，指向 `auth.users` 表
- Supabase 不支持直接在 PostgREST 查询中关联 `auth.users` 表（需要使用 Admin API）

**解决方案**:

#### 2.1 订单列表查询 (GET /admin/orders)

```typescript
// ❌ 修复前
let query = supabaseAdmin
  .from('orders')
  .select(`
    *,
    denominations(name, display_price, game_id, sku_code),
    fulfilled_by_user:fulfilled_by(email, raw_user_meta_data)  // ❌ 不支持
  `, { count: 'exact' });

// ✅ 修复后
let query = supabaseAdmin
  .from('orders')
  .select(`
    *,
    denominations(name, display_price, game_id, sku_code)
  `, { count: 'exact' });

// 查询后单独获取用户信息
if (orders && orders.length > 0) {
  const fulfilledOrders = orders.filter(order => order.fulfilled_by);
  if (fulfilledOrders.length > 0) {
    const userIds = [...new Set(fulfilledOrders.map(order => order.fulfilled_by))];
    const { data: users } = await supabaseAdmin.auth.admin.listUsers();
    
    if (users) {
      const userMap = new Map(users.users.map(user => [user.id, user]));
      orders.forEach(order => {
        if (order.fulfilled_by && userMap.has(order.fulfilled_by)) {
          const user = userMap.get(order.fulfilled_by);
          order.fulfilled_by_user = {
            email: user.email,
            raw_user_meta_data: user.user_metadata
          };
        }
      });
    }
  }
}
```

#### 2.2 单个订单查询 (GET /admin/orders/:orderId)

```typescript
// ❌ 修复前
const { data: order, error } = await supabaseAdmin
  .from('orders')
  .select(`
    *,
    denominations(name, display_price, game_id, sku_code),
    fulfilled_by_user:fulfilled_by(email, raw_user_meta_data)  // ❌ 不支持
  `)
  .eq('id', orderId)
  .single();

// ✅ 修复后
const { data: order, error } = await supabaseAdmin
  .from('orders')
  .select(`
    *,
    denominations(name, display_price, game_id, sku_code)
  `)
  .eq('id', orderId)
  .single();

// 如果有 fulfilled_by，单独获取用户信息
if (order.fulfilled_by) {
  const { data: userData } = await supabaseAdmin.auth.admin.getUserById(order.fulfilled_by);
  if (userData?.user) {
    order.fulfilled_by_user = {
      email: userData.user.email,
      raw_user_meta_data: userData.user.user_metadata
    };
  }
}
```

---

## 🔧 技术细节

### Platforms 表结构

**当前字段**:
- `platform_code` (主键)
- `platform_name`

**不包含**:
- ❌ `created_at`
- ❌ `updated_at`

### Orders 表与 Auth.Users 的关系

**问题**:
- `auth.users` 表在 Supabase 中位于 `auth` schema，不是 `public` schema
- PostgREST 不能直接跨 schema 进行外键关联
- 需要使用 Supabase Auth Admin API 单独获取用户数据

**解决方案**:
1. 先查询订单数据（from `public.orders`）
2. 提取 `fulfilled_by` 用户 ID
3. 使用 `supabaseAdmin.auth.admin.getUserById()` 或 `listUsers()` 获取用户信息
4. 在应用层合并数据

---

## 📊 影响范围

### 修复的 API 端点

1. **GET /make-server-04b375d8/cms/platforms**
   - ✅ 现在使用 `platform_code` 排序
   - ✅ 不再尝试访问不存在的 `created_at` 字段

2. **GET /make-server-04b375d8/admin/orders**
   - ✅ 移除了错误的关系查询
   - ✅ 使用 Auth Admin API 单独获取用户信息
   - ✅ 性能影响：轻微增加（额外的 API 调用）

3. **GET /make-server-04b375d8/admin/orders/:orderId**
   - ✅ 移除了错误的关系查询
   - ✅ 使用 `getUserById()` 获取单个用户信息
   - ✅ 性能影响：最小

---

## ✅ 验证步骤

### 1. 测试 Platforms API

```bash
# 应该返回所有平台，按 platform_code 排序
curl -X GET \
  https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/make-server-04b375d8/cms/platforms \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

**预期结果**:
```json
{
  "platforms": [
    { "platform_code": "android", "platform_name": "Android" },
    { "platform_code": "ios", "platform_name": "iOS" },
    { "platform_code": "pc", "platform_name": "PC" }
  ]
}
```

### 2. 测试 Orders API

```bash
# 应该返回订单列表，包含 fulfilled_by_user 信息（如果有）
curl -X GET \
  "https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/make-server-04b375d8/admin/orders?page=1&limit=10" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

**预期结果**:
```json
{
  "orders": [
    {
      "id": "...",
      "fulfillment_status": "fulfilled",
      "fulfilled_by": "user-uuid-here",
      "fulfilled_by_user": {
        "email": "admin@example.com",
        "raw_user_meta_data": {
          "role": "admin"
        }
      }
    }
  ],
  "pagination": { ... }
}
```

### 3. 测试单个订单 API

```bash
curl -X GET \
  https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/make-server-04b375d8/admin/orders/${ORDER_ID} \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

---

## 🚨 注意事项

### 性能考虑

1. **订单列表查询**
   - 现在对每页结果都调用一次 `listUsers()`
   - 如果有大量已履行的订单，建议：
     - 使用缓存
     - 或只在需要时加载用户信息

2. **优化建议**
   ```typescript
   // 可以考虑添加缓存
   const userCache = new Map();
   
   async function getCachedUser(userId) {
     if (userCache.has(userId)) {
       return userCache.get(userId);
     }
     const { data } = await supabaseAdmin.auth.admin.getUserById(userId);
     userCache.set(userId, data.user);
     return data.user;
   }
   ```

### 数据一致性

- `fulfilled_by_user` 现在是在运行时动态添加的
- 不会存储在数据库中
- 如果用户被删除，`fulfilled_by` UUID 仍然存在，但无法获取用户信息

---

## 📝 相关文件

- `/supabase/functions/server/index.tsx` - 主要修复文件
- `/types/index.ts` - 类型定义（可能需要更新）
- `/services/ordersService.ts` - 前端订单服务（使用这些 API）
- `/services/cmsService.ts` - 前端 CMS 服务（使用 platforms API）

---

## 🔄 后续优化建议

1. **添加用户信息缓存**
   - 减少对 Auth Admin API 的重复调用
   - 提高订单列表加载速度

2. **考虑创建视图或函数**
   - 在数据库层面创建视图来合并订单和用户信息
   - 使用 Postgres 函数返回 JSON 格式的用户信息

3. **前端优化**
   - 懒加载用户信息
   - 只在展开订单详情时才加载 `fulfilled_by_user`

---

**修复时间**: 2025-11-05  
**影响版本**: v1.x  
**严重程度**: 中等（阻止 CMS 和订单管理功能正常使用）  
**状态**: ✅ 已修复并验证
