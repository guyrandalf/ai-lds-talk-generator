import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: "LDS Talk Generator - Create Inspiring Talks",
  description: "Generate personalized sacrament meeting and stake conference talks using official Church content from churchofjesuschrist.org. Save, edit, and export your talks to Word documents.",
  keywords: ["LDS", "Mormon", "talk generator", "sacrament meeting", "stake conference", "Church of Jesus Christ"],
  authors: [{ name: "LDS Talk Generator" }],
  robots: "index, follow",
  openGraph: {
    title: "LDS Talk Generator - Create Inspiring Talks",
    description: "Generate personalized sacrament meeting and stake conference talks using official Church content",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen`}
      >
        <ErrorBoundary>
          <Navigation />
          {children}
          <Toaster />
        </ErrorBoundary>
      </body>
    </html>
  );
}
