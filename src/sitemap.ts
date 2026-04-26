interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

interface ProductEntry {
  id: string;
}

async function fetchProducts(apiUrl: string): Promise<ProductEntry[]> {
  const response = await fetch(`${apiUrl}/products`);
  return response.json();
}

function renderUrl(entry: SitemapUrl): string {
  return `
  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`;
}

function renderXml(urls: SitemapUrl[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(renderUrl).join('')}
</urlset>`;
}

export async function generateSitemap(siteUrl: string, apiUrl: string): Promise<string> {
  const today = new Date().toISOString().split('T')[0];

  const staticUrls: SitemapUrl[] = [
    { loc: `${siteUrl}/`, lastmod: today, changefreq: 'daily', priority: 1.0 },
    { loc: `${siteUrl}/products`, lastmod: today, changefreq: 'daily', priority: 0.9 },
    { loc: `${siteUrl}/cart`, lastmod: today, changefreq: 'daily', priority: 0.8 },
  ];

  let productUrls: SitemapUrl[] = [];
  try {
    const products = await fetchProducts(apiUrl);
    productUrls = products.map((p) => ({
      loc: `${siteUrl}/products/${p.id}`,
      lastmod: today,
      changefreq: 'weekly',
      priority: 0.7,
    }));
  } catch {
    // If the API is unavailable, the sitemap still returns static pages
  }

  return renderXml([...staticUrls, ...productUrls]);
}
