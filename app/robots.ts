import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const isStaging = process.env.STAGING_ONLY !== 'false';
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://toolcart.co.uk').replace(/\/+$/, '');

  // STAGING_ONLY: Strictly prevent all web crawlers from indexing provisional catalog & brand
  if (isStaging) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    };
  }

  // Production Rules
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/api/',
        '/checkout',
        '/basket',
        '/account/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
