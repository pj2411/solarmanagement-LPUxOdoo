import { ClientApp } from '@/components/ClientApp';
import type { ScreenId } from '@/lib/solar-data';

const VALID_SCREENS: ScreenId[] = [
  'portal-dashboard',
  'quotation-engine',
  'site-survey-engineering',
  'installation-dispatch',
  'service-warranty',
  'auth',
];

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ screen?: string }>;
}) {
  const params = await searchParams;
  const candidate = params?.screen as ScreenId | undefined;
  const initialScreen =
    candidate && VALID_SCREENS.includes(candidate)
      ? candidate
      : 'portal-dashboard';

  return <ClientApp initialScreen={initialScreen} />;
}
