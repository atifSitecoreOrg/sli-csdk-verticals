'use client';
import { useCallback, useEffect, useState } from 'react';
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
import { SearchFinderFrame } from './search-components/SearchFinderBar';
import { SearchExperienceLayout } from './search-components/SearchExperienceLayout';
import { useFinderControls } from './search-components/useFinderControls';
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
  const [previousQuery, setPreviousQuery] = useState(searchQuery);
  const {
    specialties,
    specialtyOptions,
    specialtyCounts,
    directoryTotal,
    toggleSpecialty,
    clearSpecialties,
    sort,
    setSort,
    view,
    setView,
    facet,
    sortSetting,
    hasFilters,
  } = useFinderControls({
    searchIndexId: searchIndex,
    enabled: searchEnabled,
    defaultView: Number(columns) === 1 ? 'list' : 'card',
  });
  if (searchQuery !== previousQuery) {
    setPreviousQuery(searchQuery);
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
    sort: sortSetting,
    facet,
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

  const showResults = isLoading || results.length > 0 || ((isEditing || isPreview) && total === 0);
  const resultVariant = view;
  const clearFinder = () => {
    clearSpecialties();
    onSearchChange('', false);
  };

  return (
    <SearchExperienceLayout styles={styles} id={id}>
      <SearchFinderFrame
        search={
          <SearchInput value={inputValue} onChange={(value) => onSearchChange(value, true)} />
        }
        specialtyOptions={specialtyOptions}
        specialtyCounts={specialtyCounts}
        selectedSpecialties={specialties}
        onToggleSpecialty={toggleSpecialty}
        onClearSpecialties={clearSpecialties}
        sort={sort}
        onSortChange={setSort}
        view={view}
        onViewChange={setView}
        total={isError ? 0 : total}
        directoryTotal={directoryTotal}
        from={results.length ? 1 : 0}
        to={results.length}
        query={searchQuery}
        isLoading={isLoading && results.length === 0}
        footer={
          hasNextPage ? (
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={() => {
                  loadMore();
                }}
                disabled={isLoadingMore}
                className="btn disabled:opacity-60"
              >
                {t(DICTIONARY_KEYS.LOAD_MORE) || 'Load more'}
              </button>
            </div>
          ) : undefined
        }
      >
        {isError && error && (
          <SearchError error={error} onTryAgain={() => onSearchChange('', false)} />
        )}

        {!isLoading && !isError && total === 0 && (
          <SearchEmptyResults
            query={searchQuery}
            canClear={Boolean(searchQuery) || hasFilters}
            onClearSearch={clearFinder}
          />
        )}

        {showResults && (
          <div
            className={cn(
              'grid',
              view === 'list' ? 'grid-cols-1 gap-6' : 'gap-6 xl:gap-8',
              view === 'card' &&
                (Number(columns) === 2
                  ? gridColsClass(2)
                  : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3')
            )}
          >
            {!isLoading &&
              results.map((result) => (
                <SearchItem
                  variant={resultVariant}
                  key={result.sc_item_id}
                  data={result}
                  mapping={fieldsMapping}
                  onClick={() => sendEvent('clicked')}
                />
              ))}

            {(((isEditing || isPreview) && total === 0) || isLoading) &&
              Array.from({ length: pageSize }).map((_, index) => (
                <SearchSkeletonItem key={index} variant={resultVariant} mapping={fieldsMapping} />
              ))}
          </div>
        )}
      </SearchFinderFrame>
    </SearchExperienceLayout>
  );
};
