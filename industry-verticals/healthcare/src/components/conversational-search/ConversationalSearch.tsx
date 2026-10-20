'use client';

import { FormEvent, useMemo, useRef, useState } from 'react';
import {
  ComponentParams,
  ComponentRendering,
  Field,
  Text,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import { Bot, ExternalLink, LayoutGrid, List, RotateCcw, Send, Sparkles, User } from 'lucide-react';
import { cn } from 'lib/utils';
import { SearchItem } from '@/components/search-experience/search-components/SearchItem';
import { SearchField } from '@/components/search-experience/search-components/models';
import { useEvent } from '@/components/search-experience/search-components/useEvent';
import {
  ConversationMessage,
  ConversationalSearchResponse,
  GroundedItem,
  SearchSourceConfig,
  WebCitation,
} from '@/lib/conversational-search/types';

export interface AdditionalSearchSourceItem {
  id?: string;
  name?: string;
  displayName?: string;
  fields?: {
    search?: Field<string>;
  };
}

export interface ConversationalSearchFields {
  search?: Field<string>;
  additionalSearchSources?: AdditionalSearchSourceItem[];
  title?: Field<string>;
  subtitle?: Field<string>;
  welcomeMessage?: Field<string>;
  inputPlaceholder?: Field<string>;
  suggestedPrompts?: Field<string>;
  systemInstructions?: Field<string>;
  enableWebSearch?: Field<boolean>;
}

export type ConversationalSearchParams = ComponentParams & {
  columns?: string;
  pageSize?: number;
  styles?: string;
  RenderingIdentifier?: string;
};

export interface ConversationalSearchProps {
  rendering: ComponentRendering;
  params: ConversationalSearchParams;
  fields?: ConversationalSearchFields;
}

interface ChatTurn {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  matchedItems?: GroundedItem[];
  appliedFilters?: string[];
  followUpSuggestions?: string[];
  webCitations?: WebCitation[];
  usedSources?: string[];
  provider?: string;
}

const DEFAULT_PROMPTS = [
  'Who can help with recurring migraines or neurological symptoms?',
  'Which cardiologists are available for heart rhythm evaluations?',
  'Do you have a pediatrician for newborn and child checkups?',
  'Which specialist should I see for a sports knee injury?',
];

function parseSearchFieldValue(raw?: string | null): SearchField | null {
  const trimmed = raw?.trim();
  if (!trimmed) return null;
  try {
    const parsed = JSON.parse(trimmed) as SearchField;
    if (parsed?.searchIndex) {
      return {
        searchIndex: parsed.searchIndex,
        fieldsMapping: parsed.fieldsMapping || {},
      };
    }
    return null;
  } catch {
    return null;
  }
}

function parseSuggestedPrompts(raw?: string | null): string[] {
  const trimmed = raw?.trim();
  if (!trimmed) return DEFAULT_PROMPTS;
  const parts = trimmed
    .split(/\r?\n|\|/)
    .map((line) => line.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : DEFAULT_PROMPTS;
}

/**
 * Renders markdown-lite bold and bullet formatting cleanly inside assistant responses.
 */
const FormattedAnswer = ({ text }: { text: string }) => {
  const paragraphs = text.split(/\n{2,}/);
  return (
    <div className="space-y-3 text-sm leading-relaxed md:text-base">
      {paragraphs.map((block, idx) => {
        const lines = block.split('\n').filter((line) => line.trim());
        const isList = lines.length > 0 && lines.every((line) => /^[-*]\s+/.test(line.trim()));

        const formatInline = (line: string) => {
          const segments = line.split(/(\*\*[^*]+\*\*)/g);
          return segments.map((seg, i) =>
            seg.startsWith('**') && seg.endsWith('**') ? (
              <strong key={i} className="font-semibold">
                {seg.slice(2, -2)}
              </strong>
            ) : (
              <span key={i}>{seg}</span>
            )
          );
        };

        if (isList) {
          return (
            <ul key={idx} className="list-disc space-y-1.5 pl-5">
              {lines.map((line, lineIdx) => (
                <li key={lineIdx}>{formatInline(line.replace(/^[-*]\s+/, ''))}</li>
              ))}
            </ul>
          );
        }

        return (
          <p key={idx}>
            {lines.map((line, lineIdx) => (
              <span key={lineIdx}>
                {lineIdx > 0 && <br />}
                {formatInline(line)}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
};

const ConversationalSearchInner = ({
  props,
  layoutVariant,
}: {
  props: ConversationalSearchProps;
  layoutVariant: 'default' | 'compact';
}) => {
  const { page, api } = useSitecore();
  const { isEditing } = page.mode;
  const fields = props.fields || {};
  const styles = (props.params?.styles || '').trim();
  const id = props.params?.RenderingIdentifier;
  const maxResults = Number(props.params?.pageSize) || 6;
  const defaultCardView = Number(props.params?.columns) === 1 ? 'list' : 'card';

  const [view, setView] = useState<'card' | 'list'>(defaultCardView);
  const [input, setInput] = useState('');
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [webSearchActive, setWebSearchActive] = useState<boolean>(
    Boolean(fields.enableWebSearch?.value)
  );
  const turnCounterRef = useRef(0);

  const sources = useMemo((): SearchSourceConfig[] => {
    const list: SearchSourceConfig[] = [];
    const primary = parseSearchFieldValue(fields.search?.value);
    if (primary) {
      list.push({
        id: 'primary',
        name: 'Primary Directory',
        searchIndex: primary.searchIndex,
        fieldsMapping: primary.fieldsMapping,
      });
    }

    const additional = Array.isArray(fields.additionalSearchSources)
      ? fields.additionalSearchSources
      : [];

    for (const item of additional) {
      const parsed = parseSearchFieldValue(item?.fields?.search?.value);
      if (parsed && !list.some((existing) => existing.searchIndex === parsed.searchIndex)) {
        list.push({
          id: item.id || parsed.searchIndex,
          name: item.displayName || item.name || 'Additional Index',
          searchIndex: parsed.searchIndex,
          fieldsMapping: parsed.fieldsMapping,
        });
      }
    }

    return list;
  }, [fields.search?.value, fields.additionalSearchSources]);

  const starterPrompts = useMemo(
    () => parseSuggestedPrompts(fields.suggestedPrompts?.value),
    [fields.suggestedPrompts?.value]
  );

  const sendEvent = useEvent({
    query: input,
    uid: props.rendering?.uid,
  });

  const submitQuestion = async (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed || isLoading) return;

    turnCounterRef.current += 1;
    const userTurnId = `user-${turnCounterRef.current}`;

    const historyPayload: ConversationMessage[] = turns.map((t) => ({
      role: t.role,
      content: t.content,
    }));

    setTurns((prev) => [
      ...prev,
      {
        id: userTurnId,
        role: 'user',
        content: trimmed,
      },
    ]);
    setInput('');
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/conversational-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: trimmed,
          history: historyPayload,
          sources,
          systemInstructions: fields.systemInstructions?.value || undefined,
          enableWebSearch: webSearchActive,
          maxResults,
          locale: page.locale,
          contextId: api?.edge?.clientContextId,
          edgeUrl: api?.edge?.edgeUrl,
        }),
      });

      if (!response.ok) {
        const errData = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(errData.error || `Request failed with status ${response.status}`);
      }

      const data = (await response.json()) as ConversationalSearchResponse;
      turnCounterRef.current += 1;
      const assistantTurnId = `assistant-${turnCounterRef.current}`;

      setTurns((prev) => [
        ...prev,
        {
          id: assistantTurnId,
          role: 'assistant',
          content: data.answer,
          matchedItems: data.matchedItems,
          appliedFilters: data.appliedFilters,
          followUpSuggestions: data.followUpSuggestions,
          webCitations: data.webCitations,
          usedSources: data.usedSources,
          provider: data.provider,
        },
      ]);

      sendEvent('viewed');
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Something went wrong while searching. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submitQuestion(input);
  };

  const resetConversation = () => {
    setTurns([]);
    setErrorMessage(null);
    setInput('');
  };

  const latestAssistantTurn = useMemo(
    () => [...turns].reverse().find((t) => t.role === 'assistant'),
    [turns]
  );

  const placeholderText =
    fields.inputPlaceholder?.value ||
    'Ask a question in plain language (e.g., "Which doctor treats migraines?" or "Show cardiologists")...';

  return (
    <section
      className={cn('component conversational-search relative py-12', styles)}
      id={id || undefined}
    >
      <div className="container">
        <div className="bg-background-secondary dark:bg-background-secondary-dark border-foreground/10 overflow-hidden rounded-3xl border shadow-sm">
          {/* Header Banner */}
          <div className="border-foreground/10 flex flex-wrap items-start justify-between gap-4 border-b px-6 py-6 md:px-8">
            <div className="max-w-3xl space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#6cd8c9]/25 px-3 py-1 text-xs font-semibold tracking-wide uppercase">
                <Sparkles className="h-3.5 w-3.5" />
                <span>AI Grounded Search</span>
                {sources.length > 0 && (
                  <span className="opacity-75">
                    · {sources.length} {sources.length === 1 ? 'Index' : 'Indexes'} Connected
                  </span>
                )}
              </div>

              {(fields.title?.value || isEditing) && (
                <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                  {fields.title ? <Text field={fields.title} /> : 'Ask Our AI Directory Assistant'}
                </h2>
              )}

              {(fields.subtitle?.value || isEditing) && (
                <p className="text-foreground/80 dark:text-foreground-dark/80 text-sm md:text-base">
                  {fields.subtitle ? (
                    <Text field={fields.subtitle} />
                  ) : (
                    'Ask questions in natural language to find matching specialists and grounded profiles from SitecoreAI Search.'
                  )}
                </p>
              )}
            </div>

            {/* Toolbar controls */}
            <div className="flex flex-wrap items-center gap-2">
              <label className="border-foreground/15 bg-background/80 dark:bg-background-dark/40 inline-flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium select-none">
                <input
                  type="checkbox"
                  checked={webSearchActive}
                  onChange={(e) => setWebSearchActive(e.target.checked)}
                  className="accent-foreground h-3.5 w-3.5 rounded"
                />
                <span>Include Web Search</span>
              </label>

              <div
                className="border-foreground/15 bg-background/80 dark:bg-background-dark/40 inline-flex items-center rounded-full border p-0.5"
                role="group"
                aria-label="Result layout"
              >
                <button
                  type="button"
                  onClick={() => setView('card')}
                  aria-label="Cards view"
                  aria-pressed={view === 'card'}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition',
                    view === 'card'
                      ? 'bg-foreground text-background dark:bg-foreground-dark dark:text-background-secondary-dark'
                      : 'opacity-75 hover:opacity-100'
                  )}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  <span>Cards</span>
                </button>
                <button
                  type="button"
                  onClick={() => setView('list')}
                  aria-label="List view"
                  aria-pressed={view === 'list'}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition',
                    view === 'list'
                      ? 'bg-foreground text-background dark:bg-foreground-dark dark:text-background-secondary-dark'
                      : 'opacity-75 hover:opacity-100'
                  )}
                >
                  <List className="h-3.5 w-3.5" />
                  <span>List</span>
                </button>
              </div>

              {turns.length > 0 && (
                <button
                  type="button"
                  onClick={resetConversation}
                  className="border-foreground/15 bg-background/80 hover:bg-background inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Page Builder / Editing Mode Configuration Inspector */}
          {isEditing && (
            <div className="border-foreground/10 bg-background/60 border-b px-6 py-4 text-xs md:px-8">
              <p className="font-semibold tracking-wide uppercase opacity-75">
                Page Builder Configuration
              </p>
              <div className="mt-2 grid gap-3 md:grid-cols-2">
                <div>
                  <span className="font-medium">Connected Search Indexes: </span>
                  {sources.length > 0
                    ? sources.map((s) => `${s.name} (${s.searchIndex})`).join(', ')
                    : 'None configured — select a Search Experience index in the search field'}
                </div>
                <div>
                  <span className="font-medium">Suggested Prompts (newline or | separated): </span>
                  {fields.suggestedPrompts && <Text field={fields.suggestedPrompts} />}
                </div>
              </div>
            </div>
          )}

          {/* Main Conversational Body */}
          <div
            className={cn(
              'p-6 md:p-8',
              layoutVariant === 'compact' &&
                turns.length > 0 &&
                'grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]'
            )}
          >
            <div className="space-y-6">
              {/* Welcome & Starter Prompts */}
              {turns.length === 0 && (
                <div className="bg-background/90 dark:bg-background-dark/40 border-foreground/10 rounded-2xl border p-5 md:p-6">
                  <div className="flex items-start gap-3.5">
                    <div className="bg-accent text-foreground flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div className="space-y-3">
                      <div className="text-sm leading-relaxed md:text-base">
                        {fields.welcomeMessage?.value || isEditing ? (
                          <Text field={fields.welcomeMessage} />
                        ) : (
                          'Hello! Ask me what kind of specialist, condition, or background you are looking for, and I will search our live SitecoreAI Search directory for matching profiles.'
                        )}
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-semibold tracking-wide uppercase opacity-70">
                          Try asking:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {starterPrompts.map((prompt, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => void submitQuestion(prompt)}
                              disabled={isLoading}
                              className="border-foreground/15 bg-background-secondary hover:border-foreground/40 dark:bg-background-secondary-dark rounded-full border px-3.5 py-1.5 text-left text-xs font-medium transition md:text-sm"
                            >
                              {prompt}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Conversation Thread */}
              {turns.length > 0 && (
                <div className="space-y-6" aria-live="polite">
                  {turns.map((turn) =>
                    turn.role === 'user' ? (
                      <div key={turn.id} className="flex justify-end">
                        <div className="bg-foreground text-background dark:bg-foreground-dark dark:text-background-secondary-dark inline-flex max-w-2xl items-start gap-3 rounded-2xl rounded-br-sm px-4 py-3 text-sm md:text-base">
                          <span className="leading-relaxed">{turn.content}</span>
                          <User className="mt-0.5 h-4 w-4 shrink-0 opacity-80" />
                        </div>
                      </div>
                    ) : (
                      <div
                        key={turn.id}
                        className="bg-background/95 dark:bg-background-dark/50 border-foreground/10 space-y-5 rounded-2xl border p-5 md:p-6"
                      >
                        <div className="flex items-start gap-3.5">
                          <div className="bg-accent text-foreground flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
                            <Bot className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1 space-y-3">
                            {/* Metadata badges */}
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              {turn.appliedFilters &&
                                turn.appliedFilters.map((filter) => (
                                  <span
                                    key={filter}
                                    className="bg-accent/35 rounded-full px-2.5 py-0.5 font-semibold"
                                  >
                                    Specialty: {filter}
                                  </span>
                                ))}
                              {turn.usedSources &&
                                turn.usedSources.map((src) => (
                                  <span
                                    key={src}
                                    className="border-foreground/15 rounded-full border px-2.5 py-0.5 opacity-75"
                                  >
                                    Grounded in: {src}
                                  </span>
                                ))}
                            </div>

                            <FormattedAnswer text={turn.content} />

                            {/* Web citations when EnableWebSearch is active */}
                            {turn.webCitations && turn.webCitations.length > 0 && (
                              <div className="border-foreground/10 space-y-2 border-t pt-3">
                                <p className="text-xs font-semibold tracking-wide uppercase opacity-75">
                                  Additional Web Context
                                </p>
                                <div className="grid gap-2 sm:grid-cols-2">
                                  {turn.webCitations.map((citation, cIdx) => (
                                    <a
                                      key={cIdx}
                                      href={citation.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="border-foreground/10 hover:border-foreground/30 flex flex-col justify-between rounded-xl border p-3 text-xs transition"
                                    >
                                      <div>
                                        <p className="font-semibold">{citation.title}</p>
                                        <p className="mt-1 line-clamp-2 opacity-80">
                                          {citation.snippet}
                                        </p>
                                      </div>
                                      <span className="mt-2 inline-flex items-center gap-1 font-medium underline">
                                        {citation.source}
                                        <ExternalLink className="h-3 w-3" />
                                      </span>
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Matched Grounded Cards (Default inline mode) */}
                            {layoutVariant === 'default' &&
                              turn.matchedItems &&
                              turn.matchedItems.length > 0 && (
                                <div className="pt-2">
                                  <div
                                    className={cn(
                                      'grid',
                                      view === 'list'
                                        ? 'grid-cols-1 gap-4'
                                        : 'grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3'
                                    )}
                                  >
                                    {turn.matchedItems.map((item) => (
                                      <SearchItem
                                        key={item.id}
                                        variant={view}
                                        data={item.rawDocument}
                                        mapping={item.fieldsMapping}
                                        onClick={() => sendEvent('clicked')}
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}

                            {/* Follow-up suggestions */}
                            {turn.followUpSuggestions && turn.followUpSuggestions.length > 0 && (
                              <div className="border-foreground/10 flex flex-wrap items-center gap-2 border-t pt-3">
                                <span className="text-xs font-semibold opacity-70">Follow-up:</span>
                                {turn.followUpSuggestions.map((followUp, fIdx) => (
                                  <button
                                    key={fIdx}
                                    type="button"
                                    onClick={() => void submitQuestion(followUp)}
                                    disabled={isLoading}
                                    className="border-foreground/15 bg-background-secondary hover:border-foreground/40 dark:bg-background-secondary-dark rounded-full border px-3 py-1 text-left text-xs font-medium transition"
                                  >
                                    {followUp}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  )}

                  {isLoading && (
                    <div className="bg-background/90 border-foreground/10 flex items-center gap-3 rounded-2xl border p-4 text-sm">
                      <div className="bg-accent text-foreground flex h-8 w-8 animate-pulse items-center justify-center rounded-full">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <span className="font-medium">
                        Searching SitecoreAI Search index and preparing grounded answer...
                      </span>
                    </div>
                  )}
                </div>
              )}

              {errorMessage && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-900 dark:text-red-200"
                >
                  {errorMessage}
                </div>
              )}

              {/* Question Input Form */}
              <form onSubmit={handleFormSubmit} className="relative">
                <div className="bg-background dark:bg-background-dark border-foreground/20 focus-within:border-foreground flex items-center gap-2 rounded-2xl border p-2 pl-4 shadow-xs transition">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={placeholderText}
                    disabled={isLoading}
                    aria-label="Ask a conversational search question"
                    className="min-w-0 flex-1 bg-transparent py-2 text-sm focus:outline-none md:text-base"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="bg-foreground text-background hover:bg-foreground/90 dark:bg-foreground-dark dark:text-background-secondary-dark inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <span>Ask AI</span>
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </div>

            {/* Compact split-view panel for latest matched results */}
            {layoutVariant === 'compact' && turns.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold">
                    Matched Results ({latestAssistantTurn?.matchedItems?.length || 0})
                  </h3>
                </div>
                {latestAssistantTurn?.matchedItems &&
                latestAssistantTurn.matchedItems.length > 0 ? (
                  <div
                    className={cn(
                      'grid',
                      view === 'list' ? 'grid-cols-1 gap-4' : 'grid-cols-1 gap-6 sm:grid-cols-2'
                    )}
                  >
                    {latestAssistantTurn.matchedItems.map((item) => (
                      <SearchItem
                        key={item.id}
                        variant={view}
                        data={item.rawDocument}
                        mapping={item.fieldsMapping}
                        onClick={() => sendEvent('clicked')}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm opacity-75">
                    Ask a question to display grounded profiles from the index.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export const Default = (props: ConversationalSearchProps) => (
  <ConversationalSearchInner props={props} layoutVariant="default" />
);

export const Compact = (props: ConversationalSearchProps) => (
  <ConversationalSearchInner props={props} layoutVariant="compact" />
);
