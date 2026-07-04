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
  title: 'StrokeLab - AI Swimming Stroke Analysis',
  description: 'Upload your swimming photos and get instant AI-powered feedback on your technique. Improve your form with personalized coaching.',
  openGraph: {
    title: 'StrokeLab - AI Swimming Stroke Analysis',
    description: 'AI-powered swimming stroke analysis for better technique.',
    images: ['/images/examples/freestyle-side.jpg'],
    url: '/',
    siteName: 'StrokeLab',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StrokeLab - AI Swimming Stroke Analysis',
    description: 'AI-powered swimming stroke analysis for better technique.',
    images: ['/images/examples/freestyle-side.jpg'],
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
