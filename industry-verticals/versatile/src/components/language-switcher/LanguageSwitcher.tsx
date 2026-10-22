import { JSX } from 'react';
import { VersatileProps } from '@/lib/versatile';

export const Default = ({ params }: VersatileProps): JSX.Element => (
  <div className={`component language-switcher ${params.styles ?? ''}`} id={params.RenderingIdentifier}>
    <p className="px-6 py-3 text-sm">English</p>
  </div>
);
