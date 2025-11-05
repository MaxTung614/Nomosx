# 🚀 管理员登录问题快速修复指南

**更新**: 2025-11-05

---

## ⚡ 5 分钟快速修复

### 第 1 步: 使用测试工具诊断

```
访问: http://localhost:5173/admin-test
```

输入你的账号密码，点击"测试登录"。

**看结果**:
- ✅ Role 显示 `admin` 或 `cs` → 继续第 3 步
- ❌ Role 显示 `user` → 继续第 2 步
- ❌ 登录失败 → 检查账号密码是否正确

---

### 第 2 步: 修复用户角色（如果 Role 是 'user'）

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 点击左侧 **SQL Editor**
4. 粘贴以下 SQL（记得修改邮箱）:

```sql
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'YOUR_EMAIL@example.com';
```

5. 点击 **Run**
6. 看到 "Success" 后继续第 3 步

---

### 第 3 步: 清除缓存并重新登录

**Chrome / Edge**:
```
1. 按 Ctrl+Shift+Delete (Windows) 或 Cmd+Shift+Delete (Mac)
2. 选择"所有时间"
3. 勾选"缓存"和"Cookies"
4. 点击"清除数据"
```

**Firefox**:
```
1. 按 Ctrl+Shift+Delete
2. 选择"全部"
3. 勾选"缓存"和"Cookie"
4. 点击"立即清除"
```

---

### 第 4 步: 登录管理员面板

```
访问: http://localhost:5173/enen
```

输入你的账号密码，应该能成功登录了！

---

## 🔍 仍然无法登录？

### 检查清单

- [ ] 确认邮箱和密码正确
- [ ] 确认用户 role 已设置为 'admin' 或 'cs'
- [ ] 已清除浏览器缓存和 cookies
- [ ] 尝试使用无痕模式
- [ ] 检查浏览器控制台 (F12) 是否有错误

### 查看日志

1. 打开浏览器开发者工具 (F12)
2. 切换到 "Console" 标签
3. 在登录页面输入账号密码并登录
4. 查找以下日志:
   - `[AdminLogin]` - 登录流程日志
   - `[Auth]` - 认证状态日志
   - `[Router]` - 路由跳转日志

**关键日志示例**:
```
[AdminLogin] ✓ Sign-in successful
[AdminLogin] - Role: admin          👈 这个必须是 admin 或 cs
[Router] Valid admin/cs role detected
[Auth] SIGNED_IN event - Role: admin
```

---

## 📖 首次创建管理员账号

如果你还没有任何管理员账号:

### 方法 1: SQL 一键创建（推荐）

在 Supabase SQL Editor 运行:

```sql
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email,
    encrypted_password, email_confirmed_at,
    raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(), 'authenticated', 'authenticated',
    'admin@example.com',  -- 👈 改成你的邮箱
    crypt('Admin123456', gen_salt('bf')),  -- 👈 改成你的密码
    NOW(),
    '{"role": "admin", "full_name": "Admin"}',
    NOW(), NOW(), '', ''
  ) RETURNING id INTO new_user_id;

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider,
    last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), new_user_id,
    jsonb_build_object('sub', new_user_id::text, 'email', 'admin@example.com'),
    'email', NOW(), NOW(), NOW()
  );

  RAISE NOTICE '管理员创建成功！';
END $$;
```

### 方法 2: 注册后升级

1. 在应用首页注册新账号
2. 使用第 2 步的 SQL 更新角色
3. 清除缓存后重新登录

---

## 🎯 调试工具

### 1. 测试工具页面
```
URL: /admin-test
功能: 测试登录、查看 session、诊断问题
```

### 2. 调试面板
```
位置: 登录页面右下角
功能: 实时显示认证状态
```

### 3. 浏览器控制台
```
快捷键: F12
标签: Console
查找: [AdminLogin] [Auth] [Router] 开头的日志
```

---

## 📞 更多帮助

详细文档:
- 📄 [完整故障排查指南](/docs/admin/login-troubleshooting.md)
- 📄 [快速设置管理员](/docs/admin/quick-setup-admin.md)
- 📄 [管理员访问指南](/docs/admin/admin-access-guide.md)

---

**提示**: 开发环境保留调试工具，生产环境部署前记得移除 `/admin-test` 路由和 `AuthDebugPanel` 组件。
