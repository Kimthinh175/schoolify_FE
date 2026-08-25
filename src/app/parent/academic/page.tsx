'use client';

import * as React from 'react';
import {
  BookCheck,
  Award,
  MessageSquare,
  CheckCircle2,
  BookOpen,
  ChevronDown,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useParentStore } from '@/store/parent.store';
import { MOCK_SUBMISSIONS, MOCK_COURSES } from '@/services/mock/data';

export default function ParentAcademicPage() {
  const { children, activeChildId } = useParentStore();
  const activeChild = children.find((c) => c.id === activeChildId) || children[0];
  const [activeTab, setActiveTab] = React.useState('EXAMS');

  const tabs = [
    { id: 'EXAMS', label: 'Kết Quả Kiểm Tra & Lời Phê', icon: <Award className="w-4 h-4" /> },
    { id: 'COURSES', label: 'Tiến Độ Khóa Học', icon: <BookOpen className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Badge variant="purple" className="mb-2">Sổ Liên Lạc Điện Tử</Badge>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Kết Quả Học Tập: {activeChild.name}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Theo dõi minh bạch điểm số, tiến độ học bài và đọc từng lời nhận xét chi tiết của thầy cô giáo.
        </p>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab 1: Exam Submissions & Detailed Teacher Feedback */}
      {activeTab === 'EXAMS' && (
        <div className="space-y-6">
          {MOCK_SUBMISSIONS.map((sub) => (
            <Card key={sub.id} className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{sub.exam_title}</h3>
                  <p className="text-xs text-slate-500">Môn học: {sub.course_title}</p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                    {sub.score} / 10
                  </span>
                  <Badge variant="success" className="text-[10px] ml-2">Đã Chấm Điểm</Badge>
                </div>
              </div>

              {/* General Teacher Notes */}
              <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 space-y-1">
                <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-indigo-600" />
                  Nhận Xét Chung Của Thầy Cô:
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-200 italic leading-relaxed">
                  "{sub.teacher_notes}"
                </p>
              </div>

              {/* Essay breakdown with teacher comments */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Chi Tiết Câu Tự Luận & Lời Nhận Xét:
                </h4>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">Câu 4 (Giải phương trình lượng giác)</span>
                    <span className="font-bold text-emerald-600">Đạt 2.0 / 2.5 điểm</span>
                  </div>
                  <p className="text-xs font-mono text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 whitespace-pre-line">
                    {sub.answers[3]?.text_answer}
                  </p>
                  <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><b>Lời phê của giáo viên:</b> {sub.answers[3]?.teacher_feedback}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Tab 2: Course Progress */}
      {activeTab === 'COURSES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MOCK_COURSES.map((course) => (
            <Card key={course.id} className="p-5 flex flex-col justify-between space-y-4">
              <div className="flex items-start gap-4">
                <div className="h-16 w-24 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                  <img src={course.thumbnail_url || ''} alt="" className="h-full w-full object-cover" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{course.title}</h4>
                  <p className="text-xs text-slate-500">{course.teacher_name}</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-500">Tiến độ hoàn thành:</span>
                  <span className="text-indigo-600">65%</span>
                </div>
                <Progress value={65} showLabel={false} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
