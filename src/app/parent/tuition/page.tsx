'use client';

import * as React from 'react';
import {
  CreditCard,
  QrCode,
  CheckCircle2,
  Receipt,
  Download,
  AlertCircle,
  User,
  Calendar,
  GraduationCap,
  Wallet,
  Info,
  Copy,
  Check,
  Printer,
  Baby,
  Building2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import { Dialog } from '@/components/ui/dialog';
import { useParentStore } from '@/store/parent.store';
import { MOCK_GDPT_TUITIONS, TuitionItem } from '@/services/mock/parent-flow-data';

export default function ParentTuitionPage() {
  const { children, activeChildId, setActiveChild } = useParentStore();
  const activeChild = children.find((c) => c.id === activeChildId) || children[0];

  // State lưu danh sách hóa đơn theo con cái
  const [tuitionRecords, setTuitionRecords] = React.useState<Record<string, TuitionItem[]>>(MOCK_GDPT_TUITIONS);

  const [payingItem, setPayingItem] = React.useState<TuitionItem | null>(null);
  const [receiptItem, setReceiptItem] = React.useState<TuitionItem | null>(null);
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  // Danh sách hóa đơn của con hiện tại
  const currentTuitions = tuitionRecords[activeChild.id] || [];

  const childTabs = children.map((c) => ({
    id: c.id,
    label: c.name,
    icon: <Baby className="w-4 h-4" />,
  }));

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const totalPaid = currentTuitions
    .filter((t) => t.status === 'PAID')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalPending = currentTuitions
    .filter((t) => t.status === 'PENDING')
    .reduce((acc, t) => acc + t.amount, 0);

  const handleCopyText = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleConfirmPaid = () => {
    if (!payingItem) return;
    setIsVerifying(true);

    // Mô phỏng xác thực webhook ngân hàng thời gian thực
    setTimeout(() => {
      setTuitionRecords((prev) => ({
        ...prev,
        [activeChild.id]: prev[activeChild.id].map((item) =>
          item.id === payingItem.id
            ? { ...item, status: 'PAID', paidAt: new Date().toISOString() }
            : item
        ),
      }));
      setIsVerifying(false);
      setIsSuccess(true);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Thanh Chọn Con Cái */}
      {children.length > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Học sinh nộp phí:</span>
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

      {/* Header Trang Thanh Toán */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="purple">Cổng Thanh Toán Trực Tuyến</Badge>
            <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200">
              VietQR Napas247 Tự Động Gạch Nợ
            </Badge>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Các Khoản Thu Học Phí: {activeChild.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quét mã QR từ ứng dụng ngân hàng bất kỳ để chuyển khoản. Hệ thống tự động xuất biên lai điện tử hợp lệ.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            leftIcon={<Printer className="w-4 h-4" />}
            onClick={() => window.print()}
            className="hidden sm:inline-flex"
          >
            In Phiếu Báo Thu
          </Button>
        </div>
      </div>

      {/* Thẻ Thống Kê Tổng Thu / Công Nợ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 border-l-4 border-l-emerald-500">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Đã Thanh Toán</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatMoney(totalPaid)}
          </p>
          <p className="text-xs text-slate-500 mt-1">Đã có biên lai điện tử đầy đủ</p>
        </Card>

        <Card className="p-5 border-l-4 border-l-amber-500">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Còn Cần Thanh Toán</span>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {formatMoney(totalPending)}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {totalPending > 0 ? 'Vui lòng thanh toán trước hạn chót' : 'Tất cả các khoản đã hoàn tất!'}
          </p>
        </Card>

        <Card className="p-5 border-l-4 border-l-cyan-500">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phương Thức Thanh Toán</span>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-cyan-600" />
            VietQR Napas247
          </p>
          <p className="text-xs text-emerald-600 font-semibold mt-1">Miễn phí giao dịch 100%</p>
        </Card>
      </div>

      {/* Danh Sách Các Khoản Thu Chi Tiết */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-600" />
            Danh Sách Khoản Thu Học Kỳ
          </h2>
          <span className="text-xs text-slate-500">
            Năm học 2025 - 2026 • Lớp {activeChild.className}
          </span>
        </div>

        {currentTuitions.map((item) => (
          <Card
            key={item.id}
            className={`p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 transition-all ${
              item.status === 'PENDING'
                ? 'border-indigo-500/80 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-md'
                : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {item.code}
                </span>
                <Badge variant={item.status === 'PAID' ? 'success' : 'warning'} className="font-bold">
                  {item.status === 'PAID' ? 'ĐÃ HOÀN TẤT' : 'CHƯA THANH TOÁN'}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {item.category}
                </Badge>
                <span className="text-xs text-slate-500">Hạn chót: <b>{item.dueDate}</b></span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white">{item.title}</h3>

              {/* Bảng kê chi tiết các mục */}
              <div className="pt-2">
                <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                  {item.details.map((detail, idx) => (
                    <div key={idx} className="flex justify-between text-slate-600 dark:text-slate-300">
                      <span>• {detail.label}</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {formatMoney(detail.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between w-full lg:w-auto gap-4 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-200 dark:border-slate-800">
              <div className="text-left lg:text-right">
                <span className="text-xs text-slate-500 block">Số tiền cần đóng:</span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  {formatMoney(item.amount)}
                </span>
              </div>

              {item.status === 'PENDING' ? (
                <Button
                  onClick={() => {
                    setPayingItem(item);
                    setIsSuccess(false);
                  }}
                  variant="primary"
                  className="bg-cyan-600 hover:bg-cyan-500 font-bold shadow-md shadow-cyan-600/20 cursor-pointer"
                  leftIcon={<QrCode className="w-4 h-4" />}
                >
                  Quét Mã VietQR Đóng Tiền
                </Button>
              ) : (
                <Button
                  variant="outline"
                  leftIcon={<Receipt className="w-4 h-4 text-emerald-600" />}
                  onClick={() => setReceiptItem(item)}
                  className="font-bold border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                >
                  Xem Biên Lai Điện Tử
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* MODAL THANH TOÁN VIETQR CHUẨN NAPAS247 */}
      <Dialog
        isOpen={!!payingItem}
        onClose={() => setPayingItem(null)}
        title={`Thanh Toán Học Phí: ${payingItem?.title}`}
        description="Mở ứng dụng Mobile Banking của bạn (Vietcombank, MB, Techcombank, VPBank...) để quét mã chuyển tiền."
      >
        {payingItem && (
          <div className="py-2 flex flex-col items-center text-center space-y-4">
            {!isSuccess ? (
              <>
                {/* Khung Mã QR */}
                <div className="p-3 bg-white border-2 border-slate-200 rounded-2xl shadow-lg relative group">
                  <img
                    src={`https://img.vietqr.io/image/970422-113000889999-compact2.png?amount=${payingItem.amount}&addInfo=${encodeURIComponent(
                      payingItem.code
                    )}&accountName=${encodeURIComponent(payingItem.bankAccount.accountHolder)}`}
                    alt="VietQR"
                    className="w-56 h-56 rounded-xl object-contain"
                  />
                  <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] font-bold text-indigo-600">
                    <ShieldCheck className="w-4 h-4" />
                    Chuyển Khoản An Toàn Napas247
                  </div>
                </div>

                {/* Hộp Thông Tin Chuyển Khoản kèm Nút Sao Chép Nhanh */}
                <div className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 p-4 text-xs space-y-2.5 text-left border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Ngân hàng thụ hưởng:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {payingItem.bankAccount.bankName}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Số tài khoản:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-base text-indigo-600 dark:text-indigo-400">
                        {payingItem.bankAccount.accountNumber}
                      </span>
                      <button
                        onClick={() => handleCopyText(payingItem.bankAccount.accountNumber, 'acc')}
                        className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 cursor-pointer"
                        title="Sao chép số tài khoản"
                      >
                        {copiedField === 'acc' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Tên người thụ hưởng:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {payingItem.bankAccount.accountHolder}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Số tiền:</span>
                    <span className="font-black text-base text-emerald-600">
                      {formatMoney(payingItem.amount)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-1 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500">Nội dung chuyển khoản (bắt buộc):</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                        {payingItem.code}
                      </span>
                      <button
                        onClick={() => handleCopyText(payingItem.code, 'code')}
                        className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 cursor-pointer"
                        title="Sao chép nội dung"
                      >
                        {copiedField === 'code' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleConfirmPaid}
                  disabled={isVerifying}
                  className="w-full justify-center bg-cyan-600 hover:bg-cyan-500 font-bold py-3 text-sm rounded-xl cursor-pointer"
                  leftIcon={
                    isVerifying ? (
                      <span className="animate-spin mr-1">⏳</span>
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )
                  }
                >
                  {isVerifying ? 'Đang Kiểm Tra Với Ngân Hàng...' : 'Tôi Đã Hoàn Tất Chuyển Khoản'}
                </Button>
              </>
            ) : (
              <div className="py-6 flex flex-col items-center space-y-3">
                <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Thanh Toán Học Phí Thành Công!
                </h3>
                <p className="text-xs text-slate-500 max-w-sm">
                  Khoản thu <b className="text-slate-800 dark:text-slate-200">{payingItem.title}</b> đã được hệ thống gạch nợ thành công. Biên lai điện tử có chữ ký số đã được xuất.
                </p>
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const updated = { ...payingItem, status: 'PAID' as const };
                      setPayingItem(null);
                      setReceiptItem(updated);
                    }}
                  >
                    Xem Biên Lai Ngay
                  </Button>
                  <Button onClick={() => setPayingItem(null)} variant="primary">
                    Hoàn Tất
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Dialog>

      {/* MODAL BIÊN LAI THU TIỀN ĐIỆN TỬ CHUẨN PHÁP LÝ NHÀ TRƯỜNG */}
      <Dialog
        isOpen={!!receiptItem}
        onClose={() => setReceiptItem(null)}
        className="!shadow-none"
      >
        {receiptItem && (
          <div className="relative bg-[#f8fafc] dark:bg-slate-900 rounded-3xl overflow-hidden p-6 sm:p-8 space-y-6 font-sans border border-slate-200 dark:border-slate-800 w-full max-w-[540px] mx-auto">
            {/* Header Biên Lai */}
            <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-xl bg-cyan-600 flex items-center justify-center text-white font-black text-xl shadow-md">
                  S
                </div>
                <div className="text-left">
                  <p className="font-black text-lg text-slate-900 dark:text-white leading-tight">Schoolify Pay</p>
                  <p className="text-[10px] text-slate-500 font-medium">Hệ thống biên lai điện tử ngành giáo dục</p>
                </div>
              </div>

              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider mt-3">
                Biên Lai Thu Học Phí Điện Tử
              </h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5">Số tham chiếu: {receiptItem.code}</p>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold mt-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                ĐÃ HOÀN TẤT THANH TOÁN
              </div>
            </div>

            {/* Thông tin học sinh & Đơn vị thu */}
            <div className="grid grid-cols-2 gap-4 text-xs py-2">
              <div>
                <span className="text-slate-400 block mb-0.5">Học sinh nộp phí:</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm">{activeChild.name}</p>
                <p className="text-slate-500">{activeChild.className}</p>
                <p className="text-slate-500">{activeChild.schoolName}</p>
              </div>

              <div className="text-right">
                <span className="text-slate-400 block mb-0.5">Chi tiết hóa đơn:</span>
                <p className="text-slate-600 dark:text-slate-300">
                  Ngày thu: <b>{receiptItem.paidAt ? new Date(receiptItem.paidAt).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN')}</b>
                </p>
                <p className="text-slate-500">Phương thức: <b>VietQR Napas247</b></p>
                <p className="text-slate-500">Trạng thái: <b className="text-emerald-600">Hợp lệ</b></p>
              </div>
            </div>

            {/* Bảng kê chi tiết các mục thu */}
            <div className="space-y-2">
              <div className="py-2 flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider border-t border-b border-slate-200 dark:border-slate-700">
                <span>Nội dung khoản thu</span>
                <span>Thành tiền</span>
              </div>

              <div className="space-y-1.5 py-1">
                {receiptItem.details.map((detail, idx) => (
                  <div key={idx} className="flex justify-between text-xs text-slate-700 dark:text-slate-300">
                    <span>{detail.label}</span>
                    <span className="font-semibold">{formatMoney(detail.amount)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Tổng Cộng Thực Thu:
                </span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  {formatMoney(receiptItem.amount)}
                </span>
              </div>
            </div>

            {/* Dấu mộc & Chữ ký số điện tử */}
            <div className="pt-2 pb-1 border-t border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-between text-xs">
              <div className="space-y-1">
                <p className="font-bold text-slate-700 dark:text-slate-300">Đơn vị thụ hưởng:</p>
                <p className="text-[11px] text-slate-500">{receiptItem.bankAccount.accountHolder}</p>
                <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Ký số bởi Schoolify Payment Gateway
                </p>
              </div>

              <div className="text-right">
                <div className="w-20 h-20 rounded-full border-2 border-rose-500/80 text-rose-600 flex flex-col items-center justify-center font-bold text-[9px] uppercase tracking-tighter transform rotate-[-8deg] p-1 shadow-xs ml-auto">
                  <span>★ ĐÃ THU TIỀN ★</span>
                  <span className="text-[8px] font-mono mt-0.5">SCHOOLIFY</span>
                  <span className="text-[7px] text-slate-500">PAID & VERIFIED</span>
                </div>
              </div>
            </div>

            {/* Nút hành động */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 font-bold"
                leftIcon={<Printer className="w-4 h-4" />}
                onClick={() => window.print()}
              >
                In Biên Lai
              </Button>
              <Button
                variant="primary"
                className="flex-1 font-bold bg-cyan-600 hover:bg-cyan-500"
                onClick={() => setReceiptItem(null)}
              >
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
