import { Suspense } from 'react';
import { CourseBuilderSkeleton } from '@/components/skeletons/page-skeletons';
import { CourseBuilderView } from '@/components/features/teacher/builder/CourseBuilderView';

export default function CourseBuilderPage() {
  return (
    <Suspense fallback={<CourseBuilderSkeleton />}>
      <CourseBuilderView />
    </Suspense>
  );
}
