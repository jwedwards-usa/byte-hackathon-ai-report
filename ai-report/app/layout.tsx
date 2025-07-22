import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Link from "next/link";

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
      <head>
        {/* GoatCounter Analytics - Privacy-friendly, no cookies */}
        <Script 
          data-goatcounter="https://dwell-media-group.goatcounter.com/count"
          src="//gc.zgo.at/count.js"
          strategy="afterInteractive"
        />
      </head>
      <body>
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        <div id="main-content">
          {children}
        </div>
        
        {/* Cookie/Privacy Banner */}
        <div className="privacy-banner" role="region" aria-label="Privacy Notice">
          <input type="checkbox" id="privacy-banner-toggle" className="privacy-banner-checkbox" />
          <div className="privacy-banner-content">
            <p>
              <strong>Privacy Notice:</strong> AI Report is a static news aggregator that does not use cookies or collect personal data. 
              We use privacy-friendly analytics (GoatCounter) that respects your privacy. 
              We aggregate publicly available content from various AI news sources.
              <Link href="/privacy" className="privacy-link">Learn more about our privacy practices</Link>
            </p>
            <label 
              htmlFor="privacy-banner-toggle" 
              className="privacy-banner-button" 
              role="button" 
              tabIndex={0}
              aria-label="Dismiss privacy notice"
            >
              Got it
            </label>
          </div>
        </div>
      </body>
    </html>
  );
}
