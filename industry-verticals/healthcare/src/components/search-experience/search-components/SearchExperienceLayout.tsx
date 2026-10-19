'use client';

import type { ReactNode } from 'react';
import { Text, useSitecore, type Field } from '@sitecore-content-sdk/nextjs';

type RouteFields = {
  Title?: Field<string>;
  pageSummary?: Field<string>;
};

type SearchExperienceLayoutProps = {
  styles: string;
  id?: string;
  toolbar?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
};

/**
 * Finder shell for the search experience: the page title, the search toolbar, then results.
 * @param {SearchExperienceLayoutProps} props - Title comes from the current route; toolbar and results are supplied by the variant.
 * @returns {JSX.Element} The search experience section.
 */
export const SearchExperienceLayout = ({
  styles,
  id,
  toolbar,
  children,
  footer,
}: SearchExperienceLayoutProps) => {
  const { page } = useSitecore();
  const { isEditing } = page.mode;
  const routeFields = page.layout?.sitecore?.route?.fields as RouteFields | undefined;
  const title = routeFields?.Title;
  const summary = routeFields?.pageSummary;
  const showTitle = Boolean(title?.value) || (isEditing && Boolean(title));
  const showSummary = Boolean(summary?.value) || (isEditing && Boolean(summary));

  return (
    <section
      className={`component search-experience relative py-16 ${styles}`}
      id={id || undefined}
    >
      <div className="component-content">
        <div className="container">
          {(showTitle || showSummary) && (
            <div className="mx-auto mb-10 max-w-3xl text-center">
              {showTitle && title && (
                <h1>
                  <Text field={title} />
                </h1>
              )}
              {showSummary && summary && (
                <p className="mt-4 text-lg">
                  <Text field={summary} />
                </p>
              )}
            </div>
          )}
          {toolbar ? <div className="mb-8">{toolbar}</div> : null}
          {children}
          {footer ? <div className="mt-12">{footer}</div> : null}
        </div>
      </div>
    </section>
  );
};
