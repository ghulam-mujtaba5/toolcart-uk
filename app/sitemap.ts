import { MetadataRoute } from 'next';
import { getAllPublicProducts } from '@/lib/catalog/products';
import { getStaticBuyingGuides } from '@/lib/catalog/guides';
import { getStaticProjectKits } from '@/lib/catalog/kits';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://toolcart.co.uk').replace(/\/+$/, '');
  const now = new Date();

  // 1. Static Core Discovery Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/guides`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/trade`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // 2. 6 Distinct Catalog Categories
  const categories = [
    'site-equipment',
    'ppe',
    'tools',
    'fixings',
    'measuring',
    'decorating',
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((slug) => ({
    url: `${baseUrl}/categories/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // 3. All 115 Quoted Products
  const products = getAllPublicProducts();
  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // 4. 5 UK Hardware Buying Guides
  const guides = getStaticBuyingGuides();
  const guideRoutes: MetadataRoute.Sitemap = guides.map((guide) => ({
    url: `${baseUrl}/guides/${guide.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // 5. 3 Curated Project Kits
  const kits = getStaticProjectKits();
  const kitRoutes: MetadataRoute.Sitemap = kits.map((kit) => ({
    url: `${baseUrl}/projects?kit=${kit.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...productRoutes,
    ...guideRoutes,
    ...kitRoutes,
  ];
}
