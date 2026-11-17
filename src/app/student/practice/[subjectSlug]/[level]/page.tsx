'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function StudentSubjectLevelPracticeRoadmapPage() {
  const params = useParams();
  const router = useRouter();
  const rawSubject = String(params.subjectSlug || 'toan').toLowerCase();
  const rawLevel = String(params.level || 'lop-12').toLowerCase();

  React.useEffect(() => {
    const canonicalSubject = rawSubject.includes('tin') ? 'tin-hoc' : 'toan';
    const gradeMatch = rawLevel.match(/(10|11|12)/);
    const gradeQuery = gradeMatch ? `?grade=${gradeMatch[1]}` : '';
    router.replace(`/luyen-thi/chuyen-de/${canonicalSubject}${gradeQuery}`);
  }, [rawSubject, rawLevel, router]);

  return null;
}
