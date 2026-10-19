'use client';
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSitecore } from '@sitecore-content-sdk/nextjs';
import { useSearch } from '@sitecore-content-sdk/nextjs/search';
import { cn } from 'lib/utils';
import { SearchDocument, SearchExperienceProps } from './search-components/models';
import { SearchEmptyResults } from './search-components/SearchEmptyResults';
import { SearchError } from './search-components/SearchError';
import { SearchItem } from './search-components/SearchItem';
import { SearchSkeletonItem } from './search-components/SearchSkeletonItem';
import { SearchPagination } from './search-components/SearchPagination';
import { SearchInput } from './search-components/SearchInput';
import { SearchFinderFrame } from './search-components/SearchFinderBar';
import { SearchExperienceLayout } from './search-components/SearchExperienceLayout';
import { useFinderControls } from './search-components/useFinderControls';
import { useEvent } from './search-components/useEvent';
import { useSearchField } from './search-components/useSearchField';
import { useParams } from './search-components/useParams';
import { gridColsClass } from './search-components/constants';
import { useRouter } from './search-components/useRouter';

export const Default = (props: SearchExperienceProps) => {
  const { page } = useSitecore();
  const { params } = props;
  const { searchIndex, fieldsMapping } = useSearchField(props.fields?.search?.value);

  const { styles, id, pageSize, columns } = useParams(params);
  const searchParams = useSearchParams();

  const { isEditing, isPreview } = page.mode;
  const searchQuery = (searchParams?.get('q') as string) || '';
  const searchEnabled = !isEditing && !isPreview;
  const [pageNumber, setPageNumber] = useState(1);
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
    setPageNumber(1);
  }

  const { total, totalPages, results, isLoading, isSuccess, isError, error } =
    useSearch<SearchDocument>({
      searchIndexId: searchIndex,
      page: pageNumber,
      pageSize,
      enabled: searchEnabled,
      query: searchQuery,
      sort: sortSetting,
      facet,
    });

  const { setRouterQuery } = useRouter();

  const sendEvent = useEvent({ query: searchQuery, uid: props.rendering.uid });

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
  const rangeStart = total === 0 ? 0 : (pageNumber - 1) * Number(pageSize) + 1;
  const rangeEnd = Math.min(pageNumber * Number(pageSize), total);
  const resetPage = () => setPageNumber(1);

  return (
    <SearchExperienceLayout styles={styles} id={id}>
      <SearchFinderFrame
        search={
          <SearchInput value={inputValue} onChange={(value) => onSearchChange(value, true)} />
        }
        specialtyOptions={specialtyOptions}
        specialtyCounts={specialtyCounts}
        selectedSpecialties={specialties}
        onToggleSpecialty={(value) => {
          toggleSpecialty(value);
          resetPage();
        }}
        onClearSpecialties={() => {
          clearSpecialties();
          resetPage();
        }}
        sort={sort}
        onSortChange={(value) => {
          setSort(value);
          resetPage();
        }}
        view={view}
        onViewChange={setView}
        total={isError ? 0 : total}
        directoryTotal={directoryTotal}
        from={rangeStart}
        to={rangeEnd}
        query={searchQuery}
        isLoading={isLoading}
        footer={
          !isLoading && !isError && results.length > 0 ? (
            <SearchPagination
              currentPage={pageNumber}
              totalPages={totalPages}
              onPageChange={(nextPage: number) => setPageNumber(nextPage)}
            />
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
