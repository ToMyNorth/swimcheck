# 修复 Google OAuth 登录失败 - 配置 HTTP 代理

## 📋 Context（背景）

### 问题描述
用户在中国大陆开发 SwimCheck 项目，本地已开启 VPN（v2rayN，端口 10808），但 Google OAuth 登录仍然失败：
- 浏览器访问 http://localhost:3000/auth/signin
- 点击 "Sign in with Google" 后跳转到 `/api/auth/error?error=Configuration`
- 终端日志显示：`[auth][error] TypeError: fetch failed at async getAuthorizationUrl`

### 根本原因
NextAuth v5 使用 undici fetch 库进行 HTTP 请求，该库**不会自动读取系统的 `HTTP_PROXY`/`HTTPS_PROXY` 环境变量**。即使 `.env.local` 中配置了代理变量，NextAuth 内部的 fetch 调用也不会使用它们。

### 验证结果
- ✅ 环境变量 `.env.local` 配置正确（GOOGLE_CLIENT_ID、NEXTAUTH_URL 等）
- ✅ Supabase 数据库表结构完整（7 张表已创建）
- ✅ Google Cloud Console 配置正确（回调 URL、Test users）
- ✅ 本地 VPN 正常运行（端口 10808）
-  Node.js 服务器端无法访问 Google API（undici fetch 不走系统代理）

---

## 🎯 解决方案

### 方案：创建自定义 Proxy Agent 并注入 NextAuth

#### 步骤 1：安装依赖包
```bash
npm install https-proxy-agent
```

#### 步骤 2：创建代理工具模块
新建文件 `src/lib/proxy-agent.ts`：
```typescript
import { HttpsProxyAgent } from 'https-proxy-agent';

// 从环境变量读取代理配置
const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;

// 创建代理 Agent（如果配置了代理）
export const proxyAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;

// 导出代理配置状态（用于调试）
export const isProxyConfigured = !!proxyAgent;
export const proxyEndpoint = proxyUrl;
```

#### 步骤 3：修改 NextAuth 配置
编辑 `src/app/api/auth/[...nextauth]/route.ts`：
```typescript
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { SupabaseAdapter } from '@auth/supabase-adapter';
import { proxyAgent, isProxyConfigured } from '@/lib/proxy-agent';

// 创建自定义 fetch 函数（使用代理）
const customFetch: typeof fetch = async (input, init) => {
  if (proxyAgent && typeof input === 'string' && input.startsWith('https://')) {
    // 使用代理发起请求
    return fetch(input, {
      ...init,
      dispatcher: proxyAgent as any, // undici Dispatcher
    });
  }
  return fetch(input, init);
};

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
  // ⚠️ NextAuth v5 beta 可能不支持直接传入 customFetch
  // 需要通过全局 patch 或其他方式注入
});
```

#### 步骤 4：全局 Patch Fetch（关键步骤）
由于 NextAuth v5 beta 可能不支持直接传入 `fetch` 选项，需要在全局层面 patch fetch：

创建文件 `src/instrumentation.ts`（Next.js 16+ 支持）：
```typescript
import { proxyAgent } from './lib/proxy-agent';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // 仅在 Node.js 运行时生效
    if (proxyAgent) {
      console.log(`[Proxy] Using HTTPS proxy: ${process.env.HTTPS_PROXY}`);
      
      // Patch global fetch to use proxy for HTTPS requests
      const originalFetch = global.fetch;
      global.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const urlString = typeof input === 'string' ? input : input.toString();
        
        if (urlString.startsWith('https://') && !urlString.includes('localhost')) {
          // 对 HTTPS 请求使用代理（排除 localhost）
          console.log(`[Proxy] Routing through proxy: ${urlString}`);
          return originalFetch(input, {
            ...init,
            dispatcher: proxyAgent as any,
          });
        }
        
        return originalFetch(input, init);
      };
    } else {
      console.log('[Proxy] No proxy configured');
    }
  }
}
```

#### 步骤 5：更新 next.config.ts
确保 `instrumentation.ts` 被正确加载：
```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* existing config */
};

export default nextConfig;
```

#### 步骤 6：重启开发服务器
```bash
pkill -9 node
npm run dev
```

---

## ✅ 验证步骤

### 1. 检查代理是否生效
访问 http://localhost:3000/api/debug-config，确认返回：
```json
{
  "config": {
    "googleClientId": "your-google-client-id",
    "googleClientSecret": "***configured***",
    "nextauthUrl": "http://localhost:3000",
    "supabaseUrl": "https://dzkljqvfxrovcwgbnjhl.supabase.co",
    "supabaseKey": "***configured***"
  },
  "issues": ["No configuration issues found"],
  "status": "OK"
}
```

### 2. 检查终端日志
启动服务器后，终端应显示：
```
[Proxy] Using HTTPS proxy: http://127.0.0.1:10808
```

### 3. 测试 Google OAuth 登录
1. 访问 http://localhost:3000/auth/signin
2. 点击 "Sign in with Google"
3. 选择测试账号 `a380816700norris@gmail.com`
4. 授权应用访问
5. **预期结果**：成功跳转回首页，显示用户信息

### 4. 检查终端日志（登录时）
点击登录后，终端应显示：
```
[Proxy] Routing through proxy: https://accounts.google.com/o/oauth2/v2/auth?...
```
而不是之前的 `TypeError: fetch failed`

---

## ⚠️ 注意事项

### 生产环境部署
- **Vercel/Netlify 部署时无需代理**：海外服务器可直接访问 Google API
- 建议通过环境变量控制代理启用：
  ```env
  # .env.local（开发环境）
  HTTPS_PROXY=http://127.0.0.1:10808
  
  # .env.production（生产环境，不设置代理）
  # HTTPS_PROXY=
  ```

### 替代方案（如果上述方法无效）
如果 NextAuth v5 beta 的 fetch patch 方式不工作，考虑：
1. **改用 GitHub OAuth**（国内可访问，无需代理）
2. **等待 NextAuth v5 正式版**（可能改进代理支持）
3. **使用旧版 NextAuth v4**（更稳定的代理兼容性）

---

## 📝 相关文件清单

### 需要修改的文件
- `src/app/api/auth/[...nextauth]/route.ts` - NextAuth 核心配置
- `src/instrumentation.ts` - 全局 fetch patch（新建）
- `next.config.ts` - 确保 instrumentation 加载

### 需要创建的文件
- `src/lib/proxy-agent.ts` - 代理工具模块（新建）

### 已修改的文件
- `.env.local` - 已添加 `HTTP_PROXY`/`HTTPS_PROXY` 配置

---

## 🔍 故障排查

### 如果仍然报错 `fetch failed`
1. **检查代理端口是否正确**：确认 v2rayN 实际监听端口是 10808
2. **检查代理是否运行**：在终端执行 `curl -x http://127.0.0.1:10808 https://www.google.com` 测试
3. **检查 instrumentation.ts 是否被加载**：查看终端是否有 `[Proxy] Using HTTPS proxy` 日志
4. **尝试手动测试代理**：
   ```bash
   curl -x http://127.0.0.1:10808 https://accounts.google.com/o/oauth2/v2/auth
   ```

### 如果报其他错误
- `error=AccessDenied` → 检查 Google Cloud Console 的 Test users 配置
- `error=OAuthCallback` → 检查回调 URL 是否正确
- `Supabase error` → 检查数据库表结构和 RLS 策略
