# SwimCheck 生产环境部署检查清单

## ✅ 部署前准备

### 1. 环境变量配置（Vercel Dashboard）

在 Vercel 项目设置中（Settings → Environment Variables），添加以下变量：

#### 🔑 必需变量

```env
# NextAuth Configuration
NEXTAUTH_SECRET=<生成一个随机字符串，至少32字符>
# 生成命令：openssl rand -base64 32
# 示例：aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456789+/=

NEXTAUTH_URL=https://your-domain.vercel.app
# 替换为你的实际域名，如：https://swimcheck.vercel.app

# OpenRouter API Key（已配置 ✅）
OPENAI_API_KEY=your-openrouter-api-key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# Supabase（已配置 ✅）
NEXT_PUBLIC_SUPABASE_URL=https://dzkljqvfxrovcwgbnjhl.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

#### 🎭 Google OAuth（生产环境启用）

```env
# Google OAuth（从 Google Cloud Console 获取）
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### 💳 Stripe（可选，用于付费功能）

```env
# Stripe（如果使用付费功能）
STRIPE_SECRET_KEY=sk_live_your-actual-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-actual-webhook-secret
NEXT_PUBLIC_STRIPE_PRICE_BASIC=price_basic_here
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_pro_here
```

> ⚠️ **重要**：**不要设置 `HTTP_PROXY`/`HTTPS_PROXY`**（Vercel 海外服务器可直接访问所有 API）

---

### 2. 代码修改清单

#### ✅ 已完成
- [x] OpenRouter API Key 已配置
- [x] Supabase 配置已就绪
- [x] 代理相关代码已创建（生产环境自动禁用）

#### 🔧 需要修改

##### A. 启用 Google OAuth Provider

编辑 [`src/app/api/auth/[...nextauth]/route.ts`](file:///Users/chenlianpeng/Desktop/webOversea/swimcheck/src/app/api/auth/[...nextauth]/route.ts)：

```typescript
providers: [
  // ✅ 取消注释，启用 Google OAuth
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  }),
  // Apple Provider requires Apple Developer account, skip for MVP
  // Add later if needed
],
```

##### B. 更新 NEXTAUTH_URL

确保 `.env.local` 中的 `NEXTAUTH_URL` 与你的实际域名一致（本地开发时保持 `http://localhost:3000`，生产环境由 Vercel 自动管理）。

---

### 3. Google Cloud Console 配置

#### 更新 Authorized redirect URIs

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 进入 "APIs & Services" → "Credentials"
3. 找到 "OAuth 2.0 Client IDs" → "SwimCheck"
4. 在 "Authorized redirect URIs" 中添加：
   ```
   https://your-domain.vercel.app/api/auth/callback/google
   ```
5. 保存更改

#### 确认 Test users（可选）

如果应用仍处于 "Testing" 状态，确保测试账号已添加：
- `a380816700norris@gmail.com`
- 其他测试账号...

或者将应用发布为 "Production" 状态（需要 Google 审核）。

---

### 4. Supabase 配置确认

#### 确认数据库表结构

访问 [Supabase Dashboard](https://supabase.com/dashboard)，确认以下 7 张表已创建：
- ✅ `users`
- ✅ `accounts`
- ✅ `sessions`
- ✅ `verification_tokens`
- ✅ `analyses`
- ✅ `subscriptions`
- ✅ `profiles`

#### 确认 RLS 策略

确保 Row Level Security (RLS) 已启用并配置正确的策略。

---

### 5. Stripe 配置（可选）

如果使用付费功能：

#### 获取 Live Mode 密钥

1. 访问 [Stripe Dashboard](https://dashboard.stripe.com/)
2. 切换到 "Live mode"（右上角开关）
3. 获取 `sk_live_*` 密钥

#### 配置 Webhook

1. 在 Stripe Dashboard → Developers → Webhooks
2. 点击 "Add endpoint"
3. Endpoint URL: `https://your-domain.vercel.app/api/webhooks/stripe`
4. 选择事件：
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.created`
   - `customer.subscription.deleted`
5. 复制 Webhook Signing Secret 到 `STRIPE_WEBHOOK_SECRET`

#### 创建 Price ID

1. 在 Stripe Dashboard → Products
2. 创建 Basic 和 Pro 套餐
3. 复制 Price ID 到环境变量：
   - `NEXT_PUBLIC_STRIPE_PRICE_BASIC=price_xxx`
   - `NEXT_PUBLIC_STRIPE_PRICE_PRO=price_xxx`

---

## 🚀 部署步骤

### 步骤 1：提交代码

```bash
# 检查当前状态
git status

# 添加所有更改
git add .

# 提交
git commit -m "feat: prepare for production deployment

- Configure OpenRouter API for AI analysis
- Disable Google OAuth for local development (commented out)
- Add proxy support for China network restrictions
- Create deployment documentation"

# 推送到 GitHub
git push origin main
```

### 步骤 2：在 Vercel 创建项目

1. 访问 [vercel.com](https://vercel.com)
2. 点击 "Add New Project"
3. 选择 "Import Git Repository"
4. 选择 `swimcheck` 仓库
5. 点击 "Deploy"

### 步骤 3：配置环境变量

在 Vercel Dashboard → Settings → Environment Variables 中，按照上面的清单添加所有环境变量。

### 步骤 4：启用 Google OAuth

编辑 `src/app/api/auth/[...nextauth]/route.ts`，取消注释 GoogleProvider，然后：

```bash
git add .
git commit -m "chore: enable Google OAuth for production"
git push origin main
```

### 步骤 5：更新 Google Cloud Console

按照上面的说明，添加 Vercel 域名的回调 URL。

### 步骤 6：验证部署

1. 访问 `https://your-domain.vercel.app`
2. 测试首页加载
3. 测试图片上传和分析
4. 测试 Google OAuth 登录
5. 检查 Vercel Deployment Logs

---

## ✅ 验证清单

### 基础功能
- [ ] 首页正常加载
- [ ] 图片上传功能正常
- [ ] MediaPipe 姿态估计正常
- [ ] AI 分析报告生成正常（使用 OpenRouter）

### 用户系统
- [ ] Google OAuth 登录成功
- [ ] 用户信息正确保存到 Supabase
- [ ] 会话管理正常

### 数据库
- [ ] Supabase 连接正常
- [ ] 用户数据正确写入
- [ ] 分析记录正确保存

### 性能
- [ ] 页面加载速度 < 3 秒
- [ ] AI 分析响应时间 < 5 秒
- [ ] 无控制台错误

---

## ⚠️ 常见问题排查

### Q1: 登录后跳转到 error=Configuration
**原因**：环境变量未正确配置或 Google Cloud Console 回调 URL 不匹配

**解决**：
1. 检查 Vercel 环境变量是否正确
2. 确认 Google Cloud Console 中的回调 URL 包含 `https://your-domain.vercel.app/api/auth/callback/google`
3. 重新部署以加载最新的环境变量

### Q2: AI 分析失败
**原因**：OpenRouter API Key 无效或余额不足

**解决**：
1. 检查 [OpenRouter Dashboard](https://openrouter.ai/credits) 确认有余额
2. 查看 Vercel Logs 中的错误信息
3. 确认 `OPENAI_API_KEY` 格式正确（`sk-or-v1-...`）

### Q3: Supabase 连接失败
**原因**：密钥错误或 RLS 策略未配置

**解决**：
1. 确认 Supabase 密钥正确（以 `sb_secret_` 开头）
2. 检查 Supabase Table Editor 中是否有 7 张表
3. 确认 RLS 策略已启用

### Q4: 构建失败
**原因**：依赖冲突或 TypeScript 错误

**解决**：
1. 本地运行 `npm run build` 确认能成功构建
2. 查看 Vercel Build Logs 中的错误信息
3. 修复 TypeScript 错误后重新推送

---

## 📝 部署后优化建议

### 1. 自定义域名（可选）
1. 在 Vercel Dashboard → Settings → Domains
2. 添加你的域名（如 `swimcheck.com`）
3. 按照提示配置 DNS（CNAME 或 A 记录）
4. 更新 Google Cloud Console 中的回调 URL

### 2. 环境变量加密
Vercel 会自动加密环境变量，无需额外操作。

### 3. 监控和告警
1. 在 Vercel Dashboard → Analytics 中启用监控
2. 设置错误告警通知

### 4. SEO 优化
1. 更新 `src/app/layout.tsx` 中的 metadata
2. 添加 sitemap.xml
3. 提交到 Google Search Console

---

## 🎯 快速部署命令

```bash
# 1. 提交代码
git add .
git commit -m "feat: prepare for production deployment"
git push origin main

# 2. 在 Vercel Dashboard 中：
#    - 导入仓库
#    - 配置环境变量
#    - 点击 Deploy

# 3. 启用 Google OAuth
#    - 编辑 src/app/api/auth/[...nextauth]/route.ts
#    - 取消注释 GoogleProvider
git add .
git commit -m "chore: enable Google OAuth for production"
git push origin main

# 4. 更新 Google Cloud Console 回调 URL
#    - 添加 https://your-domain.vercel.app/api/auth/callback/google

# 5. 验证部署
#    - 访问 https://your-domain.vercel.app
#    - 测试所有功能
```

---

## 📞 需要帮助？

如果遇到问题，可以：
1. 查看 Vercel Deployment Logs
2. 检查浏览器控制台错误信息
3. 查看 Supabase Logs
4. 查看 OpenRouter Activity 页面
5. 联系支持团队

祝部署顺利！
