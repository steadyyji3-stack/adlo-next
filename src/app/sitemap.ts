import type { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/posts';
import { getAllIssues } from '@/lib/dankoe';

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const blogEntries: MetadataRoute.Sitemap = posts.map(post => ({
    url: `https://adlo.tw/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt ?? post.publishedAt),
    priority: 0.8,
    changeFrequency: 'monthly',
  }));

  const dkIssues = getAllIssues();
  const dkEntries: MetadataRoute.Sitemap = dkIssues.map(issue => ({
    url: `https://adlo.tw/blog/dan-koe/${issue.week}`,
    lastModified: new Date(issue.publishedAt),
    priority: 0.85,
    changeFrequency: 'weekly',
  }));

  return [
    { url: 'https://adlo.tw',                lastModified: new Date(), priority: 1.0, changeFrequency: 'weekly' },
    { url: 'https://adlo.tw/services',       lastModified: new Date(), priority: 0.9, changeFrequency: 'monthly' },
    { url: 'https://adlo.tw/pricing',        lastModified: new Date(), priority: 0.9, changeFrequency: 'monthly' },
    { url: 'https://adlo.tw/blog',           lastModified: new Date(), priority: 0.9, changeFrequency: 'weekly' },
    { url: 'https://adlo.tw/blog/dan-koe',   lastModified: new Date(), priority: 0.9, changeFrequency: 'weekly' },
    { url: 'https://adlo.tw/cases',          lastModified: new Date(), priority: 0.8, changeFrequency: 'monthly' },
    { url: 'https://adlo.tw/trends',         lastModified: new Date(), priority: 0.7, changeFrequency: 'weekly' },
    { url: 'https://adlo.tw/process',        lastModified: new Date(), priority: 0.7, changeFrequency: 'monthly' },
    { url: 'https://adlo.tw/contact',        lastModified: new Date(), priority: 0.8, changeFrequency: 'monthly' },
    ...blogEntries,
    ...dkEntries,
  ];
}
