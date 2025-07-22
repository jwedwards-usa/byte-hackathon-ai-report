import { promises as fs } from 'fs';
import path from 'path';
import Image from 'next/image';
import Link from 'next/link';

interface ImageData {
  src: string;
  alt: string;
  width: number;
  height: number;
}

interface NewsItem {
  text: string;
  url: string;
  image?: ImageData;
}

interface NewsData {
  mainHeadline: NewsItem;
  topStories: NewsItem[];
  leftColumn: NewsItem[];
  centerColumn: NewsItem[];
  rightColumn: NewsItem[];
  lastUpdated: string;
}

async function getNewsData(): Promise<NewsData> {
  const filePath = path.join(process.cwd(), 'public', 'news-data.json');
  const fileContents = await fs.readFile(filePath, 'utf8');
  return JSON.parse(fileContents);
}

function NewsItemWithImage({ item, priority = false }: { item: NewsItem; priority?: boolean }) {
  return (
    <div className="news-item-with-image">
      {item.image && (
        <a href={item.url} target="_blank" rel="noopener noreferrer" aria-label={`Image for: ${item.text}`}>
          <Image
            src={item.image.src}
            alt={item.image.alt}
            width={item.image.width}
            height={item.image.height}
            priority={priority}
            className="news-image"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </a>
      )}
      <a 
        href={item.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className={item.text.includes('BREAKING') ? 'breaking' : ''}
      >
        {item.text}
      </a>
    </div>
  );
}

export default async function Home() {
  const newsData = await getNewsData();
  const lastUpdatedDate = new Date(newsData.lastUpdated).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  return (
    <div className="container">
      <header className="header">
        <h1 className="site-title">AI REPORT</h1>
        <p className="tagline">Your Source for Artificial Intelligence News</p>
        <p className="last-updated">Last Updated: {lastUpdatedDate}</p>
        <nav className="main-nav">
          <Link href="/archive" className="archive-link-button">📚 Browse Archives</Link>
        </nav>
      </header>

      <main>
        <div className="main-headline">
          <NewsItemWithImage item={newsData.mainHeadline} priority={true} />
        </div>

        <section className="top-stories" aria-label="Top Stories">
          <ul className="top-stories-list">
            {newsData.topStories.map((story, index) => (
              <li key={index}>
                <NewsItemWithImage item={story} priority={index === 0} />
              </li>
            ))}
          </ul>
        </section>

        <div className="columns" role="region" aria-label="News Columns">
          <div className="column column-left" role="region" aria-label="Left Column News">
            <ul className="story-list">
              {newsData.leftColumn.map((story, index) => (
                <li key={index}>
                  <NewsItemWithImage item={story} />
                </li>
              ))}
            </ul>
          </div>

          <div className="column column-center" role="region" aria-label="Center Column News">
            <ul className="story-list">
              {newsData.centerColumn.map((story, index) => (
                <li key={index}>
                  <NewsItemWithImage item={story} />
                </li>
              ))}
            </ul>
          </div>

          <div className="column column-right" role="region" aria-label="Right Column News">
            <ul className="story-list">
              {newsData.rightColumn.map((story, index) => (
                <li key={index}>
                  <NewsItemWithImage item={story} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      <footer className="footer">
        <p>&copy; 2024 AI Report. All rights reserved.</p>
        <p>A news aggregator focused on artificial intelligence</p>
        <p className="legal-disclaimer">AI Report is an independent news aggregation service. It is not affiliated with, endorsed by, or connected to any other news service or website.</p>
        
        {/* Visitor Analytics Notice */}
        <div className="visitor-counter">
          <p className="analytics-notice">
            📊 Privacy-friendly analytics by <a href="https://www.goatcounter.com/" target="_blank" rel="noopener noreferrer">GoatCounter</a>
          </p>
        </div>
        
        {/* Privacy Policy Section */}
        <div id="privacy-policy" className="privacy-policy">
          <h2>Privacy Policy</h2>
          <p>
            <strong>Last Updated: {new Date().toLocaleDateString()}</strong>
          </p>
          <h3>Information We Don&apos;t Collect</h3>
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
          <h3>Analytics</h3>
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
          <h3>Content Sources</h3>
          <p>
            We aggregate publicly available content from various AI news sources. All content remains the property of its original publishers.
          </p>
          <h3>External Links</h3>
          <p>
            Our site contains links to external websites. We are not responsible for the privacy practices of these sites.
          </p>
          <h3>GDPR & CCPA Compliance</h3>
          <p>
            As we do not collect any personal data, there is no data to request, modify, or delete under GDPR or CCPA regulations.
          </p>
          <h3>Contact</h3>
          <p>
            For privacy-related questions, please contact us through the repository issues on GitHub.
          </p>
        </div>
      </footer>
    </div>
  );
}
