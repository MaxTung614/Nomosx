# 快速创建管理员账号指南

## 🚀 最快的方法（推荐）

### 使用 Supabase SQL Editor

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择您的项目
3. 进入 **SQL Editor**
4. 执行以下 SQL 命令：

```sql
-- 方法一：如果您已经注册了账号，只需要升级角色
-- 将 'your-email@example.com' 替换为您的邮箱
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'your-email@example.com';
```

或者

```sql
-- 方法二：直接创建一个新的管理员账号
-- 注意：这需要您的 Supabase 项目已禁用邮箱确认，或手动确认邮箱
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@nomosx.com',  -- 修改为您的邮箱
  crypt('YourSecurePassword123!', gen_salt('bf')),  -- 修改为您的密码
  NOW(),
  '{"role": "admin", "full_name": "System Admin"}'::jsonb,
  NOW(),
  NOW(),
  ''
);
```

⚠️ **重要提示**：
- 方法一更安全，推荐使用
- 方法二仅在测试环境使用
- 生产环境请通过前台注册后再升级角色

---

## 📝 详细步骤（方法一）

### 步骤 1：注册账号
```bash
# 访问您的网站
https://your-website.com

# 点击"註冊"按钮
# 填写：
# - Email: admin@yourdomain.com
# - Password: YourSecurePassword123!
# - 完成注册
```

### 步骤 2：在 Supabase 中升级角色

1. **打开 Supabase Dashboard**
   - 访问：https://supabase.com/dashboard
   - 登录您的账号
   - 选择项目

2. **进入 SQL Editor**
   - 左侧菜单 → **SQL Editor**
   - 点击 **New query**

3. **执行升级 SQL**
   ```sql
   -- 将邮箱替换为您刚才注册的邮箱
   UPDATE auth.users
   SET raw_user_meta_data = jsonb_set(
     COALESCE(raw_user_meta_data, '{}'::jsonb),
     '{role}',
     '"admin"'
   )
   WHERE email = 'admin@yourdomain.com';
   ```

4. **点击 Run 执行**

5. **验证结果**
   ```sql
   -- 查询确认角色已更新
   SELECT 
     email,
     raw_user_meta_data->>'role' as role,
     created_at
   FROM auth.users
   WHERE email = 'admin@yourdomain.com';
   ```

### 步骤 3：登录管理员面板

1. 访问：`/enen`
2. 使用刚才的邮箱和密码登录
3. 成功！您现在是管理员了 🎉

---

## 🔄 批量创建管理员

如果需要创建多个管理员账号：

```sql
-- 批量更新多个用户为管理员
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email IN (
  'admin1@example.com',
  'admin2@example.com',
  'admin3@example.com'
);

-- 或者创建客服账号
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"cs"'
)
WHERE email = 'support@example.com';
```

---

## 🔍 验证和排查

### 检查用户角色

```sql
-- 查看所有用户及其角色
SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as role,
  raw_user_meta_data->>'full_name' as name,
  created_at,
  last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;
```

### 查找管理员

```sql
-- 只显示管理员账号
SELECT 
  email,
  raw_user_meta_data->>'role' as role,
  created_at
FROM auth.users
WHERE raw_user_meta_data->>'role' = 'admin';
```

### 重置角色为普通用户

```sql
-- 如果需要降级某个用户
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"user"'
)
WHERE email = 'user@example.com';
```

---

## ⚡ 使用 Supabase Dashboard GUI（最简单）

### 方法：通过 UI 手动编辑

1. **Authentication** → **Users**
2. 找到用户，点击查看详情
3. 滚动到 **Raw User Meta Data**
4. 点击 **Edit**
5. 修改 JSON：
   ```json
   {
     "role": "admin",
     "full_name": "Admin Name"
   }
   ```
6. 点击 **Save**

---

## 🎯 验证登录

创建管理员后，测试登录：

### 测试步骤

1. **清除浏览器缓存**（重要！）
   - Chrome: Ctrl+Shift+Delete
   - 选择"Cookie 和其他网站数据"
   - 点击"清除数据"

2. **访问管理员登录页**
   ```
   /enen
   ```

3. **输入凭据**
   - Email: admin@yourdomain.com
   - Password: YourSecurePassword123!

4. **检查控制台**
   - 打开浏览器开发者工具（F12）
   - 查看 Console 标签
   - 应该看到：`[AdminLogin] ✓ Sign-in successful - Role: admin`

5. **验证访问权限**
   - 应该自动跳转到 `/admin-dashboard`
   - 可以看到完整的管理功能

---

## 🐛 常见问题排查

### 问题 1：登录后仍然是普通用户

**解决方案**：
```sql
-- 1. 确认角色确实已更新
SELECT email, raw_user_meta_data FROM auth.users WHERE email = 'your-email@example.com';

-- 2. 如果角色正确但登录无效，清除所有会话
DELETE FROM auth.sessions WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'your-email@example.com'
);

-- 3. 然后退出并重新登录
```

### 问题 2：角色更新后不生效

需要：
1. 完全退出登录
2. 清除浏览器缓存
3. 重新登录

### 问题 3：找不到 SQL Editor

确保：
1. 您有 Supabase 项目的管理员权限
2. 项目已完全初始化
3. 使用的是新版 Supabase Dashboard

---

## 📋 完整检查清单

- [ ] 在前台注册了账号
- [ ] 在 Supabase Dashboard 中找到该用户
- [ ] 使用 SQL 或 UI 更新了 `role` 字段为 `admin`
- [ ] 确认更新成功（查询验证）
- [ ] 清除了浏览器缓存
- [ ] 访问 `/enen` 登录
- [ ] 成功进入管理员面板
- [ ] 可以看到管理功能

---

## 🔐 安全最佳实践

1. **使用强密码**
   - 至少 12 个字符
   - 包含大小写字母、数字、特殊符号
   - 不要使用常见密码

2. **定期审查管理员**
   ```sql
   -- 每月运行一次
   SELECT 
     email,
     raw_user_meta_data->>'role' as role,
     last_sign_in_at
   FROM auth.users
   WHERE raw_user_meta_data->>'role' IN ('admin', 'cs')
   ORDER BY last_sign_in_at DESC;
   ```

3. **记录管理员操作**
   - 启用 Supabase 日志记录
   - 定期检查 Edge Function 日志

4. **备份管理员账号**
   - 至少创建 2 个管理员账号
   - 使用不同的邮箱域名

---

**需要帮助？** 检查浏览器控制台和 Supabase Function 日志以获取详细错误信息。
