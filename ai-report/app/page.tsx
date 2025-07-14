import { promises as fs } from 'fs';
import path from 'path';
import Image from 'next/image';

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
      </footer>
    </div>
  );
}
