'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from './search-components/useTranslations';
import { useSearchParams } from 'next/navigation';
import { useSitecore } from '@sitecore-content-sdk/nextjs';
import { useInfiniteSearch } from '@sitecore-content-sdk/nextjs/search';
import { cn } from 'lib/utils';
import { SearchDocument, SearchExperienceProps } from './search-components/models';
import { SearchEmptyResults } from './search-components/SearchEmptyResults';
import { SearchError } from './search-components/SearchError';
import { SearchItem } from './search-components/SearchItem';
import { SearchSkeletonItem } from './search-components/SearchSkeletonItem';
import { SearchInput } from './search-components/SearchInput';
import { useEvent } from './search-components/useEvent';
import { useSearchField } from './search-components/useSearchField';
import { DICTIONARY_KEYS, gridColsClass } from './search-components/constants';
import { useParams } from './search-components/useParams';
import { useRouter } from './search-components/useRouter';

export const LoadMore = (props: SearchExperienceProps) => {
  const { page } = useSitecore();
  const { params } = props;
  const t = useTranslations();
  const { searchIndex, fieldsMapping } = useSearchField(props.fields?.search?.value);

  const { styles, id, pageSize, columns } = useParams(params);
  const searchParams = useSearchParams();

  const { isEditing, isPreview } = page.mode;
  const searchQuery = (searchParams?.get('q') as string) || '';
  const searchEnabled = !isEditing && !isPreview;
  const [inputValue, setInputValue] = useState<string>(searchQuery);
  const previousSearchQuery = useRef(searchQuery);

  if (previousSearchQuery.current !== searchQuery) {
    previousSearchQuery.current = searchQuery;
    setInputValue(searchQuery);
  }

  const {
    total,
    loadMore,
    results,
    isLoading,
    isLoadingMore,
    error,
    isError,
    isSuccess,
    hasNextPage,
  } = useInfiniteSearch<SearchDocument>({
    searchIndexId: searchIndex,
    pageSize,
    enabled: searchEnabled,
    query: searchQuery,
  });

  const sendEvent = useEvent({ query: searchQuery, uid: props.rendering.uid });

  const { setRouterQuery } = useRouter();

  useEffect(() => {
    if (isSuccess) {
      sendEvent('viewed');
    }
  }, [isSuccess, sendEvent]);

  const onSearchChange = useCallback(
    (value: string, debounced: boolean = true) => {
      setInputValue(value);

      if (isEditing || isPreview) return;

      setRouterQuery(value, debounced);
    },
    [setRouterQuery, isEditing, isPreview]
  );

  return (
    <div className={`component search-experience ${styles}`} id={id ? id : undefined}>
      <div className="component-content">
        <div
          className={cn('mx-auto max-w-7xl p-6', {
            'pt-24 lg:pt-32': !isEditing,
          })}
        >
          <div className="mb-8">
            <SearchInput value={inputValue} onChange={(value) => onSearchChange(value, true)} />

            <p className="mb-6 text-gray-600">
              {total} {t(DICTIONARY_KEYS.RESULTS_FOUND) || 'results found'}
            </p>
          </div>

          {isError && error && (
            <SearchError error={error} onTryAgain={() => onSearchChange('', false)} />
          )}

          {!isLoading && !isError && total === 0 && (
            <SearchEmptyResults
              query={searchQuery}
              onClearSearch={() => onSearchChange('', false)}
            />
          )}

          <div className={cn('mb-8 grid gap-6', gridColsClass(Number(columns)))}>
            {!isLoading &&
              results.map((result) => (
                <SearchItem
                  variant={Number(columns) === 1 ? 'list' : 'card'}
                  key={result.sc_item_id}
                  data={result}
                  mapping={fieldsMapping}
                  onClick={() => sendEvent('clicked')}
                />
              ))}

            {(((isEditing || isPreview) && total === 0) || isLoading) &&
              Array.from({ length: pageSize }).map((_, index) => (
                <SearchSkeletonItem
                  variant={Number(columns) === 1 ? 'list' : 'card'}
                  key={index}
                  mapping={fieldsMapping}
                />
              ))}
          </div>

          {hasNextPage && (
            <div className="flex items-center justify-center">
              <button
                onClick={() => {
                  loadMore();
                }}
                disabled={isLoadingMore}
                className="bg-primary text-primary-foreground hover:bg-primary-hover cursor-pointer rounded-lg px-4 py-2 disabled:opacity-50"
              >
                {t(DICTIONARY_KEYS.LOAD_MORE) || 'Load more'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
