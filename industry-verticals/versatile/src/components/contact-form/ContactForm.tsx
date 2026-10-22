import { JSX } from 'react';
import { Text } from '@sitecore-content-sdk/nextjs';
import { Frame, VersatileProps } from '@/lib/versatile';

export const Default = ({ fields, params }: VersatileProps): JSX.Element => (
  <Frame params={params} label="Contact">
    <Text
      tag="h2"
      field={fields?.Title}
      className="font-[family-name:var(--brand-font-heading)] text-4xl"
    />
    <Text tag="p" field={fields?.Summary} className="mt-3 max-w-xl" />
    <form className="mt-8 grid max-w-xl gap-4">
      <label className="text-sm">
        Name
        <input name="name" type="text" className="v-field mt-1" />
      </label>
      <label className="text-sm">
        Email
        <input name="email" type="email" className="v-field mt-1" />
      </label>
      <label className="text-sm">
        Message
        <textarea name="message" className="v-field mt-1" rows={5} />
      </label>
      <button type="submit" className="v-btn w-fit">
        Send
      </button>
    </form>
  </Frame>
);
