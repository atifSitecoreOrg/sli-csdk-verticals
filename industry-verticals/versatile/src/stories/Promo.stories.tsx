import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Default as Promo } from '../components/promo/Promo';
import { VersatileProps } from '../lib/versatile';
import { CommonParams, CommonRendering } from './common/commonData';
import { createImageField, createLinkField, createTextField } from './helpers/createFields';
import { boolToSitecoreCheckbox } from './helpers/boolToSitecoreCheckbox';
import {
  BackgroundColorArgs,
  backgroundColorArgTypes,
  defaultBackgroundColorArgs,
} from './common/commonControls';

type StoryProps = VersatileProps &
  BackgroundColorArgs & {
    ShowMultipleImages: boolean;
    Reversed: boolean;
    HideCurveLine: boolean;
    HideShapes: boolean;
    HideShadows: boolean;
    HideQuote: boolean;
  };

const meta = {
  title: 'Page Content/Promo',
  component: Promo,
  argTypes: {
    ...backgroundColorArgTypes,
    Reversed: {
      control: 'boolean',
      name: 'Promo Reversed',
    },
  },
  args: {
    Reversed: false,
    ...defaultBackgroundColorArgs,
  },
  tags: ['autodocs'],
} satisfies Meta<StoryProps>;
export default meta;

type Story = StoryObj<StoryProps>;

const baseParams = {
  ...CommonParams,
};

const baseRendering = {
  ...CommonRendering,
  componentName: 'Promo',
  params: baseParams,
};

const baseFields = {
  Image: createImageField('placeholder'),
  Title: createTextField('Selected for this season'),
  Summary: createTextField('A short offer, with a link through to the detail.'),
  Link: createLinkField('Read more'),
};

export const Default: Story = {
  render: (args) => {
    const params = {
      ...baseParams,
      styles: `${baseParams.styles} ${args.BackgroundColor}`,
      Reversed: boolToSitecoreCheckbox(args.Reversed),
    };
    return <Promo params={params} rendering={baseRendering} fields={baseFields} />;
  },
};
