'use client';

import * as React from 'react';
import {
  FileSpreadsheet,
  Upload,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  Users,
  Search,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dialog } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface StudentAdmission {
  id: string;
  name: string;
  dob: string;
  grade: string;
  parentPhone: string;
  status: 'SUCCESS' | 'DUPLICATE' | 'PENDING';
}

export default function AdmissionsPage() {
  const [students, setStudents] = React.useState<StudentAdmission[]>([
    { id: 'st-01', name: 'Nguyễn Hoàng Minh', dob: '2009-05-12', grade: '11A1', parentPhone: '0912345678', status: 'SUCCESS' },
    { id: 'st-02', name: 'Trần Thảo My', dob: '2009-08-20', grade: '11A1', parentPhone: '0987654321', status: 'SUCCESS' },
    { id: 'st-03', name: 'Lê Quốc Bảo', dob: '2009-11-03', grade: '11A2', parentPhone: '0909123456', status: 'SUCCESS' },
  ]);

  const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);
  const [importProgress, setImportProgress] = React.useState(0);
  const [isImporting, setIsImporting] = React.useState(false);
  const [importDone, setImportDone] = React.useState(false);

  // New Student Single Form
  const [newName, setNewName] = React.useState('');
  const [newDob, setNewDob] = React.useState('');
  const [newGrade, setNewGrade] = React.useState('11A1');
  const [newParentPhone, setNewParentPhone] = React.useState('');

  const handleSingleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newParentPhone) return;
    setStudents((prev) => [
      {
        id: `st-${Date.now()}`,
        name: newName,
        dob: newDob || '2009-01-01',
        grade: newGrade,
        parentPhone: newParentPhone,
        status: 'SUCCESS',
      },
      ...prev,
    ]);
    setNewName('');
    setNewDob('');
    setNewParentPhone('');
  };

  const handleSimulateExcelImport = () => {
    setIsImporting(true);
    setImportProgress(20);
    setTimeout(() => setImportProgress(60), 500);
    setTimeout(() => {
      setImportProgress(100);
      setIsImporting(false);
      setImportDone(true);
      setStudents((prev) => [
        { id: `st-ex-1`, name: 'Vũ Đức Thịnh', dob: '2009-02-14', grade: '11A1', parentPhone: '0933112233', status: 'SUCCESS' },
        { id: `st-ex-2`, name: 'Phạm Quỳnh Nga', dob: '2009-09-09', grade: '11A2', parentPhone: '0944556677', status: 'SUCCESS' },
        ...prev,
      ]);
    }, 1200);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="purple" className="mb-2">Phân Hệ Giáo Vụ & Tuyển Sinh (Staff)</Badge>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Tuyển Sinh & Quản Lý Hồ Sơ Học Viên
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Nhập liệu học sinh mới, gán liên kết Phụ huynh và hỗ trợ Import dữ liệu hàng loạt từ file Excel.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              setIsImportModalOpen(true);
              setImportDone(false);
              setImportProgress(0);
            }}
            variant="outline"
            leftIcon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
          >
            Import Từ File Excel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Add Single Student Form */}
        <Card className="p-6 h-fit space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-indigo-600" />
            Thêm Học Sinh Mới
          </h3>
          <form onSubmit={handleSingleAdd} className="space-y-3">
            <Input
              label="Họ và tên học sinh *"
              placeholder="VD: Nguyễn Văn An"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />
            <Input
              label="Ngày sinh"
              type="date"
              value={newDob}
              onChange={(e) => setNewDob(e.target.value)}
            />
            <Input
              label="Xếp vào khối / Lớp"
              placeholder="VD: 11A1"
              value={newGrade}
              onChange={(e) => setNewGrade(e.target.value)}
            />
            <Input
              label="Số điện thoại Phụ huynh *"
              placeholder="0912345678"
              value={newParentPhone}
              onChange={(e) => setNewParentPhone(e.target.value)}
              required
              helperText="Hệ thống sẽ tự động liên kết tài khoản Phụ huynh qua SĐT này."
            />
            <Button type="submit" className="w-full justify-center mt-2">
              Lưu Hồ Sơ Học Sinh
            </Button>
          </form>
        </Card>

        {/* Right Col: Student List Table */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Danh Sách Hồ Sơ Đã Nhập ({students.length})
              </h3>
              <Badge variant="success">Tất cả hợp lệ</Badge>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Họ và Tên</TableHead>
                  <TableHead>Khối / Lớp</TableHead>
                  <TableHead>Ngày Sinh</TableHead>
                  <TableHead>SĐT Phụ Huynh</TableHead>
                  <TableHead className="text-right">Trạng Thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-semibold text-slate-900 dark:text-white">
                      {student.name}
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-bold text-xs">
                        {student.grade}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">{student.dob}</TableCell>
                    <TableCell className="text-xs font-mono text-indigo-600 dark:text-indigo-400">
                      {student.parentPhone}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="success" className="text-[10px]">
                        Đã liên kết
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>

      {/* Excel Import Modal */}
      <Dialog
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Nhập Danh Sách Học Sinh Hàng Loạt Bằng File Excel"
        description="Tải lên file định dạng .xlsx hoặc .csv theo mẫu quy chuẩn của trường."
      >
        <div className="space-y-4 py-2 text-center">
          {!importDone ? (
            <>
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50">
                <FileSpreadsheet className="w-12 h-12 text-emerald-600 mb-3" />
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  Kéo thả file Excel vào đây hoặc bấm để chọn file
                </p>
                <p className="text-xs text-slate-500 mt-1">Dung lượng tối đa 10MB (khoảng 5,000 học sinh/lần)</p>
                <a
                  href="#"
                  className="mt-3 text-xs text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Download className="w-3.5 h-3.5" />
                  Tải file Excel mẫu chuẩn (.xlsx)
                </a>
              </div>

              {isImporting && (
                <div className="space-y-2 text-left">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Đang xử lý và kiểm tra trùng lặp SĐT...</span>
                    <span>{importProgress}%</span>
                  </div>
                  <Progress value={importProgress} />
                </div>
              )}

              <Button
                isLoading={isImporting}
                onClick={handleSimulateExcelImport}
                className="w-full justify-center"
                leftIcon={<Upload className="w-4 h-4" />}
              >
                Bắt Đầu Import Dữ Liệu
              </Button>
            </>
          ) : (
            <div className="py-4 flex flex-col items-center space-y-3">
              <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Import Thành Công 2 Học Sinh Mới!
              </h3>
              <p className="text-xs text-slate-500 max-w-xs">
                Tất cả số điện thoại phụ huynh đã được tự động kết nối vào sổ liên lạc điện tử.
              </p>
              <Button onClick={() => setIsImportModalOpen(false)} className="mt-2">
                Hoàn Tất
              </Button>
            </div>
          )}
        </div>
      </Dialog>
    </div>
  );
}
