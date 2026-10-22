import { JSX } from 'react';
import { Text } from '@sitecore-content-sdk/nextjs';
import { Frame, VersatileProps } from '@/lib/versatile';

const stats = [
  ['Stat1Value', 'Stat1Label'],
  ['Stat2Value', 'Stat2Label'],
  ['Stat3Value', 'Stat3Label'],
  ['Stat4Value', 'Stat4Label'],
] as const;

export const Default = ({ fields, params }: VersatileProps): JSX.Element => (
  <Frame params={params} label="Stats">
    <Text
      tag="h2"
      field={fields?.Title}
      className="max-w-xl font-[family-name:var(--brand-font-heading)] text-4xl"
    />
    <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map(([value, label]) => (
        <div key={value} className="v-stat">
          <Text tag="strong" field={fields?.[value]} />
          <Text tag="span" field={fields?.[label]} className="mt-2 block text-sm" />
        </div>
      ))}
    </div>
  </Frame>
);
