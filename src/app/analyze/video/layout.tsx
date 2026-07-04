import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Video Stroke Analysis | StrokeLab',
  description: 'Upload your swimming videos for comprehensive AI-powered stroke analysis. Get frame-by-frame feedback on your technique, body position, and stroke efficiency.',
  alternates: {
    canonical: '/analyze/video',
  },
};

export default function VideoAnalyzeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
