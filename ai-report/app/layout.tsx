import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Report - Your Source for Artificial Intelligence News",
  description: "AI Report is your comprehensive source for the latest artificial intelligence news, breakthroughs, and industry updates. An independent news aggregator focused on AI developments.",
  keywords: "AI news, artificial intelligence, machine learning, deep learning, GPT, ChatGPT, AI updates, tech news",
  authors: [{ name: "AI Report" }],
  creator: "AI Report",
  publisher: "AI Report",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "AI Report - Your Source for Artificial Intelligence News",
    description: "AI Report is your comprehensive source for the latest artificial intelligence news, breakthroughs, and industry updates.",
    url: "https://yourdomain.com",
    siteName: "AI Report",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AI Report - Artificial Intelligence News Aggregator",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Report - Your Source for Artificial Intelligence News",
    description: "AI Report is your comprehensive source for the latest artificial intelligence news, breakthroughs, and industry updates.",
    images: ["/og-image.jpg"],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  alternates: {
    canonical: "https://yourdomain.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        <div id="main-content">
          {children}
        </div>
      </body>
    </html>
  );
}
