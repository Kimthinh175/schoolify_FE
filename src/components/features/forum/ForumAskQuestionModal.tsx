'use client';

import * as React from 'react';
import {
  Sparkles,
  Image as ImageIcon,
  X,
  Upload,
  Eye,
  Edit3,
  Columns,
  AlertCircle,
  CheckCircle2,
  Send,
  BookOpen,
  GraduationCap,
  Tag,
  Sigma,
} from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MathRenderer } from '@/components/ui/math-renderer';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  CreateForumPostPayload,
  ForumPost,
  forumService,
} from '@/services/forum.service';

export interface ForumAskQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: (post: ForumPost) => void;
  defaultSubject?: string;
  defaultGrade?: number;
}

export interface MathToolbarSnippet {
  id: string;
  label: string;
  name: string;
  latex: string;
  minGrade: 10 | 11 | 12; // Khối lớp bắt đầu học công thức này (VD: 10 -> Lớp 10, 11, 12 đều thấy; 12 -> Chỉ Lớp 12 thấy)
  subjects: string[];     // Môn học áp dụng
}

/**
 * Ngân hàng công thức & ký hiệu chuyên biệt theo từng Môn học và luỹ tiến theo Khối lớp (10 -> 11 -> 12) chuẩn GDPT 2018
 * - Chọn Khối 10: Chỉ hiện kiến thức tới Lớp 10 (minGrade <= 10)
 * - Chọn Khối 11: Hiện kiến thức Lớp 10 + 11 (minGrade <= 11)
 * - Chọn Khối 12: Hiện đầy đủ Lớp 10 + 11 + 12 (minGrade <= 12)
 */
export const FORUM_LATEX_TOOLBAR_ITEMS: MathToolbarSnippet[] = [
  // ======================== 1. TOÁN HỌC ========================
  // Toán Lớp 10 (Đại số cơ bản, Tập hợp, Bất phương trình bậc 2, Vectơ, Tổ hợp)
  {
    id: 'math-fraction',
    label: 'a/b',
    name: 'Phân số',
    latex: '$\\frac{a}{b}$',
    minGrade: 10,
    subjects: ['Toán Học'],
  },
  {
    id: 'math-sqrt',
    label: '√x',
    name: 'Căn bậc hai',
    latex: '$\\sqrt{x}$',
    minGrade: 10,
    subjects: ['Toán Học'],
  },
  {
    id: 'math-nth-root',
    label: 'ⁿ√x',
    name: 'Căn bậc n',
    latex: '$\\sqrt[n]{x}$',
    minGrade: 10,
    subjects: ['Toán Học'],
  },
  {
    id: 'math-power',
    label: 'x²',
    name: 'Lũy thừa / Mũ',
    latex: '$x^2$',
    minGrade: 10,
    subjects: ['Toán Học'],
  },
  {
    id: 'math-delta',
    label: 'Δ = b²-4ac',
    name: 'Biệt thức Delta',
    latex: '$\\Delta = b^2 - 4ac \\ge 0$',
    minGrade: 10,
    subjects: ['Toán Học'],
  },
  {
    id: 'math-system-eq',
    label: '{ Hệ PT',
    name: 'Hệ phương trình',
    latex: '\n$$\\begin{cases} x + y = 2 \\\\ 2x - y = 1 \\end{cases}$$\n',
    minGrade: 10,
    subjects: ['Toán Học'],
  },
  {
    id: 'math-vector',
    label: 'v⃗',
    name: 'Vectơ & Tích vô hướng',
    latex: '$\\vec{a} \\cdot \\vec{b} = |\\vec{a}|\\cdot|\\vec{b}|\\cos(\\vec{a}, \\vec{b})$',
    minGrade: 10,
    subjects: ['Toán Học'],
  },
  {
    id: 'math-set',
    label: '∀x ∈ ℝ',
    name: 'Tập hợp & Mệnh đề',
    latex: '$\\forall x \\in [a; b],\\; A \\cap B = \\varnothing$',
    minGrade: 10,
    subjects: ['Toán Học'],
  },
  {
    id: 'math-comb',
    label: 'Cₙᵏ / Aₙᵏ',
    name: 'Tổ hợp - Chỉnh hợp (L10)',
    latex: '$C_n^k = \\frac{n!}{k!(n-k)!}$',
    minGrade: 10,
    subjects: ['Toán Học'],
  },

  // Toán Lớp 11 (Lượng giác, Dãy số, Giới hạn lim, Đạo hàm, Mũ & Logarit)
  {
    id: 'math-trig',
    label: 'sin / cos',
    name: 'Phương trình Lượng giác (L11)',
    latex: '$\\sin 2x = 2\\sin x\\cos x,\\; x = \\alpha + k2\\pi$',
    minGrade: 11,
    subjects: ['Toán Học'],
  },
  {
    id: 'math-sequence',
    label: 'uₙ = u₁+(n-1)d',
    name: 'Cấp số cộng / nhân (L11)',
    latex: '$u_n = u_1 + (n - 1)d,\\; S_n = \\frac{n(u_1 + u_n)}{2}$',
    minGrade: 11,
    subjects: ['Toán Học'],
  },
  {
    id: 'math-limit',
    label: 'lim',
    name: 'Giới hạn hàm số (L11)',
    latex: '$\\lim_{x \\to +\\infty} f(x)$',
    minGrade: 11,
    subjects: ['Toán Học'],
  },
  {
    id: 'math-derivative',
    label: "f'(x) ≥ 0",
    name: 'Đạo hàm (L11)',
    latex: "$f'(x) \\ge 0, \\forall x \\in (a; b)$",
    minGrade: 11,
    subjects: ['Toán Học'],
  },
  {
    id: 'math-log',
    label: 'logₐx',
    name: 'Logarit & Mũ (L11)',
    latex: '$\\log_{a}(xy) = \\log_{a}x + \\log_{a}y$',
    minGrade: 11,
    subjects: ['Toán Học'],
  },

  // Toán Lớp 12 (Nguyên hàm, Tích phân, Tọa độ Oxyz, Xác suất có điều kiện Bayes)
  {
    id: 'math-integral',
    label: '∫ f(x)dx',
    name: 'Tích phân xác định (L12)',
    latex: '$\\int_{a}^{b} f(x)\\,dx$',
    minGrade: 12,
    subjects: ['Toán Học'],
  },
  {
    id: 'math-primitive',
    label: '∫ f(x)',
    name: 'Nguyên hàm (L12)',
    latex: '$\\int f(x)\\,dx = F(x) + C$',
    minGrade: 12,
    subjects: ['Toán Học'],
  },
  {
    id: 'math-oxyz',
    label: 'Oxyz (mp)',
    name: 'Hình học Oxyz (L12)',
    latex: '$(P): Ax + By + Cz + D = 0,\\; \\vec{n} = (A; B; C)$',
    minGrade: 12,
    subjects: ['Toán Học'],
  },
  {
    id: 'math-bayes',
    label: 'P(A|B)',
    name: 'Xác suất điều kiện Bayes (L12)',
    latex: '$P(A|B) = \\frac{P(A \\cap B)}{P(B)}$',
    minGrade: 12,
    subjects: ['Toán Học'],
  },

  // ======================== 2. VẬT LÝ ========================
  // Vật Lý 10 (Động học, Định luật Newton, Công - Động năng - Thế năng, Động lượng)
  {
    id: 'phys-kinematics',
    label: 'v² - v₀² = 2as',
    name: 'Chuyển động biến đổi đều (L10)',
    latex: '$v^2 - v_0^2 = 2as,\\; s = v_0 t + \\frac{1}{2}at^2$',
    minGrade: 10,
    subjects: ['Vật Lý'],
  },
  {
    id: 'phys-newton',
    label: 'F⃗ = ma⃗',
    name: 'Định luật II Newton (L10)',
    latex: '$\\vec{F}_{hl} = m\\vec{a}$',
    minGrade: 10,
    subjects: ['Vật Lý'],
  },
  {
    id: 'phys-energy',
    label: 'Wđ = ½mv²',
    name: 'Động năng & Cơ năng (L10)',
    latex: '$W = W_đ + W_t = \\frac{1}{2}mv^2 + mgh$',
    minGrade: 10,
    subjects: ['Vật Lý'],
  },
  {
    id: 'phys-momentum',
    label: 'p⃗ = mv⃗',
    name: 'Bảo toàn Động lượng (L10)',
    latex: '$\\vec{p}_1 + \\vec{p}_2 = \\vec{p}_1\' + \\vec{p}_2\'$',
    minGrade: 10,
    subjects: ['Vật Lý'],
  },
  // Vật Lý 11 (Dao động điều hòa, Sóng cơ, Định luật Coulomb, Định luật Ohm)
  {
    id: 'phys-shm',
    label: 'x = Acos(ωt+φ)',
    name: 'Dao động điều hòa (L11)',
    latex: '$x = A\\cos(\\omega t + \\varphi),\\; \\omega = \\sqrt{\\frac{k}{m}} = \\frac{2\\pi}{T}$',
    minGrade: 11,
    subjects: ['Vật Lý'],
  },
  {
    id: 'phys-wave',
    label: 'λ = v·T = v/f',
    name: 'Bước sóng & Giao thoa (L11)',
    latex: '$\\lambda = vT = \\frac{v}{f},\\; d_2 - d_1 = k\\lambda$',
    minGrade: 11,
    subjects: ['Vật Lý'],
  },
  {
    id: 'phys-coulomb',
    label: 'F = k|q₁q₂|/r²',
    name: 'Lực tĩnh điện Coulomb (L11)',
    latex: '$F = k\\frac{|q_1 q_2|}{\\varepsilon r^2}$',
    minGrade: 11,
    subjects: ['Vật Lý'],
  },
  {
    id: 'phys-ohm',
    label: 'I = E/(R+r)',
    name: 'Định luật Ohm toàn mạch (L11)',
    latex: '$I = \\frac{\\mathcal{E}}{R_N + r},\\; U = I\\cdot R$',
    minGrade: 11,
    subjects: ['Vật Lý'],
  },
  // Vật Lý 12 (Vật lý nhiệt, Khí lý tưởng, Từ trường - Cảm ứng điện từ, Hạt nhân)
  {
    id: 'phys-thermal',
    label: 'ΔU = A + Q',
    name: 'Nguyên lý I Nhiệt động lực học (L12)',
    latex: '$\\Delta U = A + Q,\\; Q = mc\\Delta t$',
    minGrade: 12,
    subjects: ['Vật Lý'],
  },
  {
    id: 'phys-gas',
    label: 'pV = nRT',
    name: 'Phương trình Khí lý tưởng (L12)',
    latex: '$\\frac{pV}{T} = nR = \\text{const}$',
    minGrade: 12,
    subjects: ['Vật Lý'],
  },
  {
    id: 'phys-flux',
    label: 'Φ = BScosα',
    name: 'Từ thông & Cảm ứng điện từ (L12)',
    latex: '$\\Phi = NBS\\cos\\alpha,\\; e_c = -\\frac{\\Delta \\Phi}{\\Delta t}$',
    minGrade: 12,
    subjects: ['Vật Lý'],
  },
  {
    id: 'phys-nuclear',
    label: 'ΔE = Δm·c²',
    name: 'Vật lý Hạt nhân & Phóng xạ (L12)',
    latex: '$_{Z}^{A}X,\\; \\Delta E = \\Delta m \\cdot c^2,\\; N = N_0 \\cdot 2^{-t/T}$',
    minGrade: 12,
    subjects: ['Vật Lý'],
  },

  // ======================== 3. HÓA HỌC ========================
  // Hóa Học 10 (Số mol, Cấu tạo nguyên tử, Phản ứng Oxi hóa - khử, Biến thiên Enthalpy)
  {
    id: 'chem-mol',
    label: 'n = m/M = CₘV',
    name: 'Công thức Số mol & Nồng độ (L10)',
    latex: '$n = \\frac{m}{M} = C_M \\cdot V = \\frac{V_{đkc}}{24,79}$',
    minGrade: 10,
    subjects: ['Hóa Học'],
  },
  {
    id: 'chem-arrow',
    label: 'A + B → C + D',
    name: 'Mũi tên Phản ứng hóa học (L10)',
    latex: '$\\text{Chất tham gia} \\xrightarrow{t^\\circ, xt} \\text{Sản phẩm} \\downarrow \\uparrow$',
    minGrade: 10,
    subjects: ['Hóa Học'],
  },
  {
    id: 'chem-redox',
    label: 'Fe²⁺ → Fe³⁺ + 1e',
    name: 'Quá trình Oxi hóa - Khử (L10)',
    latex: '$\\stackrel{+2}{\\text{Fe}} \\longrightarrow \\stackrel{+3}{\\text{Fe}} + 1e$',
    minGrade: 10,
    subjects: ['Hóa Học'],
  },
  {
    id: 'chem-enthalpy',
    label: 'ΔᵣH°₂₉₈',
    name: 'Biến thiên Enthalpy chuẩn (L10)',
    latex: '$\\Delta_r H^\\circ_{298} = \\sum \\Delta_f H^\\circ_{298}(\\text{sp}) - \\sum \\Delta_f H^\\circ_{298}(\\text{cđ})$',
    minGrade: 10,
    subjects: ['Hóa Học'],
  },
  // Hóa Học 11 (Cân bằng hóa học Kc, pH dung dịch, Hữu cơ Hydrocarbon - Dẫn xuất)
  {
    id: 'chem-equilibrium',
    label: '⇌ Kc',
    name: 'Hằng số Cân bằng Kc (L11)',
    latex: '$aA + bB \\rightleftharpoons cC + dD,\\; K_C = \\frac{[C]^c[D]^d}{[A]^a[B]^b}$',
    minGrade: 11,
    subjects: ['Hóa Học'],
  },
  {
    id: 'chem-ph',
    label: 'pH = -lg[H⁺]',
    name: 'Độ pH dung dịch (L11)',
    latex: '$\\text{pH} = -\\log[\\text{H}^+],\\; \\text{pH} + \\text{pOH} = 14$',
    minGrade: 11,
    subjects: ['Hóa Học'],
  },
  {
    id: 'chem-organic',
    label: 'CₙH₂ₙ₊₂O',
    name: 'Công thức phân tử Hữu cơ (L11)',
    latex: '$\\text{C}_n\\text{H}_{2n+1}\\text{OH},\\; \\text{R-CHO} \\xrightarrow{+\\text{AgNO}_3/\\text{NH}_3} 2\\text{Ag}\\downarrow$',
    minGrade: 11,
    subjects: ['Hóa Học'],
  },
  // Hóa Học 12 (Ester - Lipid, Điện phân Faraday, Thế điện cực chuẩn)
  {
    id: 'chem-ester',
    label: 'RCOOR\' + NaOH',
    name: 'Thủy phân Ester (L12)',
    latex: '$\\text{RCOOR\'} + \\text{NaOH} \\xrightarrow{t^\\circ} \\text{RCOONa} + \\text{R\'OH}$',
    minGrade: 12,
    subjects: ['Hóa Học'],
  },
  {
    id: 'chem-faraday',
    label: 'm = AIt / nF',
    name: 'Định luật Faraday Điện phân (L12)',
    latex: '$m = \\frac{A \\cdot I \\cdot t}{n \\cdot F}\\; (F = 96500)$',
    minGrade: 12,
    subjects: ['Hóa Học'],
  },
  {
    id: 'chem-potential',
    label: 'E°pin = E°(+) - E°(-)',
    name: 'Sức điện động Pin Galvani (L12)',
    latex: '$E^\\circ_{\\text{pin}} = E^\\circ_{\\text{cathode}} - E^\\circ_{\\text{anode}}$',
    minGrade: 12,
    subjects: ['Hóa Học'],
  },

  // ======================== 4. TIN HỌC ========================
  // Tin Học 10 (Biểu thức logic, Hệ nhị phân/thập lục phân, Khối lệnh Python/C++)
  {
    id: 'cs-code-inline',
    label: '`code`',
    name: 'Khối lệnh / Biến (L10)',
    latex: '`for i in range(1, n + 1):`',
    minGrade: 10,
    subjects: ['Tin Học'],
  },
  {
    id: 'cs-logic',
    label: 'AND / OR / XOR',
    name: 'Phép toán Logic mệnh đề (L10)',
    latex: '$(A \\land B) \\lor (\\neg C),\\; A \\oplus B$',
    minGrade: 10,
    subjects: ['Tin Học'],
  },
  {
    id: 'cs-binary',
    label: '1011₂ = 11₁₀',
    name: 'Hệ đếm Nhị phân - Hexa (L10)',
    latex: '$101101_2 = 1\\cdot 2^5 + 0\\cdot 2^4 + 1\\cdot 2^3 + 1\\cdot 2^2 + 0\\cdot 2^1 + 1\\cdot 2^0 = 45_{10}$',
    minGrade: 10,
    subjects: ['Tin Học'],
  },
  {
    id: 'cs-mod',
    label: 'a mod b',
    name: 'Chia lấy nguyên & lấy dư (L10)',
    latex: '$a \\bmod b = r,\\; \\lfloor a / b \\rfloor$',
    minGrade: 10,
    subjects: ['Tin Học'],
  },
  // Tin Học 11 (Độ phức tạp thuật toán Big-O, Mảng 1D/2D, Truy vấn SQL)
  {
    id: 'cs-bigo',
    label: 'O(n log n)',
    name: 'Độ phức tạp Thuật toán (L11)',
    latex: '$\\mathcal{O}(n \\log n),\\; \\mathcal{O}(n^2),\\; \\mathcal{O}(1)$',
    minGrade: 11,
    subjects: ['Tin Học'],
  },
  {
    id: 'cs-recurrence',
    label: 'dp[i] = dp[i-1] + a[i]',
    name: 'Công thức Đệ quy / Quy hoạch động (L11)',
    latex: '$F[i] = \\max(F[i - 1],\\; F[i - 2] + A[i])$',
    minGrade: 11,
    subjects: ['Tin Học'],
  },
  {
    id: 'cs-sql',
    label: 'SELECT ... JOIN',
    name: 'Truy vấn CSDL SQL (L11)',
    latex: '`SELECT hs.HoTen, diem.SoDiem FROM HocSinh hs INNER JOIN BangDiem diem ON hs.MaHS = diem.MaHS WHERE diem.SoDiem >= 8.0;`',
    minGrade: 11,
    subjects: ['Tin Học'],
  },
  // Tin Học 12 (Thẻ HTML/CSS, Đồ thị & Cây, Trí tuệ nhân tạo AI)
  {
    id: 'cs-html-css',
    label: '<div class="...">',
    name: 'Cấu trúc HTML / CSS (L12)',
    latex: '`<div class="container"><h1>Tiêu đề trang web</h1></div>`',
    minGrade: 12,
    subjects: ['Tin Học'],
  },
  {
    id: 'cs-graph',
    label: 'G = (V, E)',
    name: 'Lý thuyết Đồ thị & Cây (L12)',
    latex: '$G = (V, E),\\; |E| = |V| - 1,\\; d[v] = \\min(d[v], d[u] + w(u, v))$',
    minGrade: 12,
    subjects: ['Tin Học'],
  },

  // ======================== 5. SINH HỌC ========================
  // Sinh Học 10 (Cấu trúc ADN, Nguyên phân & Giảm phân)
  {
    id: 'bio-dna',
    label: 'N = 2A + 2G',
    name: 'Cấu trúc phân tử ADN (L10)',
    latex: '$N = 2A + 2G,\\; L = \\frac{N}{2} \\cdot 3,4\\,\\text{\\AA},\\; H = 2A + 3G$',
    minGrade: 10,
    subjects: ['Sinh Học'],
  },
  {
    id: 'bio-mitosis',
    label: '2n · (2ᵏ - 1)',
    name: 'Nguyên phân & Giảm phân (L10)',
    latex: '$\\text{Số TB con} = 2^k,\\; N_{\\text{mt}} = 2n \\cdot (2^k - 1)$',
    minGrade: 10,
    subjects: ['Sinh Học'],
  },
  // Sinh Học 11 (Trao đổi chất, Quang hợp - Hô hấp tế bào)
  {
    id: 'bio-photosynthesis',
    label: '6CO₂ + 6H₂O → C₆H₁₂O₆',
    name: 'Phương trình Quang hợp (L11)',
    latex: '$6\\text{CO}_2 + 12\\text{H}_2\\text{O} \\xrightarrow{\\text{Ánh sáng, Diệp lục}} \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2\\uparrow + 6\\text{H}_2\\text{O}$',
    minGrade: 11,
    subjects: ['Sinh Học'],
  },
  // Sinh Học 12 (Quy luật di truyền Mendel, Quần thể Hardy-Weinberg)
  {
    id: 'bio-mendel',
    label: 'AaBb × AaBb',
    name: 'Phép lai Di truyền học (L12)',
    latex: '$P:\\; \\text{AaBb} \\times \\text{AaBb} \\longrightarrow F_1:\\; (3:1)(3:1) = 9:3:3:1$',
    minGrade: 12,
    subjects: ['Sinh Học'],
  },
  {
    id: 'bio-hardy',
    label: 'p² + 2pq + q² = 1',
    name: 'Cân bằng Hardy-Weinberg (L12)',
    latex: '$p^2(\\text{AA}) + 2pq(\\text{Aa}) + q^2(\\text{aa}) = 1\\; (p + q = 1)$',
    minGrade: 12,
    subjects: ['Sinh Học'],
  },

  // ======================== 6. TIẾNG ANH ========================
  {
    id: 'eng-tense',
    label: 'S + V(s/es) + O',
    name: 'Cấu trúc Thì (Tenses - L10)',
    latex: '`S + have/has + V3/ed + since/for + ...`',
    minGrade: 10,
    subjects: ['Tiếng Anh'],
  },
  {
    id: 'eng-passive',
    label: 'S + be + V3/ed',
    name: 'Câu Bị động (Passive Voice - L10)',
    latex: '`S + be + V3/ed + (by O)`',
    minGrade: 10,
    subjects: ['Tiếng Anh'],
  },
  {
    id: 'eng-underline',
    label: '<u>gạch chân</u>',
    name: 'Từ gạch chân phát âm / Sửa lỗi (L10)',
    latex: '<u>ed</u>',
    minGrade: 10,
    subjects: ['Tiếng Anh'],
  },
  {
    id: 'eng-conditional',
    label: 'If + S + V2/ed...',
    name: 'Câu Điều kiện & Cleft Sentences (L11)',
    latex: '`If + S + had + V3/ed, S + would have + V3/ed`',
    minGrade: 11,
    subjects: ['Tiếng Anh'],
  },
  {
    id: 'eng-inversion',
    label: 'Hardly had S + V3...',
    name: 'Đảo ngữ nâng cao (Inversion - L12)',
    latex: '`Hardly had + S + V3/ed + when + S + V2/ed`',
    minGrade: 12,
    subjects: ['Tiếng Anh'],
  },

  // ======================== 7. NGỮ VĂN / LỊCH SỬ / ĐỊA LÝ ========================
  {
    id: 'lit-quote',
    label: '“Trích dẫn”',
    name: 'Trích dẫn tác phẩm / Nhận định (L10)',
    latex: '“...” (Trích *Tên tác phẩm* - Tác giả)',
    minGrade: 10,
    subjects: ['Ngữ Văn', 'Lịch Sử', 'Địa Lý'],
  },
  {
    id: 'lit-outline',
    label: 'Luận điểm 1, 2, 3',
    name: 'Khung Dàn ý Nghị luận (L10)',
    latex: '\n- **Luận điểm 1:** Giải thích vấn đề\n- **Luận điểm 2:** Phân tích & Chứng minh\n- **Luận điểm 3:** Đánh giá & Liên hệ bản thân\n',
    minGrade: 10,
    subjects: ['Ngữ Văn', 'Lịch Sử', 'Địa Lý'],
  },
  {
    id: 'geo-formula',
    label: 'Mật độ = Dân số / S',
    name: 'Công thức Địa lý (Mật độ / Cơ cấu %)',
    latex: '$\\text{Mật độ dân số} = \\frac{\\text{Số dân (người)}}{\\text{Diện tích (km}^2\\text{)}}$',
    minGrade: 10,
    subjects: ['Địa Lý'],
  },
];

const SUBJECT_OPTIONS = [
  'Toán Học',
  'Vật Lý',
  'Hóa Học',
  'Tin Học',
  'Tiếng Anh',
  'Sinh Học',
  'Ngữ Văn',
  'Lịch Sử',
  'Địa Lý',
];

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB theo đúng yêu cầu Task #11
const MAX_IMAGES_COUNT = 4;

interface AttachedImageItem {
  id: string;
  name: string;
  sizeBytes: number;
  dataUrl: string;
  file?: File;
}

/**
 * Upload ảnh đính kèm qua `forumService.uploadImage(file)` (gửi multipart/form-data sang BE `POST /api/v1/forum/upload` để BE đẩy lên Cloudinary).
 * Nếu BE chưa bật endpoint upload thì tự động fallback sang DataURL để không làm gián đoạn quá trình test trên FE.
 */
async function uploadForumImageToCloud(item: AttachedImageItem): Promise<string> {
  if (item.file) {
    const uploadRes = await forumService.uploadImage(item.file);
    if (uploadRes.ok && uploadRes.url) {
      return uploadRes.url;
    }
  }
  return item.dataUrl;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

export function ForumAskQuestionModal({
  isOpen,
  onClose,
  onPostCreated,
  defaultSubject = 'Toán Học',
  defaultGrade = 12,
}: ForumAskQuestionModalProps) {
  const [title, setTitle] = React.useState('');
  const [subject, setSubject] = React.useState(defaultSubject);
  const [grade, setGrade] = React.useState<number>(defaultGrade);
  const [chapterName, setChapterName] = React.useState('');
  const [tagsInput, setTagsInput] = React.useState('');
  const [content, setContent] = React.useState('');
  const [editorMode, setEditorMode] = React.useState<'split' | 'write' | 'preview'>('split');
  const [images, setImages] = React.useState<AttachedImageItem[]>([]);
  const [isDraggingOver, setIsDraggingOver] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [uploadErrorMsg, setUploadErrorMsg] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const titleInputRef = React.useRef<HTMLInputElement | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [activeField, setActiveField] = React.useState<'title' | 'content'>('content');

  // Lọc danh sách công thức thông minh theo đúng Môn học & Khối lớp đang chọn (Lớp 10 chỉ tới L10, Lớp 11 tới L11, Lớp 12 đầy đủ)
  const visibleToolbarItems = React.useMemo(() => {
    return FORUM_LATEX_TOOLBAR_ITEMS.filter(
      (item) => item.subjects.includes(subject) && item.minGrade <= grade
    );
  }, [subject, grade]);

  // Chèn công thức LaTeX đúng vào vị trí con trỏ của ô đang chọn (Title hoặc Content)
  const handleInsertLatex = (snippet: MathToolbarSnippet) => {
    setErrorMsg(null);
    if (activeField === 'title' && titleInputRef.current) {
      const input = titleInputRef.current;
      const start = input.selectionStart ?? title.length;
      const end = input.selectionEnd ?? title.length;
      const cleanLatex = snippet.latex.trim();
      const nextValue = `${title.slice(0, start)}${cleanLatex}${title.slice(end)}`;
      setTitle(nextValue);
      requestAnimationFrame(() => {
        input.focus();
        const cursor = start + cleanLatex.length;
        input.setSelectionRange(cursor, cursor);
      });
      return;
    }

    const textarea = textareaRef.current;
    if (!textarea) {
      setContent((prev) => `${prev}${prev ? ' ' : ''}${snippet.latex}`);
      return;
    }

    const start = textarea.selectionStart ?? content.length;
    const end = textarea.selectionEnd ?? content.length;
    const selectedText = content.slice(start, end);

    let insertion = snippet.latex;
    if (selectedText.trim()) {
      if (snippet.id === 'math-fraction') {
        insertion = `$\\frac{${selectedText}}{b}$`;
      } else if (snippet.id === 'math-sqrt') {
        insertion = `$\\sqrt{${selectedText}}$`;
      }
    }

    const nextContent = `${content.slice(0, start)}${insertion}${content.slice(end)}`;
    setContent(nextContent);

    requestAnimationFrame(() => {
      textarea.focus();
      const nextCursorPos = start + insertion.length;
      textarea.setSelectionRange(nextCursorPos, nextCursorPos);
    });
  };

  // Xử lý kiểm tra và đọc file ảnh đính kèm (<= 5MB)
  const processFiles = (fileList: FileList | File[]) => {
    setErrorMsg(null);
    setUploadErrorMsg(null);
    const filesArray = Array.from(fileList);
    if (filesArray.length === 0) return;

    if (images.length + filesArray.length > MAX_IMAGES_COUNT) {
      const msg = `Chỉ được đính kèm tối đa ${MAX_IMAGES_COUNT} ảnh chụp đề bài hoặc vở nháp.`;
      setUploadErrorMsg(msg);
      toast.error(msg);
      return;
    }

    for (const file of filesArray) {
      if (!file.type.startsWith('image/')) {
        const msg = `Tệp "${file.name}" không phải là định dạng hình ảnh hợp lệ (JPG, PNG, WEBP).`;
        setUploadErrorMsg(msg);
        toast.error(msg);
        continue;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        const msg = `Ảnh "${file.name}" có dung lượng ${formatFileSize(
          file.size
        )}, vượt quá giới hạn tối đa 5MB cho phép! Vui lòng chọn ảnh nhỏ hơn 5MB.`;
        setUploadErrorMsg(msg);
        toast.error(msg);
        continue;
      }

      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result;
        if (typeof result === 'string') {
          setImages((prev) => [
            ...prev,
            {
              id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              name: file.name,
              sizeBytes: file.size,
              dataUrl: result,
              file,
            },
          ]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const imageFiles: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) imageFiles.push(file);
      }
    }
    if (imageFiles.length > 0) {
      processFiles(imageFiles);
    }
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => prev.filter((item) => item.id !== id));
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setChapterName('');
    setTagsInput('');
    setImages([]);
    setErrorMsg(null);
    setUploadErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setUploadErrorMsg(null);

    if (!title.trim() || title.trim().length < 8) {
      setErrorMsg('Vui lòng nhập tiêu đề câu hỏi rõ ràng (tối thiểu 8 ký tự).');
      return;
    }

    if (!content.trim() && images.length === 0) {
      setErrorMsg('Vui lòng nhập nội dung câu hỏi hoặc đính kèm ảnh chụp đề bài.');
      return;
    }

    setIsSubmitting(true);

    // Upload danh sách ảnh lên Cloudinary (hoặc qua Backend API /api/v1/forum/upload)
    const uploadedUrls = await Promise.all(
      images.map((imgItem) => uploadForumImageToCloud(imgItem))
    );

    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const finalTags =
      parsedTags.length > 0
        ? parsedTags
        : [subject, `Khối ${grade}`, ...(chapterName.trim() ? [chapterName.trim()] : ['Hỏi bài'])];

    const payload: CreateForumPostPayload = {
      title: title.trim(),
      content: content.trim(),
      subject,
      grade,
      chapter_name: chapterName.trim() || undefined,
      tags: finalTags,
      attachments: uploadedUrls,
    };

    const result = await forumService.createPost(payload);
    setIsSubmitting(false);

    if (!result.ok) {
      setErrorMsg(
        result.message ||
          'Không thể gửi câu hỏi lên máy chủ API (/api/v1/forum/posts). Vui lòng kiểm tra kết nối Backend.'
      );
      return;
    }

    if (result.post && onPostCreated) {
      onPostCreated(result.post);
    }

    resetForm();
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="4xl"
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#00B8DD]/15 text-[#007D99] dark:text-[#00B8DD] flex items-center justify-center">
            <Sigma className="w-4 h-4" />
          </div>
          <div>
            <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Đặt Câu Hỏi Thảo Luận Mới
            </span>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-1 text-xs">
        {/* Thông báo lỗi nếu có */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-start gap-2.5 font-semibold animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Hàng 1: Chọn Môn học, Khối lớp (10-11-12) & Chương / Chủ đề */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#00B8DD]" />
              <span>Môn Học *</span>
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#00B8DD] cursor-pointer"
            >
              {SUBJECT_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-[#00B8DD]" />
              <span>Khối Lớp *</span>
            </label>
            <select
              value={grade}
              onChange={(e) => setGrade(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#00B8DD] cursor-pointer"
            >
              <option value={12}>Khối 12 (Ôn thi Tốt nghiệp THPT)</option>
              <option value={11}>Khối 11 (Chương trình GDPT 2018)</option>
              <option value={10}>Khối 10 (Chương trình GDPT 2018)</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
              <Tag className="w-3.5 h-3.5 text-[#00B8DD]" />
              <span>Chuyên đề / Tags (cách bởi dấu phẩy)</span>
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="VD: Cực trị hàm số, Tích phân, Oxyz..."
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#00B8DD]"
            />
          </div>
        </div>

        {/* Hàng 2: Tiêu đề câu hỏi */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Tiêu Đề Câu Hỏi * <span className="text-slate-400 font-normal">(Hỗ trợ công thức $...$)</span>
            </label>
            <span className="text-[11px] text-slate-400">{title.length}/200</span>
          </div>
          <input
            ref={titleInputRef}
            type="text"
            required
            maxLength={200}
            value={title}
            onFocus={() => setActiveField('title')}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ví dụ: Tìm m để hàm số $y = x^3 - 3mx^2 + 1$ đồng biến trên khoảng $(0; +\infty)$"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#00B8DD]"
          />
        </div>

        {/* ── TASK #12: THANH CÔNG CỤ CHÈN NHANH CÔNG THỨC THEO MÔN HỌC & KHỐI LỚP ── */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90 p-3 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#00B8DD]" />
              <span className="font-bold text-slate-700 dark:text-slate-200 text-xs">
                Thanh Công Cụ Chèn Nhanh ({subject} • Tới Khối {grade}):
              </span>
              <Badge
                variant="outline"
                className="text-[10px] border-[#00B8DD]/40 text-[#007D99] dark:text-[#00B8DD]"
              >
                {visibleToolbarItems.length} mẫu công thức phù hợp
              </Badge>
            </div>

            {/* Chế độ hiển thị khung soạn thảo & Live Preview */}
            <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-lg text-[11px]">
              <button
                type="button"
                onClick={() => setEditorMode('split')}
                className={cn(
                  'px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1',
                  editorMode === 'split'
                    ? 'bg-white dark:bg-slate-900 text-[#007D99] dark:text-[#00B8DD] shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                <Columns className="w-3 h-3" /> Song song
              </button>
              <button
                type="button"
                onClick={() => setEditorMode('write')}
                className={cn(
                  'px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1',
                  editorMode === 'write'
                    ? 'bg-white dark:bg-slate-900 text-[#007D99] dark:text-[#00B8DD] shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                <Edit3 className="w-3 h-3" /> Chỉ soạn thảo
              </button>
              <button
                type="button"
                onClick={() => setEditorMode('preview')}
                className={cn(
                  'px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1',
                  editorMode === 'preview'
                    ? 'bg-white dark:bg-slate-900 text-[#007D99] dark:text-[#00B8DD] shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                <Eye className="w-3 h-3" /> Xem trước
              </button>
            </div>
          </div>

          {/* Danh sách nút bấm chèn nhanh theo Môn học & Khối lớp */}
          <div className="flex flex-wrap items-center gap-1.5">
            {visibleToolbarItems.map((item) => (
              <button
                key={item.id}
                type="button"
                title={`${item.name} (Lớp ${item.minGrade}): ${item.latex}`}
                onClick={() => handleInsertLatex(item)}
                className="group inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-[#00B8DD]/10 dark:hover:bg-[#00B8DD]/20 border border-slate-200 dark:border-slate-700 hover:border-[#00B8DD] text-slate-700 dark:text-slate-200 hover:text-[#007D99] dark:hover:text-[#00B8DD] transition-all cursor-pointer shadow-2xs"
              >
                <span className="font-mono font-bold text-xs text-[#007D99] dark:text-[#00B8DD]">
                  {item.label}
                </span>
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">
                  {item.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── TASK #11: KHUNG SOẠN THẢO + LIVE KATEX PREVIEW TRỰC TIẾP ── */}
        <div
          className={cn(
            'grid gap-3.5',
            editorMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
          )}
        >
          {/* Cột Trái: Khung nhập văn bản & mã LaTeX */}
          {(editorMode === 'split' || editorMode === 'write') && (
            <div className="space-y-1.5 flex flex-col">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-[#00B8DD]" />
                  <span>Nội Dung Đề Bài &amp; Chỗ Đang Vướng Mắc *</span>
                </label>
                <span className="text-[11px] text-slate-400">Hỗ trợ dán ảnh (Ctrl+V)</span>
              </div>
              <textarea
                ref={textareaRef}
                rows={7}
                value={content}
                onFocus={() => setActiveField('content')}
                onChange={(e) => setContent(e.target.value)}
                onPaste={handlePaste}
                placeholder={
                  'Nhập đề bài hoặc bấm nút trên thanh công cụ để chèn công thức theo đúng môn học và khối lớp...\n\nVí dụ: Giải phương trình $\\sqrt{2x + 1} = x - 1$'
                }
                className="w-full flex-1 p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#00B8DD] font-sans resize-y min-h-[170px]"
              />
            </div>
          )}

          {/* Cột Phải: Khung Xem Trước Trực Tiếp (Live KaTeX Preview) */}
          {(editorMode === 'split' || editorMode === 'preview') && (
            <div className="space-y-1.5 flex flex-col">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#007D99] dark:text-[#00B8DD] flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Xem Trước Trực Tiếp (Live KaTeX Preview)</span>
                </span>
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px]">
                  Render thời gian thực
                </Badge>
              </div>
              <div className="w-full flex-1 p-4 rounded-xl border-2 border-dashed border-[#00B8DD]/35 bg-[#E6F8FC]/20 dark:bg-slate-900/80 min-h-[170px] max-h-[260px] overflow-y-auto space-y-2.5">
                {title.trim() || content.trim() ? (
                  <>
                    {title.trim() && (
                      <div className="pb-2 border-b border-slate-200/80 dark:border-slate-800">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                          Tiêu đề:
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                          <MathRenderer text={title} inline />
                        </h4>
                      </div>
                    )}
                    {content.trim() ? (
                      <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                        <MathRenderer text={content} />
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">
                        Nội dung chi tiết sẽ hiển thị công thức Toán tại đây...
                      </p>
                    )}
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center py-6 text-slate-400 space-y-1.5">
                    <Sigma className="w-7 h-7 text-[#00B8DD]/50" />
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Khung xem trước công thức ({subject} - Khối {grade})
                    </p>
                    <p className="text-[11px] max-w-xs">
                      Khi em gõ hoặc bấm nút chèn công thức ở bên trái, biểu thức sẽ được render đẹp mắt ngay lập tức tại đây.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── TASK #11: ĐÍNH KÈM ẢNH CHỤP ĐỀ BÀI / VỞ NHÁP (<= 5MB) ── */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-[#00B8DD]" />
              <span>Đính Kèm Ảnh Chụp Đề Bài Giấy / Vở Nháp (Tối đa 5MB/ảnh)</span>
            </label>
            <span className="text-[11px] font-semibold text-slate-400">
              Đã chọn {images.length}/{MAX_IMAGES_COUNT} ảnh
            </span>
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingOver(true);
            }}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-between gap-3',
              isDraggingOver
                ? 'border-[#00B8DD] bg-[#00B8DD]/10'
                : 'border-slate-300 dark:border-slate-700 hover:border-[#00B8DD] bg-slate-50/60 dark:bg-slate-900/50'
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00B8DD]/15 text-[#007D99] dark:text-[#00B8DD] flex items-center justify-center shrink-0">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Bấm để tải ảnh lên hoặc kéo thả ảnh chụp đề bài vào đây
                </p>
                <p className="text-[11px] text-slate-500">
                  Hỗ trợ ảnh JPG, PNG, WEBP rõ nét • Dung lượng tối đa <strong>&lt;= 5MB</strong> mỗi ảnh
                </p>
              </div>
            </div>

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="rounded-xl text-xs font-bold border-slate-300 dark:border-slate-700 shrink-0"
            >
              Chọn Ảnh Đề Bài
            </Button>
          </div>

          {/* Cảnh báo ngay tại khung upload khi chọn ảnh vượt quá 5MB hoặc sai định dạng */}
          {uploadErrorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center justify-between gap-2 text-xs font-bold animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>{uploadErrorMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => setUploadErrorMsg(null)}
                className="p-1 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-500 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Danh sách preview các ảnh đã đính kèm */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 p-1.5 flex flex-col gap-1.5"
                >
                  <div className="relative h-24 w-full rounded-lg overflow-hidden bg-slate-950/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.dataUrl}
                      alt={img.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(img.id)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md hover:bg-rose-700 transition-colors cursor-pointer"
                      title="Xóa ảnh này"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="px-1 flex items-center justify-between text-[10px] text-slate-500">
                    <span className="truncate font-semibold max-w-[100px]">{img.name}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                      {formatFileSize(img.sizeBytes)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer nút hành động */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-500">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Câu hỏi rõ ràng giúp thầy cô và bạn bè giải đáp nhanh gấp 3 lần!</span>
          </div>

          <div className="flex items-center gap-2.5 ml-auto">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl border-slate-300 dark:border-slate-700 text-xs font-bold"
            >
              Hủy Bỏ
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              leftIcon={<Send className="w-3.5 h-3.5" />}
              className="bg-[#00B8DD] hover:bg-[#009bbd] text-white font-bold rounded-xl text-xs px-5 shadow-md shadow-[#00B8DD]/25"
            >
              Đăng Câu Hỏi Lên Diễn Đàn
            </Button>
          </div>
        </div>
      </form>
    </Dialog>
  );
}
