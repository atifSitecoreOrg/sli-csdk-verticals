import { useI18n } from 'next-localization';

/**
 * Adapter around next-localization so Search Experience files can keep
 * the starter kit's `useTranslations()` call shape.
 */
export const useTranslations = () => {
  const { t } = useI18n();
  return t;
};
