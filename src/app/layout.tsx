import type { Metadata } from "next";
import { Analytics } from '@vercel/analytics/react';
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AuthProvider from "@/components/providers/AuthProvider";
import "./globals.css";

// Use system fonts to avoid network requests in China
const fontVariables = "font-sans";

export const metadata: Metadata = {
  metadataBase: new URL('https://strokelab.app'),
  title: {
    default: 'StrokeLab - AI Swimming Stroke Analysis',
    template: '%s | StrokeLab',
  },
  description:
    'StrokeLab is an AI-powered swimming stroke analysis platform. Upload a photo or video of your swim and receive instant, professional-grade technique feedback from our advanced computer vision and AI coaching engine.',
  keywords: [
    'swimming',
    'swim analysis',
    'swim technique',
    'swimming stroke analysis',
    'AI swimming coach',
    'AI coach',
    'swim technique analysis',
    'swimming posture correction',
    'swim form',
    'swimming coach',
    'freestyle analysis',
    'breaststroke analysis',
    'butterfly analysis',
    'backstroke analysis',
  ],
  authors: [{ name: 'StrokeLab Team' }],
  creator: 'StrokeLab',
  publisher: 'StrokeLab',
  category: 'Sports Technology',
  openGraph: {
    title: 'StrokeLab - AI Swimming Stroke Analysis',
    description:
      'Upload your swimming photos or videos and get instant AI-powered feedback on your technique. Improve your form with personalized coaching from StrokeLab.',
    url: '/',
    siteName: 'StrokeLab',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StrokeLab - AI Swimming Stroke Analysis',
    description:
      'Upload your swimming photos or videos and get instant AI-powered feedback on your technique. Improve your form with personalized coaching from StrokeLab.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: { canonical: '/' },
  verification: {
    google: '6IqIyPibuVCL9iqCrcn_mPut0rsklg8zrlSOtaI9nss',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
