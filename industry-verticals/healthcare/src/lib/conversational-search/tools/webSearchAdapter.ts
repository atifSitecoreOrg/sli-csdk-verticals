import { WebCitation } from '../types';

interface DuckDuckGoTopic {
  Text?: string;
  FirstURL?: string;
  Topics?: DuckDuckGoTopic[];
}

interface DuckDuckGoResponse {
  Heading?: string;
  AbstractText?: string;
  AbstractURL?: string;
  AbstractSource?: string;
  RelatedTopics?: DuckDuckGoTopic[];
}

/**
 * Pluggable web search adapter for enriching conversational answers when EnableWebSearch is toggled on.
 * Supports Tavily API (if TAVILY_API_KEY is configured) and falls back to DuckDuckGo Instant Answer API (free, no key required).
 */
export async function searchExternalWeb(
  query: string,
  maxResults: number = 3
): Promise<WebCitation[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const tavilyKey = process.env.TAVILY_API_KEY;
  if (tavilyKey) {
    try {
      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: tavilyKey,
          query: trimmed,
          max_results: maxResults,
          include_answer: false,
        }),
      });
      if (response.ok) {
        const data = (await response.json()) as {
          results?: { title?: string; url?: string; content?: string }[];
        };
        return (data.results || []).slice(0, maxResults).map((item) => ({
          title: item.title || trimmed,
          url: item.url || '',
          snippet: item.content || '',
          source: 'Web Search',
        }));
      }
    } catch {
      // Fall through to free DuckDuckGo Instant Answer lookup
    }
  }

  try {
    const url = new URL('https://api.duckduckgo.com/');
    url.searchParams.set('q', trimmed);
    url.searchParams.set('format', 'json');
    url.searchParams.set('no_html', '1');
    url.searchParams.set('skip_disambig', '1');

    const response = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return [];

    const data = (await response.json()) as DuckDuckGoResponse;
    const citations: WebCitation[] = [];

    if (data.AbstractText && data.AbstractURL) {
      citations.push({
        title: data.Heading || trimmed,
        url: data.AbstractURL,
        snippet: data.AbstractText,
        source: data.AbstractSource || 'DuckDuckGo',
      });
    }

    for (const topic of data.RelatedTopics || []) {
      if (citations.length >= maxResults) break;
      if (topic.Text && topic.FirstURL) {
        citations.push({
          title: topic.Text.split(' - ')[0] || trimmed,
          url: topic.FirstURL,
          snippet: topic.Text,
          source: 'DuckDuckGo',
        });
      }
    }

    return citations.slice(0, maxResults);
  } catch {
    return [];
  }
}
