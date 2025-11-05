# 快速验证指南 - is_archived 字段修复

**修复日期:** 2025-11-05  
**预计验证时间:** 5 分钟

---

## ✅ 快速验证步骤

### 1. 检查 Admin Dashboard (2 分钟)

访问 `/admin-login` 并登录：

```
测试每个 Tab:
☐ 區域管理 - 可以加载数据
☐ 平台管理 - 可以加载数据
☐ 促銷標籤管理 - 可以加载数据
☐ 遊戲管理 - 可以加载数据
☐ 產品面額管理 - 可以加载数据
☐ 首頁游戲管理 - 可以加载数据
```

**预期结果:** 所有 Tab 都能成功加载数据，无错误提示

### 2. 测试 CRUD 操作 (2 分钟)

在任意一个 Tab 中：

```
☐ 创建新项目 - 成功
☐ 编辑现有项目 - 成功
☐ 删除项目 - 成功（显示删除确认）
```

**预期结果:** 所有操作成功，无 Console 错误

### 3. 检查首页 (1 分钟)

访问 `/`：

```
☐ 游戏列表显示
☐ 游戏卡片正常渲染
☐ 无 Console 错误
```

**预期结果:** 首页正常显示，游戏数据加载成功

### 4. 检查 Console (30 秒)

打开浏览器 DevTools Console：

```
☐ 无 "column does not exist" 错误
☐ 无 Supabase 查询错误
☐ 无红色错误信息
```

**预期结果:** Console 干净，无错误

---

## 🚨 如果仍有错误

### 错误：column XXX.is_archived does not exist

**解决方案:**

1. 清除浏览器缓存
2. 重新部署 Edge Function
3. 检查是否还有其他文件引用 `is_archived`

### 错误：Failed to fetch regions/platforms/etc.

**检查步骤:**

1. 验证 Supabase 连接
2. 检查 Edge Function 日志
3. 验证 RLS 策略

### 其他错误

查看完整修复文档：`/docs/fixes/is-archived-field-removal.md`

---

## ✅ 验证完成

如果所有步骤都通过，修复已成功！

**记录验证结果:**
- [ ] Admin Dashboard: ✅ 通过
- [ ] CRUD 操作: ✅ 通过
- [ ] 首页加载: ✅ 通过
- [ ] Console 检查: ✅ 无错误

**验证人员:** __________  
**验证日期:** __________

---

**如有问题，请参考:** `/docs/fixes/is-archived-field-removal.md`
