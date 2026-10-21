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

const SPECIALTY_FIELDS = new Set(['jobtitle', 'specialty', 'specialties', 'speciality']);
const IDENTIFIER_FIELDS = new Set([
  'sku',
  'productcode',
  'productid',
  'itemid',
  'itemcode',
  'code',
  'id',
]);

const normalizeFieldName = (fieldName: string): string =>
  fieldName.replace(/[\s_-]/g, '').toLowerCase();

/** Job titles and specialties can be shown as chips. SKUs and other codes cannot. */
export function isSpecialtyField(fieldName?: string): boolean {
  if (!fieldName) return false;
  const normalized = normalizeFieldName(fieldName);
  if (IDENTIFIER_FIELDS.has(normalized)) return false;
  return SPECIALTY_FIELDS.has(normalized);
}

/** Product codes such as SOF0004 are identifiers, not specialties. */
export function isIdentifierValue(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (/^[A-Za-z]{1,8}\d{3,}$/.test(trimmed)) return true;
  return false;
}

export function specialtyLabels(source: SearchSourceConfig, items: GroundedItem[]): string[] {
  if (!isSpecialtyField(source.fieldsMapping?.type)) return [];
  const labels = new Set<string>();
  for (const item of items) {
    if (item.category && !isIdentifierValue(item.category)) labels.add(item.category);
  }
  return [...labels];
}

export class SitecoreSearchAdapter {
  private service: SearchService;

  constructor(contextId: string, edgeUrl?: string) {
    this.service = new SearchService({
      contextId,
      edgeUrl,
    });
  }

  /**
   * One keyphrase query against the datasource search index. Does not prefetch a catalog.
   */
  async searchSource(
    source: SearchSourceConfig,
    options: {
      query?: string;
      limit?: number;
      locale?: string;
    }
  ): Promise<{ items: GroundedItem[]; total: number; appliedCategories: string[] }> {
    const { query = '', limit = 6, locale } = options;
    const keyphrase = query.trim();
    if (!keyphrase) {
      return { items: [], total: 0, appliedCategories: [] };
    }

    const boundedLimit = Math.min(Math.max(limit, 1), 12);
    const apiResponse = await this.service.search<SearchDocument>({
      searchIndexId: source.searchIndex,
      keyphrase,
      limit: boundedLimit,
      offset: 0,
      ...(locale ? { locale } : {}),
    });

    const items = (apiResponse.results || [])
      .map((doc) => normalizeSearchDocument(doc, source))
      .slice(0, boundedLimit);

    return {
      items,
      total: apiResponse.total || items.length,
      appliedCategories: specialtyLabels(source, items),
    };
  }
}
