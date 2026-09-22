'use client';

import { useMemo, useState } from 'react';
import { Destination, DestinationSearchResult } from '@/types/destination';
import DestinationCard from '../non-sitecore/DestinationCard';
import { ComponentProps } from '@/lib/component-props';
import { useI18n } from 'next-localization';
import { HeroBannerStyles, TitleSectionFlags } from '@/types/styleFlags';
import { Search } from 'lucide-react';
import FilterDropdown from '../non-sitecore/FilterDropdown';

export interface DestinationListingProps extends ComponentProps {
  params: { [key: string]: string };
  fields: {
    items: Destination[];
  };
}

const ITEMS_PER_PAGE = 6;

/**
 * Maps a Sitecore destination item to the card model used by DestinationCard.
 */
const mapDestination = (item: Destination): DestinationSearchResult => {
  const fields = item.fields || {};

  return {
    id: item.id,
    activities:
      fields.Activities?.map((activity) => activity.fields?.Title?.value).filter(
        (value): value is string => Boolean(value)
      ) || [],
    continent: fields.Continent?.value || '',
    country: fields.Country?.value || '',
    description: fields.ShortDescription?.value || '',
    highlights:
      fields.Highlights?.map((highlight) => highlight.fields?.Title?.value).filter(
        (value): value is string => Boolean(value)
      ) || [],
    image_url: fields.Image?.value?.src || '',
    label: fields.Label?.value || '',
    name: fields.Title?.value || item.displayName,
    price: fields.Price?.value || '',
    review_rating: Number(fields.Rating?.value || 0),
    srouce_id: item.id,
    temperatures: fields.Temperatures?.value || '',
    type: fields.Label?.value || '',
    url: item.url,
    trip_duration: fields.TripDuration?.value || '',
    trip_periods: fields.TripPeriods?.value || '',
  };
};

/**
 * Adds or removes a filter value from the current selection.
 */
const toggleValue = (values: string[], value: string): string[] =>
  values.includes(value) ? values.filter((current) => current !== value) : [...values, value];

/**
 * Builds labeled filter options with occurrence counts.
 */
const countBy = (items: DestinationSearchResult[], getValue: (item: DestinationSearchResult) => string | string[]) => {
  const counts = new Map<string, number>();

  items.forEach((item) => {
    const raw = getValue(item);
    const values = Array.isArray(raw) ? raw : [raw];
    values.filter(Boolean).forEach((value) => {
      counts.set(value, (counts.get(value) || 0) + 1);
    });
  });

  return Array.from(counts.entries()).map(([value, count]) => ({
    id: value,
    value,
    label: `${value} (${count})`,
  }));
};

export const Default = (props: DestinationListingProps) => {
  const { t } = useI18n();
  const id = props.params.RenderingIdentifier;
  const hideTitleSection = props.params?.styles?.includes(TitleSectionFlags.HideTitleSection);
  const showGradientBackground = props.params?.styles?.includes(
    HeroBannerStyles.ShowGradientOverlay
  );

  const destinations = useMemo(
    () => (props.fields?.items || []).map(mapDestination),
    [props.fields?.items]
  );

  const [keyphrase, setKeyphrase] = useState('');
  const [selectedContinents, setSelectedContinents] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const continentOptions = useMemo(() => countBy(destinations, (item) => item.continent), [destinations]);
  const typeOptions = useMemo(() => countBy(destinations, (item) => item.label), [destinations]);
  const activityOptions = useMemo(() => countBy(destinations, (item) => item.activities), [destinations]);

  const filteredDestinations = useMemo(() => {
    const query = keyphrase.trim().toLowerCase();

    return destinations.filter((destination) => {
      const matchesQuery =
        !query ||
        [destination.name, destination.country, destination.description, destination.continent]
          .join(' ')
          .toLowerCase()
          .includes(query);
      const matchesContinent =
        selectedContinents.length === 0 || selectedContinents.includes(destination.continent);
      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(destination.label);
      const matchesActivity =
        selectedActivities.length === 0 ||
        destination.activities.some((activity) => selectedActivities.includes(activity));

      return matchesQuery && matchesContinent && matchesType && matchesActivity;
    });
  }, [destinations, keyphrase, selectedContinents, selectedTypes, selectedActivities]);

  const displayedResults = filteredDestinations.slice(0, visibleCount);
  const hasMore = visibleCount < filteredDestinations.length;

  return (
    <section
      className={`component destination-listing ${props?.params?.styles?.trimEnd()}`}
      id={id}
    >
      <div
        className={`relative inset-0 z-0 w-full ${
          showGradientBackground ? 'from-accent-dark to-accent bg-linear-to-r' : 'bg-accent'
        }`}
      >
        <div className="container mx-auto flex flex-col items-center justify-center px-4 py-16">
          <h1 className="text-background text-center">
            {t('destinations_hero_title') || 'Explore Amazing Destinations'}
          </h1>
          <div className="text-background/80 mt-4 text-center text-xl">
            {t('destinations_hero_description') ||
              'Discover your next adventure from our curated collection of world-class destinations'}
          </div>

          <div className="mt-8 w-full max-w-5xl px-4">
            <div className="component item-finder destination-search bg-background mx-auto max-w-4xl rounded-lg p-6 shadow-lg">
              <form>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-[2fr_1fr_1fr_1fr]">
                  <div className="relative">
                    <div className="text-foreground-muted pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2">
                      <Search size={20} />
                    </div>
                    <input
                      type="text"
                      placeholder={t('search_destinations') || 'Search destinations...'}
                      value={keyphrase}
                      onChange={(event) => {
                        setKeyphrase(event.target.value);
                        setVisibleCount(ITEMS_PER_PAGE);
                      }}
                      className="text-foreground placeholder:text-foreground-muted focus:outline-accent-gray/60 h-9 w-full rounded-md border bg-transparent py-1 pr-6 pl-10 text-xs shadow-xs placeholder:text-xs focus:outline-3"
                    />
                  </div>
                  <FilterDropdown
                    options={continentOptions}
                    placeholder={t('continent_label') || 'Continent'}
                    selectedValues={selectedContinents}
                    onToggle={(value) => {
                      setSelectedContinents((current) => toggleValue(current, value));
                      setVisibleCount(ITEMS_PER_PAGE);
                    }}
                  />
                  <FilterDropdown
                    options={typeOptions}
                    placeholder={t('type_label') || 'Type'}
                    selectedValues={selectedTypes}
                    onToggle={(value) => {
                      setSelectedTypes((current) => toggleValue(current, value));
                      setVisibleCount(ITEMS_PER_PAGE);
                    }}
                  />
                  <FilterDropdown
                    options={activityOptions}
                    placeholder={t('activities_label') || 'Activities'}
                    selectedValues={selectedActivities}
                    onToggle={(value) => {
                      setSelectedActivities((current) => toggleValue(current, value));
                      setVisibleCount(ITEMS_PER_PAGE);
                    }}
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="container pt-6">
        {!hideTitleSection && (
          <div className="mb-2">
            <h2 className="mb-2">{t('destinations_sub_title') || 'Popular Destinations'}</h2>
            <p className="text-foreground-light text-xl">
              {t('destinations_short_description') || ''}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 py-8 md:grid-cols-2 lg:grid-cols-3">
          {displayedResults.map((destination) => (
            <DestinationCard key={destination.id} destination={destination} />
          ))}
        </div>

        {displayedResults.length > 0 && (
          <div className="flex justify-center py-8">
            <button
              onClick={() => setVisibleCount((current) => current + ITEMS_PER_PAGE)}
              className="btn-outline w-auto!"
              disabled={!hasMore}
            >
              {hasMore
                ? t('load_more_destinations') || 'Load More Destinations'
                : t('all_destinations_loaded') || 'All Destinations Loaded'}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
