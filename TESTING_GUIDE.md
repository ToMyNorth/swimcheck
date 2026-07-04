# StrokeLab 用户行为测试指南

## 🎯 测试目标
验证完整的用户流程是否正常工作，包括：
1. 图片上传和 AI 分析
2. 评分计算和可视化
3. AI 教练建议生成（使用 Llama 3.1）
4. 报告页面展示

##  测试步骤

### 步骤 1：访问网站并登录
1. 打开浏览器，访问 https://strokelab.app
2. 点击右上角 **"Sign In"** 按钮
3. 使用 Google 账号登录（或使用测试账号）
4. 确认成功跳转到 Dashboard

**预期结果**：
- ✅ 成功登录
- ✅ 看到 Dashboard 页面
- ✅ 显示用户信息和配额（Free: 3 analyses/month）

---

### 步骤 2：上传图片进行分析
1. 点击顶部导航栏的 **"Analyze"** 或 **"Try Free — 3 Analyses/Month"** 按钮
2. 进入分析页面（/analyze）
3. **上传图片**：
   - 点击上传区域
   - 选择 `freestyle-side.jpg`（位于项目中的 `/public/images/examples/freestyle-side.jpg`）
   - 或者从本地下载该图片后上传
4. 等待 AI 分析完成（MediaPipe 姿态检测 + 评分计算）

**预期结果**：
- ✅ 图片成功上传
- ✅ 显示处理进度（Processing...）
- ✅ MediaPipe 检测到人体关键点（33个关节点）
- ✅ 自动跳转到报告页面

---

### 步骤 3：查看分析报告
报告页面 URL 格式：`https://strokelab.app/report/[id]?scores=...`

**检查以下内容**：

#### A. 整体评分（Overall Score）
- 应该显示一个 0-100 的分数
- 分数周围有环形进度条
- 颜色根据分数变化：
  - ≥80: 绿色（优秀）
  - 60-79: 橙色（良好）
  - <60: 红色（需要改进）

#### B. 6项技术指标
应该显示以下指标的评分卡片：
1. **Body Alignment** (身体对齐) - 水平倾斜度
2. **Arm Entry (L)** (左臂入水角度)
3. **Arm Entry (R)** (右臂入水角度)
4. **Head Position** (头部位置) - 脊柱中立位
5. **Body Roll** (身体滚动) - 旋转代理
6. **Symmetry** (对称性) - 左右平衡

**预期结果**：
- ✅ 所有指标都有分数（不是默认值 50）
- ✅ 分数在合理范围内（0-100）
- ✅ 每个卡片显示对应的子标题

#### C. AI Coach Feedback（AI 教练反馈）
这是最关键的部分！应该显示：

1. **Summary**（总结）
   - 一段文字描述整体表现

2. **Strengths**（优势）
   - 列出做得好的方面

3. **Areas to Improve**（需要改进的地方）
   - 列出需要改进的方面

4. **Priority Recommendations**（优先建议）
   - 按优先级排列的建议列表
   - 每个建议包含：
     - 问题描述
     - 当前分数 vs 目标分数
     - 解释说明
     - 推荐的训练动作（Drill）
     - "How to do it" 展开按钮（点击显示详细步骤）

5. **Encouragement**（鼓励语）
   - 一句激励性的话

**预期结果**：
- ✅ AI 建议成功生成（使用 Llama 3.1 模型）
- ✅ 内容是个性化的，基于实际评分
- ✅ 格式正确，JSON 解析成功
- ✅ 没有显示 "Unable to Generate Advice" 错误

**如果看到错误**：
- 检查 Vercel Logs：https://vercel.com/norrischen/swimcheck/logs
- 查看是否有 OpenRouter API 调用失败的日志
- 确认环境变量 `OPENAI_API_KEY` 已配置

---

### 步骤 4：测试分享功能
1. 点击报告页面右上角的 **"Share Results"** 按钮
2. 复制生成的分享链接
3. 在新标签页中打开该链接

**预期结果**：
- ✅ 生成可分享的 URL
- ✅ 分享链接能正确显示报告内容

---

### 步骤 5：测试视频分析（可选）
1. 访问 https://strokelab.app/analyze/video
2. 上传一个 5-10 秒的自由泳视频
3. 等待逐帧分析完成

**预期结果**：
- ✅ 视频成功上传
- ✅ 提取关键帧进行分析
- ✅ 生成视频分析报告

---

## 🐛 常见问题排查

### 问题 1：所有分数都是 50
**原因**：URL 中没有 scores 参数或格式不正确
**解决**：确保从 /analyze 页面正常跳转，不要直接访问报告页面

### 问题 2：AI 建议显示 "Unable to Generate Advice"
**原因**：OpenRouter API 调用失败
**解决**：
1. 检查 Vercel Logs
2. 确认 `OPENAI_API_KEY` 环境变量已配置
3. 确认使用的是免费模型 `meta-llama/llama-3.1-8b-instruct:free`

### 问题 3：MediaPipe 检测不到人体
**原因**：图片质量不佳或姿势不清晰
**解决**：
- 使用清晰的侧视图照片
- 确保光线充足
- 身体完整可见

### 问题 4：登录后无法访问 Dashboard
**原因**：Supabase 表结构问题
**解决**：
- 检查 Supabase Dashboard → Table Editor → users 表
- 确认包含 `updated_at` 列

---

## ✅ 测试清单

完成后勾选以下项目：

- [ ] 成功登录
- [ ] 上传图片
- [ ] MediaPipe 姿态检测成功
- [ ] 生成 6 项技术指标评分
- [ ] 整体评分计算正确
- [ ] AI 教练建议生成成功（Llama 3.1）
- [ ] 报告显示所有数据
- [ ] 分享功能正常工作
- [ ] 没有控制台错误

---

## 📊 测试数据记录

请在测试过程中记录以下信息：

**测试时间**：____________________

**使用的图片**：□ freestyle-side.jpg  □ 其他：__________

**整体评分**：____________________

**AI 建议生成时间**：____________________ 秒

**遇到的问题**：
```
[在此处记录任何错误或异常]
```

**截图**：
- [ ] 登录页面
- [ ] 上传页面
- [ ] 处理中页面
- [ ] 报告页面（整体评分）
- [ ] 报告页面（AI 建议）

---

## 🔗 相关资源

- 生产环境：https://strokelab.app
- Vercel Dashboard：https://vercel.com/norrischen/swimcheck
- Vercel Analytics：https://vercel.com/norrischen/swimcheck/analytics
- Vercel Logs：https://vercel.com/norrischen/swimcheck/logs
- Supabase Dashboard：https://supabase.com/dashboard/project/dzkljqvfxrovcwgbnjhl

---

## 💡 提示

1. **首次测试建议使用示例图片** `freestyle-side.jpg`，确保流程正常工作
2. **观察网络请求**：打开浏览器开发者工具（F12），查看 Network 标签
3. **检查控制台日志**：Console 标签中应该有详细的调试信息
4. **记录响应时间**：从上传到生成报告的总时长应该在 5-15 秒之间

祝测试顺利！‍♂️
