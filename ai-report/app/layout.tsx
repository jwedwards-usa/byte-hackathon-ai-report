import type { Metadata, Viewport } from "next";
import Script from "next/script";
import Link from "next/link";
import { promises as fs } from 'fs';
import path from 'path';

// Read critical CSS at build time
async function getCriticalCSS() {
  try {
    const cssPath = path.join(process.cwd(), 'app', 'critical.css');
    const criticalCSS = await fs.readFile(cssPath, 'utf-8');
    return criticalCSS;
  } catch (error) {
    console.error('Failed to read critical CSS:', error);
    return '';
  }
}

export const metadata: Metadata = {
  title: "AI Report - Your Source for Artificial Intelligence News",
  description: "AI Report is your comprehensive source for the latest artificial intelligence news, breakthroughs, and industry updates. An independent news aggregator focused on AI developments.",
  keywords: "AI news, artificial intelligence, machine learning, deep learning, GPT, ChatGPT, AI research, tech news",
  authors: [{ name: "AI Report" }],
  robots: "index, follow",
  openGraph: {
    title: "AI Report - Your Source for Artificial Intelligence News",
    description: "Comprehensive AI news aggregator featuring the latest in artificial intelligence, machine learning, and tech innovations.",
    type: "website",
    locale: "en_US",
    siteName: "AI Report",
  },
  twitter: {
    card: "summary",
    title: "AI Report - AI News Aggregator",
    description: "The latest artificial intelligence news and breakthroughs in one place.",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const criticalCSS = await getCriticalCSS();
  
  return (
    <html lang="en">
      <head>
        {/* Inline critical CSS for fastest initial render */}
        {criticalCSS && (
          <style dangerouslySetInnerHTML={{ __html: criticalCSS }} />
        )}
        
        {/* Load main stylesheet */}
        <link 
          rel="stylesheet" 
          href={`${process.env.NODE_ENV === 'production' ? '/byte-hackathon-ai-report' : ''}/styles.css`}
        />
        
        {/* GoatCounter Analytics - Privacy-friendly, no cookies */}
        <Script
          data-goatcounter="https://dwell-media-group.goatcounter.com/count"
          src="//gc.zgo.at/count.js"
          strategy="afterInteractive"
        />
      </head>
      <body>
        <a href="#main" className="skip-to-content">Skip to main content</a>
        
        {/* Privacy Banner */}
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
        
        {children}
      </body>
    </html>
  );
}
