// Below are built-in components that are available in the app, it's recommended to keep them as is
import { NextjsContentSdkComponent } from '@sitecore-content-sdk/nextjs';


import { BYOCWrapper, FEaaSWrapper } from '@sitecore-content-sdk/nextjs';
import { Form } from '@sitecore-content-sdk/nextjs';

// end of built-in import section
import * as Title from 'src/components/title/Title';
import * as ThemeSwitcher from 'src/components/theme-switcher/ThemeSwitcher';
import * as ThemeEditor from 'src/components/theme-editor/ThemeEditor';
import * as SocialFollow from 'src/components/social-follow/SocialFollow';
import * as SectionWrapper from 'src/components/section-wrapper/SectionWrapper';
import * as SearchExperienceLoadMore from 'src/components/search-experience/SearchExperience.LoadMore';
import * as SearchExperience from 'src/components/search-experience/SearchExperience';
import * as UseTranslations from 'src/components/search-experience/search-components/useTranslations';
import * as UseSearchField from 'src/components/search-experience/search-components/useSearchField';
import * as UseRouter from 'src/components/search-experience/search-components/useRouter';
import * as UseParams from 'src/components/search-experience/search-components/useParams';
import * as UseFinderControls from 'src/components/search-experience/search-components/useFinderControls';
import * as UseEvent from 'src/components/search-experience/search-components/useEvent';
import * as UseDebounce from 'src/components/search-experience/search-components/useDebounce';
import * as SearchSkeletonItem from 'src/components/search-experience/search-components/SearchSkeletonItem';
import * as SearchPagination from 'src/components/search-experience/search-components/SearchPagination';
import * as SearchItemCommon from 'src/components/search-experience/search-components/SearchItemCommon';
import * as SearchInput from 'src/components/search-experience/search-components/SearchInput';
import * as SearchFinderBar from 'src/components/search-experience/search-components/SearchFinderBar';
import * as SearchExperienceLayout from 'src/components/search-experience/search-components/SearchExperienceLayout';
import * as SearchError from 'src/components/search-experience/search-components/SearchError';
import * as SearchEmptyResults from 'src/components/search-experience/search-components/SearchEmptyResults';
import * as Models from 'src/components/search-experience/search-components/models';
import * as Constants from 'src/components/search-experience/search-components/constants';
import * as SearchItemTitle from 'src/components/search-experience/search-components/SearchItem/SearchItemTitle';
import * as SearchItemTags from 'src/components/search-experience/search-components/SearchItem/SearchItemTags';
import * as SearchItemSummary from 'src/components/search-experience/search-components/SearchItem/SearchItemSummary';
import * as SearchItemSubTitle from 'src/components/search-experience/search-components/SearchItem/SearchItemSubTitle';
import * as SearchItemLink from 'src/components/search-experience/search-components/SearchItem/SearchItemLink';
import * as SearchItemImage from 'src/components/search-experience/search-components/SearchItem/SearchItemImage';
import * as SearchItemCategory from 'src/components/search-experience/search-components/SearchItem/SearchItemCategory';
import * as Index from 'src/components/search-experience/search-components/SearchItem/index';
import * as RowSplitter from 'src/components/row-splitter/RowSplitter';
import * as RichText from 'src/components/rich-text/RichText';
import * as Reviews from 'src/components/reviews/Reviews';
import * as Promo from 'src/components/promo/Promo';
import * as PartialDesignDynamicPlaceholder from 'src/components/partial-design-dynamic-placeholder/PartialDesignDynamicPlaceholder';
import * as PageContent from 'src/components/page-content/PageContent';
import * as Navigation from 'src/components/navigation/Navigation';
import * as LinkList from 'src/components/link-list/LinkList';
import * as Image from 'src/components/image/Image';
import * as HeroBanner from 'src/components/hero-banner/HeroBanner';
import * as HeaderExtended from 'src/components/header-extended/HeaderExtended';
import * as Footer from 'src/components/footer/Footer';
import * as Features from 'src/components/features/Features';
import * as DoctorsListing from 'src/components/doctors-listing/DoctorsListing';
import * as DoctorDetails from 'src/components/doctor-details/DoctorDetails';
import * as ContentBlock from 'src/components/content-block/ContentBlock';
import * as Container from 'src/components/container/Container';
import * as ColumnSplitter from 'src/components/column-splitter/ColumnSplitter';

export const componentMap = new Map<string, NextjsContentSdkComponent>([
  ['BYOCWrapper', BYOCWrapper],
  ['FEaaSWrapper', FEaaSWrapper],
  ['Form', Form],
  ['Title', { ...Title }],
  ['ThemeSwitcher', { ...ThemeSwitcher }],
  ['ThemeEditor', { ...ThemeEditor }],
  ['SocialFollow', { ...SocialFollow }],
  ['SectionWrapper', { ...SectionWrapper, componentType: 'client' }],
  ['SearchExperience', { ...SearchExperienceLoadMore, ...SearchExperience, componentType: 'client' }],
  ['useTranslations', { ...UseTranslations }],
  ['useSearchField', { ...UseSearchField, componentType: 'client' }],
  ['useRouter', { ...UseRouter, componentType: 'client' }],
  ['useParams', { ...UseParams, componentType: 'client' }],
  ['useFinderControls', { ...UseFinderControls, componentType: 'client' }],
  ['useEvent', { ...UseEvent, componentType: 'client' }],
  ['useDebounce', { ...UseDebounce, componentType: 'client' }],
  ['SearchSkeletonItem', { ...SearchSkeletonItem, componentType: 'client' }],
  ['SearchPagination', { ...SearchPagination, componentType: 'client' }],
  ['SearchItemCommon', { ...SearchItemCommon, componentType: 'client' }],
  ['SearchInput', { ...SearchInput, componentType: 'client' }],
  ['SearchFinderBar', { ...SearchFinderBar, componentType: 'client' }],
  ['SearchExperienceLayout', { ...SearchExperienceLayout, componentType: 'client' }],
  ['SearchError', { ...SearchError, componentType: 'client' }],
  ['SearchEmptyResults', { ...SearchEmptyResults, componentType: 'client' }],
  ['models', { ...Models }],
  ['constants', { ...Constants }],
  ['SearchItemTitle', { ...SearchItemTitle, componentType: 'client' }],
  ['SearchItemTags', { ...SearchItemTags, componentType: 'client' }],
  ['SearchItemSummary', { ...SearchItemSummary, componentType: 'client' }],
  ['SearchItemSubTitle', { ...SearchItemSubTitle, componentType: 'client' }],
  ['SearchItemLink', { ...SearchItemLink, componentType: 'client' }],
  ['SearchItemImage', { ...SearchItemImage, componentType: 'client' }],
  ['SearchItemCategory', { ...SearchItemCategory, componentType: 'client' }],
  ['index', { ...Index, componentType: 'client' }],
  ['RowSplitter', { ...RowSplitter }],
  ['RichText', { ...RichText }],
  ['Reviews', { ...Reviews }],
  ['Promo', { ...Promo, componentType: 'client' }],
  ['PartialDesignDynamicPlaceholder', { ...PartialDesignDynamicPlaceholder }],
  ['PageContent', { ...PageContent }],
  ['Navigation', { ...Navigation, componentType: 'client' }],
  ['LinkList', { ...LinkList }],
  ['Image', { ...Image }],
  ['HeroBanner', { ...HeroBanner, componentType: 'client' }],
  ['HeaderExtended', { ...HeaderExtended }],
  ['Footer', { ...Footer, componentType: 'client' }],
  ['Features', { ...Features, componentType: 'client' }],
  ['DoctorsListing', { ...DoctorsListing }],
  ['DoctorDetails', { ...DoctorDetails }],
  ['ContentBlock', { ...ContentBlock }],
  ['Container', { ...Container }],
  ['ColumnSplitter', { ...ColumnSplitter }],
]);

export default componentMap;
