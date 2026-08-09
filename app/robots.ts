import type { MetadataRoute } from 'next';

const SITE_URL = 'https://subduing-luster-juvenile.ngrok-free.dev';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
