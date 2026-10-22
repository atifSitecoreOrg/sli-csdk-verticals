import { JSX } from 'react';
import { Text } from '@sitecore-content-sdk/nextjs';
import { Frame, VersatileProps } from '@/lib/versatile';

export const Default = ({ fields, params }: VersatileProps): JSX.Element => (
  <Frame params={params} label="Search">
    <Text tag="h1" field={fields?.Title} className="v-display" />
    <form className="mt-8" action="/search" method="get">
      <label className="block text-sm" htmlFor="versatile-search">
        Search this site
      </label>
      <input id="versatile-search" name="q" type="search" className="v-field mt-2 max-w-xl" />
    </form>
  </Frame>
);
