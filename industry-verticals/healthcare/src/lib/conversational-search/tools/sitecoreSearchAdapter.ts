import { SearchService } from '@sitecore-content-sdk/search';
import {
  SearchDocument,
  SearchFieldsMapping,
} from '@/components/search-experience/search-components/models';
import { GroundedItem, SearchSourceConfig } from '../types';

const stripHtml = (value: string): string =>
  value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const readStringField = (doc: SearchDocument, fieldName?: string): string => {
  if (!fieldName) return '';
  const raw = doc[fieldName];
  if (typeof raw === 'string') return raw.trim();
  if (Array.isArray(raw)) return raw.map(String).join(', ').trim();
  if (typeof raw === 'number' || typeof raw === 'boolean') return String(raw);
  return '';
};

const resolveItemUrl = (doc: SearchDocument, mapping: SearchFieldsMapping): string => {
  const mappedLink = readStringField(doc, mapping.link) || readStringField(doc, 'scUrl');
  if (mappedLink) return mappedLink;
  const title = readStringField(doc, mapping.title) || readStringField(doc, 'Title');
  if (title) {
    return `/Doctors/${title.replace(/\s+/g, '-')}`;
  }
  return '#';
};

export const normalizeSearchDocument = (
  doc: SearchDocument,
  source: SearchSourceConfig
): GroundedItem => {
  const mapping = source.fieldsMapping || {};
  const title =
    readStringField(doc, mapping.title) ||
    readStringField(doc, 'FullName') ||
    readStringField(doc, 'Title') ||
    'Untitled';
  const category =
    readStringField(doc, mapping.type) ||
    readStringField(doc, 'JobTitle') ||
    readStringField(doc, 'Category') ||
    '';
  const rawDescription =
    readStringField(doc, mapping.description) ||
    readStringField(doc, 'pageSummary') ||
    readStringField(doc, 'Bio') ||
    '';
  const summary = stripHtml(rawDescription);
  const image = readStringField(doc, mapping.images) || readStringField(doc, 'Photo') || undefined;
  const url = resolveItemUrl(doc, mapping);
  const rawTags = mapping.tags ? doc[mapping.tags] : undefined;
  const tags = Array.isArray(rawTags)
    ? rawTags.map(String)
    : typeof rawTags === 'string' && rawTags.trim()
      ? rawTags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : undefined;

  return {
    id: doc.sc_item_id || `${source.id}-${title}`,
    sourceId: source.id,
    sourceName: source.name,
    title,
    category,
    summary,
    url,
    image,
    tags,
    rawDocument: doc,
    fieldsMapping: mapping,
  };
};

export interface IndexCatalogSummary {
  sourceId: string;
  sourceName: string;
  searchIndex: string;
  totalItems: number;
  categories: { name: string; count: number }[];
  items: GroundedItem[];
}

export class SitecoreSearchAdapter {
  private service: SearchService;
  private catalogCache = new Map<string, { expiresAt: number; data: IndexCatalogSummary }>();

  constructor(contextId: string, edgeUrl?: string) {
    this.service = new SearchService({
      contextId,
      edgeUrl,
    });
  }

  /**
   * Loads the catalog and category/facet breakdown for a given SitecoreAI Search source.
   * Uses limit 100 because SitecoreAI Search returns up to 100 items reliably per request.
   */
  async getCatalogSummary(
    source: SearchSourceConfig,
    locale?: string
  ): Promise<IndexCatalogSummary> {
    const cacheKey = `${source.searchIndex}:${locale || 'default'}`;
    const cached = this.catalogCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const response = await this.service.search<SearchDocument>({
      searchIndexId: source.searchIndex,
      keyphrase: '',
      limit: 100,
      offset: 0,
      ...(locale ? { locale } : {}),
    });

    const items = (response.results || []).map((doc) => normalizeSearchDocument(doc, source));
    const categoryCounts = new Map<string, number>();

    for (const item of items) {
      if (item.category) {
        categoryCounts.set(item.category, (categoryCounts.get(item.category) ?? 0) + 1);
      }
    }

    const categories = [...categoryCounts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));

    const summary: IndexCatalogSummary = {
      sourceId: source.id,
      sourceName: source.name,
      searchIndex: source.searchIndex,
      totalItems: response.total || items.length,
      categories,
      items,
    };

    this.catalogCache.set(cacheKey, {
      expiresAt: Date.now() + 60_000,
      data: summary,
    });

    return summary;
  }

  /**
   * Queries a configured SitecoreAI Search index using keyword, category/facet filters, and local semantic scoring.
   */
  async searchSource(
    source: SearchSourceConfig,
    options: {
      query?: string;
      categories?: string[];
      facetName?: string;
      limit?: number;
      locale?: string;
    }
  ): Promise<{ items: GroundedItem[]; total: number; appliedCategories: string[] }> {
    const { query = '', categories = [], facetName, limit = 10, locale } = options;
    const catalog = await this.getCatalogSummary(source, locale);

    // Match requested categories case-insensitively against known index categories
    const matchedCategories = categories
      .map((requested) => {
        const lower = requested.trim().toLowerCase();
        const exact = catalog.categories.find((c) => c.name.toLowerCase() === lower);
        if (exact) return exact.name;
        const partial = catalog.categories.find(
          (c) => c.name.toLowerCase().includes(lower) || lower.includes(c.name.toLowerCase())
        );
        return partial?.name;
      })
      .filter((value): value is string => Boolean(value));

    const uniqueCategories = [...new Set(matchedCategories)];

    // First try direct SitecoreAI Search API call if query or facet is specified
    try {
      const resolvedFacetName =
        facetName || (source.fieldsMapping?.type === 'JobTitle' ? 'Job Title' : undefined);

      const facetPayload =
        uniqueCategories.length > 0 && resolvedFacetName
          ? {
              fields: [
                {
                  name: resolvedFacetName,
                  filters: [{ operator: 'eq' as const, value: uniqueCategories }],
                },
              ],
            }
          : undefined;

      if (query.trim() || facetPayload) {
        const apiResponse = await this.service.search<SearchDocument>({
          searchIndexId: source.searchIndex,
          keyphrase: query.trim(),
          limit: Math.min(Math.max(limit, 6), 50),
          offset: 0,
          ...(locale ? { locale } : {}),
          ...(facetPayload ? { facet: facetPayload } : {}),
        });

        if (apiResponse.results && apiResponse.results.length > 0) {
          const normalized = apiResponse.results.map((doc) => normalizeSearchDocument(doc, source));
          return {
            items: normalized.slice(0, limit),
            total: apiResponse.total || normalized.length,
            appliedCategories: uniqueCategories,
          };
        }
      }
    } catch {
      // Fall back to in-memory grounded catalog search if a custom facet name is unsupported by the index
    }

    // Grounded catalog filtering (handles natural language terms + category filtering across all catalog items)
    let candidates = catalog.items;
    if (uniqueCategories.length > 0) {
      const categorySet = new Set(uniqueCategories.map((c) => c.toLowerCase()));
      candidates = candidates.filter((item) => categorySet.has(item.category.toLowerCase()));
    }

    const terms = query
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter((term) => term.length > 2);

    if (terms.length > 0) {
      const scored = candidates
        .map((item) => {
          const haystack =
            `${item.title} ${item.category} ${item.summary} ${(item.tags || []).join(' ')}`.toLowerCase();
          let score = 0;
          for (const term of terms) {
            if (item.title.toLowerCase().includes(term)) score += 5;
            if (item.category.toLowerCase().includes(term)) score += 4;
            if (haystack.includes(term)) score += 2;
          }
          return { item, score };
        })
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score);

      if (scored.length > 0) {
        return {
          items: scored.slice(0, limit).map((entry) => entry.item),
          total: scored.length,
          appliedCategories: uniqueCategories,
        };
      }
    }

    return {
      items: candidates.slice(0, limit),
      total: candidates.length,
      appliedCategories: uniqueCategories,
    };
  }
}
