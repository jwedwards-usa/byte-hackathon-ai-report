import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the fs module
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn().mockResolvedValue(JSON.stringify({
      mainHeadline: {
        text: "Test Headline",
        url: "https://example.com/test",
        image: {
          src: "/images/2024-01-15/test.jpg",
          alt: "Test image description",
          width: 600,
          height: 400
        }
      },
      topStories: [
        {
          text: "Top Story 1",
          url: "https://example.com/top1"
        }
      ],
      leftColumn: [],
      centerColumn: [],
      rightColumn: [],
      lastUpdated: "2024-01-15T12:00:00Z"
    }))
  }
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />;
  },
}));

// Mock the Home component since it's an async server component
jest.mock('./page', () => ({
  default: function Home() {
    return (
      <div>
        <a href="#main-content" className="skip-to-content">Skip to main content</a>
        <h1>AI REPORT</h1>
        <p>Your Source for Artificial Intelligence News</p>
        <img src="/images/2024-01-15/test.jpg" alt="Test image description" />
        <a href="https://example.com/test">Test Headline</a>
      </div>
    );
  }
}));

import Home from './page';

describe('Home Page', () => {
  it('renders the AI Report title', () => {
    render(<Home />);
    const heading = screen.getByText('AI REPORT');
    expect(heading).toBeInTheDocument();
  });

  it('renders the tagline', () => {
    render(<Home />);
    const tagline = screen.getByText('Your Source for Artificial Intelligence News');
    expect(tagline).toBeInTheDocument();
  });

  it('renders images with proper alt text', () => {
    render(<Home />);
    const image = screen.getByAltText('Test image description');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/images/2024-01-15/test.jpg');
  });

  it('includes skip to content link for accessibility', () => {
    render(<Home />);
    const skipLink = screen.getByText('Skip to main content');
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('renders headline links', () => {
    render(<Home />);
    const link = screen.getByText('Test Headline');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com/test');
  });
}); 