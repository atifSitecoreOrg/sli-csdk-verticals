import {
  SearchDocument,
  SearchFieldsMapping,
} from '@/components/search-experience/search-components/models';

export interface SearchSourceConfig {
  id: string;
  name: string;
  searchIndex: string;
  fieldsMapping: SearchFieldsMapping;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface GroundedItem {
  id: string;
  sourceId: string;
  sourceName: string;
  title: string;
  category: string;
  summary: string;
  url: string;
  image?: string;
  tags?: string[];
  rawDocument: SearchDocument;
  fieldsMapping: SearchFieldsMapping;
}

export interface WebCitation {
  title: string;
  url: string;
  snippet: string;
  source: string;
}

export interface ConversationalSearchRequest {
  question: string;
  history?: ConversationMessage[];
  sources: SearchSourceConfig[];
  systemInstructions?: string;
  enableWebSearch?: boolean;
  maxResults?: number;
  locale?: string;
}

export interface ConversationalSearchResponse {
  answer: string;
  matchedItems: GroundedItem[];
  appliedFilters: string[];
  followUpSuggestions: string[];
  webCitations: WebCitation[];
  usedSources: string[];
  provider: 'github-models' | 'openai-compatible' | 'grounded-fallback';
}
