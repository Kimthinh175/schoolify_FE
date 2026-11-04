'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';

const CasioCalculatorWidget = dynamic(
  () => import('@/components/features/calculator').then((mod) => mod.CasioCalculatorWidget),
  { ssr: false }
);

const AgenticChatWidget = dynamic(
  () => import('@/components/features/agent/AgenticChatWidget').then((mod) => mod.AgenticChatWidget),
  { ssr: false }
);

export function GlobalFloatingWidgets() {
  const [isChildWindow, setIsChildWindow] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined' && !!window.opener) {
      setIsChildWindow(true);
    }
  }, []);

  if (isChildWindow) return null;

  return (
    <>
      <CasioCalculatorWidget />
      <AgenticChatWidget />
    </>
  );
}
