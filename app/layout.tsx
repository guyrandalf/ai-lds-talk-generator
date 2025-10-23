import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/useAuth";

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
  title: "Pulpit Pal - Create Inspiring Talks",
  description: "Generate personalized sacrament meeting and stake conference talks using official Church content from churchofjesuschrist.org. Save, edit, and export your talks to Word documents.",
  keywords: ["LDS", "Mormon", "talk generator", "sacrament meeting", "stake conference", "Church of Jesus Christ"],
  authors: [{ name: "Pulpit Pal" }],
  robots: "index, follow",
  openGraph: {
    title: "Pulpit Pal - Create Inspiring Talks",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen flex flex-col`}
      >
        <ErrorBoundary>
          <AuthProvider>
            <Navigation />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <Toaster
              position="top-center"
            />
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
