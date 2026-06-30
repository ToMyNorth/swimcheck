import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AuthProvider from "@/components/providers/AuthProvider";
import "./globals.css";

// Use system fonts to avoid network requests in China
const fontVariables = "font-sans";

export const metadata: Metadata = {
  metadataBase: new URL('https://swimcheck.com'),
  title: 'SwimCheck - AI Swimming Stroke Analysis',
  description: 'Upload your swimming photos and get instant AI-powered feedback on your technique. Improve your form with personalized coaching.',
  openGraph: {
    title: 'SwimCheck - AI Swimming Stroke Analysis',
    description: 'AI-powered swimming stroke analysis for better technique.',
    images: ['/og-image.png'],
    url: '/',
    siteName: 'SwimCheck',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: { canonical: '/' },
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
      </body>
    </html>
  );
}
