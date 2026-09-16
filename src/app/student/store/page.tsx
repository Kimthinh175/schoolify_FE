'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Sparkles,
  Gift,
  Award,
  CheckCircle2,
  Tag,
  Copy,
  Search,
  Filter,
  Package,
  Layers,
  ArrowRight,
  Info,
  Clock,
  Shirt,
  Percent,
  Check,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabItem } from '@/components/ui/tabs';
import { StoreItem, StudentInventory, StoreItemType } from '@/types/store';

// Mock Initial Store Items
const INITIAL_STORE_ITEMS: StoreItem[] = [
  {
    id: 'item-01',
    name: 'Voucher Giảm 50% Khóa Học IELTS Academic 7.5+',
    description: 'Áp dụng giảm 50% học phí khi đăng ký khóa học luyện thi IELTS nâng cao trong kỳ này.',
    points_required: 500,
    type: 'VOUCHER',
    discount_value_pct: 50,
    image_url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&auto=format&fit=crop&q=80',
    quantity_available: 12,
    status: 'ACTIVE',
    created_at: '2026-09-01',
  },
  {
    id: 'item-02',
    name: 'Huy Hiệu "Thợ Săn Điểm 10 Lượng Giác"',
    description: 'Huy hiệu danh dự hiển thị nổi bật trên hồ sơ cá nhân và bảng xếp hạng học sinh toàn trường.',
    points_required: 300,
    type: 'BADGE',
    image_url: 'https://images.unsplash.com/photo-1614680376593-902f749f7b64?w=600&auto=format&fit=crop&q=80',
    quantity_available: 50,
    status: 'ACTIVE',
    created_at: '2026-09-02',
  },
  {
    id: 'item-03',
    name: 'Giao Diện Theme Cyberpunk Neon Cho Dashboard',
    description: 'Mở khóa chủ đề giao diện Cyberpunk Neon rực rỡ độc quyền cho trang cá nhân học sinh.',
    points_required: 700,
    type: 'THEME',
    image_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
    quantity_available: 5,
    status: 'ACTIVE',
    created_at: '2026-09-03',
  },
  {
    id: 'item-04',
    name: 'Voucher Giảm 30% Đặt Mua Lớp Chuyên Đề Toán 11',
    description: 'Ưu đãi giảm 30% khi đăng ký thêm chuyên đề Toán 11 Thống kê & Lượng giác nâng cao.',
    points_required: 350,
    type: 'VOUCHER',
    discount_value_pct: 30,
    image_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80',
    quantity_available: 20,
    status: 'ACTIVE',
    created_at: '2026-09-05',
  },
  {
    id: 'item-05',
    name: 'Áo Phông Đồng Phục CLB Tin Học Schoolify',
    description: 'Áo thun cotton cao cấp in hình logo CLB Lập Trình & AI Schoolify phiên bản giới hạn.',
    points_required: 1200,
    type: 'OTHER',
    image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
    quantity_available: 0,
    status: 'SOLDOUT',
    created_at: '2026-08-28',
  },
  {
    id: 'item-06',
    name: 'Huy Hiệu "Bậc Thầy Chuyên Cần 30 Ngày"',
    description: 'Huy hiệu trao tặng cho học viên có chuỗi điểm danh và hoàn thành bài tập 30 ngày liên tục.',
    points_required: 400,
    type: 'BADGE',
    image_url: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=600&auto=format&fit=crop&q=80',
    quantity_available: 100,
    status: 'ACTIVE',
    created_at: '2026-09-08',
  },
];

// Initial Student Inventory Items (Balo đồ)
const INITIAL_INVENTORY: StudentInventory[] = [
  {
    id: 'inv-101',
    student_id: 'std-01',
    item_id: 'item-01',
    item: INITIAL_STORE_ITEMS[0],
    code: 'IELTS50-DISCOUNT-9921',
    is_used: false,
    acquired_at: '10/09/2026',
  },
  {
    id: 'inv-102',
    student_id: 'std-01',
    item_id: 'item-02',
    item: INITIAL_STORE_ITEMS[1],
    code: 'BADGE-MATH-TOP10',
    is_used: true,
    acquired_at: '05/09/2026',
    used_at: '06/09/2026',
  },
];

export default function StudentStorePage() {
  // Student Profile State
  const [points, setPoints] = useState<number>(850);
  
  // Store & Inventory State
  const [storeItems, setStoreItems] = useState<StoreItem[]>(INITIAL_STORE_ITEMS);
  const [inventory, setInventory] = useState<StudentInventory[]>(INITIAL_INVENTORY);
  
  // Active Tab: 'store' (Cửa hàng) vs 'inventory' (Balo đồ)
  const [mainTab, setMainTab] = useState<string>('store');
  const [itemTypeFilter, setItemTypeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Redeem Modal & Copy States
  const [selectedItemToRedeem, setSelectedItemToRedeem] = useState<StoreItem | null>(null);
  const [justRedeemedItem, setJustRedeemedItem] = useState<{ item: StoreItem; code: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);

  // Filtered store items
  const filteredStoreItems = useMemo(() => {
    return storeItems.filter((item) => {
      if (itemTypeFilter !== 'ALL' && item.type !== itemTypeFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc) return false;
      }
      return true;
    });
  }, [storeItems, itemTypeFilter, searchQuery]);

  // Handle opening confirmation modal
  const handleOpenRedeemModal = (item: StoreItem) => {
    setSelectedItemToRedeem(item);
    setIsConfirmModalOpen(true);
  };

  // Handle actual redemption logic
  const handleConfirmRedeem = () => {
    if (!selectedItemToRedeem) return;

    if (points < selectedItemToRedeem.points_required) {
      alert('Số dư điểm thưởng của bạn không đủ để đổi vật phẩm này!');
      return;
    }

    if (selectedItemToRedeem.quantity_available <= 0) {
      alert('Vật phẩm này đã hết hàng!');
      return;
    }

    // 1. Deduct points
    setPoints((prev) => prev - selectedItemToRedeem.points_required);

    // 2. Decrement stock in store
    setStoreItems((prev) =>
      prev.map((item) => {
        if (item.id === selectedItemToRedeem.id) {
          const newQty = item.quantity_available - 1;
          return {
            ...item,
            quantity_available: newQty,
            status: newQty === 0 ? 'SOLDOUT' : item.status,
          };
        }
        return item;
      })
    );

    // 3. Generate unique voucher code or badge code
    const generatedCode = `SCH-${selectedItemToRedeem.type}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 4. Add item to StudentInventory (Balo đồ)
    const newInventoryItem: StudentInventory = {
      id: `inv-${Date.now()}`,
      student_id: 'std-01',
      item_id: selectedItemToRedeem.id,
      item: selectedItemToRedeem,
      code: generatedCode,
      is_used: false,
      acquired_at: new Date().toLocaleDateString('vi-VN'),
    };

    setInventory((prev) => [newInventoryItem, ...prev]);

    // 5. Close confirm modal & open success feedback
    setIsConfirmModalOpen(false);
    setJustRedeemedItem({ item: selectedItemToRedeem, code: generatedCode });
    setIsSuccessModalOpen(true);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const mainTabs: TabItem[] = [
    { id: 'store', label: 'Cửa Hàng Đổi Quà', badge: storeItems.filter(i => i.status === 'ACTIVE').length },
    { id: 'inventory', label: 'Balo Đồ Đã Đổi', badge: inventory.length },
  ];

  const getTypeBadge = (type: StoreItemType) => {
    switch (type) {
      case 'VOUCHER':
        return <Badge variant="purple" icon={<Tag className="w-3 h-3" />}>Voucher</Badge>;
      case 'BADGE':
        return <Badge variant="success" icon={<Award className="w-3 h-3" />}>Huy Hiệu</Badge>;
      case 'THEME':
        return <Badge variant="primary" icon={<Sparkles className="w-3 h-3" />}>Giao Diện</Badge>;
      default:
        return <Badge variant="secondary" icon={<Gift className="w-3 h-3" />}>Quà Tặng</Badge>;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Gamification Wallet & Store Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="primary" className="bg-white/20 text-white font-bold backdrop-blur-xs">
                Ví Gamification
              </Badge>
              <span className="text-xs text-amber-100 font-medium">Học sinh Võ Ngọc Minh • Khối 11</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Cửa Hàng Đổi Thưởng & Túi Đồ Học Sinh 🎁
            </h1>
            <p className="text-xs sm:text-sm text-amber-100 max-w-xl">
              Tích lũy điểm thưởng từ việc hoàn thành bài tập, điểm cao bài thi và tham gia học tập tích cực để đổi quà độc quyền!
            </p>
          </div>

          {/* Points Balance Box */}
          <div className="rounded-2xl bg-white/15 backdrop-blur-md p-5 border border-white/25 flex items-center justify-between sm:justify-start gap-4 shrink-0 shadow-lg">
            <div className="h-14 w-14 rounded-2xl bg-white text-amber-600 flex items-center justify-center font-bold text-2xl shadow-md">
              💎
            </div>
            <div>
              <span className="text-xs text-amber-100 uppercase font-extrabold tracking-wider">Ví Điểm Hiện Tại</span>
              <p className="text-3xl font-black text-white leading-none mt-0.5">{points} <span className="text-base font-bold">Điểm</span></p>
              <span className="text-[11px] text-amber-200 mt-1 block">Tích thêm điểm qua bài thi & bài tập</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Switcher: Store vs Inventory */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <Tabs tabs={mainTabs} activeTab={mainTab} onChange={setMainTab} variant="pill" />

          {/* Controls for Store tab */}
          {mainTab === 'store' && (
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="w-full sm:w-64">
                <Input
                  placeholder="Tìm kiếm vật phẩm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="w-4 h-4" />}
                  className="bg-white dark:bg-slate-900"
                />
              </div>

              <div className="relative w-full sm:w-44">
                <select
                  value={itemTypeFilter}
                  onChange={(e) => setItemTypeFilter(e.target.value)}
                  className="w-full h-10 px-3.5 pr-8 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-amber-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 cursor-pointer appearance-none"
                >
                  <option value="ALL">Tất cả loại quà</option>
                  <option value="VOUCHER">Voucher giảm giá</option>
                  <option value="BADGE">Huy hiệu thành tích</option>
                  <option value="THEME">Giao diện độc quyền</option>
                  <option value="OTHER">Quà tặng hiện vật</option>
                </select>
                <Filter className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          )}
        </div>

        {/* TAB 1: CỬA HÀNG ĐỔI QUÀ (STORE) */}
        {mainTab === 'store' && (
          <div>
            {filteredStoreItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStoreItems.map((item) => {
                  const isSoldOut = item.quantity_available <= 0 || item.status === 'SOLDOUT';
                  const hasEnoughPoints = points >= item.points_required;

                  return (
                    <Card
                      key={item.id}
                      className="p-0 overflow-hidden flex flex-col justify-between group hover:shadow-xl transition-all border-slate-200/80 dark:border-slate-800"
                    >
                      {/* Image header */}
                      <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <img
                          src={item.image_url || 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop&q=80'}
                          alt={item.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-60" />

                        {/* Item Type Badge */}
                        <div className="absolute top-3 left-3">
                          {getTypeBadge(item.type)}
                        </div>

                        {/* Stock Badge */}
                        <div className="absolute top-3 right-3">
                          {isSoldOut ? (
                            <Badge variant="danger" className="font-bold">Hết hàng</Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-slate-900/80 text-white backdrop-blur-md font-bold">
                              Còn {item.quantity_available} quà
                            </Badge>
                          )}
                        </div>

                        {/* Points badge overlay */}
                        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-amber-500 text-white font-extrabold px-3 py-1 rounded-xl shadow-md text-xs">
                          <span>💎 {item.points_required} Điểm</span>
                        </div>
                      </div>

                      {/* Content Body */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                            {item.name}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 font-medium">Yêu cầu điểm ví:</span>
                            <span className={`font-bold ${hasEnoughPoints ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                              {item.points_required} / {points} Điểm
                            </span>
                          </div>

                          <Button
                            className="w-full justify-center"
                            variant={isSoldOut ? 'ghost' : hasEnoughPoints ? 'primary' : 'outline'}
                            disabled={isSoldOut || !hasEnoughPoints}
                            onClick={() => handleOpenRedeemModal(item)}
                            leftIcon={isSoldOut ? undefined : <Gift className="w-4 h-4" />}
                          >
                            {isSoldOut
                              ? 'Đã Hết Hàng'
                              : !hasEnoughPoints
                              ? 'Chưa Đủ Điểm Đổi'
                              : 'Đổi Quà Ngay'}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="py-16 text-center bg-slate-50/50 dark:bg-slate-900/20 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
                <Package className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Không tìm thấy quà phù hợp</h3>
                <p className="text-xs text-slate-500">Thử thay đổi từ khóa hoặc bộ lọc danh mục quà tặng.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: BALO ĐỒ ĐÃ ĐỔI (STUDENT INVENTORY) */}
        {mainTab === 'inventory' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Túi Đồ Vật Phẩm Của Tôi</h2>
                <p className="text-xs text-slate-500">Danh sách voucher, huy hiệu và quà tặng bạn đã đổi thành công.</p>
              </div>
              <Badge variant="purple" className="font-bold">
                {inventory.length} Vật Phẩm Sở Hữu
              </Badge>
            </div>

            {inventory.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {inventory.map((inv) => (
                  <Card key={inv.id} className="p-5 flex flex-col sm:flex-row gap-4 justify-between items-center border-slate-200/80 dark:border-slate-800">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <img
                        src={inv.item.image_url || 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop&q=80'}
                        alt={inv.item.name}
                        className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {getTypeBadge(inv.item.type)}
                          <span className="text-[11px] text-slate-400 font-medium">Đã đổi: {inv.acquired_at}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                          {inv.item.name}
                        </h4>
                        {inv.code && (
                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                              {inv.code}
                            </span>
                            <button
                              onClick={() => handleCopyCode(inv.code!)}
                              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                              title="Sao chép mã"
                            >
                              {copiedCode === inv.code ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="w-full sm:w-auto shrink-0 text-right space-y-2">
                      {inv.is_used ? (
                        <Badge variant="secondary" className="w-full sm:w-auto justify-center">
                          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" /> Đã Sử Dụng
                        </Badge>
                      ) : (
                        <Badge variant="success" className="w-full sm:w-auto justify-center font-bold">
                          Sẵn Sàng Dùng
                        </Badge>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center bg-slate-50/50 dark:bg-slate-900/20 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Balo đồ của bạn đang trống</h3>
                <p className="text-xs text-slate-500">Hãy tích lũy điểm và đổi quà đầu tiên của bạn tại Cửa Hàng!</p>
                <Button variant="outline" size="sm" onClick={() => setMainTab('store')}>
                  Khám phá Cửa Hàng
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL 1: CONFIRMATION MODAL */}
      <Dialog
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Xác Nhận Đổi Quà Thưởng"
        description="Vui lòng kiểm tra lại số điểm tiêu tốn trước khi tiến hành đổi vật phẩm."
      >
        {selectedItemToRedeem && (
          <div className="space-y-5 pt-2">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50">
              <img
                src={selectedItemToRedeem.image_url}
                alt={selectedItemToRedeem.name}
                className="w-16 h-16 rounded-xl object-cover shrink-0 border border-amber-200 dark:border-amber-800"
              />
              <div className="space-y-1">
                <Badge variant="warning" className="text-[10px] font-bold">
                  {selectedItemToRedeem.type}
                </Badge>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {selectedItemToRedeem.name}
                </h4>
                <p className="text-xs text-amber-700 dark:text-amber-300 font-extrabold">
                  💎 Giá đổi: {selectedItemToRedeem.points_required} Điểm
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl">
              <div className="flex justify-between">
                <span>Số dư điểm hiện tại:</span>
                <span className="font-bold text-slate-900 dark:text-white">{points} Điểm</span>
              </div>
              <div className="flex justify-between">
                <span>Điểm sau khi đổi:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {points - selectedItemToRedeem.points_required} Điểm
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setIsConfirmModalOpen(false)}>
                Hủy Bỏ
              </Button>
              <Button variant="primary" onClick={handleConfirmRedeem}>
                Xác Nhận Đổi Quà
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* MODAL 2: SUCCESS FEEDBACK MODAL */}
      <Dialog
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Đổi Quà Thành Công! 🎉"
        description="Vật phẩm đã được thêm trực tiếp vào Balo đồ của bạn."
      >
        {justRedeemedItem && (
          <div className="space-y-6 pt-2 text-center">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                {justRedeemedItem.item.name}
              </h3>
              <p className="text-xs text-slate-500">
                Mã vật phẩm sở hữu của bạn:
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-2 text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 px-4 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800">
                  {justRedeemedItem.code}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="outline"
                className="w-full justify-center"
                onClick={() => setIsSuccessModalOpen(false)}
              >
                Tiếp Tục Đổi Quà
              </Button>
              <Button
                variant="primary"
                className="w-full justify-center"
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  setMainTab('inventory');
                }}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Xem Balo Đồ Ngay
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
