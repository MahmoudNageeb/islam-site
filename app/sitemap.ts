import type { MetadataRoute } from 'next';

const SITE_URL = 'https://subduing-luster-juvenile.ngrok-free.dev';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages = ['', '/about', '/control', '/company', '/stats', '/ab-results'];

  return pages.map((p) => ({
    url: `${SITE_URL}${p}`,
    lastModified: now,
    changeFrequency: p === '' ? 'weekly' : 'monthly',
    priority: p === '' ? 1.0 : 0.7,
  }));
}
