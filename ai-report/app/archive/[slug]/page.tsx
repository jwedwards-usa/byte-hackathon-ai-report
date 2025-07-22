import { promises as fs } from 'fs';
import path from 'path';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';

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

export async function generateStaticParams() {
  const archiveDir = path.join(process.cwd(), 'public', 'archive');
  
  try {
    const files = await fs.readdir(archiveDir);
    return files
      .filter(file => file.endsWith('.json') && file.startsWith('news-data-'))
      .map(filename => ({
        slug: filename.replace('.json', '')
      }));
  } catch (error) {
    console.error('Error reading archive directory:', error);
    return [];
  }
}

async function getArchiveData(slug: string): Promise<NewsData | null> {
  const filePath = path.join(process.cwd(), 'public', 'archive', `${slug}.json`);
  
  try {
    const jsonData = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(jsonData);
  } catch (error) {
    console.error(`Error reading archive file ${slug}:`, error);
    return null;
  }
}

function formatArchiveDate(slug: string): string {
  // Extract date from filename: news-data-YYYY-MM-DD-HH-MM-SS
  const dateMatch = slug.match(/news-data-(\d{4})-(\d{2})-(\d{2})-(\d{2})-(\d{2})-(\d{2})/);
  
  if (!dateMatch) return 'Archive';
  
  const [_, year, month, day, hour, minute, second] = dateMatch;
  const date = new Date(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(day),
    parseInt(hour),
    parseInt(minute),
    parseInt(second)
  );
  
  return date.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });
}

export default async function ArchivePage({ params }: { params: { slug: string } }) {
  const newsData = await getArchiveData(params.slug);
  
  if (!newsData) {
    notFound();
  }
  
  const archiveDate = formatArchiveDate(params.slug);
  
  // Helper function to check if an image path exists
  async function imageExists(imagePath: string): Promise<boolean> {
    try {
      await fs.access(path.join(process.cwd(), 'public', imagePath));
      return true;
    } catch {
      return false;
    }
  }

  // Helper to render a news item with optional image
  const NewsItemWithImage = async ({ item }: { item: NewsItem }) => {
    const hasValidImage = item.image && await imageExists(item.image.src);
    
    return (
      <div className={hasValidImage ? 'news-item-with-image' : ''}>
        {hasValidImage && (
          <img 
            src={`${process.env.NODE_ENV === 'production' ? '/byte-hackathon-ai-report' : ''}/${item.image!.src}`}
            alt={item.image!.alt}
            width={item.image!.width}
            height={item.image!.height}
            className="news-image"
            loading="lazy"
          />
        )}
        <a href={item.url} target="_blank" rel="noopener noreferrer">
          {item.text}
        </a>
      </div>
    );
  };

  return (
    <div className="container">
      <header className="header">
        <h1 className="site-title">AI REPORT ARCHIVE</h1>
        <p className="tagline">Historical AI News Snapshot</p>
        <p className="last-updated">Archive Date: {archiveDate}</p>
        <nav className="archive-nav">
          <Link href="/" className="back-link">← Back to Current News</Link>
          <span className="nav-separator"> | </span>
          <Link href="/archive" className="back-link">← Back to Archive List</Link>
        </nav>
      </header>

      <main id="main">
        {/* Main Headline */}
        {newsData.mainHeadline && (
          <section className="main-headline">
            <NewsItemWithImage item={newsData.mainHeadline} />
          </section>
        )}

        {/* Top Stories */}
        {newsData.topStories && newsData.topStories.length > 0 && (
          <section className="top-stories">
            <ul className="top-stories-list">
              {newsData.topStories.map((story, index) => (
                <li key={index}>
                  <NewsItemWithImage item={story} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Three Column Layout */}
        <div className="columns">
          {/* Left Column */}
          <section className="column column-left">
            <ul className="story-list">
              {newsData.leftColumn?.map((story, index) => (
                <li key={index}>
                  <NewsItemWithImage item={story} />
                </li>
              ))}
            </ul>
          </section>

          {/* Center Column */}
          <section className="column column-center">
            <ul className="story-list">
              {newsData.centerColumn?.map((story, index) => (
                <li key={index}>
                  <NewsItemWithImage item={story} />
                </li>
              ))}
            </ul>
          </section>

          {/* Right Column */}
          <section className="column column-right">
            <ul className="story-list">
              {newsData.rightColumn?.map((story, index) => (
                <li key={index}>
                  <NewsItemWithImage item={story} />
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>

      <footer className="footer">
        <p>&copy; 2024 AI Report. All rights reserved.</p>
        <p>A news aggregator focused on artificial intelligence</p>
        <p className="legal-disclaimer">AI Report is an independent news aggregation service. It is not affiliated with, endorsed by, or connected to any other news service or website.</p>
        <p className="archive-notice">This is an archived snapshot from {archiveDate}</p>
      </footer>
    </div>
  );
} 