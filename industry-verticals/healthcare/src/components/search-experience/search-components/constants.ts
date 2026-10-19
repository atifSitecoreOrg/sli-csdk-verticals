export const DEBOUNCE_TIME = 400;

export const DEFAULT_PAGE_SIZE = 6;

export const gridColsClass = (value = 3): string => {
  const cols = Math.max(1, Math.min(Number(value) || 3, 3));

  if (cols === 1) {
    return 'grid-cols-1';
  }

  if (cols === 2) {
    return 'grid-cols-1 md:grid-cols-2';
  }

  return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
};

export const DICTIONARY_KEYS = {
  RESULTS_FOUND: 'SearchExperience_ResultsFound',
  NO_RESULTS_FOUND: 'SearchExperience_NoResultsFound',
  TRY_ADJUSTING_YOUR_SEARCH: 'SearchExperience_TryAdjustingYourSearch',
  CLEAR_SEARCH: 'SearchExperience_ClearSearch',
  SOMETHING_WENT_WRONG: 'SearchExperience_SomethingWentWrong',
  TRY_AGAIN: 'SearchExperience_TryAgain',
  LOAD_MORE: 'SearchExperience_LoadMore',
  SEARCH_INPUT_PLACEHOLDER: 'SearchExperience_SearchInputPlaceholder',
  PREVIOUS_PAGE: 'SearchExperience_PreviousPage',
  NEXT_PAGE: 'SearchExperience_NextPage',
  READ_MORE: 'SearchExperience_ReadMore',
  VIEW_PROFILE: 'SearchExperience_ViewProfile',
  SPECIALTY: 'SearchExperience_Specialty',
  CLEAR_FILTERS: 'SearchExperience_ClearFilters',
  SORT: 'SearchExperience_Sort',
  SORT_RECOMMENDED: 'SearchExperience_SortRecommended',
  SORT_NAME_ASC: 'SearchExperience_SortNameAsc',
  SORT_NAME_DESC: 'SearchExperience_SortNameDesc',
  CARD_VIEW: 'SearchExperience_CardView',
  LIST_VIEW: 'SearchExperience_ListView',
  DOCTOR: 'SearchExperience_Doctor',
  DOCTORS: 'SearchExperience_Doctors',
  SHOWING: 'SearchExperience_Showing',
  OF: 'SearchExperience_Of',
  IN_DIRECTORY: 'SearchExperience_InDirectory',
  FOR_QUERY: 'SearchExperience_ForQuery',
  UPDATING_RESULTS: 'SearchExperience_UpdatingResults',
  NO_MATCHING_DOCTORS: 'SearchExperience_NoMatchingDoctors',
  REMOVE_FILTER: 'SearchExperience_RemoveFilter',
};

/** Display name of the specialty facet on the doctor search index. */
export const SPECIALTY_FACET = 'Job Title';

export const NAME_SORT_FIELD = 'FullName' as const;
