# StrokeLab SEO 运营操作指南

> 本文档为 strokelab.app 的 SEO 平台配置与站外运营操作手册。
> 代码层面的 SEO 优化已由开发团队完成（动态 Sitemap、页面 Metadata、JSON-LD 结构化数据、安全 Headers、图片优化等）。
> 本文档聚焦于需要手动操作的平台配置和长期运营策略。

---

## 一、Google Search Console (GSC) 配置

### 1.1 域名验证

当前状态：**已通过 HTML meta tag 完成验证**
- Verification code: `6IqIyPibuVCL9iqCrcn_mPut0rsklg8zrlSOtaI9nss`
- 该 tag 已配置在 `src/app/layout.tsx` 的 `metadata.verification.google` 字段中，Next.js 会自动渲染为 `<meta name="google-site-verification" content="...">` 标签

#### 添加 GSC 属性完整步骤

1. 访问 [Google Search Console](https://search.google.com/search-console)
2. 点击左上角下拉菜单 → **Add property**
3. 选择 **URL prefix** 方式（推荐，因为已通过 meta tag 验证）
4. 输入 `https://strokelab.app`，点击 **Continue**
5. 选择 **HTML tag** 验证方式 → 系统会自动检测到已有的 meta tag → 点击 **Verify**
6. 验证成功后，**再添加一个属性**：`https://www.strokelab.app`（同样使用 URL prefix + HTML tag 方式）

> ⚠️ **重要**：需要添加两个属性（带 www 和不带 www），确保 Google 正确识别你的首选域名。如果未来设置了 www 到非 www 的 301 重定向，GSC 会自动将信号合并到首选域名。

#### 设置首选域名

- 在 GSC 中选择 `https://strokelab.app` 属性
- 进入 **Settings** → **Change of Address**（如果后续需要迁移域名时使用）
- 确保 Vercel 部署已配置 www → 非 www 的 301 重定向（在 Vercel Dashboard → Domains 中设置）

### 1.2 提交 Sitemap

项目的 Sitemap 是通过 `src/app/sitemap.ts` **动态生成**的，每次访问都会返回最新内容，包含以下页面：

| URL | 优先级 | 更新频率 |
|-----|--------|---------|
| `https://strokelab.app/` | 1.0 | 每周 |
| `https://strokelab.app/analyze` | 0.9 | 每周 |
| `https://strokelab.app/analyze/video` | 0.9 | 每周 |
| `https://strokelab.app/pricing` | 0.8 | 每月 |
| `https://strokelab.app/faq` | 0.7 | 每月 |
| `https://strokelab.app/privacy` | 0.3 | 每年 |
| `https://strokelab.app/terms` | 0.3 | 每年 |

#### 提交步骤

1. 在 GSC 左侧菜单选择 **Sitemaps**
2. 在 "Add a new sitemap" 输入框中输入 `sitemap.xml`
3. 点击 **Submit**
4. 等待几分钟后刷新页面，确认状态显示为 **"Success"**
5. 如果状态为 "Couldn't fetch"，等待 24 小时后重新提交（新属性需要时间处理）

> 💡 **提示**：提交后可以在该页面看到 Google 从 Sitemap 发现的 URL 数量。未来新增页面（如博客文章）时，`sitemap.ts` 需要同步更新以包含新 URL。

### 1.3 URL 检查与索引请求

对每个重要页面手动请求索引，加速 Google 收录：

1. 在 GSC 顶部搜索栏输入完整 URL（如 `https://strokelab.app/`）
2. 按回车，等待 URL Inspection 结果
3. 如果显示 "URL is not on Google"，点击 **Request Indexing**
4. 每个 URL 每天可以请求索引一次

**优先请求索引的页面（按顺序）：**

- [ ] `https://strokelab.app/` — 首页（最重要）
- [ ] `https://strokelab.app/analyze` — 图片分析页
- [ ] `https://strokelab.app/analyze/video` — 视频分析页
- [ ] `https://strokelab.app/pricing` — 定价页
- [ ] `https://strokelab.app/faq` — FAQ 页

> 💡 通常提交后 1-2 周内会被索引。可以通过 `site:strokelab.app` 在 Google 搜索中验证收录情况。

### 1.4 日常监控 Checklist

**每周检查：**
- [ ] 进入 **Performance** → 查看 Search Performance 趋势（Total Clicks、Total Impressions、Average CTR、Average Position）
- [ ] 进入 **Indexing → Pages** → 检查是否有新的索引错误（如 "Not found (404)"、"Server error (5xx)"）
- [ ] 进入 **Experience → Core Web Vitals** → 检查 LCP、INP、CLS 指标是否通过（绿色 = Good）

**每月检查：**
- [ ] **Performance** → 查看 Queries 标签 → 了解用户搜索什么关键词找到你的网站
- [ ] **Performance** → 查看 Pages 标签 → 了解哪些页面带来最多流量
- [ ] **Links** → 检查外部链接（External links）数量变化

**设置邮件通知：**
1. GSC → 左下角齿轮图标 **Settings**
2. 找到 **Email notifications** 部分
3. 开启 "Send me email notifications about..." 所有选项
4. 这样当出现索引问题或安全问题时，Google 会主动通知你

### 1.5 哥飞方法论补充：新站 SEO 冷启动预期管理

> 以下内容基于哥飞（gefeixiaowang）的出海建站方法论，结合 StrokeLab 项目实际情况整理。

#### "养站"时间节奏表

哥飞反复强调，SEO 是一个需要耐心的长期过程，新站从上线到稳定变现有明确的时间节奏：

| 阶段 | 时间 | 预期 | StrokeLab 对应动作 |
|------|------|------|-------------------|
| 上线到首次收录 | 1-2 周 | Google 开始索引页面 | 提交 GSC + Sitemap，手动请求索引 |
| 首批长尾词排名 | 2-4 周 | 长尾词进入前 50 | 观察 GSC Performance 中的 Queries |
| 稳定自然流量 | 1-3 个月 | 日均几十到几百 UV | 持续发布博客 + 外链建设 |
| 养站成熟期 | 3-6 个月 | 稳定排名和收入 | 程序化 SEO + 订阅转化优化 |

#### 哥飞的"四心"理念

哥飞认为做好 SEO 需要 **决心、信心、耐心、恒心**。SEO 是一门依赖实践的技艺，不是看了教程就会的。StrokeLab 已完成代码层 SEO 优化（动态 Sitemap、Metadata、JSON-LD 等），技术基础扎实，提交 GSC 后需等待 1-2 周观察首批索引情况，不要因为短期内没有流量而焦虑。

#### StrokeLab 当前状态评估

- ✅ 代码层 SEO 已完成（Sitemap、Metadata、JSON-LD、Canonical URL 等）
- ⏳ 待操作：GSC 属性验证 + Sitemap 提交 + 手动请求索引
- 📊 预期：提交后 1-2 周内可在 `site:strokelab.app` 看到首批收录结果

#### 🔴 高优先级行动

- **每周记录 GSC 数据**：进入 GSC → Performance，记录 Impressions 和 Clicks 数据，建立基线。建议用 Google Sheets 做一个简单的周报模板，追踪周环比变化
- **建立 SEO 日志**：记录每次操作（提交 Sitemap 日期、发布博客日期、外链建设日期），方便后续复盘因果关系

---

## 二、数据分析与监控

### 2.1 Google Analytics 4 (GA4) 集成

#### 创建 GA4 媒体资源

1. 访问 [analytics.google.com](https://analytics.google.com)
2. 点击左下角 **Admin**（齿轮图标）
3. 点击 **+ Create** → **Property**
4. 填写以下信息：
   - Property name: `StrokeLab`
   - Reporting time zone: 选择 `United States`（主要目标用户市场）
   - Currency: `USD`
5. 点击 **Next** → 选择行业 `Sports` → 点击 **Next**
6. 选择 Business objectives → 点击 **Create**
7. 创建 Data Stream：选择 **Web**
   - Website URL: `https://strokelab.app`
   - Stream name: `StrokeLab Web`
   - 开启 **Enhanced measurement**（自动追踪页面浏览、滚动、外链点击等）
8. 记录 **Measurement ID**（格式为 `G-XXXXXXXXXX`）

#### 集成方式（推荐 Google Tag Manager）

**方案 A：通过 Google Tag Manager（推荐）**

1. 访问 [tagmanager.google.com](https://tagmanager.google.com) → 创建账号和容器
2. 容器名称: `StrokeLab`，目标平台: **Web**
3. 在 GTM 容器中：
   - 点击 **Tags** → **New**
   - Tag type: **Google Analytics: GA4 Configuration**
   - Measurement ID: 填入上面获得的 `G-XXXXXXXXXX`
   - Trigger: **All Pages**
   - 保存并发布容器
4. 获取 GTM 的容器代码（格式为 `GTM-XXXXXXX`）
5. 将 GTM 代码添加到项目中（需要开发者协助，在 `layout.tsx` 中使用 `next/script` 组件添加）

**方案 B：使用 `@next/third-parties` 包（如果 Next.js 版本支持）**

```tsx
// src/app/layout.tsx
import { GoogleAnalytics } from '@next/third-parties/google'

// 在 </body> 前添加
<GoogleAnalytics gaId="G-XXXXXXXXXX" />
```

> ⚠️ 无论选择哪种方案，都需要将 Measurement ID 配置到环境变量 `NEXT_PUBLIC_GA_ID` 中，便于管理。

#### 关键事件追踪设置

在 GA4 中设置以下自定义事件，追踪核心业务转化：

| 事件名称 | 触发时机 | 参数 | 业务意义 |
|---------|---------|------|---------|
| `analysis_complete` | 用户完成一次游泳分析 | `stroke_type`, `analysis_type`(image/video) | 核心功能使用率 |
| `pricing_view` | 用户访问定价页 | - | 付费意向 |
| `signup_complete` | 用户注册完成 | `provider`(google/email) | 获客转化 |
| `subscription_start` | 用户开始订阅 | `plan_name`, `price` | 收入转化 |
| `share_report` | 用户分享分析报告 | `share_method` | 自然传播 |

**GA4 Events 配置步骤：**

1. GA4 → **Admin** → **Data Display** → **Events**
2. 点击 **Create event** → 自定义事件
3. 对于 `analysis_complete`：
   - Event name: `analysis_complete`
   - Matching conditions: 需要在代码中通过 `gtag('event', 'analysis_complete', {...})` 触发
4. 在 GA4 → **Admin** → **Data Display** → **Conversions** 中将 `signup_complete` 和 `subscription_start` 标记为转化事件

> 💡 代码中的事件触发需要开发者配合，在分析完成的回调、注册成功回调等位置添加 `gtag` 调用。

#### 关联 GSC 与 GA4

关联后，可以在 GA4 中直接查看 Google 搜索数据（搜索词、展示量、点击量）：

1. GA4 → **Admin** → **Product Links** → **Search Console Links**
2. 点击 **Link** → 选择你已验证的 GSC 属性 `strokelab.app`
3. 选择要共享的 Search Console 数据视图
4. 确认关联

关联成功后，GA4 左侧菜单会出现 **Search Console** 报告组，包含 Landing Page 和 Google Organic Search Traffic 等报告。

### 2.2 Vercel Analytics 配置

当前状态：**已集成** — `@vercel/analytics` 组件已添加到 `src/app/layout.tsx` 的 `<Analytics />` 标签中。

#### 查看数据

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择 StrokeLab 项目
3. 点击顶部 **Analytics** 标签

#### 关注的面板

- **Audience**：访问量、独立访客数、页面浏览量、跳出率、平均会话时长。可以按国家/地区、设备类型、浏览器等维度筛选
- **Web Vitals**：基于真实用户数据（Real User Monitoring）的 Core Web Vitals 指标。包括 LCP（最大内容绘制）、FID/INP（交互延迟）、CLS（布局偏移）。以 P75 值展示，绿色/黄色/红色标识健康状况
- **Top Pages**：最受访问的页面排行，了解哪些页面吸引用户
- **Top Referrers**：流量来源，追踪外部引荐效果

#### 配置自定义事件（可选）

如果需要追踪 Vercel Analytics 自定义事件：

```tsx
import { track } from '@vercel/analytics'

// 在关键操作完成后调用
track('Analysis Completed', { type: 'image', stroke: 'freestyle' })
```

### 2.3 Vercel Speed Insights

1. Vercel Dashboard → 项目 → **Speed Insights** 标签
2. 如果未启用，点击 **Enable Speed Insights**
3. 等待 24-48 小时收集真实用户数据
4. 重点关注：
   - **LCP**（Largest Contentful Paint）：目标 < 2.5s。首页 Hero 区域的大图和背景视频可能是瓶颈
   - **INP**（Interaction to Next Paint）：目标 < 200ms。关注分析按钮等交互元素的响应速度
   - **CLS**（Cumulative Layout Shift）：目标 < 0.1。确保图片和动态内容不会导致布局跳动
5. 与 GSC 的 Core Web Vitals 报告交叉验证，确保数据一致性

---

## 三、站外 SEO 与内容策略

### 3.1 外链建设 (Backlinks) 策略

外链是 Google 排名算法的核心因素之一。对于 StrokeLab 这样的垂直工具产品，需要重点建设游泳/体育科技领域的高质量外链。

#### 高价值外链来源

| 来源类型 | 具体目标 | 优先级 | 预期难度 |
|---------|---------|-------|---------|
| 游泳社区/论坛 | Reddit r/swimming, r/SwimCoach, r/triathlon, SwimSwam 评论区 | 🔴 高 | 中 |
| 体育科技媒体 | SportsTechie, SwimSwam, Swimming World Magazine | 🔴 高 | 高 |
| 产品目录 | Product Hunt, BetaList, AlternativeTo, SaaSHub | 🟡 中 | 低 |
| 博客客座文章 | 游泳训练博客、铁人三项博客、体育科技博客 | 🟡 中 | 中 |
| YouTube 描述 | 游泳教学频道合作、自有频道 | 🟡 中 | 低 |
| 学术/教育 | 大学游泳队网站、体育科学课程资源页 | 🟢 低 | 高 |
| AI 工具目录 | Futurepedia、Toolify.ai、There's An AI For That、aitools.fyi 等 | 🔴 高 | 低 |
| 资源聚合页 | "Best Swimming Apps"、"Swim Training Tools" 列表 | 🟡 中 | 低 |

#### 外链建设操作步骤

**Reddit 策略（高优先级）：**

1. 注册 Reddit 账号，先花 2-3 周在 r/swimming、r/SwimCoach、r/triathlon 积累 karma
2. 回答游泳技术问题（如 "How to improve my freestyle catch?"），在回答中自然提及工具
3. 示例话术：*"I've been using this AI analysis tool called StrokeLab to check my body position — it shows you exactly where your hip drop is happening"*
4. 在每周 "Self-Promotion Thread" 中正式发布
5. 发布 "I built" 类型帖子：*"I built an AI tool that analyzes your swimming stroke from a photo — looking for beta testers"*

**客座博客策略：**

1. 在 Google 搜索 `"swimming" + "write for us"` 或 `"swim coaching" + "guest post"` 找目标博客
2. 准备 3-5 个文章选题（如 "How AI is Changing Swim Coaching"）
3. 发送邮件 pitch，提供选题和简短作者简介
4. 文章内自然嵌入 StrokeLab 链接（如 "tools like StrokeLab can help..."）

**资源页外链策略：**

1. 搜索 `"swimming apps" OR "swim training tools" OR "swimming resources"` 找到现有列表页
2. 联系站长/博主，请求将 StrokeLab 添加到他们的推荐列表
3. 提供免费使用权限作为交换

**AI 工具目录策略（详见 3.5 节）：**

1. 批量提交主流 AI 目录（Futurepedia、Toolify.ai、There's An AI For That 等），一次性获取高权重外链
2. 使用统一的 Listing 信息（见 3.5 节规范表），保持品牌一致性
3. 注册操作一次性完成，后续仅需季度检查 + 产品大版本更新时同步

### 3.2 社交媒体运营

#### Twitter/X

- **账号名**：`@strokelab_app` 或 `@strokelab`
- **Bio**：`AI-powered swimming stroke analysis 🏊‍♂️ Upload a photo, get instant coaching feedback. Try it free → strokelab.app`
- **内容方向**：
  - 游泳技术 tips（每周 2 条）：*"Tip: Keep your head down during freestyle. Looking forward causes hip drop → more drag. Here's what AI analysis reveals..."*
  - Before/After 分析对比（每周 1 条）：展示分析截图 + 改善建议
  - 产品更新（每次更新时发布）
  - 游泳行业/赛事相关评论（奥运、世锦赛期间）
- **Hashtags**：`#SwimTech` `#SwimmingAnalysis` `#AISports` `#SwimCoach` `#SwimTwitter` `#SwimmingTraining`
- **互动策略**：
  - 参与 `#SwimTwitter` 社区讨论
  - 回复游泳教练和运动员的推文
  - Retweet 游泳技术相关内容并添加评论
- **频率**：每周 3-5 条推文，保持稳定更新

#### YouTube

- **频道名**：`StrokeLab`
- **频道描述**：包含关键词 "AI swimming stroke analysis"
- **内容类型**：
  - 产品演示视频（2-3 分钟）："How to Use StrokeLab to Analyze Your Swimming"
  - 技术教程（5-10 分钟）："5 Freestyle Mistakes That AI Can Detect"
  - Before/After 对比（3-5 分钟）：展示用户改善过程
  - 技术原理（5-8 分钟）："How MediaPipe + AI Analyzes Swimming Strokes"
- **SEO 优化**：
  - 视频标题包含目标关键词（如 "AI Swimming Analysis - Free Tool"）
  - 视频描述前 2 行包含网站链接
  - 添加时间戳章节
  - 创建播放列表分类内容
- **频率**：每月 2-4 个视频

#### Reddit

- **活跃社区**：r/swimming（80万+成员）、r/SwimCoach、r/triathlon、r/fitness
- **策略**：
  - 不要直接打广告！Reddit 社区对硬广告极其反感
  - 先作为社区成员活跃 2-4 周，回答问题、分享经验
  - 在 "Weekly Self-Promotion" 帖子中分享（大多数 subreddit 有专门的自推帖）
  - 发布有价值的 "I built" 帖子：*"I built an AI tool that analyzes your swimming stroke from a photo. It uses pose detection + LLM to give coaching feedback. Looking for swimmers to try it out and give feedback!"*
  - 附上真实截图和分析结果
- **频率**：每周在相关帖子中互动 2-3 次

#### Instagram / TikTok

- **内容类型**：
  - 游泳分析过程的短视频/Reels（15-60 秒）
  - Before/After 对比（原图 → AI 骨骼叠加 → 评分结果）
  - 游泳技术 tips 图文轮播
  - 幕后花絮（开发过程、技术原理简介）
- **Bio 链接**：使用 Linktree 或直链到 strokelab.app
- **Hashtags**：`#swimming` `#swimtech` `#swimminganalysis` `#swimcoach` `#freestyleswimming` `#aitools`
- **频率**：每周 2-3 条短视频

### 3.3 Product Hunt / Hacker News 发布策略

#### Product Hunt Launch

**准备阶段（发布前 2-4 周）：**

1. 注册 Product Hunt 账号并完善 profile
2. 准备以下素材：
   - 产品页标题: **StrokeLab**
   - Tagline: **"AI-powered swimming stroke analysis — upload a photo, get instant coaching"**
   - 描述（500 字符以内）：突出 "AI + computer vision" 和 "free to try" 卖点
   - 截图 5-6 张：首页、分析上传页、分析结果（带骨骼叠加）、评分详情、AI 建议
   - 演示 GIF 或短视频（30-60 秒）：展示完整的上传→分析→结果流程
   - Gallery 中的 thumbnail
3. 准备 Maker Comment（第一条留言，由 maker 发布）：
   - 介绍为什么做这个产品
   - 技术栈亮点（MediaPipe pose detection + LLM coaching）
   - 邀请社区反馈
   - 提供免费试用额度

**发布策略：**

- 选择 **周二、周三或周四** 发布（竞争相对较小）
- 发布时间：**Pacific Time 00:01 AM**（Product Hunt 按太平洋时间日重置）
- 提前联系 2-3 个活跃 hunter 请求 hunt（hunter 发布比 maker 发布权重更高）
- 发布当天行动清单：
  - [ ] 在 Twitter/X 发布 launch 公告并 @producthunt
  - [ ] 在 LinkedIn 发布
  - [ ] 在相关 Slack/Discord 群分享
  - [ ] 回复所有 Product Hunt 评论（前 24 小时内）
  - [ ] 请朋友和支持者 upvote（但不要刷票，PH 会检测并惩罚）

#### Hacker News

- 发布标题：*"Show HN: I built an AI tool to analyze swimming strokes using pose detection"*
- URL: `https://strokelab.app`
- 准备一篇技术博客文章（如 "Building an AI Swim Coach with MediaPipe and LLMs"），在 HN 评论区链接
- 在评论中积极回答技术问题（HN 用户关注实现细节）
- 发布时间：**Pacific Time 上午 8-10 点，周二至周四**

### 3.4 博客内容营销建议

> 💡 **重要**：建议后续开发 `/blog` 路由。博客是长期 SEO 增长的核心引擎，每篇高质量文章都是一个新的流量入口。

#### 推荐文章选题（按优先级排序）

**高优先级（搜索量大、与产品直接相关）：**
1. "5 Common Freestyle Mistakes and How to Fix Them" — 搜索量最大的入门内容
2. "How to Film Your Swimming Stroke for AI Analysis" — 直接引导用户使用产品
3. "Swimming Stroke Efficiency: The Metrics That Matter" — 建立专业权威
4. "AI vs Human Swim Coaches: What Each Does Best" — 话题性强，容易引发讨论
5. "The Complete Guide to Breaststroke Technique" — 高搜索量的技术指南

**中优先级（技术深度、建立 E-E-A-T）：**
6. "How AI Pose Detection Works for Swimming Analysis" — 展示技术实力
7. "The Science Behind Swimming Stroke Analysis" — 科学背书
8. "Body Position in Swimming: Why Your Hips Drop (and How to Fix It)" — 解决具体痛点
9. "From Beginner to Advanced: Swimming Technique Progression" — 覆盖多个用户层级
10. "Underwater vs Above-Water Analysis: Which Is Better?" — 对比内容

#### 文章模板

每篇文章应包含：
- **H1 标题**：包含主关键词
- **Meta description**：150-160 字符，包含关键词和行动号召
- **导语**（100-200 字）：说明文章要解决什么问题
- **正文**（1500-3000 字）：使用 H2/H3 分段，包含图片/示意图
- **CTA**：文章末尾引导到分析页面（如 "Try analyzing your stroke for free at StrokeLab"）
- **内链**：至少 2-3 个链接指向其他博客文章或分析页面

#### 内容频率建议

| 阶段 | 时间范围 | 频率 | 说明 |
|------|---------|------|------|
| 启动期 | 第 1-3 个月 | 每周 1-2 篇 | 快速积累内容，建立索引基础 |
| 成长期 | 第 4-6 个月 | 每周 1 篇 | 稳定产出，优化已有内容 |
| 成熟期 | 6 个月后 | 每两周 1 篇 | 重点维护高质量内容，更新旧文章 |

#### 关键词策略

**主关键词（搜索量大，竞争激烈）：**
- `swimming stroke analysis` — 核心关键词
- `AI swimming coach` — 差异化卖点
- `swim technique analysis` — 功能描述

**长尾关键词（搜索量适中，竞争较低）：**
- `how to improve freestyle stroke`
- `breaststroke technique tips`
- `AI swim analysis tool free`
- `swimming posture correction`
- `analyze my swimming stroke online`
- `swimming form checker`

**关键词研究工具：**
- 免费：Google Keyword Planner、Google Trends、AnswerThePublic
- 付费：Ahrefs、SEMrush、Ubersuggest Pro

### 3.5 AI 工具目录收录（高优先级）

AI 工具目录是近年来新兴的高权重流量入口。用户通过 "AI swimming analysis"、"best AI tools for sports" 等关键词直接在这些平台上搜索工具。**收录到主流 AI 目录不仅带来高质量外链，还能直接获取精准的 AI 工具寻找者用户**。大部分目录收录免费，且操作一次性完成，投入产出比极高。

#### 为什么必须注册 AI 目录？

1. **精准流量**：访问 AI 目录的用户正在主动寻找 AI 工具，转化意图极强
2. **高权重外链**：主流 AI 目录的域名权重（DA/DR）通常在 50-80 之间，对 SEO 帮助极大
3. **品牌曝光**：在 "AI Sports"、"AI Coaching" 等分类中占据位置
4. **长尾搜索覆盖**：用户可能搜索 "AI swimming coach tool" 直接从目录找到你
5. **一次性投入**：注册一次即可长期获益，后续仅需偶尔更新信息

#### 主流 AI 目录收录清单

| 平台名称 | 网址 | 收录难度 | 是否免费 | 域名权重 | 预计效果 |
|---------|------|---------|---------|---------|--------|
| Futurepedia | futurepedia.io | 低（表单提交） | ✅ 免费 | DA ~75 | 高（最大 AI 目录） |
| Toolify.ai | toolify.ai | 低（表单提交） | ✅ 免费 | DA ~65 | 高（流量大） |
| There's An AI For That | theresanaiforthat.com | 中（审核较严） | ✅ 免费 | DA ~70 | 高（知名度高） |
| aitools.fyi | aitools.fyi | 低（表单提交） | ✅ 免费 | DA ~60 | 中 |
| TopAI.tools | topai.tools | 低（表单提交） | ✅ 免费 | DA ~55 | 中 |
| AI Tool Tracker | aitooltracker.com | 低（表单提交） | ✅ 免费 | DA ~45 | 中低 |
| Future Tools | futuretools.io | 中（需审核） | ✅ 免费 | DA ~65 | 中高 |
| OpenTools | opentools.ai | 低（表单提交） | ✅ 免费 | DA ~50 | 中 |
| ToolPilot.ai | toolpilot.ai | 低（表单提交） | ✅ 免费 | DA ~55 | 中 |
| Easy With AI | easywithai.com | 低（表单提交） | ✅ 免费 | DA ~40 | 中低 |

#### 注册操作步骤

**以 Futurepedia 为例（其他平台流程类似）：**

1. 访问 [futurepedia.io](https://www.futurepedia.io)
2. 点击页面右上角 **"Submit a Tool"** 或 **"Add Your Tool"**
3. 填写以下信息：
   - **Tool Name**: StrokeLab
   - **Tool URL**: https://strokelab.app
   - **Short Description**: AI-powered swimming stroke analysis tool that provides instant coaching feedback
   - **Long Description**: StrokeLab uses MediaPipe pose detection and advanced AI to analyze swimming strokes from photos or videos. Upload a swimming photo, get instant feedback on body alignment, arm entry angle, head position, and more. Receive personalized coaching tips powered by large language models. Supports freestyle, breaststroke, and more. Free to try with 3 analyses per month.
   - **Category**: Sports / Fitness / Education
   - **Pricing Model**: Freemium
   - **Screenshots**: 准备 3-5 张高清截图（首页、分析上传界面、分析结果页、AI 建议页面）
   - **Logo**: 使用 StrokeLab logo 的 512x512 PNG 版本
   - **Favicon**: 使用网站 favicon
4. 提交后等待审核（通常 1-3 个工作日）
5. 审核通过后检查 Listing 页面，确保所有信息正确、链接可点击

#### 各平台 Listing 信息统一规范

为保持品牌一致性，所有目录使用统一的基础信息：

| 字段 | 内容 |
|------|------|
| 工具名称 | StrokeLab |
| 一句话描述 | AI-powered swimming stroke analysis — upload a photo, get instant coaching feedback |
| 详细描述 | StrokeLab uses MediaPipe pose detection and LLM-powered coaching to analyze swimming strokes from photos or videos. Get instant feedback on body alignment, arm entry angle, head position, and receive personalized improvement tips. Supports freestyle, breaststroke, and more. |
| 定价模型 | Freemium（免费 3 次/月，订阅解锁无限分析） |
| 分类标签 | Sports, Fitness, AI Coaching, Education, Image Analysis |
| 核心卖点关键词 | AI swimming analysis, swim stroke analysis, AI swim coach, pose detection, swimming technique |

#### 注册进度 Checklist

- [ ] Futurepedia 已提交（DA ~75，最高优先级）
- [ ] Toolify.ai 已提交
- [ ] There's An AI For That 已提交
- [ ] aitools.fyi 已提交
- [ ] TopAI.tools 已提交
- [ ] AI Tool Tracker 已提交
- [ ] Future Tools 已提交
- [ ] OpenTools 已提交
- [ ] ToolPilot.ai 已提交
- [ ] Easy With AI 已提交
- [ ] 所有已通过的 Listing 链接已在表格中记录
- [ ] 各 Listing 页面的截图/描述信息一致且准确
- [ ] 在各 Listing 页面的评论区或 Q&A 中补充产品特色

> 💡 **提示**：完成上述目录注册后，可以在 GA4 中创建自定义渠道组 "AI Directories"，追踪来自这些平台的流量。在 GA4 → Reports → Acquisition → Traffic acquisition 中，Referral 来源会显示具体哪个目录带来了访问。

#### 持续维护

- 每季度检查一次各目录 Listing 状态，确保页面未被下架
- 产品有重大更新时（如新增泳姿支持、视频分析升级），同步更新各目录的描述
- 如有新的高权重 AI 目录出现，及时提交收录
- 监控 GA4 Referral 数据，评估各目录的流量贡献

#### 哥飞方法论补充：外链建设实战技巧

> 以下内容基于哥飞社群分享的外链建设实战经验，针对 StrokeLab 项目具体化。

**"抄作业"方法**：哥飞社群成员 BBQ 夫妇分享的核心策略——每天用 Ahrefs/Semrush 分析竞争对手的外链来源，照着一个个做。每个新站上线后立即做上百个外链，不要等“准备好了”再开始。

**高 DR 值免费外链渠道（社群总结）：**

| 渠道 | 域名权重 | 成本 | 操作步骤 | 优先级 |
|------|---------|------|---------|--------|
| Stripe Climate 捐赠 | DR 94 | 0.1% 捐赠 | 注册 Stripe → 开启 Climate → 自动获得高 DR 外链 | 🔴 高 |
| Hacker News Show | DR 90+ | 免费 | 提交 "Show HN: I built an AI swimming stroke analysis tool" 帖子 | 🔴 高 |
| Chrome 插件商店 | DR 99 | $5 注册费 | 将 StrokeLab 做成简单 Chrome 插件提交 **[需开发]** | 🟡 中 |
| AI 导航站批量收录 | DR 40-75 | 免费 | 见 3.5 节 AI 工具目录清单，一次性全部提交 | 🔴 高 |
| GitHub Awesome 列表 | DR 90+ | 免费 | 找到 awesome-ai-tools、awesome-swimming 等仓库，提交 PR | 🔴 高 |

**操作步骤（以 Hacker News Show 为例）：**

1. 注册 Hacker News 账号（需等待一定时间才能发帖）
2. 发布标题：`Show HN: I built an AI tool that analyzes swimming strokes using pose detection`
3. URL 填写 `https://strokelab.app`
4. 在评论区准备好技术细节回答（MediaPipe + LLM 实现方式）
5. 发布时间：太平洋时间上午 8-10 点，周二至周四

**🔴 高优先级行动：**
- 上线第一周完成 Hacker News Show 提交 + 全部 AI 目录收录（见 3.5 节）
- 完成 Stripe Climate 开启

**🟡 中优先级行动：**
- 研究游泳类竞品（如 SwimEye、Technique AI 等）的反向链接来源，用 Ahrefs 免费版查看，逐个复制
- 探索 Chrome 插件方案的可行性

#### 哥飞方法论补充：程序化 SEO 与长尾关键词批量生产

> 以下内容基于哥飞的程序化 SEO 核心理念，针对 StrokeLab 项目具体化。

**核心理念："一句话需求做页面"**——找到大量相似长尾关键词，创建页面模板 + 数据库，批量生成页面。哥飞常举的案例：picturethisai.com 拥有 500 万个页面，单页最多几百访问，但累计月访问量 150 万。

**针对 StrokeLab 的具体建议 [需开发]：**

创建 `/tools/[tool-name]` 路由，批量生成工具页面：

| 页面路径 | 目标关键词 | 页面标题 |
|---------|---------|----------|
| `/tools/freestyle-stroke-analyzer` | freestyle stroke analyzer | Free Freestyle Stroke Analyzer Online |
| `/tools/breaststroke-technique-checker` | breaststroke technique checker | Breaststroke Technique Checker - AI Powered |
| `/tools/butterfly-form-evaluator` | butterfly form evaluator | Butterfly Swimming Form Evaluator |
| `/tools/swim-posture-checker` | swimming posture checker | Swimming Posture Checker - Free AI Analysis |
| `/tools/backstroke-start-analyzer` | backstroke start analyzer | Backstroke Start Analyzer Online |
| `/tools/swim-turn-technique-tool` | swim turn technique tool | Swimming Turn Technique Analyzer |
| ... | ... | 共 20-50 个长尾词页面 |

每个页面使用统一模板，但标题、描述、H1、CTA 不同。每个页面都是一个独立的 SEO 入口，最终指向主分析工具。

**KGR（关键词黄金比例）公式应用：**

```
KGR = allintitle 搜索结果数 / 月搜索量（搜索量须 < 250）
```

| KGR 值 | 判断 | 预期 |
|--------|------|------|
| KGR < 0.25 | 值得做 | 几天内就有排名 |
| 0.25 < KGR < 1 | 有难度 | 需要时间积累 |
| KGR > 1 | 放弃 | 竞争太激烈 |

**操作步骤：**
1. 在 Google 搜索 `allintitle:freestyle stroke analyzer free online`，统计结果数
2. 用 Google Keyword Planner 或 Ubersuggest 查询月搜索量
3. 计算 KGR，筛选 < 0.25 的关键词优先做页面

**"低 KD 多内页"打法（农村包围城市）：**

- **不做大词**（如 "swimming analysis"），新站没权重排不上
- **做大量低竞争长尾内页**，每页几十搜索量，100 个页面累计几千月访问
- **词根扩展法**：一个主词 + 后缀裂变
  - 主词 `swimming stroke` + Analyzer / Checker / Calculator / Tool / Coach / Evaluator / Generator
  - 主词 `freestyle technique` + Analyzer / Tips / Guide / Correction / Assessment
  - 主词 `breaststroke form` + Checker / Evaluator / Improvement / Analysis

**🔴 高优先级——这是工具站流量增长的核心引擎**

**预期效果：** 开发完成后 2-3 个月内，长尾页面累计贡献 30-50% 的总自然流量。

#### 哥飞方法论补充：导航站外链的优先级判断

> 以下内容基于哥飞社群经验，补充导航站外链的优先级策略。

哥飞社群经验：导航站外链是"一次性投入、长期回报"的高 ROI 动作。除了 3.5 节已列出的 10 个 AI 目录，还应关注以下渠道：

| 平台 | 类型 | 说明 | 优先级 |
|------|------|------|--------|
| GitHub Awesome 列表 | 开源社区 | 如 awesome-ai-tools、awesome-machine-learning，提交 PR 免费获取高 DR 外链 | 🔴 高 |
| SaaS 评测站 | 如 G2、Capterra | 适合有订阅模式的工具，提交产品 Listing | 🟡 中 |
| Dev.to / Hashnode | 技术博客平台 | 发布技术文章（如 "Building an AI Swim Coach with MediaPipe + LLM"），自然嵌入链接 | 🟡 中 |
| Indie Hackers | 独立开发者社区 | 发布产品故事，分享开发过程 | 🟡 中 |
| BetaList | 新产品目录 | 适合早期产品提交 | 🟡 中 |

哥飞建议："提前注册好海外各种媒体、社区、服务的账号，并时常登录保持活跃。" 这意味着不要等到需要发外链时才注册账号，平时就要维护这些平台的存在感。

**🔴 高优先级行动：**
- 第一周完成 GitHub Awesome 列表 PR 提交（至少 3-5 个相关仓库）
- 第一周发布 Dev.to 技术文章 1 篇（如 "How I Built an AI Swimming Coach with MediaPipe and LLMs"）

**🟡 中优先级行动：**
- 第二周完成 G2/Capterra 产品提交
- 持续在 Dev.to/Hashnode 发布技术文章（每月 1-2 篇）

---

## 四、Google AdSense 申请准备 Checklist

### 4.1 申请前必备条件

- [ ] 网站运营至少 3-6 个月（Google 偏好有一定历史的网站）
- [ ] 日均独立访客达到 100+（建议 500+，流量越大通过率越高）
- [ ] 至少 15-20 个高质量内容页面（包括工具页 + 博客文章）
- [ ] 有博客文章（至少 10 篇原创内容，每篇 1000 字以上）
- [ ] Privacy Policy 页面（✅ 已有 `/privacy`）
- [ ] Terms of Service 页面（✅ 已有 `/terms`）
- [ ] About Us 页面（⚠️ 需要创建 `/about`）
- [ ] Contact Us 页面（⚠️ 需要创建 `/contact`）
- [ ] 网站无 broken links 或 404 错误
- [ ] 网站加载速度良好（LCP < 2.5s，可用 PageSpeed Insights 检测）
- [ ] 网站无抄袭/重复内容
- [ ] 导航清晰，用户可以方便地浏览网站

### 4.2 建议新增的页面（AdSense 审核友好）

这些页面不仅有助于 AdSense 审核通过，也能提升网站的专业形象：

| 页面路径 | 内容说明 | 优先级 |
|---------|---------|-------|
| `/about` | 关于 StrokeLab 团队、使命、技术原理。展示 E-E-A-T（经验、专业、权威、可信）| 🔴 高 |
| `/contact` | 联系表单或邮箱地址，让用户和 Google 看到这是一个真实的业务 | 🔴 高 |
| `/blog` | 博客列表页，展示内容深度和更新频率 | 🟡 中 |
| `/blog/[slug]` | 博客文章页，每篇都是独立的 SEO 入口 | 🟡 中 |

### 4.3 申请流程

1. 访问 [adsense.google.com](https://adsense.google.com)
2. 使用 Google 账号登录
3. 点击 **Get started** → 添加网站 URL: `strokelab.app`
4. 选择国家/地区，同意条款
5. Google 会提供一段 AdSense 代码片段
6. 将代码添加到项目中：

```tsx
// src/app/layout.tsx 中添加
import Script from 'next/script'

// 在 <head> 或 <body> 中添加
<Script
  async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
  crossOrigin="anonymous"
  strategy="afterInteractive"
/>
```

7. 回到 AdSense 点击 **I've pasted the code** → 提交审核
8. 等待审核（通常 1-2 周，有时会更快）
9. 审核期间保持网站可访问，不要修改核心内容
10. 审核通过后：
    - 在 AdSense Dashboard 中创建广告单元
    - 选择广告格式（推荐 Auto ads 先测试，再手动调整）

### 4.4 广告位建议

| 页面类型 | 推荐广告位 | 注意事项 |
|---------|-----------|---------|
| 博客文章页 | 文章段落间内嵌广告 + 文章末尾广告 | 不影响阅读体验，段落间至少 2 段文字间隔 |
| 分析结果页 | 结果报告下方展示（仅非付费用户） | **付费用户不展示广告**，保护订阅体验 |
| 首页 | 页面底部 banner 广告 | 不要放在 Hero 区域或 CTA 按钮附近 |
| FAQ 页 | 问题列表下方 | 不要在折叠区域以上展示广告 |

> ⚠️ **重要原则**：广告绝不能影响核心用户体验。分析工具的使用流程（上传→分析→查看结果）中不应出现广告干扰。博客文章是展示广告的最佳位置。

### 4.5 哥飞方法论补充：变现升级策略

> 以下内容基于哥飞 2025 年 12 月 SEO 大会核心观点及社群经验，结合 StrokeLab 项目具体化。

#### 核心观点：超越 AdSense，追求更高天花板

哥飞明确指出：“放弃低天花板的 AdSense，选择付费订阅等更高潜力的变现方式。” AdSense 只是基础变现手段，对于 StrokeLab 这样的 AI 工具站，订阅付费才是核心收入来源。

#### 哥飞变现方式对比（每 1000 UV 收入）

| 方式 | 收入 | 适用 StrokeLab？ | 说明 |
|------|------|----------------|------|
| AdSense 广告 | $5-20 | ✅ 博客/免费用户页面 | 低门槛，但天花板低 |
| 订阅付费 | $10-120+ | ✅ **核心变现方式** | 高天花板，稳定 MRR |
| 混合模式 | 最高 | ✅ **推荐** | 订阅为主 + 博客页广告补充 |

#### StrokeLab 变现公式（基于哥飞方法论）

```
收入 = 流量 × 付费转化率 × ARPPU × 生命周期
```

- 目标：每 1000 新注册用户，订阅可带来 $120/月，广告仅 $20
- 订阅 vs 广告收入比应为 **6:1 以上**
- 重点优化付费转化率和用户留存，而非单纯追求流量

#### AdSense 申请时机优化

- 哥飞指出：网上说域名注册 3 个月才能申请，但流量大、内容充实的网站可以更早
- **建议时机**：日均 UV 100+ 且有 10+ 篇博客文章后再申请
- **申请前确保**：About 和 Contact 页面存在 **[需开发]**
- 申请前检查所有博客文章质量，确保每篇 1000 字以上、无抄袭

#### 定价建议（社群经验）

- **定价不低于 $19/月**：低价产品手续费吃利润，不值得
- **高价 + 优惠券 > 低价无优惠**：用户心理感受更好，且有促销空间
- **年费默认勾选**：提高 LTV，降低流失率
- 建议设置 $19/月、$149/年（相当于 $12.4/月）两档，年费显示为默认选项

#### 广告位补充建议 [推演建议，基于哥飞核心理念合理推断]

- **高 CPC 内容方向**：在博客中写 "best swimming equipment"、"swim coaching software comparison" 等对比类文章（SaaS/Tech 类关键词 CPC 更高）
- **SEO 流量 RPM 通常 $4-10**，社交媒体 RPM 仅 $0.8-2 → 优先发展 SEO 流量
- **CTR 低于 0.5% 的广告位应删除**：低 CTR 广告位影响用户体验，收益微薄

#### 🔴 高优先级——变现是整个项目的终极目标

**行动清单：**
- [ ] 确认订阅定价策略（不低于 $19/月，年费默认勾选）
- [ ] 在达到日均 100 UV + 10 篇博客后申请 AdSense
- [ ] 开发 About 和 Contact 页面 **[需开发]**
- [ ] 规划 2-3 篇高 CPC 对比类博客文章

---

## 五、持续优化 Checklist

### 每月检查项

- [ ] 检查 GSC **Performance** 报告：点击量、展示量、CTR、平均排名的趋势
- [ ] 检查 GSC **Indexing → Pages**：是否有新的索引错误或警告
- [ ] 检查 GSC **Core Web Vitals**：URL 组的性能状态
- [ ] 分析 GA4 **Reports → Acquisition**：各流量来源的表现（Organic Search、Social、Direct、Referral）
- [ ] 分析 GA4 **Reports → Engagement**：用户行为、事件触发次数
- [ ] 检查关键词排名变化：在 Google 搜索核心关键词，记录排名位置
- [ ] 发布至少 2-4 篇博客文章（启动期建议 4+ 篇）
- [ ] 社交媒体活跃度维护：Twitter/X、Reddit 等平台保持更新
- [ ] 检查 AI 工具目录 Listing 状态：确认各平台页面正常、未被下架
- [ ] Vercel Analytics **Web Vitals**：检查真实用户性能数据

### 每季度检查项

- [ ] 审计并更新旧内容：检查已有博客文章的信息是否过时，更新数据和链接
- [ ] 外链建设效果评估：GSC → Links → External links 数量和质量
- [ ] AI 工具目录效果评估：GA4 Referral 数据中各目录的流量和转化
- [ ] 检查是否有新的高权重 AI 目录需要提交
- [ ] 竞品分析：搜索 "AI swimming analysis"、"swim stroke analysis tool" 查看排名情况
- [ ] 调整关键词策略：根据 GSC 实际搜索词数据，发现新的关键词机会
- [ ] 评估是否需要增加新页面/功能：根据用户搜索行为和需求调整
- [ ] 检查技术 SEO：使用 Screaming Frog 爬取全站，检查 broken links、重复内容、missing meta tags
- [ ] 使用 [Rich Results Test](https://search.google.com/test/rich-results) 验证 JSON-LD 结构化数据
- [ ] 使用 [PageSpeed Insights](https://pagespeed.web.dev) 检查各页面性能评分

### 年度检查项

- [ ] 全面 SEO 审计（可使用 Ahrefs Site Audit 或 Screaming Frog）
- [ ] 更新 About 页面和团队信息
- [ ] 评估整体内容策略是否需要调整方向
- [ ] 回顾年度流量和收入数据，制定下一年增长计划
- [ ] 检查并更新 Privacy Policy 和 Terms of Service

## 七、哥飞方法论补充：工具站出海整体战略

> 以下章节基于哥飞方法论的核心理念，为 StrokeLab 项目定制的整体战略规划。

### 7.1 "养网站防老"理念与 StrokeLab 定位

哥飞核心理念：“做网站就像种果树，先种一棵，再种第二棵，慢慢形成果园。这些果树会持续产出果实（被动收入）。”

**StrokeLab 在哥飞框架中的定位：**

| 维度 | 评估 |
|------|------|
| 类型 | **AI 工具站**（1000 UV 变现 $10-100+，高于小游戏站和纯内容站） |
| 优势 | 已有 MediaPipe + LLM 技术壁垒，不是简单的 wrapper |
| 策略 | 先做好 StrokeLab 这一个站，验证模式后可用相同技术栈扩展 |
| 护城河 | 技术实现复杂度高，不容易被复制 |

### 7.2 用户增长路径（哥飞框架适配）

| 阶段 | 时间 | 核心动作 | 目标指标 |
|------|------|---------|----------|
| 冷启动 | 第 1-2 周 | GSC 提交 + AI 目录收录 + Reddit/HN 发布 | 首批收录 + 100 DAU |
| SEO 爬坡 | 第 1-3 个月 | 博客内容生产 + 长尾页面建设 + 外链建设 | 500 DAU + 首批 AdSense |
| 增长加速 | 第 3-6 个月 | 程序化 SEO 页面批量上线 + 社交媒体矩阵 | 2000 DAU + 订阅转化 |
| 稳定变现 | 6 个月+ | 内容更新维护 + 新功能迭代 + 变现优化 | 稳定 MRR + AdSense |

### 7.3 矩阵扩展建议（长期）

- 哥飞鼓励"先上 10 个站"，但 StrokeLab 当前应**专注做好一个站**
- 当 StrokeLab 月入稳定后，可考虑：
  - **扩展同技术栈工具站**（如 AI 瑜伽姿势分析、AI 高尔夫挥杆分析）[推演建议，基于哥飞核心理念合理推断]
  - **使用子目录（非子域名）做多语言版本**，权重集中 **[需开发]**
  - 哥飞明确建议：多语言用子目录 + hreflang 标签，不用子域名（权重分散）
- 🟢 **低优先级——当前阶段专注单站**

### 7.4 "新词"挖掘策略（针对游泳/AI 领域）

哥飞最核心策略：“捷径是找到刚出现的‘新词’，此时竞争少，哪怕做得一般也能拿到排名。”

**针对 StrokeLab 的新词来源：**

| 来源 | 操作 | 示例 |
|------|------|------|
| AI 新模型发布 | 新 pose estimation 模型发布时，立即写评测/对比文章 | "MediaPipe vs MoveNet for Swimming Analysis" |
| 游泳赛事热点 | 奥运、世锦赛期间快速发布分析类文章 | "AI Analysis of Leon Marchand's Butterfly Stroke" |
| Google Trends | 监控 "AI swimming" 相关上升趋势词 | 发现 "swim AI coach" 搜索量突增，立即做页面 |
| 社交媒体热点 | Twitter/Reddit 上游泳相关话题爆发 | 某个游泳技术话题火了，快速写博客 |

**新词判断方法：**
1. 在 Google 搜索关键词
2. 查看搜索结果中是否有近 30 天内发布的内容
3. 如果有大量新内容，说明是新词，值得快速进入
4. 如果搜索结果都是旧内容，说明已有稳定竞争格局

**🔴 高优先级：**
- 每月至少做 1 次新词挖掘
- 发现机会后 **48 小时内**发布对应内容（新词窗口期短）
- 设置 Google Alerts 监控 "AI swimming"、"swimming analysis" 等关键词

### 7.5 核心公式与 KPI 看板

**核心公式：**

```
SEO = Contents(80%) + Backlinks(20%) + Technical(基本功)
收入 = 流量 × 付费转化率 × ARPPU × 生命周期
KGR = allintitle 结果数 / 月搜索量（< 250 才值得做）
```

**月度 KPI 看板（建议第 3 个月达到的目标）：**

| 指标 | 数据来源 | 月度目标（第 3 个月） |
|------|---------|---------------------|
| Google 收录页面数 | GSC → Coverage | 50+ |
| 自然搜索点击量 | GSC → Performance | 500+ |
| 日均独立访客 | GA4 | 500+ |
| 付费订阅用户 | Stripe Dashboard | 20+ |
| 博客文章数 | 手动统计 | 12+ |
| 外链数量 | Ahrefs/GSC Links | 100+ |
| AdSense 月收入 | AdSense Dashboard | $50+（如已通过审核） |

**🔴 高优先级：** 建立 Google Sheets KPI 看板，每月更新一次，追踪上述所有指标的变化趋势。

---

## 六、工具推荐

| 工具 | 用途 | 费用 | 优先级 |
|------|------|------|-------|
| [Google Search Console](https://search.google.com/search-console) | 索引监控、搜索表现、技术 SEO | 免费 | 🔴 必装 |
| [Google Analytics 4](https://analytics.google.com) | 流量分析、用户行为、转化追踪 | 免费 | 🔴 必装 |
| [Vercel Analytics](https://vercel.com/docs/analytics) | Web Vitals、真实用户性能监控 | Vercel 包含 | 🔴 必装 |
| [Google Tag Manager](https://tagmanager.google.com) | 统一管理 GA4、AdSense 等跟踪代码 | 免费 | 🟡 推荐 |
| [PageSpeed Insights](https://pagespeed.web.dev) | 页面速度测试和优化建议 | 免费 | 🔴 必用 |
| [Rich Results Test](https://search.google.com/test/rich-results) | JSON-LD 结构化数据验证 | 免费 | 🟡 推荐 |
| [Ubersuggest](https://neilpatel.com/ubersuggest/) | 关键词建议、搜索量查询 | 免费/付费 | 🟡 推荐 |
| [Google Trends](https://trends.google.com) | 搜索趋势分析、季节性变化 | 免费 | 🟡 推荐 |
| [Screaming Frog](https://www.screamingfrog.co.uk/seo-spider/) | 网站爬虫、技术 SEO 审计 | 免费（500 URL） | 🟢 可选 |
| [Ahrefs](https://ahrefs.com) | 关键词研究、外链分析、竞品研究 | 付费（$99/月起） | 🟢 可选 |
| [SEMrush](https://www.semrush.com) | 全功能 SEO 套件 | 付费（$119/月起） | 🟢 可选 |
| [AnswerThePublic](https://answerthepublic.com) | 发现用户常问问题，指导内容创作 | 免费/付费 | 🟢 可选 |
| [Canva](https://www.canva.com) | 制作社交媒体图片和博客配图 | 免费/付费 | 🟡 推荐 |

---

## 附录：已完成的代码层 SEO 配置清单

以下工作已在代码中完成，无需手动操作，但需要运营人员了解：

| 配置项 | 状态 | 文件位置 | 说明 |
|-------|------|---------|------|
| Google Verification Tag | ✅ 已完成 | `src/app/layout.tsx` | Meta tag 已配置 |
| 动态 Sitemap | ✅ 已完成 | `src/app/sitemap.ts` | 7 个核心页面 |
| Robots.txt | ✅ 已完成 | `src/app/robots.ts` | 允许爬取，屏蔽 API/auth/dashboard |
| 全局 Metadata | ✅ 已完成 | `src/app/layout.tsx` | Title、Description、Keywords、OG、Twitter Card |
| 页面级 Metadata | ✅ 已完成 | 各 `page.tsx` | 每个页面有独立的 title 和 description |
| JSON-LD 结构化数据 | ✅ 已完成 | `src/app/page.tsx` | SoftwareApplication + FAQPage + HowTo |
| Canonical URL | ✅ 已完成 | `src/app/layout.tsx` | 已设置 `<link rel="canonical">` |
| Open Graph 标签 | ✅ 已完成 | `src/app/layout.tsx` | 社交媒体分享卡片 |
| Vercel Analytics | ✅ 已完成 | `src/app/layout.tsx` | `<Analytics />` 组件 |
| 图片 lazy loading | ✅ 已完成 | `src/app/page.tsx` | 图片使用 `loading="lazy"` |
| 语义化 HTML | ✅ 已完成 | 各页面 | 使用 `<section>`、`<h1>`-`<h3>` 等语义标签 |
| Mobile-friendly | ✅ 已完成 | Tailwind CSS 响应式设计 | 移动端友好 |
| OG 社交分享图 | ✅ 已完成 | `src/app/opengraph-image.tsx` | 动态生成 1200x630 品牌分享图 |
