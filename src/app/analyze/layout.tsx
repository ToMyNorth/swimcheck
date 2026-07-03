import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Analyze Your Stroke | StrokeLab',
  description: 'Upload your swimming photos and get instant AI feedback on your technique.',
  alternates: { canonical: '/analyze' },
};

export default function AnalyzeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
