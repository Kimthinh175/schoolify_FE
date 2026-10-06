'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, MessageSquare, ThumbsUp, Eye, CheckCircle2,
  Image as ImageIcon, Send, User, MoreVertical, X, Clock,
  Share2, Flag, Paperclip
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Dữ liệu giả lập (Mock)
const MOCK_TOPIC = {
  id: 'topic-1',
  title: 'Giúp em giải bài toán hình học không gian lớp 11 với ạ!',
  content: 'Cho hình chóp S.ABCD có đáy ABCD là hình vuông cạnh a, SA vuông góc với mặt phẳng đáy và SA = a√2. Gọi M, N lần lượt là trung điểm của SB và SD. Tính khoảng cách từ đỉnh A đến mặt phẳng (CMN).\n\nEm đã thử dùng phương pháp tọa độ nhưng phương trình mặt phẳng ra lẻ quá. Có cách nào dùng hình học thuần túy nhanh hơn không ạ? Em cảm ơn!',
  author: {
    name: 'Nguyễn Văn A',
    role: 'STUDENT',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d'
  },
  tags: ['Toán 11', 'Hình học không gian', 'Khoảng cách'],
  views: 245,
  likes: 12,
  comments_count: 3,
  created_at: '2 giờ trước',
  status: 'OPEN'
};

const MOCK_COMMENTS = [
  {
    id: 'cmt-1',
    author: {
      name: 'Thầy Trần B',
      role: 'TEACHER',
      avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d'
    },
    content: 'Chào em, với bài toán này em nên dùng phương pháp thể tích (tỉ số thể tích) sẽ nhanh hơn rất nhiều so với phương pháp tọa độ. \n\nGợi ý: Em tính thể tích của khối chóp S.ABCD rồi dùng tỉ số thể tích để tìm thể tích S.CMN. Sau đó tính diện tích tam giác CMN để suy ra khoảng cách nhé.',
    likes: 8,
    is_accepted: true,
    created_at: '1 giờ trước',
    image: null
  },
  {
    id: 'cmt-2',
    author: {
      name: 'Lê Thị C',
      role: 'STUDENT',
      avatar: 'https://i.pravatar.cc/150?u=a04258a2462d826712d'
    },
    content: 'Mình vừa giải xong bài này. Gửi bạn hình vẽ và các bước giải chi tiết nhé. Mình dùng phương pháp kẻ đường phụ vuông góc.',
    likes: 3,
    is_accepted: false,
    created_at: '45 phút trước',
    image: 'https://images.unsplash.com/photo-1632516643720-e7f5d7d6ecc9?q=80&w=800&auto=format&fit=crop'
  }
];

export default function ForumTopicDetail() {
  const [replyText, setReplyText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const imgUrl = URL.createObjectURL(e.target.files[0]);
      setSelectedImage(imgUrl);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  return (
    <div className="space-y-6">
        {/* Tiêu đề trang (Page Header) */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Diễn Đàn Thảo Luận
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Nơi giao lưu, trao đổi kiến thức và hỗ trợ giải đáp bài tập cùng cộng đồng học sinh, giáo viên.
          </p>
        </div>

        {/* Thanh điều hướng (Breadcrumb) */}
        <div className="flex items-center gap-2 mb-6 text-sm text-slate-500 dark:text-slate-400">
          <Link href="/forum" className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition-colors">
            Diễn đàn
          </Link>
          <span>/</span>
          <Link href="/forum?category=math" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Toán học
          </Link>
          <span>/</span>
          <span className="text-slate-800 dark:text-slate-200 font-medium truncate">Chi tiết thảo luận</span>
        </div>

        {/* Bài viết gốc */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 md:p-8">
              {/* Thẻ phân loại (Tags) */}
              <div className="flex flex-wrap gap-2 mb-4">
                {MOCK_TOPIC.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-medium rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Tiêu đề */}
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                {MOCK_TOPIC.title}
              </h1>

              {/* Thông tin tác giả */}
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <img src={MOCK_TOPIC.author.avatar} alt="Avatar" className="w-12 h-12 rounded-full ring-2 ring-white dark:ring-slate-800 shadow-sm object-cover" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white">{MOCK_TOPIC.author.name}</span>
                      <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] uppercase font-bold rounded">
                        {MOCK_TOPIC.author.role}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {MOCK_TOPIC.created_at}</span>
                    </div>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-4 text-slate-500 text-sm">
                  <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" /> {MOCK_TOPIC.views}</span>
                  <span className="flex items-center gap-1.5"><MessageSquare className="w-4 h-4" /> {MOCK_TOPIC.comments_count}</span>
                </div>
              </div>

              {/* Nội dung bài viết */}
              <div className="prose prose-slate dark:prose-invert max-w-none mb-8 whitespace-pre-line text-slate-700 dark:text-slate-300">
                {MOCK_TOPIC.content}
              </div>

              {/* Các nút tương tác */}
              <div className="flex items-center justify-between pt-4">
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-900/40 text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 rounded-xl transition-all font-medium text-sm">
                  <ThumbsUp className="w-4 h-4" /> <span>Thích ({MOCK_TOPIC.likes})</span>
                </button>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20">
                    <Flag className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Danh sách câu trả lời */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-500" />
              {MOCK_TOPIC.comments_count} Câu trả lời
            </h3>

            {MOCK_COMMENTS.map((comment) => (
              <div
                key={comment.id}
                className={cn(
                  "bg-white dark:bg-slate-900 rounded-2xl shadow-sm border overflow-hidden",
                  comment.is_accepted ? "border-emerald-200 dark:border-emerald-900/50 ring-1 ring-emerald-50 dark:ring-emerald-900/20" : "border-slate-200 dark:border-slate-800"
                )}
              >
                {comment.is_accepted && (
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 px-6 py-2 border-b border-emerald-100 dark:border-emerald-900/50 flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4" /> Câu trả lời đã được phê duyệt
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <img src={comment.author.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 dark:text-white text-sm">{comment.author.name}</span>
                          <span className={cn(
                            "px-1.5 py-0.5 text-[9px] uppercase font-bold rounded",
                            comment.author.role === 'TEACHER' ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          )}>
                            {comment.author.role}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500">{comment.created_at}</span>
                      </div>
                    </div>
                    <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 whitespace-pre-line mb-4">
                    {comment.content}
                  </div>

                  {comment.image && (
                    <div className="mb-4 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 relative group cursor-pointer max-w-md">
                      <img src={comment.image} alt="Solution attachment" className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Eye className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm font-medium transition-colors">
                      <ThumbsUp className="w-4 h-4" /> {comment.likes}
                    </button>
                    <button className="text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm font-medium transition-colors">
                      Phản hồi
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Hộp thoại phản hồi (Gửi Lời Giải Kèm Ảnh) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-1 relative overflow-hidden mt-8">
            <div className="p-5 pb-2">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Gửi lời giải của bạn</h4>
              <textarea
                className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none min-h-[120px]"
                placeholder="Nhập nội dung lời giải chi tiết (hỗ trợ Markdown)..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />

              {/* Khu vực xem trước ảnh */}
              {selectedImage && (
                <div className="mt-4 relative inline-block">
                  <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 w-48 h-32 relative">
                    <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <button
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-1 shadow-md transition-transform hover:scale-110"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="px-5 py-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/50 mt-2 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="image-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <label
                  htmlFor="image-upload"
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Đính kèm ảnh giải</span>
                </label>
                <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800" title="Đính kèm tệp">
                  <Paperclip className="w-4 h-4" />
                </button>
              </div>
              <button
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm transition-all",
                  replyText.trim() || selectedImage
                    ? "bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/25"
                    : "bg-slate-300 dark:bg-slate-700 cursor-not-allowed"
                )}
                disabled={!replyText.trim() && !selectedImage}
              >
                <span>Gửi lời giải</span>
                <Send className="w-4 h-4" />
              </button>
            </div>
            </div>
    </div>
  );
}
