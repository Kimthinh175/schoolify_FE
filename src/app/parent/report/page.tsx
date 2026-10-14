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
  Bell,
  ChevronRight,
  Printer,
  Download,
  Share2,
  Baby,
  Star,
  ShieldCheck,
  Sparkles,
  Phone,
  FileText,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog } from '@/components/ui/dialog';
import { useParentStore } from '@/store/parent.store';
import { useNotificationStore } from '@/store/notification.store';
import { MOCK_SUBMISSIONS, MOCK_COURSES, MOCK_TIMETABLE } from '@/services/mock/data';
import { MOCK_GDPT_REPORTS, ChildAcademicReport } from '@/services/mock/parent-flow-data';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function ParentAcademicPage() {
  const { children, activeChildId, setActiveChild } = useParentStore();
  const { notifications, markAsRead } = useNotificationStore();
  const activeChild = children.find((c) => c.id === activeChildId) || children[0];
  const [activeTab, setActiveTab] = React.useState('GDPT_REPORT');
  const [isExportModalOpen, setIsExportModalOpen] = React.useState(false);

  // Lấy dữ liệu báo cáo GDPT 2018 theo con
  const report: ChildAcademicReport = MOCK_GDPT_REPORTS[activeChild.id] || MOCK_GDPT_REPORTS['child-01'];

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const childTabs = children.map((c) => ({
    id: c.id,
    label: c.name,
    icon: <Baby className="w-4 h-4" />,
  }));

  const mainTabs = [
    { id: 'GDPT_REPORT', label: 'Báo Cáo GDPT 2018', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'SCORES', label: 'Biểu Đồ Khảo Thí', icon: <Award className="w-4 h-4" /> },
    { id: 'FEEDBACK', label: 'Lời Phê & Bài Làm', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'ATTENDANCE', label: 'Lịch Học & Chuyên Cần', icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'COURSES', label: 'Tiến Độ Khóa Học', icon: <BookOpen className="w-4 h-4" /> },
    {
      id: 'NOTIFICATIONS',
      label: 'Thông Báo Từ Trường',
      icon: <Bell className="w-4 h-4" />,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
  ];

  const childSubmissions = MOCK_SUBMISSIONS.filter(
    (sub) => sub.student_id === activeChild.id
  ).sort((a, b) => new Date(a.graded_at || 0).getTime() - new Date(b.graded_at || 0).getTime());

  const childTimetable = MOCK_TIMETABLE.filter(
    (session) => session.class_id === activeChild.classId
  );

  const getScoreBadge = (score: number) => {
    if (score >= 9) return <Badge variant="success">{score} - Xuất Sắc</Badge>;
    if (score >= 8) return <Badge variant="success">{score} - Tốt</Badge>;
    if (score >= 6.5) return <Badge variant="primary">{score} - Khá</Badge>;
    if (score >= 5) return <Badge variant="warning">{score} - Đạt</Badge>;
    return <Badge variant="danger">{score} - Chưa Đạt</Badge>;
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
      {/* Thanh Chọn Con Cái */}
      {children.length > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Học sinh:</span>
            <Tabs
              tabs={childTabs}
              activeTab={activeChildId}
              onChange={setActiveChild}
              variant="pill"
            />
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-semibold text-xs border-cyan-500/30 text-cyan-600 dark:text-cyan-400">
              {activeChild.grade} • {activeChild.className}
            </Badge>
          </div>
        </div>
      )}

      {/* Tiêu Đề & Hành Động */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="purple">Sổ Liên Lạc Điện Tử</Badge>
            <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200">
              Chuẩn GDPT 2018 (TT 22/2021)
            </Badge>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Báo Cáo Học Tập & Rèn Luyện: {activeChild.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Trường: {activeChild.schoolName} • Năm học: {report.academicYear} ({report.semester})
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            leftIcon={<Printer className="w-4 h-4" />}
            onClick={() => window.print()}
            className="hidden sm:inline-flex"
          >
            In Báo Cáo
          </Button>
          <Button
            variant="primary"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={() => setIsExportModalOpen(true)}
            className="bg-cyan-600 hover:bg-cyan-500 shadow-md shadow-cyan-600/20"
          >
            Xuất Sổ Liên Lạc (PDF)
          </Button>
        </div>
      </div>

      {/* Các Tab Chính */}
      <Tabs tabs={mainTabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab 1: Báo Cáo Chuẩn GDPT 2018 */}
      {activeTab === 'GDPT_REPORT' && (
        <div className="space-y-6">
          {/* Thẻ Tổng Quan Đánh Giá Kết Quả GDPT 2018 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5 bg-gradient-to-br from-indigo-500/10 via-white to-transparent dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-900 border-indigo-200/60 dark:border-indigo-800/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
                  Kết Quả Học Tập
                </span>
                <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-2">
                {report.learningResult}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  ĐTB Chung: {report.overallScore}/10
                </span>
                <span className="text-[11px] text-slate-400">• Top {report.rankInClass}/{report.totalStudents}</span>
              </div>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-emerald-500/10 via-white to-transparent dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 border-emerald-200/60 dark:border-emerald-800/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  Kết Quả Rèn Luyện
                </span>
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
                {report.conductResult}
              </p>
              <p className="text-xs text-slate-500 mt-1">Hạnh kiểm xuất sắc, ý thức gương mẫu</p>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-amber-500/10 via-white to-transparent dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-900 border-amber-200/60 dark:border-amber-800/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                  Danh Hiệu Thi Đua
                </span>
                <Sparkles className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">
                {report.awardTitle}
              </p>
              <p className="text-xs text-slate-500 mt-1">Căn cứ Thông tư 22/2021/TT-BGDĐT</p>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-cyan-500/10 via-white to-transparent dark:from-cyan-950/40 dark:via-slate-900 dark:to-slate-900 border-cyan-200/60 dark:border-cyan-800/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-700 dark:text-cyan-400 uppercase tracking-wider">
                  Chuyên Cần Đi Học
                </span>
                <CalendarDays className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <p className="text-3xl font-black text-cyan-600 dark:text-cyan-400 mt-2">
                {report.attendanceRate}%
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {report.totalAbsences === 0 ? 'Đi học đủ 100% các buổi' : `Vắng ${report.totalAbsences} buổi có phép`}
              </p>
            </Card>
          </div>

          {/* Phần 1: Bảng Điểm Các Môn Tính Điểm Kết Hợp Nhận Xét */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <BookCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  1. Môn Học Đánh Giá Bằng Điểm Số Kết Hợp Nhận Xét
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                (ĐĐGtx: Thường xuyên • ĐĐGgk: Giữa kỳ • ĐĐGck: Cuối kỳ • ĐTBmhk: Điểm TB Môn)
              </span>
            </div>

            <Card className="overflow-x-auto shadow-xs">
              <Table>
                <TableHeader className="bg-slate-50/80 dark:bg-slate-800/50">
                  <TableRow>
                    <TableHead className="w-[200px]">Môn Học & Giáo Viên</TableHead>
                    <TableHead className="text-center">ĐĐGtx (15p, Miệng)</TableHead>
                    <TableHead className="text-center">ĐĐGgk (Hệ số 2)</TableHead>
                    <TableHead className="text-center">ĐĐGck (Hệ số 3)</TableHead>
                    <TableHead className="text-center font-bold">ĐTB Môn</TableHead>
                    <TableHead className="text-center">Mức Đạt</TableHead>
                    <TableHead className="min-w-[260px]">Nhận Xét Của Giáo Viên Bộ Môn</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.subjects
                    .filter((s) => s.category === 'SCORE_EVALUATED')
                    .map((subject) => (
                      <TableRow key={subject.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <TableCell>
                          <div className="font-bold text-slate-900 dark:text-white text-sm">
                            {subject.subjectName}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">GV: {subject.teacherName}</div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            {subject.ddgTx.map((score, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-bold text-xs text-slate-800 dark:text-slate-200"
                              >
                                {score.toFixed(1)}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-bold text-sm text-slate-800 dark:text-slate-200">
                          {subject.ddgGk !== null ? subject.ddgGk.toFixed(1) : '-'}
                        </TableCell>
                        <TableCell className="text-center font-bold text-sm text-slate-800 dark:text-slate-200">
                          {subject.ddgCk !== null ? subject.ddgCk.toFixed(1) : '-'}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-base font-black text-indigo-600 dark:text-indigo-400">
                            {subject.dtbMhk !== null ? subject.dtbMhk.toFixed(1) : '-'}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              subject.evaluationResult === 'TỐT'
                                ? 'success'
                                : subject.evaluationResult === 'KHÁ'
                                ? 'primary'
                                : 'warning'
                            }
                            className="font-bold"
                          >
                            {subject.evaluationResult}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">
                            "{subject.teacherComment}"
                          </p>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </Card>
          </div>

          {/* Phần 2: Các Môn Đánh Giá Bằng Nhận Xét (Đạt / Chưa Đạt) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                2. Môn Học Đánh Giá Bằng Nhận Xét (Đạt / Chưa Đạt)
              </h3>
            </div>

            <Card className="overflow-x-auto shadow-xs">
              <Table>
                <TableHeader className="bg-slate-50/80 dark:bg-slate-800/50">
                  <TableRow>
                    <TableHead className="w-[260px]">Môn Học & Hoạt Động Giáo Dục</TableHead>
                    <TableHead className="w-[140px] text-center">Kết Quả</TableHead>
                    <TableHead className="w-[200px]">Giáo Viên Hướng Dẫn</TableHead>
                    <TableHead>Nhận Xét Sự Tiến Bộ Của Học Sinh</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.subjects
                    .filter((s) => s.category === 'COMMENT_EVALUATED')
                    .map((subject) => (
                      <TableRow key={subject.id}>
                        <TableCell className="font-bold text-sm text-slate-900 dark:text-white">
                          {subject.subjectName}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="success" className="font-bold text-xs py-1 px-3">
                            {subject.evaluationResult}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600 dark:text-slate-300">
                          {subject.teacherName}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600 dark:text-slate-300 italic">
                          "{subject.teacherComment}"
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </Card>
          </div>

          {/* Phần 3: Đánh Giá 5 Phẩm Chất & 3 Năng Lực Cốt Lõi GDPT 2018 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 5 Phẩm chất chủ yếu */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500" />
                  Đánh Giá 5 Phẩm Chất Chủ Yếu
                </h3>
                <Badge variant="success">TẤT CẢ ĐẠT TỐT</Badge>
              </div>

              <div className="space-y-3.5">
                {report.qualities.map((q) => (
                  <div
                    key={q.qualityName}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {q.qualityName}
                      </span>
                      <Badge variant="success" className="text-[10px]">
                        Mức: {q.level}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{q.description}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* 3 Năng lực cốt lõi & Nhận xét GVCN */}
            <div className="space-y-6 flex flex-col justify-between">
              <Card className="p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-cyan-600" />
                    Đánh Giá Năng Lực Chung Cốt Lõi
                  </h3>
                  <Badge variant="success">TỐT</Badge>
                </div>

                <div className="space-y-3.5">
                  {report.competencies.map((c) => (
                    <div
                      key={c.competencyName}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {c.competencyName}
                        </span>
                        <Badge variant="primary" className="text-[10px]">
                          Mức: {c.level}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{c.description}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Hộp Thư Nhận Xét Của GVCN */}
              <Card className="p-6 space-y-3 bg-gradient-to-br from-indigo-50/70 to-blue-50/40 dark:from-indigo-950/40 dark:to-slate-900 border-indigo-200 dark:border-indigo-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-indigo-600" />
                    <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-200">
                      Ý Kiến Nhận Xét Của Giáo Viên Chủ Nhiệm
                    </h4>
                  </div>
                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {report.homeroomTeacher.phone}
                  </span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
                  "{report.homeroomTeacher.comment}"
                </p>
                <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-indigo-100 dark:border-indigo-900">
                  <span>GVCN: <b>{report.homeroomTeacher.name}</b></span>
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Đã ký số học bạ
                  </span>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Biểu Đồ Khảo Thí & Lịch Sử Bài Thi */}
      {activeTab === 'SCORES' && (
        <div className="space-y-6">
          <Card className="p-6 shadow-xs">
            <div className="mb-6 flex flex-col gap-1">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Biểu Đồ Điểm Thi Thử Định Kỳ (Khảo Thí Schoolify)
              </h2>
              <p className="text-sm text-slate-500">
                Thống kê điểm số các bài khảo thí trực tuyến theo thời gian của {activeChild.name}
              </p>
            </div>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={childSubmissions.map((sub) => ({
                    name:
                      (sub.exam_title || '').length > 15
                        ? (sub.exam_title || '').substring(0, 15) + '...'
                        : sub.exam_title || '',
                    fullName: sub.exam_title || '',
                    score: sub.score || 0,
                    date: sub.graded_at ? formatDate(sub.graded_at) : 'Chưa chấm',
                    course: sub.course_title,
                  }))}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                    cursor={{ fill: '#f1f5f9' }}
                    formatter={(value: any) => [`${value} Điểm`, 'Điểm số']}
                    labelFormatter={(label: any, payload: any) => {
                      if (payload && payload.length > 0) {
                        return `${payload[0].payload.fullName} - ${payload[0].payload.course}`;
                      }
                      return label;
                    }}
                  />
                  <Bar dataKey="score" fill="#4f46e5" radius={[6, 6, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Danh Sách Bài Thi Khảo Thí Đã Chấm
              </h2>
            </div>
            <Card className="overflow-hidden shadow-xs">
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
                          <div className="text-xs text-slate-500 mt-0.5">{sub.exam_title}</div>
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
                        Chưa có dữ liệu khảo thí.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 3: Lời Phê & Bài Làm */}
      {activeTab === 'FEEDBACK' && (
        <div className="space-y-6">
          {childSubmissions.map((sub) => (
            <Card key={sub.id} className="p-6 space-y-4 shadow-xs border-l-4 border-l-amber-400">
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

              {/* Hộp Thư Lời Phê */}
              <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 space-y-1">
                <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-indigo-600" />
                  Nhận Xét Đánh Giá Của Giáo Viên:
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-200 italic leading-relaxed">
                  "{sub.teacher_notes}"
                </p>
              </div>

              {/* Phân tích bài tự luận kèm nhận xét của giáo viên */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Chi Tiết Câu Tự Luận & Lời Nhận Xét:
                </h4>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {sub.answers?.[3] ? 'Câu Tự Luận Chuyên Sâu' : 'Phần Viết Luận'}
                    </span>
                    <span className="font-bold text-emerald-600">Đạt chuẩn yêu cầu</span>
                  </div>
                  <p className="text-xs font-mono text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 whitespace-pre-line">
                    {sub.answers?.[3]?.text_answer || sub.answers?.[0]?.text_answer || 'Không có bài làm tự luận'}
                  </p>
                  <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <b>Lời phê của giáo viên:</b>{' '}
                      {sub.answers?.[3]?.teacher_feedback || sub.answers?.[0]?.teacher_feedback || 'Rất tốt'}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Tab 4: Lịch Học & Chuyên Cần */}
      {activeTab === 'ATTENDANCE' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Lịch Học & Điểm Danh Chuyên Cần</h2>
          </div>
          <Card className="overflow-hidden shadow-xs">
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
                    const isAbsent = isPast && index === 2;

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
                            Phòng: {session.room || 'Phòng Học Trực Tuyến'}
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

      {/* Tab 5: Tiến Độ Khóa Học */}
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

      {/* Tab 6: Thông Báo Từ Trường */}
      {activeTab === 'NOTIFICATIONS' && (
        <div className="space-y-4">
          {notifications.map((note) => (
            <Card
              key={note.id}
              onClick={() => markAsRead(note.id)}
              className={`p-5 transition-all hover:shadow-md cursor-pointer border-l-4 ${
                !note.isRead
                  ? 'border-l-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20'
                  : 'border-l-transparent bg-white dark:bg-slate-900'
              }`}
            >
              <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-start overflow-hidden">
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    {!note.isRead && <span className="flex shrink-0 h-2 w-2 rounded-full bg-indigo-600" />}
                    <h3
                      className={`text-base font-bold truncate ${
                        !note.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {note.title}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                    {note.content}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-500 pt-2">
                    <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                    <span>{note.date}</span>
                  </div>
                </div>

                <div className="hidden sm:flex shrink-0">
                  <div className="h-8 w-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Xem Trước & Xuất Sổ Liên Lạc Điện Tử Chuẩn GDPT 2018 */}
      <Dialog
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Xuất Sổ Liên Lạc Điện Tử (Định Dạng PDF)"
        description="Xem trước bản in chính thức được ký số bởi Ban Giám Hiệu và Giáo Viên Chủ Nhiệm."
      >
        <div className="space-y-4 py-2">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-2.5">
            <div className="text-center pb-2 border-b border-slate-200 dark:border-slate-700">
              <p className="font-bold uppercase tracking-wider text-slate-500">BỘ GIÁO DỤC VÀ ĐÀO TẠO</p>
              <p className="font-black text-sm text-slate-900 dark:text-white">{activeChild.schoolName}</p>
              <p className="text-[11px] text-cyan-600 font-semibold mt-0.5">SỔ LIÊN LẠC HỌC TẬP & RÈN LUYỆN ĐIỆN TỬ</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
              <p>Họ tên: <b>{activeChild.name}</b></p>
              <p>Lớp: <b>{activeChild.className}</b></p>
              <p>Học kỳ: <b>{report.semester} ({report.academicYear})</b></p>
              <p>Xếp loại học tập: <b className="text-emerald-600">{report.learningResult}</b></p>
              <p>Rèn luyện: <b className="text-emerald-600">{report.conductResult}</b></p>
              <p>Danh hiệu: <b className="text-amber-600">{report.awardTitle}</b></p>
            </div>

            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-[11px] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Chữ ký số điện tử: <b>SHA-256 Verified by Schoolify CA</b></span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsExportModalOpen(false)}>
              Đóng
            </Button>
            <Button
              variant="primary"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={() => {
                window.print();
                setIsExportModalOpen(false);
              }}
            >
              Tải Xuống PDF Hoặc In Ngay
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
