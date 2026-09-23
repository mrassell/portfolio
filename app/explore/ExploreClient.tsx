'use client';

import dynamic from 'next/dynamic';

const PortfolioWorld = dynamic(() => import('./PortfolioWorld'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[100dvh] w-full flex-col items-center justify-center gap-3 bg-[#cfe0ea] text-stone-700">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-stone-300 border-t-stone-800" />
      <p className="text-sm font-medium">Building the world…</p>
    </div>
  ),
});

export default function ExploreClient() {
  return <PortfolioWorld />;
}
