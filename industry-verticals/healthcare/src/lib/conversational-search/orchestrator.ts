import {
  ConversationalSearchRequest,
  ConversationalSearchResponse,
  GroundedItem,
  SearchSourceConfig,
  WebCitation,
} from './types';
import { IndexCatalogSummary, SitecoreSearchAdapter } from './tools/sitecoreSearchAdapter';
import { searchExternalWeb } from './tools/webSearchAdapter';

const DEFAULT_GITHUB_MODELS_URL = 'https://models.github.ai/inference/chat/completions';
const DEFAULT_MODEL = 'gpt-5-mini';

/**
 * Domain-aware synonym hints that help both the grounded fallback and tool-calling
 * bridge natural-language user questions to category/facet values across vertical sites.
 */
const NATURAL_LANGUAGE_CONCEPT_HINTS: Record<string, string[]> = {
  cardiologist: [
    'heart',
    'cardiac',
    'chest pain',
    'arrhythmia',
    'palpitation',
    'blood pressure',
    'hypertension',
    'cardiovascular',
    'cholesterol',
  ],
  neurologist: [
    'brain',
    'migraine',
    'headache',
    'seizure',
    'epilepsy',
    'stroke',
    'memory',
    'nerve',
    'neuropathy',
    'tremor',
    'dizziness',
  ],
  dermatologist: [
    'skin',
    'rash',
    'acne',
    'eczema',
    'psoriasis',
    'mole',
    'melanoma',
    'hair loss',
    'hives',
    'dermatology',
  ],
  pediatrician: [
    'child',
    'children',
    'kid',
    'baby',
    'infant',
    'newborn',
    'toddler',
    'teen',
    'pediatric',
    'vaccine',
  ],
  'orthopedic surgeon': [
    'bone',
    'joint',
    'knee',
    'shoulder',
    'hip',
    'fracture',
    'sports injury',
    'acl',
    'meniscus',
    'arthritis',
    'orthopedic',
    'spine',
    'back pain',
  ],
  gastroenterologist: [
    'stomach',
    'digestive',
    'gut',
    'acid reflux',
    'ulcer',
    'ibs',
    'crohn',
    'colitis',
    'liver',
    'colonoscopy',
    'abdominal',
  ],
  endocrinologist: [
    'diabetes',
    'thyroid',
    'hormone',
    'insulin',
    'metabolism',
    'adrenal',
    'pituitary',
    'osteoporosis',
  ],
  oncologist: ['cancer', 'tumor', 'oncology', 'chemotherapy', 'biopsy', 'lymphoma', 'carcinoma'],
  ophthalmologist: [
    'eye',
    'vision',
    'cataract',
    'glaucoma',
    'retina',
    'lasik',
    'blurry vision',
    'sight',
  ],
  psychiatrist: [
    'mental health',
    'anxiety',
    'depression',
    'adhd',
    'panic',
    'bipolar',
    'sleep',
    'insomnia',
    'stress',
    'therapy',
    'psychiatry',
  ],
  pulmonologist: [
    'lung',
    'breathing',
    'asthma',
    'copd',
    'cough',
    'shortness of breath',
    'sleep apnea',
    'respiratory',
  ],
  rheumatologist: [
    'autoimmune',
    'lupus',
    'rheumatoid',
    'joint swelling',
    'fibromyalgia',
    'gout',
    'vasculitis',
  ],
  urologist: ['kidney stone', 'bladder', 'prostate', 'urinary', 'urology'],
  nephrologist: ['kidney', 'renal', 'dialysis', 'hypertension'],
  gynecologist: [
    'women health',
    'pregnancy',
    'prenatal',
    'obgyn',
    'fertility',
    'menopause',
    'pelvic',
  ],
  otolaryngologist: [
    'ear',
    'nose',
    'throat',
    'ent',
    'sinus',
    'hearing',
    'tonsil',
    'vertigo',
    'tinnitus',
  ],
  allergist: ['allergy', 'allergies', 'immunology', 'hay fever', 'food allergy', 'asthma', 'hives'],
  hematologist: ['blood disorder', 'anemia', 'clotting', 'sickle cell', 'hematology'],
  'infectious disease specialist': [
    'infection',
    'viral',
    'bacterial',
    'travel medicine',
    'lyme',
    'fever',
  ],
  'general practitioner': [
    'primary care',
    'family doctor',
    'annual checkup',
    'physical exam',
    'general checkup',
    'preventive care',
    'flu',
  ],
};

interface OpenAIToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_calls?: OpenAIToolCall[];
  tool_call_id?: string;
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

/**
 * Infers matching categories from a natural-language question using both the actual categories
 * present in the SitecoreAI Search index and natural-language concept hints.
 */
function inferCategoriesFromQuestion(
  question: string,
  catalogs: IndexCatalogSummary[]
): { categories: string[]; keywords: string[] } {
  const lower = question.toLowerCase();
  const matchedCategories = new Set<string>();

  for (const catalog of catalogs) {
    for (const cat of catalog.categories) {
      const catLower = cat.name.toLowerCase();
      if (lower.includes(catLower)) {
        matchedCategories.add(cat.name);
        continue;
      }
      // Also match plural or root stem (e.g. "cardiologists" -> "Cardiologist")
      const stem = catLower.replace(/(ist|ian|er|or)s?$/, '');
      if (stem.length >= 4 && lower.includes(stem)) {
        matchedCategories.add(cat.name);
        continue;
      }

      const hints = NATURAL_LANGUAGE_CONCEPT_HINTS[catLower] || [];
      if (hints.some((hint) => lower.includes(hint))) {
        matchedCategories.add(cat.name);
      }
    }
  }

  const stopWords = new Set([
    'who',
    'what',
    'which',
    'where',
    'when',
    'why',
    'how',
    'can',
    'could',
    'would',
    'should',
    'find',
    'show',
    'tell',
    'give',
    'need',
    'looking',
    'for',
    'with',
    'have',
    'has',
    'does',
    'doctor',
    'doctors',
    'specialist',
    'specialists',
    'physician',
    'physicians',
    'help',
    'about',
    'the',
    'and',
    'are',
    'you',
    'any',
    'there',
    'best',
    'good',
    'see',
    'recommend',
    'available',
    'nova',
    'medical',
  ]);

  const keywords = lower
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word));

  return {
    categories: [...matchedCategories],
    keywords,
  };
}

/**
 * Generates contextual follow-up questions based on the matched results and available categories.
 */
function buildFollowUpSuggestions(
  matchedItems: GroundedItem[],
  catalogs: IndexCatalogSummary[],
  appliedCategories: string[]
): string[] {
  const suggestions: string[] = [];

  if (matchedItems.length > 0) {
    const first = matchedItems[0];
    suggestions.push(`Tell me more about ${first.title}'s background and clinical focus`);
    if (matchedItems.length > 1) {
      suggestions.push(`Compare ${first.title} and ${matchedItems[1].title} for my appointment`);
    }
  }

  const allCategories = catalogs.flatMap((c) => c.categories.map((cat) => cat.name));
  const otherCategory = allCategories.find((c) => !appliedCategories.includes(c));
  if (otherCategory) {
    suggestions.push(`Which ${otherCategory.toLowerCase()}s are available in the directory?`);
  } else {
    suggestions.push('What specialties are available across the directory?');
  }

  return suggestions.slice(0, 3);
}

/**
 * Grounded intelligent engine used when no external LLM token is configured or if the external endpoint is unreachable.
 * Ensures the conversational search works out-of-the-box in every environment while remaining 100% grounded in SitecoreAI Search.
 */
async function runGroundedSearchFallback(
  request: ConversationalSearchRequest,
  adapter: SitecoreSearchAdapter,
  catalogs: IndexCatalogSummary[],
  maxResults: number
): Promise<ConversationalSearchResponse> {
  const { question, history = [], enableWebSearch, locale } = request;
  const combinedContext =
    history.length > 0
      ? `${history
          .slice(-2)
          .map((m) => m.content)
          .join(' ')} ${question}`
      : question;

  const { categories: directCategories, keywords } = inferCategoriesFromQuestion(
    question,
    catalogs
  );
  const { categories: contextualCategories } =
    directCategories.length > 0
      ? { categories: directCategories }
      : inferCategoriesFromQuestion(combinedContext, catalogs);

  const collectedItems: GroundedItem[] = [];
  const appliedFilters = new Set<string>(contextualCategories);
  const usedSources = new Set<string>();

  // Check if user is asking for a directory overview / list of specialties
  const lowerQ = question.toLowerCase();
  const isOverviewQuestion =
    lowerQ.includes('what specialt') ||
    lowerQ.includes('all specialt') ||
    lowerQ.includes('how many') ||
    lowerQ.includes('list of') ||
    lowerQ.includes('overview');

  for (const source of request.sources) {
    const catalog = catalogs.find((c) => c.sourceId === source.id);
    if (!catalog) continue;

    // Check direct name match in catalog first
    const nameMatches = catalog.items.filter((item) => {
      const nameParts = item.title.toLowerCase().split(/\s+/);
      return nameParts.some((part) => part.length > 3 && lowerQ.includes(part));
    });

    if (nameMatches.length > 0) {
      for (const item of nameMatches) {
        collectedItems.push(item);
        if (item.category) appliedFilters.add(item.category);
      }
      usedSources.add(source.name);
      continue;
    }

    const searchRes = await adapter.searchSource(source, {
      query: keywords.join(' '),
      categories: contextualCategories,
      limit: maxResults,
      locale,
    });

    if (searchRes.items.length > 0) {
      collectedItems.push(...searchRes.items);
      searchRes.appliedCategories.forEach((c) => appliedFilters.add(c));
      usedSources.add(source.name);
    }
  }

  const deduplicated = Array.from(
    new Map(collectedItems.map((item) => [item.id, item])).values()
  ).slice(0, maxResults);

  const webCitations = enableWebSearch ? await searchExternalWeb(question, 2) : [];

  const totalIndexed = catalogs.reduce((acc, c) => acc + c.totalItems, 0);
  const allCategories = catalogs.flatMap((c) => c.categories);

  let answer = '';
  if (isOverviewQuestion && allCategories.length > 0) {
    const topSpecialties = allCategories
      .slice(0, 10)
      .map((c) => `${c.name} (${c.count})`)
      .join(', ');
    answer = `Our indexed directory includes **${totalIndexed} profiles** across **${allCategories.length} categories**, including ${topSpecialties}${allCategories.length > 10 ? ', and more' : ''}. Here are several featured profiles from the index:`;
  } else if (deduplicated.length > 0) {
    const filterList = [...appliedFilters];
    const intro =
      filterList.length > 0
        ? `Based on your question, I matched **${deduplicated.length} ${filterList.join(' / ')}** profile${deduplicated.length === 1 ? '' : 's'} from the SitecoreAI Search index:`
        : `I found **${deduplicated.length} relevant match${deduplicated.length === 1 ? '' : 'es'}** in our SitecoreAI Search index:`;

    const bullets = deduplicated
      .slice(0, 4)
      .map((item) => {
        const shortSummary =
          item.summary.length > 160 ? `${item.summary.slice(0, 157).trim()}...` : item.summary;
        return `- **${item.title}**${item.category ? ` (${item.category})` : ''}: ${shortSummary}`;
      })
      .join('\n');

    answer = `${intro}\n\n${bullets}`;
  } else {
    answer = `I searched our SitecoreAI Search index (${totalIndexed} total records across ${allCategories.length} categories) but did not find an exact match for "${question}". Try asking about a specific specialty such as ${allCategories
      .slice(0, 5)
      .map((c) => c.name)
      .join(', ')}, or describe what you are looking for.`;
  }

  return {
    answer,
    matchedItems: deduplicated,
    appliedFilters: [...appliedFilters],
    followUpSuggestions: buildFollowUpSuggestions(deduplicated, catalogs, [...appliedFilters]),
    webCitations,
    usedSources: [...usedSources],
    provider: 'grounded-fallback',
  };
}

/**
 * Runs the conversational AI search agent using a Foundry deployment (`gpt-5-mini`) or any configured
 * OpenAI-compatible endpoint with tool-calling over the configured SitecoreAI Search indexes.
 */
export async function runConversationalSearch(
  request: ConversationalSearchRequest,
  contextId: string,
  edgeUrl?: string
): Promise<ConversationalSearchResponse> {
  const maxResults = Math.min(Math.max(request.maxResults || 6, 1), 12);
  const validSources: SearchSourceConfig[] = (request.sources || []).filter((s) =>
    Boolean(s.searchIndex?.trim())
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
  const catalogs = await Promise.all(
    validSources.map((source) => adapter.getCatalogSummary(source, request.locale))
  );

  const { apiKey, baseUrl, model, provider } = getAiEndpointConfig();
  if (!apiKey) {
    return runGroundedSearchFallback(request, adapter, catalogs, maxResults);
  }

  const catalogContext = catalogs
    .map((c) => {
      const cats = c.categories.map((cat) => `${cat.name} (${cat.count})`).join(', ');
      return `Source "${c.sourceName}" (sourceId: "${c.sourceId}", total: ${c.totalItems}): Available categories/specialties: [${cats}]`;
    })
    .join('\n');

  const tools = [
    {
      type: 'function' as const,
      function: {
        name: 'search_sitecore_index',
        description:
          'Searches a SitecoreAI Search index by keyword and/or exact category/specialty names from the index schema. Always call this tool to retrieve grounded items before answering.',
        parameters: {
          type: 'object',
          properties: {
            sourceId: {
              type: 'string',
              description: 'The sourceId of the SitecoreAI Search index to query.',
            },
            query: {
              type: 'string',
              description:
                'Optional keywords or person/item name to search for (leave empty string when filtering purely by category/specialty).',
            },
            categories: {
              type: 'array',
              items: { type: 'string' },
              description:
                'One or more exact category/specialty names from the available categories list (e.g. ["Cardiologist"], ["Neurologist"]).',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of items to return (default 6).',
            },
          },
          required: ['sourceId'],
        },
      },
    },
    ...(request.enableWebSearch
      ? [
          {
            type: 'function' as const,
            function: {
              name: 'search_external_web',
              description:
                'Searches the public web for general background knowledge when the user asks a general question beyond the directory.',
              parameters: {
                type: 'object',
                properties: {
                  query: {
                    type: 'string',
                    description: 'Search query for external web lookup.',
                  },
                },
                required: ['query'],
              },
            },
          },
        ]
      : []),
  ];

  const systemPrompt = `You are an intelligent conversational search assistant grounded strictly in the site's SitecoreAI Search indexes.
${request.systemInstructions ? `\nSite Instructions:\n${request.systemInstructions}\n` : ''}
Configured SitecoreAI Search Indexes:
${catalogContext}

Rules:
1. Always call \`search_sitecore_index\` to look up grounded records from the appropriate sourceId.
2. When a user describes a need, symptom, topic, or question in natural language, map it to the matching category/specialty from the index's available categories list and pass those in \`categories\`. Leave \`query\` empty unless the user also asked for a specific name or keyword that must appear in the text.
3. Never invent or hallucinate names, credentials, URLs, or records that were not returned by \`search_sitecore_index\`.
4. After tool results return, respond with a JSON object matching this exact schema:
{
  "answer": "Clear, helpful markdown response summarizing how the matched items answer the user's question.",
  "matchedItemIds": ["sc_item_id of relevant items to show as cards"],
  "followUpSuggestions": ["2 to 3 natural follow-up questions the user can click next"]
}`;

  const messages: OpenAIMessage[] = [
    { role: 'system', content: systemPrompt },
    ...(request.history || []).slice(-6).map((turn) => ({
      role: turn.role,
      content: turn.content,
    })),
    { role: 'user', content: request.question },
  ];

  const retrievedItemsMap = new Map<string, GroundedItem>();
  const appliedFilters = new Set<string>();
  const usedSources = new Set<string>();
  const webCitations: WebCitation[] = [];

  try {
    for (let step = 0; step < 3; step++) {
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          tools,
          tool_choice: 'auto',
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        console.error(
          'Conversational search model call failed',
          response.status,
          errorBody.slice(0, 300)
        );
        return runGroundedSearchFallback(request, adapter, catalogs, maxResults);
      }

      const completion = (await response.json()) as {
        choices?: {
          message?: {
            content?: string | null;
            tool_calls?: OpenAIToolCall[];
          };
        }[];
      };

      const assistantMsg = completion.choices?.[0]?.message;
      if (!assistantMsg) break;

      if (assistantMsg.tool_calls && assistantMsg.tool_calls.length > 0) {
        messages.push({
          role: 'assistant',
          content: assistantMsg.content || null,
          tool_calls: assistantMsg.tool_calls,
        });

        for (const call of assistantMsg.tool_calls) {
          let parsedArgs: Record<string, unknown> = {};
          try {
            parsedArgs = JSON.parse(call.function.arguments || '{}');
          } catch {
            parsedArgs = {};
          }

          if (call.function.name === 'search_sitecore_index') {
            const requestedSourceId = String(parsedArgs.sourceId || validSources[0].id);
            const targetSource =
              validSources.find((s) => s.id === requestedSourceId) || validSources[0];
            const queryArg = typeof parsedArgs.query === 'string' ? parsedArgs.query : '';
            const categoriesArg = Array.isArray(parsedArgs.categories)
              ? parsedArgs.categories.map(String)
              : [];
            const limitArg = typeof parsedArgs.limit === 'number' ? parsedArgs.limit : maxResults;

            const searchOutcome = await adapter.searchSource(targetSource, {
              query: queryArg,
              categories: categoriesArg,
              limit: limitArg,
              locale: request.locale,
            });

            usedSources.add(targetSource.name);
            searchOutcome.appliedCategories.forEach((c) => appliedFilters.add(c));
            searchOutcome.items.forEach((item) => retrievedItemsMap.set(item.id, item));

            messages.push({
              role: 'tool',
              tool_call_id: call.id,
              content: JSON.stringify({
                source: targetSource.name,
                totalMatches: searchOutcome.total,
                appliedCategories: searchOutcome.appliedCategories,
                items: searchOutcome.items.map((item) => ({
                  id: item.id,
                  title: item.title,
                  category: item.category,
                  summary: item.summary,
                  url: item.url,
                })),
              }),
            });
          } else if (call.function.name === 'search_external_web' && request.enableWebSearch) {
            const webQuery = String(parsedArgs.query || request.question);
            const foundWeb = await searchExternalWeb(webQuery, 3);
            webCitations.push(...foundWeb);
            messages.push({
              role: 'tool',
              tool_call_id: call.id,
              content: JSON.stringify({ results: foundWeb }),
            });
          }
        }
        continue;
      }

      const rawContent = (assistantMsg.content || '').trim();
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]) as {
            answer?: string;
            matchedItemIds?: string[];
            followUpSuggestions?: string[];
          };

          const allRetrieved = [...retrievedItemsMap.values()];
          const selectedItems =
            Array.isArray(parsed.matchedItemIds) && parsed.matchedItemIds.length > 0
              ? parsed.matchedItemIds
                  .map((id) => retrievedItemsMap.get(id))
                  .filter((item): item is GroundedItem => Boolean(item))
              : allRetrieved;

          const finalItems = (selectedItems.length > 0 ? selectedItems : allRetrieved).slice(
            0,
            maxResults
          );

          return {
            answer:
              parsed.answer || 'Here are the matching profiles from our SitecoreAI Search index.',
            matchedItems: finalItems,
            appliedFilters: [...appliedFilters],
            followUpSuggestions:
              Array.isArray(parsed.followUpSuggestions) && parsed.followUpSuggestions.length > 0
                ? parsed.followUpSuggestions.slice(0, 3)
                : buildFollowUpSuggestions(finalItems, catalogs, [...appliedFilters]),
            webCitations,
            usedSources: [...usedSources],
            provider,
          };
        } catch {
          // If content wasn't strict JSON, return raw text with any retrieved items
        }
      }

      if (rawContent) {
        const finalItems = [...retrievedItemsMap.values()].slice(0, maxResults);
        return {
          answer: rawContent,
          matchedItems: finalItems,
          appliedFilters: [...appliedFilters],
          followUpSuggestions: buildFollowUpSuggestions(finalItems, catalogs, [...appliedFilters]),
          webCitations,
          usedSources: [...usedSources],
          provider,
        };
      }
    }
  } catch (error) {
    console.error(
      'Conversational search model call failed',
      error instanceof Error ? error.message : error
    );
    return runGroundedSearchFallback(request, adapter, catalogs, maxResults);
  }

  return runGroundedSearchFallback(request, adapter, catalogs, maxResults);
}
