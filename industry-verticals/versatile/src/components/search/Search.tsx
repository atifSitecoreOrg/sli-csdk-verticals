import { JSX } from 'react';
import { Text } from '@sitecore-content-sdk/nextjs';
import { Frame, VersatileProps } from '@/lib/versatile';

export const Default = ({ fields, params }: VersatileProps): JSX.Element => (
  <Frame params={params} label="Search">
    <Text tag="h1" field={fields?.Title} className="font-[family-name:var(--brand-font-heading)] text-4xl" />
    <form className="mt-6" action="/search" method="get">
      <label className="block text-sm" htmlFor="versatile-search">
        Search
      </label>
      <input id="versatile-search" name="q" type="search" className="mt-2 w-full max-w-xl rounded-full border px-4 py-3" />
    </form>
  </Frame>
);
