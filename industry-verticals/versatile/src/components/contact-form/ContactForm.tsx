import { JSX } from 'react';
import { Text } from '@sitecore-content-sdk/nextjs';
import { Frame, VersatileProps } from '@/lib/versatile';

export const Default = ({ fields, params }: VersatileProps): JSX.Element => (
  <Frame params={params} label="Contact">
    <Text tag="h2" field={fields?.Title} className="font-[family-name:var(--brand-font-heading)] text-3xl" />
    <Text tag="p" field={fields?.Summary} className="mt-3" />
    <form className="mt-6 grid max-w-xl gap-4">
      <label>
        Name
        <input name="name" type="text" className="mt-1 w-full rounded-xl border px-3 py-2" />
      </label>
      <label>
        Email
        <input name="email" type="email" className="mt-1 w-full rounded-xl border px-3 py-2" />
      </label>
      <label>
        Message
        <textarea name="message" className="mt-1 w-full rounded-xl border px-3 py-2" rows={4} />
      </label>
    </form>
  </Frame>
);
