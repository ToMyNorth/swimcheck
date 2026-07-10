# 🏊 StrokeLab — AI-Powered Swimming Stroke Analysis

**Upload a swimming video and get instant AI analysis of stroke technique, timing, and improvement tips.**

👉 **[strokelab.app](https://strokelab.app)**

![StrokeLab](https://strokelab.app/og-default.png)

## ✨ Features

- **AI Stroke Analysis** — Upload a video and receive detailed stroke-by-stroke feedback powered by AI
- **Pose Detection** — MediaPipe-based body pose tracking for precise movement analysis
- **Video Upload** — Support for common video formats, processed securely in the cloud
- **Detailed Reports** — Stroke timing, body position, kick pattern, and improvement suggestions
- **Dashboard** — Track your analysis history and progress over time
- **Google Login** — Sign in with Google to save and revisit your analyses
- **Pricing Plans** — Free tier with optional paid plans for advanced features
- **FAQ & Support** — Comprehensive help documentation

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **AI**: OpenAI (via OpenRouter), MediaPipe Pose
- **Database**: Supabase (PostgreSQL)
- **Auth**: NextAuth.js (Google OAuth)
- **Payments**: Stripe, Lemon Squeezy
- **Language**: TypeScript
- **Deployment**: Vercel

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/ToMyNorth/swimcheck.git

# Install dependencies
cd swimcheck
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase, OpenRouter, and auth credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📄 Pages

| Page | URL | Description |
|------|-----|-------------|
| Home | `/` | Landing page with feature showcase |
| Analyze | `/analyze` | Upload video for AI analysis |
| Analyze Video | `/analyze/video` | Video analysis interface |
| Dashboard | `/dashboard` | Analysis history |
| Report | `/report` | Detailed stroke report |
| Pricing | `/pricing` | Plans and pricing |
| FAQ | `/faq` | Frequently asked questions |

## 🌐 Live

**[strokelab.app](https://strokelab.app)** — Upload your first video for free.

## 📝 License

MIT
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
