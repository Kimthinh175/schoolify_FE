'use client';

import * as React from 'react';
import {
  BookCheck,
  Award,
  MessageSquare,
  CheckCircle2,
  BookOpen,
  CalendarDays,
  Clock,
  XCircle,
  GraduationCap,
  Mail
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useParentStore } from '@/store/parent.store';
import { MOCK_SUBMISSIONS, MOCK_COURSES, MOCK_TIMETABLE } from '@/services/mock/data';

export default function ParentAcademicPage() {
  const { children, activeChildId } = useParentStore();
  const activeChild = children.find((c) => c.id === activeChildId) || children[0];
  const [activeTab, setActiveTab] = React.useState('SCORES');

  const tabs = [
    { id: 'SCORES', label: 'Bảng Điểm Chi Tiết', icon: <Award className="w-4 h-4" /> },
    { id: 'FEEDBACK', label: 'Lời Phê & Bài Làm', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'ATTENDANCE', label: 'Lịch Học & Chuyên Cần', icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'COURSES', label: 'Tiến Độ Khóa Học', icon: <BookOpen className="w-4 h-4" /> },
  ];

  const childSubmissions = MOCK_SUBMISSIONS.filter(sub => sub.student_id === activeChild.id);
  const childTimetable = MOCK_TIMETABLE.filter(session => session.class_id === activeChild.classId);

  const getScoreBadge = (score: number) => {
    if (score >= 8) return <Badge variant="success">{score} - Giỏi</Badge>;
    if (score >= 6.5) return <Badge variant="primary">{score} - Khá</Badge>;
    if (score >= 5) return <Badge variant="warning">{score} - TB</Badge>;
    return <Badge variant="danger">{score} - Yếu</Badge>;
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Badge variant="purple" className="mb-2">Sổ Liên Lạc Điện Tử</Badge>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Kết Quả Học Tập: {activeChild.name}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Theo dõi minh bạch điểm số, tiến độ học bài, lịch học và đọc từng lời nhận xét chi tiết của thầy cô giáo.
        </p>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab 1: Bảng Điểm Chi Tiết (Scoreboard) */}
      {activeTab === 'SCORES' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Bảng Điểm Các Môn Thi</h2>
          </div>
          <Card className="overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Môn Học / Bài Thi</TableHead>
                  <TableHead>Ngày Chấm</TableHead>
                  <TableHead className="text-right">Điểm Số</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {childSubmissions.length > 0 ? (
                  childSubmissions.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell>
                        <div className="font-semibold text-slate-900 dark:text-white text-sm">
                          {sub.course_title}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {sub.exam_title}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-slate-500">
                          {sub.graded_at ? formatDate(sub.graded_at) : 'Chưa chấm'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right align-middle">
                        {getScoreBadge(sub.score || 0)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center text-slate-500">
                      Chưa có dữ liệu điểm số.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {/* Tab 2: Lời Phê & Bài Làm (Restored Original Detailed Layout) */}
      {activeTab === 'FEEDBACK' && (
        <div className="space-y-6">
          {childSubmissions.map((sub) => (
            <Card key={sub.id} className="p-6 space-y-4 shadow-sm border-l-4 border-l-amber-400">
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

              {/* General Teacher Notes (Hộp Thư Lời Phê) */}
              <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 space-y-1">
                <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-indigo-600" />
                  Nhận Xét Đánh Giá Của Giáo Viên:
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
                    {sub.answers?.[3]?.text_answer || 'Không có dữ liệu bài làm tự luận'}
                  </p>
                  <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><b>Lời phê của giáo viên:</b> {sub.answers?.[3]?.teacher_feedback || 'Không có nhận xét'}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Tab 3: Lịch Học & Chuyên Cần */}
      {activeTab === 'ATTENDANCE' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Lịch Học & Điểm Danh Chuyên Cần</h2>
          </div>
          <Card className="overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Thời Gian</TableHead>
                  <TableHead>Tiết Học / Môn Học</TableHead>
                  <TableHead>Giáo Viên & Phòng</TableHead>
                  <TableHead className="text-right">Chuyên Cần</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {childTimetable.length > 0 ? (
                  childTimetable.map((session, index) => {
                    const isPast = new Date(session.start_time) < new Date();
                    const isAbsent = isPast && index === 2; // Giả lập vắng mặt

                    return (
                      <TableRow key={session.id}>
                        <TableCell className="align-top">
                          <div className="font-semibold text-slate-900 dark:text-white text-sm">
                            {formatDate(session.start_time)}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(session.start_time)} - {formatTime(session.end_time)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-slate-900 dark:text-white line-clamp-2 text-sm">
                            {session.title}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-slate-700 dark:text-slate-300">
                            GV: {session.teacher_name}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            Phòng: {session.room}
                          </div>
                        </TableCell>
                        <TableCell className="text-right align-middle">
                          {!isPast ? (
                            <Badge variant="outline" className="text-slate-500 bg-transparent">
                              Chưa học
                            </Badge>
                          ) : isAbsent ? (
                            <Badge variant="danger" icon={<XCircle className="w-3 h-3" />}>
                              Vắng mặt
                            </Badge>
                          ) : (
                            <Badge variant="success" icon={<CheckCircle2 className="w-3 h-3" />}>
                              Có mặt
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-slate-500">
                      Không có lịch học nào.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {/* Tab 4: Course Progress */}
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
