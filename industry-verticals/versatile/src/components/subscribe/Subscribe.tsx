import { JSX } from 'react';
import { Text } from '@sitecore-content-sdk/nextjs';
import { Frame, VersatileProps } from '@/lib/versatile';

export const Default = ({ fields, params }: VersatileProps): JSX.Element => (
  <Frame params={params} label="Subscribe">
    <div className="grid items-center gap-6 md:grid-cols-2">
      <Text
        tag="h2"
        field={fields?.Title}
        className="font-[family-name:var(--brand-font-heading)] text-3xl"
      />
      <form className="flex gap-2" action="">
        <label className="sr-only" htmlFor="versatile-subscribe">
          Email
        </label>
        <input
          id="versatile-subscribe"
          name="email"
          type="email"
          required
          placeholder="you@studio.com"
          className="v-field"
        />
        <button type="submit" className="v-btn shrink-0">
          Subscribe
        </button>
      </form>
    </div>
  </Frame>
);
