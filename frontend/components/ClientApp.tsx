'use client';

import dynamic from 'next/dynamic';
import type { ScreenId } from '@/lib/solar-data';

const SunPowerApp = dynamic(
  () => import('@/components/SunPowerApp').then((mod) => mod.SunPowerApp),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f6]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#0e7a66] border-t-transparent" />
      </div>
    ),
  }
);

export function ClientApp({ initialScreen }: { initialScreen: ScreenId }) {
  return <SunPowerApp initialScreen={initialScreen} />;
}
