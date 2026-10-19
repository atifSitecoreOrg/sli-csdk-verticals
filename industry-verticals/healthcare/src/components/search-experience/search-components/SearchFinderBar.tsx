'use client';

import type { ReactNode } from 'react';
import { useTranslations } from './useTranslations';
import { DICTIONARY_KEYS } from './constants';
import { FinderSort, FinderView } from './useFinderControls';

type SearchFinderFrameProps = {
  search: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  specialtyOptions: string[];
  specialtyCounts: Record<string, number>;
  selectedSpecialties: string[];
  onToggleSpecialty: (value: string) => void;
  onClearSpecialties: () => void;
  sort: FinderSort;
  onSortChange: (value: FinderSort) => void;
  view: FinderView;
  onViewChange: (value: FinderView) => void;
  total: number;
  directoryTotal: number;
  from: number;
  to: number;
  query: string;
  isLoading: boolean;
};

export const SearchFinderFrame = ({
  search,
  children,
  footer,
  specialtyOptions,
  specialtyCounts,
  selectedSpecialties,
  onToggleSpecialty,
  onClearSpecialties,
  sort,
  onSortChange,
  view,
  onViewChange,
  total,
  directoryTotal,
  from,
  to,
  query,
  isLoading,
}: SearchFinderFrameProps) => {
  const filterProps = {
    specialtyOptions,
    specialtyCounts,
    selectedSpecialties,
    onToggleSpecialty,
    onClearSpecialties,
  };

  return (
    <div className="lg:grid lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start lg:gap-8 xl:gap-12">
      <aside className="hidden lg:block">
        <div className="bg-background-secondary dark:bg-background-secondary-dark sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto rounded-2xl p-5">
          <SpecialtyFilters {...filterProps} layout="list" labelledBy="doctor-specialty-sidebar" />
        </div>
      </aside>
      <div className="min-w-0">
        {search}
        {specialtyOptions.length > 0 && (
          <div className="mt-4 lg:hidden">
            <SpecialtyFilters
              {...filterProps}
              layout="scroll"
              labelledBy="doctor-specialty-scroll"
            />
          </div>
        )}
        <ResultsSummary
          total={total}
          directoryTotal={directoryTotal}
          from={from}
          to={to}
          query={query}
          isLoading={isLoading}
          filtered={selectedSpecialties.length > 0}
          sort={sort}
          onSortChange={onSortChange}
          view={view}
          onViewChange={onViewChange}
        />
        {selectedSpecialties.length > 0 && (
          <SelectedFilters
            selectedSpecialties={selectedSpecialties}
            onToggleSpecialty={onToggleSpecialty}
            onClearSpecialties={onClearSpecialties}
          />
        )}
        {children}
        {footer ? <div className="mt-10">{footer}</div> : null}
      </div>
    </div>
  );
};

const SpecialtyFilters = ({
  specialtyOptions,
  specialtyCounts,
  selectedSpecialties,
  onToggleSpecialty,
  onClearSpecialties,
  layout,
  labelledBy,
}: {
  specialtyOptions: string[];
  specialtyCounts: Record<string, number>;
  selectedSpecialties: string[];
  onToggleSpecialty: (value: string) => void;
  onClearSpecialties: () => void;
  layout: 'list' | 'scroll';
  labelledBy: string;
}) => {
  const t = useTranslations();
  const label = t(DICTIONARY_KEYS.SPECIALTY) || 'Specialty';
  const isList = layout === 'list';

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p id={labelledBy} className="text-sm font-semibold tracking-wide uppercase">
          {label}
        </p>
        {selectedSpecialties.length > 0 && (
          <button
            type="button"
            onClick={onClearSpecialties}
            className="text-accent text-sm font-semibold underline-offset-4 hover:underline"
          >
            {t(DICTIONARY_KEYS.CLEAR_FILTERS) || 'Clear filters'}
          </button>
        )}
      </div>
      <div
        role="group"
        aria-labelledby={labelledBy}
        className={
          isList
            ? 'flex flex-col gap-1'
            : 'flex gap-2 overflow-x-auto [mask-image:linear-gradient(to_right,#000_88%,transparent)] pb-1'
        }
      >
        {specialtyOptions.map((specialty) => {
          const selected = selectedSpecialties.includes(specialty);
          const count = specialtyCounts[specialty];
          return (
            <button
              key={specialty}
              type="button"
              aria-pressed={selected}
              onClick={() => onToggleSpecialty(specialty)}
              className={
                isList
                  ? selected
                    ? 'bg-foreground text-background dark:bg-accent dark:text-foreground flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold'
                    : 'text-foreground hover:bg-background dark:text-foreground-dark dark:hover:bg-background/10 flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold'
                  : selected
                    ? 'bg-foreground text-background dark:bg-accent dark:text-foreground inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold'
                    : 'bg-background-secondary text-foreground dark:bg-background-secondary-dark dark:text-foreground-dark inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold'
              }
            >
              <span>{specialty}</span>
              {typeof count === 'number' && (
                <span className={selected ? 'opacity-80' : 'opacity-60'}>{count}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const ResultsSummary = ({
  total,
  directoryTotal,
  from,
  to,
  query,
  isLoading,
  filtered,
  sort,
  onSortChange,
  view,
  onViewChange,
}: {
  total: number;
  directoryTotal: number;
  from: number;
  to: number;
  query: string;
  isLoading: boolean;
  filtered: boolean;
  sort: FinderSort;
  onSortChange: (value: FinderSort) => void;
  view: FinderView;
  onViewChange: (value: FinderView) => void;
}) => {
  const t = useTranslations();
  const sortLabel = t(DICTIONARY_KEYS.SORT) || 'Sort';
  const cardLabel = t(DICTIONARY_KEYS.CARD_VIEW) || 'Cards';
  const listLabel = t(DICTIONARY_KEYS.LIST_VIEW) || 'List';
  const doctorsLabel =
    total === 1 ? t(DICTIONARY_KEYS.DOCTOR) || 'doctor' : t(DICTIONARY_KEYS.DOCTORS) || 'doctors';
  const showing = t(DICTIONARY_KEYS.SHOWING) || 'Showing';
  const ofLabel = t(DICTIONARY_KEYS.OF) || 'of';
  const narrowed = (filtered || Boolean(query)) && directoryTotal > total;
  const detail = isLoading
    ? t(DICTIONARY_KEYS.UPDATING_RESULTS) || 'Updating results'
    : total === 0
      ? t(DICTIONARY_KEYS.NO_MATCHING_DOCTORS) || 'No matching doctors'
      : [
          `${showing} ${from}–${to} ${ofLabel} ${total}`,
          query ? `${t(DICTIONARY_KEYS.FOR_QUERY) || 'for'} “${query}”` : '',
          narrowed
            ? `${directoryTotal} ${t(DICTIONARY_KEYS.IN_DIRECTORY) || 'in the directory'}`
            : '',
        ]
          .filter(Boolean)
          .join(' · ');

  return (
    <div className="border-foreground/10 mt-6 mb-6 flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div aria-live="polite" aria-busy={isLoading}>
        {isLoading && total === 0 ? (
          <div className="bg-background-secondary dark:bg-background-secondary-dark h-10 w-40 animate-pulse rounded-lg" />
        ) : (
          <p className="text-foreground dark:text-foreground-dark">
            <span className="font-heading text-4xl font-bold tabular-nums">{total}</span>
            <span className="ml-2 text-lg">{doctorsLabel}</span>
          </p>
        )}
        <p className="text-foreground/70 dark:text-foreground-secondary-dark mt-1 text-sm">
          {detail}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="sr-only" htmlFor="doctor-finder-sort">
          {sortLabel}
        </label>
        <select
          id="doctor-finder-sort"
          value={sort}
          aria-label={sortLabel}
          onChange={(event) => onSortChange(event.target.value as FinderSort)}
          className="bg-background-secondary dark:bg-background-secondary-dark focus:ring-accent h-11 rounded-full px-4 text-sm font-semibold focus:ring-2 focus:outline-none"
        >
          <option value="recommended">
            {t(DICTIONARY_KEYS.SORT_RECOMMENDED) || 'Recommended'}
          </option>
          <option value="name-asc">{t(DICTIONARY_KEYS.SORT_NAME_ASC) || 'Name A–Z'}</option>
          <option value="name-desc">{t(DICTIONARY_KEYS.SORT_NAME_DESC) || 'Name Z–A'}</option>
        </select>
        <div
          role="group"
          aria-label="Results layout"
          className="bg-background-secondary dark:bg-background-secondary-dark inline-flex rounded-full p-1"
        >
          <ViewButton
            label={cardLabel}
            pressed={view === 'card'}
            onClick={() => onViewChange('card')}
          >
            <CardsIcon />
            <span className="hidden sm:inline">{cardLabel}</span>
          </ViewButton>
          <ViewButton
            label={listLabel}
            pressed={view === 'list'}
            onClick={() => onViewChange('list')}
          >
            <ListIcon />
            <span className="hidden sm:inline">{listLabel}</span>
          </ViewButton>
        </div>
      </div>
    </div>
  );
};

const SelectedFilters = ({
  selectedSpecialties,
  onToggleSpecialty,
  onClearSpecialties,
}: {
  selectedSpecialties: string[];
  onToggleSpecialty: (value: string) => void;
  onClearSpecialties: () => void;
}) => {
  const t = useTranslations();
  const removeLabel = t(DICTIONARY_KEYS.REMOVE_FILTER) || 'Remove';

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      {selectedSpecialties.map((specialty) => (
        <button
          key={specialty}
          type="button"
          onClick={() => onToggleSpecialty(specialty)}
          className="bg-accent/35 text-foreground dark:text-foreground inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold"
        >
          {specialty}
          <span aria-hidden="true">×</span>
          <span className="sr-only">
            {removeLabel} {specialty}
          </span>
        </button>
      ))}
      <button
        type="button"
        onClick={onClearSpecialties}
        className="text-foreground/70 hover:text-foreground px-2 text-sm font-semibold underline-offset-4 hover:underline"
      >
        {t(DICTIONARY_KEYS.CLEAR_FILTERS) || 'Clear filters'}
      </button>
    </div>
  );
};

const ViewButton = ({
  label,
  pressed,
  onClick,
  children,
}: {
  label: string;
  pressed: boolean;
  onClick: () => void;
  children: ReactNode;
}) => (
  <button
    type="button"
    aria-label={label}
    aria-pressed={pressed}
    onClick={onClick}
    className={
      pressed
        ? 'bg-foreground text-background dark:bg-accent dark:text-foreground inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold'
        : 'text-foreground dark:text-foreground-dark inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold'
    }
  >
    {children}
  </button>
);

const CardsIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 5h7v7H4V5zm9 0h7v7h-7V5zM4 14h7v5H4v-5zm9 0h7v5h-7v-5z"
    />
  </svg>
);

const ListIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 7h16M4 12h16M4 17h16"
    />
  </svg>
);
