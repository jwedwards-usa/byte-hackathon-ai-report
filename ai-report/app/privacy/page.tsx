import Link from 'next/link';

export default function PrivacyPage() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="container">
      <header className="header">
        <h1 className="site-title">AI REPORT PRIVACY POLICY</h1>
        <p className="tagline">Your Privacy Matters</p>
        <p className="last-updated">Last Updated: {currentDate}</p>
        <nav className="privacy-nav">
          <Link href="/" className="back-link">← Back to News</Link>
        </nav>
      </header>

      <main className="privacy-main">
        <div className="privacy-content">
          <h2>Information We Don&apos;t Collect</h2>
          <p>
            AI Report is a static website that does not:
          </p>
          <ul>
            <li>Use cookies or tracking technologies</li>
            <li>Collect personal information</li>
            <li>Store user data</li>
            <li>Require user accounts or registration</li>
            <li>Use invasive advertising</li>
          </ul>

          <h2>Analytics</h2>
          <p>
            We use GoatCounter for privacy-friendly analytics. GoatCounter:
          </p>
          <ul>
            <li>Does not use cookies</li>
            <li>Does not track personal data</li>
            <li>Provides only aggregate statistics</li>
            <li>Is open source and privacy-focused</li>
            <li>Learn more at <a href="https://www.goatcounter.com/privacy" target="_blank" rel="noopener noreferrer">GoatCounter Privacy Policy</a></li>
          </ul>

          <h2>Content Sources</h2>
          <p>
            We aggregate publicly available content from various AI news sources. All content remains the property of its original publishers.
          </p>

          <h2>External Links</h2>
          <p>
            Our site contains links to external websites. We are not responsible for the privacy practices of these sites.
          </p>

          <h2>GDPR & CCPA Compliance</h2>
          <p>
            As we do not collect any personal data, there is no data to request, modify, or delete under GDPR or CCPA regulations.
          </p>

          <h2>Privacy Notice</h2>
          <p>
            AI Report is a static news aggregator that does not use cookies or collect personal data. 
            We use privacy-friendly analytics (GoatCounter) that respects your privacy. 
            We aggregate publicly available content from various AI news sources.
          </p>

          <h2>Contact</h2>
          <p>
            For privacy-related questions, please contact us through the repository issues on GitHub.
          </p>
        </div>
      </main>

      <footer className="footer">
        <p>&copy; 2024 AI Report. All rights reserved.</p>
        <p>A news aggregator focused on artificial intelligence</p>
        <p className="legal-disclaimer">AI Report is an independent news aggregation service. It is not affiliated with, endorsed by, or connected to any other news service or website.</p>
      </footer>
    </div>
  );
} 