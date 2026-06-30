# SwimCheck 生产环境部署指南

##  Vercel 部署步骤

### 1. 推送代码到 GitHub

```bash
git add .
git commit -m "feat: prepare for production deployment"
git push origin main
```

### 2. 在 Vercel 创建项目

1. 访问 [vercel.com](https://vercel.com)
2. 点击 "Add New Project"
3. 选择 "Import Git Repository"
4. 选择 `swimcheck` 仓库
5. 点击 "Deploy"

### 3. 配置环境变量

在 Vercel 项目设置中，添加以下环境变量（Settings → Environment Variables）：

#### 必需变量
```env
# NextAuth Configuration
NEXTAUTH_SECRET=<生成一个随机字符串，至少32字符>
NEXTAUTH_URL=https://your-domain.vercel.app

# Google OAuth（生产环境启用）
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://dzkljqvfxrovcwgbnjhl.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Stripe（可选，用于付费功能）
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
NEXT_PUBLIC_STRIPE_PRICE_BASIC=price_basic_here
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_pro_here
```

> **注意**：
> - `NEXTAUTH_SECRET` 可以使用命令生成：`openssl rand -base64 32`
> - `NEXTAUTH_URL` 替换为你的实际域名（如 `https://swimcheck.vercel.app`）
> - **不要设置 `HTTP_PROXY`/`HTTPS_PROXY`**（Vercel 海外服务器可直接访问 Google API）

### 4. 启用 Google OAuth Provider

编辑 `src/app/api/auth/[...nextauth]/route.ts`，取消注释 GoogleProvider：

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

### 5. 更新 Google Cloud Console 回调 URL

在 [Google Cloud Console](https://console.cloud.google.com/) 中：

1. 进入 "APIs & Services" → "Credentials"
2. 找到 "OAuth 2.0 Client IDs" → "SwimCheck"
3. 在 "Authorized redirect URIs" 中添加：
   ```
   https://your-domain.vercel.app/api/auth/callback/google
   ```
4. 保存更改

### 6. 重新部署

```bash
git add .
git commit -m "chore: enable Google OAuth for production"
git push origin main
```

Vercel 会自动检测代码变更并重新部署。

---

## ✅ 验证部署

### 1. 检查环境变量
访问 `https://your-domain.vercel.app/api/debug-env`，确认所有环境变量已正确加载。

### 2. 测试 Google OAuth 登录
1. 访问 `https://your-domain.vercel.app/auth/signin`
2. 点击 "Sign in with Google"
3. 选择测试账号或你的 Google 账号
4. 授权应用访问
5. **预期结果**：成功跳转回首页，显示用户信息

### 3. 检查终端日志
在 Vercel Dashboard → Deployments → Logs 中，应该看到：
```
[Proxy] No proxy configured
```
（因为生产环境不需要代理）

---

## ⚠️ 常见问题

### Q1: 登录后跳转到 error=Configuration
**原因**：环境变量未正确配置或 Google Cloud Console 回调 URL 不匹配

**解决**：
1. 检查 Vercel 环境变量是否正确
2. 确认 Google Cloud Console 中的回调 URL 包含 `https://your-domain.vercel.app/api/auth/callback/google`
3. 重新部署以加载最新的环境变量

### Q2: Supabase 连接失败
**原因**：`SUPABASE_SERVICE_ROLE_KEY` 错误或 RLS 策略未配置

**解决**：
1. 确认 Supabase 密钥正确（以 `sb_secret_` 开头）
2. 检查 Supabase Table Editor 中是否有 7 张表（users, accounts, sessions, verification_tokens, analyses, subscriptions, profiles）
3. 确认 RLS 策略已启用

### Q3: Stripe 支付失败
**原因**：Stripe 密钥错误或 Webhook 未配置

**解决**：
1. 使用 Stripe Dashboard 获取正确的 `sk_live_*` 密钥
2. 在 Stripe Dashboard → Developers → Webhooks 中添加 endpoint：`https://your-domain.vercel.app/api/webhooks/stripe`
3. 复制 Webhook Signing Secret 到 `STRIPE_WEBHOOK_SECRET`

---

## 📝 本地开发 vs 生产环境对比

| 配置项 | 本地开发 | 生产环境（Vercel） |
|--------|---------|------------------|
| **NEXTAUTH_URL** | `http://localhost:3000` | `https://your-domain.vercel.app` |
| **HTTP_PROXY** | `http://127.0.0.1:10808`（可选） | **不设置** |
| **Google OAuth** | ❌ 禁用（网络限制） | ✅ 启用 |
| **数据库** | Supabase（远程） | Supabase（远程） |
| **部署方式** | `npm run dev` | Vercel 自动部署 |

---

## 🔒 安全建议

1. **不要提交 `.env.local` 到 Git**（已在 `.gitignore` 中）
2. **定期轮换 `NEXTAUTH_SECRET`**（每 90 天）
3. **使用 Supabase Row Level Security (RLS)** 保护用户数据
4. **启用 Stripe Webhook 签名验证**，防止伪造请求
5. **限制 Google OAuth 的 Authorized JavaScript origins**，只允许你的域名

---

## 📞 需要帮助？

如果遇到问题，可以：
1. 查看 Vercel Deployment Logs
2. 检查浏览器控制台错误信息
3. 查看 Supabase Logs
4. 联系支持团队

祝部署顺利！
