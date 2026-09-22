import { ComponentParams, ComponentRendering } from '@sitecore-content-sdk/nextjs';

export type SearchParams = ComponentParams & {
  columns?: string;
  pageSize?: number;
  styles?: string;
  GridParameters?: string;
  RenderingIdentifier?: string;
};

export type SearchDocument = {
  sc_item_id: string;
  [key: string]: string | string[] | number | undefined;
};

/**
 * Mapping of the component fields to the search index fields
 */
export interface SearchFieldsMapping {
  description?: string;
  type?: string;
  title?: string;
  link?: string;
  images?: string;
  tags?: string;
}

export interface SearchField {
  searchIndex: string;
  fieldsMapping: SearchFieldsMapping;
}

export interface SearchExperienceProps {
  params: SearchParams;
  fields?: {
    /**
     * JSON stringified object of type SearchField
     */
    search?: {
      value?: string;
    };
  };
  rendering: ComponentRendering;
};
