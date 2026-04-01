import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://adlo.tw',          lastModified: new Date(), priority: 1.0, changeFrequency: 'weekly' },
    { url: 'https://adlo.tw/services', lastModified: new Date(), priority: 0.9, changeFrequency: 'monthly' },
    { url: 'https://adlo.tw/pricing',  lastModified: new Date(), priority: 0.9, changeFrequency: 'monthly' },
    { url: 'https://adlo.tw/cases',    lastModified: new Date(), priority: 0.8, changeFrequency: 'monthly' },
    { url: 'https://adlo.tw/trends',   lastModified: new Date(), priority: 0.7, changeFrequency: 'weekly' },
    { url: 'https://adlo.tw/process',  lastModified: new Date(), priority: 0.7, changeFrequency: 'monthly' },
    { url: 'https://adlo.tw/contact',  lastModified: new Date(), priority: 0.8, changeFrequency: 'monthly' },
  ];
}
