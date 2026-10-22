import { JSX } from 'react';
import { Link } from '@sitecore-content-sdk/nextjs';
import { linkField, VersatileProps } from '@/lib/versatile';

export const Default = ({ fields, params }: VersatileProps): JSX.Element => (
  <div
    className={`component social-follow flex gap-4 ${params.styles ?? ''}`}
    id={params.RenderingIdentifier}
  >
    <Link field={linkField(fields?.FacebookLink)} className="v-underline text-sm" />
    <Link field={linkField(fields?.InstagramLink)} className="v-underline text-sm" />
    <Link field={linkField(fields?.TwitterLink)} className="v-underline text-sm" />
  </div>
);
