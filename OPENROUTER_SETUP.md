# OpenRouter 配置指南

## 📋 为什么使用 OpenRouter？

由于中国大陆无法直接访问 OpenAI API，我们使用 **OpenRouter** 作为代理：
- ✅ 支持支付宝/微信充值
- ✅ 国内可访问（无需 VPN）
- ✅ 提供多种模型选择（OpenAI、Anthropic、Google、Meta 等）
- ✅ 统一 API 格式（兼容 OpenAI SDK）

---

## 🔑 获取 OpenRouter API Key

### 步骤 1：注册账号
1. 访问 [https://openrouter.ai/](https://openrouter.ai/)
2. 点击 "Sign Up" 或使用 Google/GitHub 登录
3. 完成邮箱验证

### 步骤 2：创建 API Key
1. 访问 [https://openrouter.ai/keys](https://openrouter.ai/keys)
2. 点击 "Create Key"
3. 输入密钥名称（如 "StrokeLab"）
4. 复制生成的密钥（格式：`sk-or-v1-...`）

### 步骤 3：充值（可选但推荐）
1. 访问 [https://openrouter.ai/credits](https://openrouter.ai/credits)
2. 选择充值金额（最低 $5）
3. 使用支付宝/微信/信用卡支付

> 💡 **提示**：新用户通常有少量免费额度可用于测试。

---

## ⚙️ 配置项目

### 1. 更新 `.env.local`

将你的 OpenRouter API Key 添加到 `.env.local`：

```env
# OpenRouter API Key (替代 OpenAI，支持中国大陆访问)
OPENAI_API_KEY=sk-or-v1-your-actual-key-here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
```

> **注意**：将 `sk-or-v1-your-actual-key-here` 替换为你实际的 API Key。

### 2. 重启开发服务器

```bash
pkill -9 node
npm run dev
```

### 3. 测试 AI 分析功能

1. 上传一张游泳图片
2. 等待姿态估计完成
3. 查看生成的分析报告

如果看到详细的游泳建议（包括 strengths、weaknesses、recommendations），说明配置成功！

---

## 🤖 推荐的模型选择

### 当前配置：**openai/gpt-4o-mini**

**理由**：
- ✅ **性价比高**：$0.15/1M tokens（输入），$0.60/1M tokens（输出）
- ✅ **速度快**：响应时间 < 1 秒
- ✅ **质量稳定**：适合生成游泳分析报告
- ✅ **支持 JSON 格式**：完美适配项目的 `response_format: { type: 'json_object' }`

**预估成本**：
- 单次图片分析：约 $0.001 - $0.005（取决于报告长度）
- 100 次分析：约 $0.10 - $0.50

### 其他可选模型

| 模型 | 价格（输入/输出） | 速度 | 适用场景 | 推荐度 |
|------|------------------|------|---------|--------|
| **openai/gpt-4o-mini** | $0.15 / $0.60 | ⚡ | 通用任务、JSON 输出 | ⭐⭐⭐⭐⭐ |
| openai/gpt-4o | $2.50 / $10.00 | ⚡⚡ | 复杂推理、高质量内容 | ⭐⭐⭐⭐ |
| anthropic/claude-3.5-sonnet | $3.00 / $15.00 | ⚡⚡ | 长文本分析 | ⭐⭐⭐ |
| google/gemini-pro | $0.50 / $1.50 | ⚡⚡ | 多模态分析 | ⭐⭐⭐ |
| meta-llama/llama-3.1-70b | $0.90 / $0.90 | ⚡⚡ | 开源替代 | ⭐⭐ |

### 如何切换模型？

编辑 [`src/lib/llm/advisor.ts`](file:///Users/chenlianpeng/Desktop/webOversea/swimcheck/src/lib/llm/advisor.ts)，修改 `model` 参数：

```typescript
// 当前：openai/gpt-4o-mini
model: 'openai/gpt-4o-mini',

// 切换到 GPT-4o（更高质量，但更贵）
model: 'openai/gpt-4o',

// 切换到 Claude 3.5 Sonnet
model: 'anthropic/claude-3.5-sonnet',

// 切换到 Gemini Pro
model: 'google/gemini-pro',
```

> ⚠️ **注意**：不同模型的 API 格式可能略有差异，切换后需要测试 JSON 输出是否正常。

---

## 📊 查看使用情况

### 在 OpenRouter Dashboard 中
1. 访问 [https://openrouter.ai/activity](https://openrouter.ai/activity)
2. 查看最近的 API 调用记录
3. 监控 token 使用量和费用

### 在项目日志中
终端会显示每次 API 调用的详细信息（如果启用了调试模式）。

---

## ⚠️ 常见问题

### Q1: 报错 "Invalid API key"
**原因**：API Key 不正确或已过期

**解决**：
1. 检查 `.env.local` 中的 `OPENAI_API_KEY` 是否正确
2. 确认密钥格式为 `sk-or-v1-...`
3. 在 OpenRouter Dashboard 中重新生成密钥

### Q2: 报错 "Model not found"
**原因**：模型名称格式错误

**解决**：
确保使用 OpenRouter 格式的模型名称：`provider/model`
- ✅ 正确：`openai/gpt-4o-mini`
-  错误：`gpt-4o-mini`

### Q3: 响应很慢
**原因**：网络延迟或模型负载高

**解决**：
1. 检查网络连接
2. 尝试切换到更快的模型（如 `openai/gpt-4o-mini`）
3. 在 OpenRouter Dashboard 中查看模型状态

### Q4: JSON 解析失败
**原因**：模型返回的格式不符合预期

**解决**：
1. 确认使用了支持 `response_format: { type: 'json_object' }` 的模型
2. 检查 Prompt 是否明确要求 JSON 格式
3. 查看终端日志中的原始响应内容

---

## 🔒 安全建议

1. **不要提交 API Key 到 Git**（`.env.local` 已在 `.gitignore` 中）
2. **定期轮换 API Key**（每 90 天）
3. **设置使用限额**：在 OpenRouter Dashboard 中设置每月支出上限
4. **监控异常使用**：定期检查 Activity 页面，发现异常立即停用密钥

---

## 📞 需要帮助？

如果遇到问题，可以：
1. 查看 [OpenRouter 文档](https://openrouter.ai/docs)
2. 检查 [OpenRouter Discord](https://discord.gg/openrouter) 社区
3. 查看项目终端日志中的错误信息

祝使用愉快！
