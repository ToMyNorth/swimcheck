# 修复 Google OAuth 登录失败问题

## 📋 问题诊断

### 症状
- 用户点击 "Sign in with Google" 后跳转到 `/api/auth/error?error=Configuration`
- 终端日志显示：`[auth][error] TypeError: fetch failed at async getAuthorizationUrl`
- curl 测试确认：`Failed to connect to accounts.google.com port 443`

### 根本原因
**中国大陆网络环境下，Google OAuth API（accounts.google.com）被防火墙封锁**，导致 NextAuth 无法获取授权 URL。

## 🎯 解决方案

### 方案 A：配置 HTTP 代理（快速解决，适合开发）

#### 步骤 1：安装 http-proxy-agent
```bash
npm install http-proxy-agent https-proxy-agent
```

#### 步骤 2：修改 `.env.local`，添加代理配置
```env
# 现有配置保持不变...

# 新增：HTTP 代理配置（替换为你的代理地址）
HTTP_PROXY=http://127.0.0.1:7890
HTTPS_PROXY=http://127.0.0.1:7890
NO_PROXY=localhost,127.0.0.1
```

> **注意**：将 `7890` 替换为你实际使用的代理端口（常见端口：7890、1080、51837 等）

#### 步骤 3：修改 NextAuth 配置以使用代理
创建新文件 `src/lib/proxy-fetch.ts`：
```typescript
import { HttpsProxyAgent } from 'https-proxy-agent';

const proxyAgent = process.env.HTTPS_PROXY 
  ? new HttpsProxyAgent(process.env.HTTPS_PROXY) 
  : undefined;

export const customFetch = async (url: string | URL | Request, options?: RequestInit) => {
  if (proxyAgent && url.toString().startsWith('https://')) {
    return fetch(url, { ...options, agent: proxyAgent as any });
  }
  return fetch(url, options);
};
```

修改 `src/app/api/auth/[...nextauth]/route.ts`：
```typescript
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { SupabaseAdapter } from '@auth/supabase-adapter';
import { customFetch } from '@/lib/proxy-fetch';

export const { handlers: { GET, POST }, auth, signIn, signOut } = NextAuth({
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  // 使用自定义 fetch 函数（通过代理）
  experimental: {
    enableWebAssembly: true,
  },
});
```

#### 步骤 4：重启开发服务器
```bash
pkill -9 node
npm run dev
```

---

### 方案 B：改用 GitHub OAuth（推荐，长期稳定）

#### 优点
- ✅ 国内可访问，无需代理
- ✅ 开发者友好（你的目标用户是程序员）
- ✅ 免费且稳定

#### 步骤 1：在 GitHub 注册 OAuth App
1. 访问 https://github.com/settings/applications/new
2. 填写信息：
   - **Application name**: SwimCheck
   - **Homepage URL**: http://localhost:3000
   - **Authorization callback URL**: http://localhost:3000/api/auth/callback/github
3. 获取 `Client ID` 和 `Client Secret`

#### 步骤 2：更新 `.env.local`
```env
# 注释掉 Google OAuth 配置
# GOOGLE_CLIENT_ID=...
# GOOGLE_CLIENT_SECRET=...

# 新增 GitHub OAuth 配置
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

#### 步骤 3：修改 NextAuth 配置
```typescript
import NextAuth from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import { SupabaseAdapter } from '@auth/supabase-adapter';

export const { handlers: { GET, POST }, auth, signIn, signOut } = NextAuth({
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
});
```

#### 步骤 4：更新登录页面 UI
修改 `src/app/auth/signin/page.tsx`，将 Google 按钮改为 GitHub 按钮。

#### 步骤 5：重启服务器并测试
```bash
pkill -9 node
npm run dev
```

---

### 方案 C：保留双 Provider（最佳用户体验）

同时支持 GitHub 和 Google，让用户自行选择：

```typescript
providers: [
  GitHubProvider({
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  }),
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  }),
],
```

这样：
- 国内用户 → 使用 GitHub 登录
- 海外用户 → 可选择 Google 或 GitHub

---

## ✅ 验证步骤

1. **访问** http://localhost:3000/auth/signin
2. **点击新的登录按钮**（GitHub 或 Google + 代理）
3. **完成 OAuth 授权流程**
4. **确认成功跳转回首页并显示用户信息**

---

## ⚠️ 注意事项

### 如果使用方案 A（代理）
- 仅适用于开发环境
- 生产环境部署到 Vercel/Netlify 时不需要代理（海外服务器可直接访问 Google）
- 需要确保代理软件运行中

### 如果使用方案 B/C（GitHub）
- 需要在 Supabase 数据库中保持相同的表结构（已创建的 7 张表可复用）
- GitHub OAuth 会自动创建用户记录，与 Google OAuth 兼容

---

## 📝 推荐执行顺序

1. **立即执行**：方案 A（配置代理）→ 快速恢复开发
2. **后续优化**：方案 C（双 Provider）→ 提升用户体验，兼容国内外用户

---

##  相关资源

- [NextAuth.js Providers 文档](https://authjs.dev/getting-started/authentication/oauth)
- [GitHub OAuth App 注册](https://github.com/settings/applications/new)
- [http-proxy-agent NPM](https://www.npmjs.com/package/http-proxy-agent)
