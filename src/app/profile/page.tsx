'use client';

import * as React from 'react';
import { User, Mail, Phone, MapPin, Building, ShieldCheck, Camera, Save, CheckCircle2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/auth.store';

export default function ProfileSettingsPage() {
  const { user, currentRole } = useAuthStore();

  const [fullname, setFullname] = React.useState(user?.fullname || 'Nguyễn Hoàng Minh');
  const [email, setEmail] = React.useState(user?.email || 'student.minh@schoolify.edu.vn');
  const [phone, setPhone] = React.useState('0987 654 321');
  const [address, setAddress] = React.useState('TP. Hồ Chí Minh, Việt Nam');
  const [bio, setBio] = React.useState('Học sinh Lớp 11A1 THPT Chuyên Công Nghệ Schoolify. Đam mê Toán học & Tiếng Anh.');
  
  const [savedSuccess, setSavedSuccess] = React.useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'STUDENT': return 'Học Sinh K-12';
      case 'TEACHER': return 'Giáo Viên / Creator';
      case 'PARENT': return 'Phụ Huynh Học Sinh';
      case 'PRINCIPAL': return 'Ban Giám Hiệu';
      case 'SUPER_ADMIN': return 'Quản Trị Hệ Thống';
      default: return 'Học Sinh K-12';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      {/* ── Page Header ── */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6F8FC] dark:bg-[#00B8DD]/15 text-xs font-bold text-[#007D99] dark:text-[#00B8DD] mb-2">
          <User className="w-3.5 h-3.5 text-[#00B8DD]" />
          <span>Tài Khoản & Cá Nhân</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Chỉnh Sửa Hồ Sơ Cá Nhân
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Cập nhật thông tin tài khoản, avatar và thông tin liên hệ của bạn trên Schoolify.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>Đã lưu thay đổi hồ sơ cá nhân thành công!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: Avatar & Quick Info */}
        <Card className="p-6 border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <Avatar
                src={user?.avatar_url || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80'}
                alt={fullname}
                size="xl"
                className="w-24 h-24 sm:w-28 sm:h-28 text-2xl border-4 border-[#00B8DD]/20"
              />
              <button
                type="button"
                className="absolute bottom-0 right-0 p-2 rounded-full bg-[#00B8DD] text-slate-950 hover:bg-[#009BBD] transition-all shadow-md cursor-pointer"
                title="Đổi ảnh đại diện"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center sm:text-left space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{fullname}</h3>
                <Badge variant="primary" className="bg-[#00B8DD] text-slate-950 font-bold text-[10px]">
                  {getRoleLabel(currentRole)}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{email}</p>
              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-[#00B8DD]" /> THPT Chuyên Công Nghệ Schoolify
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Tài khoản đã xác thực
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Card 2: Detailed Personal Form */}
        <Card className="p-6 border-slate-200 dark:border-slate-800 space-y-5">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            Thông Tin Chi Tiết
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Họ và tên
              </label>
              <Input
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                leftIcon={<User className="w-4 h-4 text-[#00B8DD]" />}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Địa chỉ Email
              </label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4 text-[#00B8DD]" />}
                type="email"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Số điện thoại
              </label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                leftIcon={<Phone className="w-4 h-4 text-[#00B8DD]" />}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Tỉnh / Thành phố
              </label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                leftIcon={<MapPin className="w-4 h-4 text-[#00B8DD]" />}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Giới thiệu ngắn (Bio)
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#00B8DD]"
              placeholder="Nhập giới thiệu ngắn về bản thân..."
            />
          </div>
        </Card>

        {/* Action Button */}
        <div className="flex justify-end gap-3">
          <Button
            type="submit"
            variant="primary"
            className="bg-[#00B8DD] hover:bg-[#009BBD] text-slate-950 font-bold px-6"
            leftIcon={<Save className="w-4 h-4" />}
          >
            Lưu Thay Đổi Hồ Sơ
          </Button>
        </div>
      </form>
    </div>
  );
}
