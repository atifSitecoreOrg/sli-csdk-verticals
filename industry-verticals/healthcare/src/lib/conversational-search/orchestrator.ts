import {
  ConversationalSearchRequest,
  ConversationalSearchResponse,
  GroundedItem,
  SearchSourceConfig,
  WebCitation,
} from './types';
import {
  SitecoreSearchAdapter,
  isIdentifierValue,
  isSpecialtyField,
} from './tools/sitecoreSearchAdapter';
import { searchExternalWeb } from './tools/webSearchAdapter';

const DEFAULT_GITHUB_MODELS_URL = 'https://models.github.ai/inference/chat/completions';
const DEFAULT_MODEL = 'gpt-5-mini';

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

function getAiEndpointConfig() {
  const apiKey =
    process.env.GITHUB_MODELS_TOKEN || process.env.GITHUB_TOKEN || process.env.OPENAI_API_KEY || '';
  const baseUrl = process.env.AI_BASE_URL || DEFAULT_GITHUB_MODELS_URL;
  const model = process.env.AI_MODEL || DEFAULT_MODEL;
  const provider: 'github-models' | 'openai-compatible' =
    baseUrl.includes('models.github.ai') || baseUrl.includes('models.inference.ai.azure.com')
      ? 'github-models'
      : 'openai-compatible';

  return { apiKey: apiKey.trim(), baseUrl, model, provider };
}

const HITS_PER_SOURCE = 4;
const COMBINED_RESULT_CAP = 12;

function usesSpecialtyLabels(sources: SearchSourceConfig[]): boolean {
  return (
    sources.length > 0 && sources.every((source) => isSpecialtyField(source.fieldsMapping?.type))
  );
}

function takeBalancedHits(
  sources: SearchSourceConfig[],
  batches: Array<{ items: GroundedItem[] } | undefined>
): { items: GroundedItem[]; usedSources: string[] } {
  const items: GroundedItem[] = [];
  const seen = new Set<string>();
  const usedSources: string[] = [];

  sources.forEach((source, index) => {
    const batch = batches[index];
    if (!batch || batch.items.length === 0) return;

    let kept = 0;
    for (const item of batch.items) {
      if (kept >= HITS_PER_SOURCE || items.length >= COMBINED_RESULT_CAP) break;
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      items.push(item);
      kept += 1;
    }

    if (kept > 0) usedSources.push(source.name);
  });

  return { items, usedSources };
}

function coverEverySource(selected: GroundedItem[], pool: GroundedItem[]): GroundedItem[] {
  const result = [...selected];
  const seen = new Set(result.map((item) => item.id));
  const covered = new Set(result.map((item) => item.sourceId));

  for (const item of pool) {
    if (result.length >= COMBINED_RESULT_CAP) break;
    if (covered.has(item.sourceId) || seen.has(item.id)) continue;
    result.push(item);
    seen.add(item.id);
    covered.add(item.sourceId);
  }

  return result;
}

function filtersForDisplayedItems(items: GroundedItem[]): string[] {
  const labels = new Set<string>();
  for (const item of items) {
    if (!isSpecialtyField(item.fieldsMapping?.type)) continue;
    if (item.category && !isIdentifierValue(item.category)) labels.add(item.category);
  }
  return [...labels];
}

function buildFollowUpSuggestions(matchedItems: GroundedItem[], specialtyMode: boolean): string[] {
  if (matchedItems.length === 0) {
    return specialtyMode
      ? ['What specialties are available?']
      : ['Show me sofas', 'What chairs do you have?'];
  }

  const first = matchedItems[0];
  const second = matchedItems[1];
  if (specialtyMode) {
    return [
      `Tell me more about ${first.title}`,
      second
        ? `Compare ${first.title} and ${second.title}`
        : 'Which other specialists are available?',
    ];
  }

  return [
    `Tell me more about the ${first.title}`,
    second ? `Compare ${first.title} and ${second.title}` : 'Show me similar items',
    'What other options do you have?',
  ].slice(0, 3);
}

function answerFromItems(question: string, items: GroundedItem[], specialtyMode: boolean): string {
  if (items.length === 0) {
    return specialtyMode
      ? `I searched the SitecoreAI Search index but did not find a specialist match for "${question}". Try naming a specialty or a symptom.`
      : `I searched the SitecoreAI Search index but did not find a match for "${question}". Try naming a product, such as a sofa, chair, or lamp.`;
  }

  const intro = `I found ${items.length} match${items.length === 1 ? '' : 'es'} in the SitecoreAI Search index:`;
  const bullets = items
    .slice(0, 4)
    .map((item) => {
      const shortSummary =
        item.summary.length > 160 ? `${item.summary.slice(0, 157).trim()}...` : item.summary;
      const category =
        isSpecialtyField(item.fieldsMapping?.type) &&
        item.category &&
        !isIdentifierValue(item.category)
          ? ` (${item.category})`
          : '';
      return `- **${item.title}**${category}: ${shortSummary}`;
    })
    .join('\n');

  return `${intro}\n\n${bullets}`;
}

function groundedResponse(
  question: string,
  items: GroundedItem[],
  appliedFilters: string[],
  webCitations: WebCitation[],
  usedSources: string[],
  specialtyMode: boolean
): ConversationalSearchResponse {
  return {
    answer: answerFromItems(question, items, specialtyMode),
    matchedItems: items,
    appliedFilters,
    followUpSuggestions: buildFollowUpSuggestions(items, specialtyMode),
    webCitations,
    usedSources,
    provider: 'grounded-fallback',
  };
}

function itemsForPrompt(items: GroundedItem[]) {
  return items.map((item) => {
    const specialty =
      isSpecialtyField(item.fieldsMapping?.type) &&
      item.category &&
      !isIdentifierValue(item.category)
        ? item.category
        : undefined;

    return {
      id: item.id,
      title: item.title,
      sourceName: item.sourceName,
      ...(specialty ? { specialty } : {}),
      summary: item.summary,
      url: item.url,
    };
  });
}

async function requestAnswer(
  baseUrl: string,
  apiKey: string,
  model: string,
  messages: OpenAIMessage[],
  reasoningEffort: 'low' | undefined
): Promise<Response> {
  return fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      ...(reasoningEffort ? { reasoning_effort: reasoningEffort } : {}),
    }),
  });
}

/**
 * Searches each configured SitecoreAI Search index once, then asks the model once to phrase the answer.
 */
export async function runConversationalSearch(
  request: ConversationalSearchRequest,
  contextId: string,
  edgeUrl?: string
): Promise<ConversationalSearchResponse> {
  const validSources: SearchSourceConfig[] = (request.sources || []).filter((source) =>
    Boolean(source.searchIndex?.trim())
  );

  if (validSources.length === 0) {
    return {
      answer:
        'No SitecoreAI Search index is configured on this component yet. Please select a Search Experience index in the component datasource.',
      matchedItems: [],
      appliedFilters: [],
      followUpSuggestions: [],
      webCitations: [],
      usedSources: [],
      provider: 'grounded-fallback',
    };
  }

  const adapter = new SitecoreSearchAdapter(contextId, edgeUrl);
  const specialtyMode = usesSpecialtyLabels(validSources);
  const [searchBatches, webCitations] = await Promise.all([
    Promise.all(
      validSources.map((source) =>
        adapter.searchSource(source, {
          query: request.question,
          limit: HITS_PER_SOURCE,
          locale: request.locale,
        })
      )
    ),
    request.enableWebSearch ? searchExternalWeb(request.question, 2) : Promise.resolve([]),
  ]);

  const { items, usedSources: sourcesUsed } = takeBalancedHits(validSources, searchBatches);
  const filters = filtersForDisplayedItems(items);

  const { apiKey, baseUrl, model, provider } = getAiEndpointConfig();
  if (!apiKey) {
    return groundedResponse(
      request.question,
      items,
      filters,
      webCitations,
      sourcesUsed,
      specialtyMode
    );
  }

  const history = (request.history || [])
    .slice(-4)
    .map((turn) => `${turn.role}: ${turn.content}`)
    .join('\n');

  const messages: OpenAIMessage[] = [
    {
      role: 'system',
      content: `You write a short answer from SitecoreAI Search results. Use only the supplied items.
${request.systemInstructions ? `\nSite instructions:\n${request.systemInstructions}\n` : ''}
Rules:
- Do not invent names, products, specialties, or URLs.
- Each item includes sourceName, the index it came from. Answer from those sources and keep each fact with its source.
- Mention a specialty only when that item includes a specialty field. Never describe a SKU or product code as a specialty.
- Return JSON only:
{"answer":"markdown summary","matchedItemIds":["id"],"followUpSuggestions":["question","question"]}`,
    },
    {
      role: 'user',
      content: `${history ? `Recent conversation:\n${history}\n\n` : ''}Question: ${request.question}

Search results:
${JSON.stringify(itemsForPrompt(items))}

${webCitations.length > 0 ? `Web notes:\n${JSON.stringify(webCitations)}` : ''}`,
    },
  ];

  try {
    let response = await requestAnswer(baseUrl, apiKey, model, messages, 'low');
    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      const rejectedReasoning = response.status === 400 && /reasoning_effort/i.test(errorBody);
      if (!rejectedReasoning) {
        console.error(
          'Conversational search model call failed',
          response.status,
          errorBody.slice(0, 300)
        );
        return groundedResponse(
          request.question,
          items,
          filters,
          webCitations,
          sourcesUsed,
          specialtyMode
        );
      }
      response = await requestAnswer(baseUrl, apiKey, model, messages, undefined);
      if (!response.ok) {
        const retryBody = await response.text().catch(() => '');
        console.error(
          'Conversational search model call failed',
          response.status,
          retryBody.slice(0, 300)
        );
        return groundedResponse(
          request.question,
          items,
          filters,
          webCitations,
          sourcesUsed,
          specialtyMode
        );
      }
    }

    const completion = (await response.json()) as {
      choices?: { message?: { content?: string | null } }[];
    };
    const rawContent = (completion.choices?.[0]?.message?.content || '').trim();
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]) as {
          answer?: string;
          matchedItemIds?: string[];
          followUpSuggestions?: string[];
        };
        const byId = new Map(items.map((item) => [item.id, item]));
        const selected =
          Array.isArray(parsed.matchedItemIds) && parsed.matchedItemIds.length > 0
            ? parsed.matchedItemIds
                .map((id) => byId.get(id))
                .filter((item): item is GroundedItem => Boolean(item))
            : items;
        const finalItems = coverEverySource(selected.length > 0 ? selected : items, items).slice(
          0,
          COMBINED_RESULT_CAP
        );
        const displayedFilters = filtersForDisplayedItems(finalItems);

        return {
          answer: parsed.answer || answerFromItems(request.question, finalItems, specialtyMode),
          matchedItems: finalItems,
          appliedFilters: displayedFilters,
          followUpSuggestions:
            Array.isArray(parsed.followUpSuggestions) && parsed.followUpSuggestions.length > 0
              ? parsed.followUpSuggestions.slice(0, 3)
              : buildFollowUpSuggestions(finalItems, specialtyMode),
          webCitations,
          usedSources: sourcesUsed,
          provider,
        };
      } catch {
        // The model returned text that was not JSON. Keep the retrieved items.
      }
    }

    if (rawContent) {
      return {
        answer: rawContent,
        matchedItems: items,
        appliedFilters: filters,
        followUpSuggestions: buildFollowUpSuggestions(items, specialtyMode),
        webCitations,
        usedSources: sourcesUsed,
        provider,
      };
    }
  } catch (error) {
    console.error(
      'Conversational search model call failed',
      error instanceof Error ? error.message : error
    );
  }

  return groundedResponse(
    request.question,
    items,
    filters,
    webCitations,
    sourcesUsed,
    specialtyMode
  );
}
