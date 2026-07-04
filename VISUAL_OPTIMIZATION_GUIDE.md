# 游泳主题视觉优化 - 资源清单与说明

## 📋 概述

本次优化将 StrokeLab 首页改造为沉浸式游泳主题体验，包含动态背景、水主题配色、以及丰富的视觉元素。

---

## ✅ 已完成的修改

### 1. **配色方案优化** (`src/app/globals.css`)

已将整体配色调整为游泳/水相关色调：

#### 亮色模式 (Light Mode)
- **Primary**: 海洋蓝 `oklch(0.6 0.18 230)` - 主按钮、标题强调
- **Secondary**: 青色/水绿色 `oklch(0.92 0.06 200)` - 次要元素
- **Accent**: 绿松石色 `oklch(0.88 0.08 190)` - 装饰性元素
- **Background**: 淡蓝色调白 `oklch(0.98 0.01 210)` - 页面背景
- **Chart Colors**: 从深蓝到浅蓝的渐变，模拟水深变化

#### 暗色模式 (Dark Mode)
- **Primary**: 明亮青色 `oklch(0.75 0.15 200)` - 在深色背景下更醒目
- **Background**: 深海军蓝 `oklch(0.12 0.02 240)` - 深海氛围
- **Accent**: 亮绿松石 `oklch(0.3 0.1 190)` - 高对比度装饰

### 2. **新增组件** (`src/components/SwimmingBackground.tsx`)

创建了可复用的游泳主题背景组件，支持：
- ✅ 视频背景（自动播放、循环、静音）
- ✅ Poster 图片（视频加载前显示）
- ✅ 静态图片回退（视频失败时）
- ✅ 半透明遮罩层（保证文字可读性）
- ✅ 水波纹 SVG 叠加效果
- ✅ 性能优化（懒加载、preload metadata）

同时提供了简化版 `AnimatedWaterBackground` 组件，使用纯 CSS 动画模拟水波效果，适合不需要真实视频的场景。

### 3. **SVG 图案资源** (`public/patterns/water-ripple.svg`)

创建了水波纹 SVG 图案，用于：
- Hero 区域背景叠加
- Features section 微妙纹理
- What to Upload section 泳道线装饰

### 4. **首页优化** (`src/app/page.tsx`)

#### Hero Section
- ✅ 集成 `SwimmingBackground` 动态背景组件
- ✅ 白色文字 + 阴影效果，确保在深色背景上可读
- ✅ 渐变遮罩透明度 0.7，平衡视觉效果和可读性
- ✅ CTA 按钮增强（阴影、悬停效果）

#### Features Section
- ✅ 添加水波纹背景图案（5% 透明度）
- ✅ 图标容器改为圆角矩形 + 渐变背景
- ✅ 悬停效果：卡片上浮 + 图标放大
- ✅ 图标更换：`Zap` → `Waves`（更符合游泳主题）

#### How It Works Section
- ✅ 顶部/底部渐变过渡效果
- ✅ 步骤数字增大（h-16 w-16），使用渐变填充
- ✅ 桌面端步骤间连接线（渐变效果）
- ✅ 悬停效果：步骤圆圈和图标放大

#### What to Upload Section
- ✅ 泳道线装饰背景（5 条水平线，5% 透明度）
- ✅ 图片悬停缩放效果（scale-105）
- ✅ 视频播放按钮增强（更大、带阴影）
- ✅ 悬停渐变叠加效果
- ✅ CTA 按钮使用渐变色

#### CTA Section
- ✅ 全宽渐变背景（primary → accent → secondary）
- ✅ 模糊光斑装饰（模拟水下光线效果）
- ✅ 白色文字 + 阴影
- ✅ 白色按钮（与背景形成强烈对比）
- ✅ 悬停放大效果

---

##  需要准备的素材

### 必需素材（高优先级）

#### 1. **Hero 背景视频** 
- **路径**: `/public/videos/hero-swimming.mp4`
- **建议规格**:
  - 分辨率: 1920x1080 (Full HD) 或更高
  - 时长: 10-15 秒（循环播放）
  - 格式: MP4 (H.264 编码)
  - 文件大小: < 5MB（优化后）
  - 内容建议: 
    - 游泳者侧面视角的自由泳动作
    - 慢动作镜头更佳
    - 水面波光粼粼的效果
    - 避免过多水花遮挡身体
  
- **获取方式**:
  - 使用免费素材网站: Pexels, Pixabay, Unsplash Videos
  - 搜索关键词: "swimming underwater", "freestyle swimming slow motion", "pool swimming"
  - 或使用现有图片制作短视频（Canva, Adobe Premiere）

#### 2. **Hero Poster 图片**
- **路径**: `/public/images/hero-poster.jpg`
- **建议规格**:
  - 分辨率: 1920x1080 或与视频相同比例
  - 格式: JPG（高质量压缩）或 WebP
  - 文件大小: < 500KB
  - 内容: 视频的封面帧或高质量的游泳照片
  
- **用途**: 视频加载前显示，提升首屏体验

### 可选素材（中优先级）

#### 3. **更多示例图片**
当前已有 3 张示例图片在 `/public/images/examples/`:
- ✅ `freestyle-side.jpg` (109KB)
- ✅ `breaststroke.jpg` (123KB)  
- ✅ `video-thumbnail.jpg` (184KB)

**建议补充**:
- 仰泳示例图 (`backstroke.jpg`)
- 蝶泳示例图 (`butterfly.jpg`)
- 水下拍摄示例图 (`underwater-shot.jpg`)
- 正确 vs 错误姿势对比图

#### 4. **品牌 Logo 变体**
如果需要在深色背景上使用 Logo，准备：
- 白色版本 Logo
- 透明背景 PNG 或 SVG 格式

---

## 🚀 临时解决方案（无视频素材时）

如果你暂时无法提供视频素材，系统已经内置了降级方案：

### 方案 A: 使用静态图片背景
当前配置会自动回退到 `/images/examples/freestyle-side.jpg`，无需额外操作。

### 方案 B: 使用 CSS 动画背景
修改 `page.tsx` 中的 Hero section，替换 `SwimmingBackground` 为 `AnimatedWaterBackground`：

```tsx
// 替换这行
<SwimmingBackground ... />

// 为这行
import { AnimatedWaterBackground } from '@/components/SwimmingBackground';

// 然后在 JSX 中使用
<AnimatedWaterBackground />
```

这个方案使用纯 CSS 动画模拟水波和气泡效果，性能极佳，无需任何视频素材。

---

## 📦 新增文件清单

### 已创建的文件
1. ✅ `src/components/SwimmingBackground.tsx` - 动态背景组件
2. ✅ `public/patterns/water-ripple.svg` - 水波纹 SVG 图案

### 需要创建的文件
1. ⏳ `public/videos/hero-swimming.mp4` - Hero 背景视频（必需）
2. ⏳ `public/images/hero-poster.jpg` - Hero poster 图片（必需）

### 修改的文件
1. ✅ `src/app/globals.css` - 配色方案
2. ✅ `src/app/page.tsx` - 首页结构和样式

---

## 🔧 技术细节

### 性能优化措施
1. **视频优化**:
   - `preload="metadata"` - 仅预加载元数据
   - `muted` - 静音播放（浏览器允许自动播放）
   - `playsInline` - 移动端内联播放
   - 错误处理 - 自动回退到静态图片

2. **图片优化**:
   - `loading="lazy"` - 懒加载非首屏图片
   - `object-cover` - 保持比例填充
   - 适当的压缩和质量设置

3. **CSS 优化**:
   - 使用 `transform` 和 `opacity` 进行动画（GPU 加速）
   - `will-change` 提示浏览器优化
   - 减少重绘和回流

### 响应式设计
- ✅ 移动端适配（所有 section 使用 Tailwind 响应式类）
- ✅ 视频背景自动适应不同屏幕尺寸
- ✅ 字体大小根据视口调整（sm:text-5xl md:text-6xl）
- ✅ 网格布局自动切换（md:grid-cols-3）

### 无障碍考虑
- ✅ 足够的颜色对比度（WCAG AA 标准）
- ✅ 文字阴影增强可读性
- ✅ 语义化 HTML 结构
- ✅ Alt 文本描述图片

---

## 🎯 下一步行动

### 立即执行
1. **下载/制作 Hero 视频**（参考上方规格）
2. **放置到** `/public/videos/hero-swimming.mp4`
3. **准备 Poster 图片** 放到 `/public/images/hero-poster.jpg`
4. **测试效果**:
   ```bash
   npm run dev
   # 访问 http://localhost:3000
   ```

### 后续优化（可选）
1. 添加更多泳姿示例图片
2. 创建品牌 Logo 的白色版本
3. 考虑添加 Lottie 动画作为备选方案
4. A/B 测试不同的背景效果

---

## 💡 设计灵感来源

- **配色**: 借鉴海洋深度渐变（浅蓝 → 深蓝）
- **动效**: 模拟水下气泡上升、水波荡漾
- **布局**: 泳道线作为分隔元素的隐喻
- **交互**: 流畅的悬停反馈，如划水般顺滑

---

## ❓ 常见问题

**Q: 视频太大影响加载速度怎么办？**
A: 使用 FFmpeg 压缩：
```bash
ffmpeg -i input.mp4 -vcodec libx264 -crf 23 -preset medium output.mp4
```

**Q: 如何禁用视频背景，只用静态图片？**
A: 在 `page.tsx` 中移除 `videoUrl` 属性：
```tsx
<SwimmingBackground 
  // videoUrl="/videos/hero-swimming.mp4"  // 注释掉这行
  posterUrl="/images/hero-poster.jpg"
  fallbackImageUrl="/images/examples/freestyle-side.jpg"
/>
```

**Q: 暗色模式下效果如何？**
A: 已针对暗色模式优化，所有颜色变量都有对应的 dark mode 值，自动适配。

**Q: 可以自定义遮罩透明度吗？**
A: 可以，调整 `overlayOpacity` 参数（0-1 之间）：
```tsx
<SwimmingBackground overlayOpacity={0.5} />
```

---

##  需要帮助？

如有问题或需要进一步定制，请查看：
- SwimmingBackground 组件源码注释
- globals.css 中的颜色变量定义
- Tailwind CSS 官方文档

---

**最后更新**: 2026-07-04  
**作者**: AI Assistant for SwimCheck Project
