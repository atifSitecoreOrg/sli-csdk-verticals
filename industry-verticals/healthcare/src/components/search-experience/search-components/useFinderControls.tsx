'use client';

import { useMemo, useState } from 'react';
import { useSearch } from '@sitecore-content-sdk/nextjs/search';
import { NAME_SORT_FIELD, SPECIALTY_FACET } from './constants';
import { SearchDocument } from './models';

export type FinderSort = 'recommended' | 'name-asc' | 'name-desc';
export type FinderView = 'card' | 'list';

type FinderControlsOptions = {
  searchIndexId: string;
  enabled: boolean;
  defaultView: FinderView;
};

const specialtyName = (document: SearchDocument) => {
  const value = document.JobTitle;
  return typeof value === 'string' ? value.trim() : '';
};

/**
 * Specialty filter, name sort, and card/list view for the doctor finder.
 * Specialty options come from the full index because the facet response only returns the first ten values.
 * A limit above 100 is ignored by this index and falls back to ten results, so the catalog request stays at 100.
 */
export const useFinderControls = ({
  searchIndexId,
  enabled,
  defaultView,
}: FinderControlsOptions) => {
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [sort, setSort] = useState<FinderSort>('recommended');
  const [view, setView] = useState<FinderView>(defaultView);

  const { results: catalog, total: directoryTotal } = useSearch<SearchDocument>({
    searchIndexId,
    page: 1,
    pageSize: 100,
    enabled: enabled && Boolean(searchIndexId),
    query: '',
  });

  const { specialtyOptions, specialtyCounts } = useMemo(() => {
    const counts = new Map<string, number>();
    catalog.forEach((document) => {
      const name = specialtyName(document);
      if (!name) return;
      counts.set(name, (counts.get(name) ?? 0) + 1);
    });
    return {
      specialtyOptions: [...counts.keys()].sort((left, right) => left.localeCompare(right)),
      specialtyCounts: Object.fromEntries(counts),
    };
  }, [catalog]);

  const facet = useMemo(
    () =>
      specialties.length
        ? {
            fields: [
              {
                name: SPECIALTY_FACET,
                filters: [{ operator: 'eq' as const, value: specialties }],
              },
            ],
          }
        : undefined,
    [specialties]
  );

  const sortSetting = useMemo(
    () =>
      sort === 'name-asc'
        ? { name: NAME_SORT_FIELD, order: 'asc' as const }
        : sort === 'name-desc'
          ? { name: NAME_SORT_FIELD, order: 'desc' as const }
          : undefined,
    [sort]
  );

  const toggleSpecialty = (value: string) => {
    setSpecialties((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    );
  };

  return {
    specialties,
    specialtyOptions,
    specialtyCounts,
    directoryTotal,
    toggleSpecialty,
    clearSpecialties: () => setSpecialties([]),
    sort,
    setSort,
    view,
    setView,
    facet,
    sortSetting,
    hasFilters: specialties.length > 0,
  };
};
