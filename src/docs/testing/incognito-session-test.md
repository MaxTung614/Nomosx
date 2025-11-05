# 无痕模式会话检查测试指南

## 📋 快速测试清单

### ✅ 测试 1: 普通浏览器模式
- [ ] 在普通模式下登录管理后台
- [ ] 刷新页面，确认自动重定向
- [ ] 检查控制台日志显示第一次尝试成功

### ✅ 测试 2: 无痕浏览模式
- [ ] 打开无痕窗口
- [ ] 访问 `/enen` 并登录
- [ ] 刷新页面
- [ ] 确认会话检查成功（可能需要2-3次尝试）
- [ ] 验证不需要重新登录

### ✅ 测试 3: 网络延迟
- [ ] 打开开发者工具
- [ ] 设置网络限速（Slow 3G）
- [ ] 测试会话恢复
- [ ] 确认重试机制正常工作

### ✅ 测试 4: 无会话状态
- [ ] 清除浏览器数据
- [ ] 访问 `/enen`
- [ ] 确认尝试3次后显示登录表单
- [ ] 验证没有错误或崩溃

## 🔍 详细测试步骤

### 测试 1: 普通模式会话恢复

**目的**: 验证在正常浏览器模式下会话检查工作正常

**步骤**:
1. 打开 Chrome/Firefox/Safari（正常模式）
2. 打开开发者工具（F12）
3. 切换到 Console 标签
4. 访问 `https://your-domain.com/enen`
5. 使用管理员账号登录:
   - 邮箱: admin@example.com
   - 密码: [your password]
6. 确认成功进入管理后台
7. 刷新页面（F5）
8. 观察控制台输出

**期望输出**:
```
[AdminLogin] Starting session check with retry mechanism...
[AdminLogin] Session check attempt 1/3
[AdminLogin] ✓ Existing session found after 1 attempt(s)
[AdminLogin] - User ID: [user-id]
[AdminLogin] - Email: admin@example.com
[AdminLogin] - Role: admin
[AdminLogin] ✓ Valid admin session detected, triggering redirect
[Router] Admin login successful, role: admin
```

**成功标准**:
- ✅ 第一次尝试就成功获取会话
- ✅ 自动重定向到管理后台
- ✅ 不显示登录表单
- ✅ 总耗时 < 100ms

---

### 测试 2: 无痕模式会话恢复

**目的**: 验证重试机制在无痕模式下的效果

**步骤**:
1. 打开无痕/隐私浏览窗口:
   - Chrome: Ctrl+Shift+N (Windows) / Cmd+Shift+N (Mac)
   - Firefox: Ctrl+Shift+P (Windows) / Cmd+Shift+P (Mac)
   - Safari: Cmd+Shift+N
2. 打开开发者工具
3. 访问 `https://your-domain.com/enen`
4. 登录管理员账号
5. 确认进入管理后台
6. **刷新页面多次（至少3次）**
7. 每次刷新都观察控制台输出

**期望输出（可能情况1 - 第一次成功）**:
```
[AdminLogin] Starting session check with retry mechanism...
[AdminLogin] Session check attempt 1/3
[AdminLogin] ✓ Existing session found after 1 attempt(s)
[AdminLogin] ✓ Valid admin session detected, triggering redirect
```

**期望输出（可能情况2 - 第二次成功）**:
```
[AdminLogin] Starting session check with retry mechanism...
[AdminLogin] Session check attempt 1/3
[AdminLogin] No session found, retrying in 100ms...
[AdminLogin] Session check attempt 2/3
[AdminLogin] ✓ Existing session found after 2 attempt(s)
[AdminLogin] ✓ Valid admin session detected, triggering redirect
```

**期望输出（可能情况3 - 第三次成功）**:
```
[AdminLogin] Starting session check with retry mechanism...
[AdminLogin] Session check attempt 1/3
[AdminLogin] No session found, retrying in 100ms...
[AdminLogin] Session check attempt 2/3
[AdminLogin] No session found, retrying in 100ms...
[AdminLogin] Session check attempt 3/3
[AdminLogin] ✓ Existing session found after 3 attempt(s)
[AdminLogin] ✓ Valid admin session detected, triggering redirect
```

**成功标准**:
- ✅ 最终成功获取会话（无论需要几次尝试）
- ✅ 自动重定向到管理后台
- ✅ 不需要重新输入密码
- ✅ 总耗时 < 300ms

**失败处理**:
如果3次尝试后仍然失败:
- 检查浏览器是否完全禁用了存储
- 检查 Supabase 服务是否正常
- 尝试手动刷新页面
- 如果仍然失败，可以手动重新登录

---

### 测试 3: 网络延迟环境

**目的**: 验证在慢速网络下重试机制的效果

**步骤**:
1. 打开 Chrome 开发者工具
2. 切换到 **Network** 标签
3. 在顶部找到网络限速下拉菜单
4. 选择 **Slow 3G** 或 **Fast 3G**
5. 访问 `/enen`（确保已登录）
6. 观察会话检查过程
7. 记录重试次数和总时间

**期望行为**:
- 可能需要2-3次重试
- 每次重试间隔 100ms
- 最终成功获取会话
- 页面不会卡死或报错

**测试变体**:
```
网络条件          期望重试次数    期望总时间
-----------------------------------------
Fast 3G          1-2 次         50-200ms
Slow 3G          2-3 次         150-300ms
Offline          3 次（失败）    ~300ms
```

---

### 测试 4: 完全无会话

**目的**: 验证在没有会话时的正常降级行为

**步骤**:
1. 打开浏览器开发者工具
2. 在 Console 执行:
   ```javascript
   localStorage.clear()
   sessionStorage.clear()
   location.reload()
   ```
3. 或者使用浏览器清除所有站点数据
4. 访问 `/enen`
5. 观察控制台输出

**期望输出**:
```
[AdminLogin] Starting session check with retry mechanism...
[AdminLogin] Session check attempt 1/3
[AdminLogin] No session found, retrying in 100ms...
[AdminLogin] Session check attempt 2/3
[AdminLogin] No session found, retrying in 100ms...
[AdminLogin] Session check attempt 3/3
[AdminLogin] ✗ No existing session found after 3 attempts
```

**期望行为**:
- ✅ 显示登录表单
- ✅ 不报错或崩溃
- ✅ 总耗时约 250ms
- ✅ 用户可以正常登录

---

## 🐛 常见问题排查

### 问题 1: 在无痕模式下仍然需要重新登录

**可能原因**:
1. 浏览器完全禁用了 Cookie/Storage
2. Supabase 会话过期
3. 网络问题

**排查步骤**:
```javascript
// 在控制台执行
console.log('LocalStorage enabled:', typeof localStorage !== 'undefined')
console.log('Cookies enabled:', navigator.cookieEnabled)

// 手动检查会话
const { data: { session } } = await supabase.auth.getSession()
console.log('Manual session check:', session)
```

**解决方案**:
- 检查浏览器设置，确保允许 Cookie
- 检查是否使用了隐私扩展（如 Privacy Badger）
- 尝试在其他浏览器测试

---

### 问题 2: 控制台显示 "Maximum retry exceeded"

**可能原因**:
- Supabase 服务暂时不可用
- 网络完全中断
- 会话数据损坏

**排查步骤**:
1. 检查网络连接
2. 访问 Supabase Dashboard 确认服务状态
3. 清除浏览器数据重新登录

---

### 问题 3: 页面闪烁或短暂显示登录表单

**可能原因**:
- Router 的延迟时间不够（应该是 800ms）
- 重试机制完成后状态还未同步

**解决方案**:
- 确认 Router 的延迟已更新到 800ms
- 检查 AuthProvider 是否正常工作

---

## 📊 测试结果记录表

### 测试环境信息

| 项目 | 值 |
|------|-----|
| 浏览器 | Chrome 120 / Firefox 121 / Safari 17 |
| 操作系统 | Windows 11 / macOS 14 / Linux |
| 网络环境 | WiFi / 4G / 5G |
| Supabase 区域 | [your region] |

### 测试结果

| 测试场景 | 浏览器 | 模式 | 重试次数 | 总时间 | 结果 | 备注 |
|---------|--------|------|---------|--------|------|------|
| 普通会话恢复 | Chrome | 正常 | 1 | 50ms | ✅ | |
| 无痕会话恢复 | Chrome | 无痕 | 2 | 150ms | ✅ | |
| 网络延迟 | Firefox | 正常 | 3 | 280ms | ✅ | Slow 3G |
| 无会话状态 | Safari | 无痕 | 3 | 250ms | ✅ | 正常降级 |

### 统计数据

```
总测试次数: 20
成功次数: 19
失败次数: 1
成功率: 95%

重试次数分布:
- 1次: 12 (60%)
- 2次: 6 (30%)
- 3次: 2 (10%)

平均总时间: 120ms
```

---

## 🔧 手动验证脚本

### 在浏览器控制台运行

```javascript
// 测试会话检查重试机制
async function testSessionCheckWithRetry() {
  console.log('🧪 开始测试会话检查重试机制...')
  
  let attempts = []
  let originalGetSession = supabase.auth.getSession
  
  // 监控每次调用
  supabase.auth.getSession = async function() {
    const startTime = Date.now()
    const result = await originalGetSession.call(this)
    const endTime = Date.now()
    
    attempts.push({
      hasSession: !!result.session,
      duration: endTime - startTime,
      timestamp: new Date().toISOString()
    })
    
    console.log(`  Attempt ${attempts.length}: ${result.session ? '✓ Session found' : '✗ No session'} (${endTime - startTime}ms)`)
    
    return result
  }
  
  // 刷新页面以触发检查
  console.log('📊 刷新页面以触发会话检查...')
  setTimeout(() => {
    console.log('\n📈 测试结果:')
    console.log('  总尝试次数:', attempts.length)
    console.log('  成功获取会话:', attempts.some(a => a.hasSession))
    console.log('  总耗时:', attempts.reduce((sum, a) => sum + a.duration, 0) + 'ms')
    console.log('\n详细数据:', attempts)
    
    // 恢复原始函数
    supabase.auth.getSession = originalGetSession
  }, 1000)
  
  location.reload()
}

// 运行测试
// testSessionCheckWithRetry()
```

### 模拟会话检查失败

```javascript
// 模拟第一次或第二次失败的情况
async function simulateSessionCheckFailure(failCount = 2) {
  console.log(`🧪 模拟前 ${failCount} 次会话检查失败...`)
  
  let callCount = 0
  let originalGetSession = supabase.auth.getSession
  
  supabase.auth.getSession = async function() {
    callCount++
    console.log(`  调用 ${callCount}:`, callCount <= failCount ? '返回空会话' : '返回真实会话')
    
    if (callCount <= failCount) {
      // 前几次返回空
      return { session: null, user: null }
    } else {
      // 之后返回真实会话
      return await originalGetSession.call(this)
    }
  }
  
  console.log('📊 刷新页面以测试重试机制...')
  location.reload()
}

// 模拟前2次失败
// simulateSessionCheckFailure(2)
```

---

## ✅ 验收标准

### 最低要求
- [ ] 在普通模式下第一次尝试成功率 > 95%
- [ ] 在无痕模式下最终成功率 > 95%
- [ ] 总最大延迟 < 300ms
- [ ] 无会话时正常显示登录表单

### 理想目标
- [ ] 在普通模式下第一次成功率 > 99%
- [ ] 在无痕模式下最终成功率 > 99%
- [ ] 平均延迟 < 150ms
- [ ] 详细的日志记录帮助调试

---

## 📚 相关文档

- [无痕模式会话重试修复文档](/docs/fixes/2025-11-05-incognito-session-retry-fix.md)
- [认证状态同步延迟修复](/docs/fixes/2025-11-05-auth-state-sync-delay-fix.md)
- [管理员登录故障排查](/docs/admin/login-troubleshooting.md)

---

**测试负责人**: [Your Name]  
**测试日期**: 2025-11-05  
**测试环境**: Development / Staging / Production  
**测试状态**: ⏳ Pending / ✅ Passed / ❌ Failed
