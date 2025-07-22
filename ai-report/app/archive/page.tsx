import { promises as fs } from 'fs';
import path from 'path';
import Link from 'next/link';

interface ArchiveFile {
  filename: string;
  date: Date;
  formattedDate: string;
  timeAgo: string;
}

async function getArchiveFiles(): Promise<ArchiveFile[]> {
  const archiveDir = path.join(process.cwd(), 'public', 'archive');
  
  try {
    const files = await fs.readdir(archiveDir);
    
    // Filter for JSON files and parse dates
    const archiveFiles = files
      .filter(file => file.endsWith('.json') && file.startsWith('news-data-'))
      .map(filename => {
        // Extract date from filename: news-data-YYYY-MM-DD-HH-MM-SS.json
        const dateMatch = filename.match(/news-data-(\d{4})-(\d{2})-(\d{2})-(\d{2})-(\d{2})-(\d{2})\.json/);
        
        if (!dateMatch) return null;
        
        const [, year, month, day, hour, minute, second] = dateMatch;
        const date = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
          parseInt(hour),
          parseInt(minute),
          parseInt(second)
        );
        
        // Format date for display
        const formattedDate = date.toLocaleString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short'
        });
        
        // Calculate time ago
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);
        
        let timeAgo = '';
        if (diffDays > 0) {
          timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        } else if (diffHours > 0) {
          timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        } else {
          timeAgo = 'Less than an hour ago';
        }
        
        return {
          filename,
          date,
          formattedDate,
          timeAgo
        };
      })
      .filter((file): file is ArchiveFile => file !== null)
      .sort((a, b) => b.date.getTime() - a.date.getTime()); // Most recent first
    
    return archiveFiles;
  } catch (error) {
    console.error('Error reading archive directory:', error);
    return [];
  }
}

export default async function ArchivePage() {
  const archiveFiles = await getArchiveFiles();
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Group files by date
  const filesByDate = archiveFiles.reduce((acc, file) => {
    const dateKey = file.date.toDateString();
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(file);
    return acc;
  }, {} as Record<string, ArchiveFile[]>);
  
  return (
    <div className="container">
      <header className="header">
        <h1 className="site-title">AI REPORT ARCHIVES</h1>
        <p className="tagline">Browse Historical AI News Snapshots</p>
        <p className="last-updated">Current Date: {currentDate}</p>
        <nav className="archive-nav">
          <Link href="/" className="back-link">← Back to Current News</Link>
        </nav>
      </header>

      <main className="archive-main">
        <div className="archive-content">
          <h2>Available News Archives</h2>
          <p className="archive-description">
            Each snapshot represents the AI news aggregated at that specific time. 
            News archives are automatically cleaned up after 7 days.
          </p>
          
          {archiveFiles.length === 0 ? (
            <div className="no-archives">
              <p>No archives available at this time.</p>
              <p>Archives are created hourly when news is updated.</p>
            </div>
          ) : (
            <div className="archive-list">
              {Object.entries(filesByDate).map(([dateKey, files]) => (
                <div key={dateKey} className="archive-date-group">
                  <h3 className="archive-date-header">{dateKey}</h3>
                  <ul className="archive-files">
                    {files.map(file => (
                      <li key={file.filename}>
                        <a 
                          href={`/archive/${file.filename}`}
                          className="archive-link"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <span className="archive-time">{file.formattedDate}</span>
                          <span className="archive-ago">({file.timeAgo})</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
          
          <div className="archive-info">
            <h3>How Archives Work</h3>
            <ul>
              <li>News is aggregated every 3 hours from multiple AI sources</li>
              <li>Each update creates a timestamped snapshot</li>
              <li>Archives older than 7 days are automatically removed</li>
              <li>Click any archive link to view the news from that time</li>
            </ul>
          </div>
        </div>
      </main>

      <footer className="footer">
        <p>&copy; 2024 AI Report. All rights reserved.</p>
        <p>A news aggregator focused on artificial intelligence</p>
      </footer>
    </div>
  );
} 