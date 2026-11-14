'use client';

import { usePathname } from 'next/navigation';
import { GenericPageSkeleton } from '@/components/skeletons/page-skeletons';
import { HomePageSkeleton } from '@/components/skeletons/home-skeleton';

export default function PublicLoading() {
  const pathname = usePathname();
  if (pathname === '/') return <HomePageSkeleton />;
  return <GenericPageSkeleton />;
}
