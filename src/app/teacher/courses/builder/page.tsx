import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { CourseBuilderView } from '@/components/features/teacher/builder/CourseBuilderView';

export default function CourseBuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-20" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Skeleton className="lg:col-span-5 h-[480px]" />
            <Skeleton className="lg:col-span-4 h-[480px]" />
            <Skeleton className="lg:col-span-3 h-[480px]" />
          </div>
        </div>
      }
    >
      <CourseBuilderView />
    </Suspense>
  );
}
