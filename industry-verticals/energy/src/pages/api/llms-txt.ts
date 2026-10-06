import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Serves the public llms.txt file for AI search engines and LLM consumption.
 * Follows the llms.txt specification: https://llmstxt.org/
 * Provides a markdown summary of the site's identity, purpose, and key pages.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).setHeader('Allow', 'GET').end();
    return;
  }

  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers.host || 'localhost:3000';
  const baseUrl = `${protocol}://${host}`;

  const content = `# Gridwell

> Gridwell is an energy site with grid status and articles, delivered with Sitecore XM Cloud.

## Key pages

- [Home](${baseUrl}/): Main landing page and site overview

## Optional

- [Sitemap](${baseUrl}/sitemap.xml): Full XML sitemap for search engines
- [LLM Sitemap](${baseUrl}/sitemap-llm.xml): LLM-optimized sitemap for AI crawlers
- [Robots](${baseUrl}/robots.txt): Crawler and bot access rules
- [AI metadata](${baseUrl}/.well-known/ai.txt): AI crawler and LLM metadata (ai.txt)
`;

  res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  res.status(200).send(content);
}
