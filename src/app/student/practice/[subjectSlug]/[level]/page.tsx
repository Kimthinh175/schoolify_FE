'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { PracticeRoadmapList } from '@/components/features/student/PracticeRoadmapList';

export default function StudentSubjectLevelPracticeRoadmapPage() {
  const params = useParams();
  const subjectSlug = (params.subjectSlug as string) || 'toan-hoc';
  const level = (params.level as string) || 'lop-11';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <PracticeRoadmapList currentSubjectSlug={subjectSlug} currentLevelSlug={level} />
      </div>
    </div>
  );
}
