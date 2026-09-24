'use client';

import * as React from 'react';
import { PracticeRoadmapList } from '@/components/features/student/PracticeRoadmapList';

export default function StudentPracticeRoadmapPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <PracticeRoadmapList currentSubjectSlug="toan-hoc" currentLevelSlug="lop-11" />
      </div>
    </div>
  );
}
