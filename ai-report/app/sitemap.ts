import { MetadataRoute } from 'next'

// Ensure this file is treated as fully static when using `output: 'export'`
export const revalidate = false;

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://yourdomain.com',
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1,
    },
  ]
} 