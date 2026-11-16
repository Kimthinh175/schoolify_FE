import { DollarSign, Users, GraduationCap, BookOpen, TrendingUp, Store } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { TeacherDashboardStats } from '@/services/teacher.service';

export function TeacherKpiStats({ stats }: { stats: TeacherDashboardStats }) {
  const formatMoney = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* Thu nhập bán khóa học (TransactionType: TEACHER_INCOME) */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Thu Nhập Bán Khóa Học</span>
          <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center dark:bg-emerald-950 dark:text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-3">
          {formatMoney(stats.totalIncome)}
        </p>
        <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold mt-1">
          <TrendingUp className="w-4 h-4 shrink-0" />
          <span>TEACHER_INCOME thực nhận (đã trừ phí sàn)</span>
        </div>
      </Card>

      {/* Tổng học viên */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Tổng Học Viên Theo Học</span>
          <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center dark:bg-indigo-950 dark:text-indigo-400">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-3">
          {stats.totalStudents.toLocaleString('vi-VN')}{' '}
          <span className="text-base font-semibold text-slate-500">học viên</span>
        </p>
        <p className="text-xs text-slate-500 mt-1">Trên toàn bộ khóa học bạn sở hữu</p>
      </Card>

      {/* Số lớp */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Lớp Học Phụ Trách</span>
          <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center dark:bg-purple-950 dark:text-purple-400">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-3">
          {stats.totalClasses} <span className="text-base font-semibold text-slate-500">lớp</span>
        </p>
        <p className="text-xs text-slate-500 mt-1">Đang giảng dạy trong học kỳ này</p>
      </Card>

      {/* Khóa học */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Khóa Học Sở Hữu</span>
          <div className="h-9 w-9 rounded-xl bg-[#E6F8FC] text-[#007D99] flex items-center justify-center dark:bg-[#00B8DD]/20 dark:text-[#00B8DD]">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-3">
          {stats.totalCourses} <span className="text-base font-semibold text-slate-500">khóa</span>
        </p>
        <div className="flex items-center gap-1 text-xs text-[#007D99] dark:text-[#00B8DD] font-semibold mt-1">
          <Store className="w-4 h-4 shrink-0" />
          <span>{stats.marketplaceCourses} khóa đang bán trên Marketplace</span>
        </div>
      </Card>
    </div>
  );
}
