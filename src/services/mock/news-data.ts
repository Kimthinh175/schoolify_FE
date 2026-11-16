import { NewsArticle, NewsCategory } from '@/types';

export const MOCK_NEWS_CATEGORIES: NewsCategory[] = [
  {
    id: 'cat-thpt',
    name: 'Thi Tốt Nghiệp THPT',
    slug: 'thi-tot-nghiep-thpt',
    description: 'Thông tin quy chế, cấu trúc đề minh họa và phân tích chuyên sâu kỳ thi Tốt nghiệp THPT theo Chương trình GDPT 2018.',
    icon: 'GraduationCap',
    color: '#00B8DD',
    order_index: 1,
    is_active: true,
    is_featured: true,
    meta_title: 'Tin Tức Thi Tốt Nghiệp THPT 2026 | Schoolify',
    meta_description: 'Cập nhật cấu trúc đề thi, lịch thi và phân tích ma trận đề Tốt nghiệp THPT mới nhất từ Bộ GD&ĐT.',
    meta_keywords: ['thi tốt nghiệp thpt 2026', 'đề minh họa 2026', 'chương trình gdpt 2018'],
    is_indexable: true,
    created_at: '2026-09-01T08:00:00.000Z',
    updated_at: '2026-10-04T08:00:00.000Z',
  },
  {
    id: 'cat-edtech',
    name: 'Công Nghệ Giáo Dục',
    slug: 'cong-nghe-giao-duc',
    description: 'Xu hướng ứng dụng AI, Adaptive Learning và chuyển đổi số trong dạy và học phổ thông.',
    icon: 'Sparkles',
    color: '#6366F1',
    order_index: 2,
    is_active: true,
    is_featured: true,
    meta_title: 'Công Nghệ Giáo Dục & AI Học Tập | Schoolify',
    meta_description: 'Khám phá công nghệ AI tạo đề thích ứng, chấm bài tự luận tự động và cá nhân hóa lộ trình học tập.',
    meta_keywords: ['công nghệ giáo dục', 'edtech', 'ai giáo dục', 'adaptive learning'],
    is_indexable: true,
    created_at: '2026-09-01T08:00:00.000Z',
    updated_at: '2026-10-02T08:00:00.000Z',
  },
  {
    id: 'cat-bi-quyet',
    name: 'Bí Quyết Ôn Thi',
    slug: 'bi-quyet-on-thi',
    description: 'Phương pháp giải nhanh, sơ đồ tư duy, công thức Toán - Lý - Hóa - Anh và kinh nghiệm đạt điểm 9+ từ giáo viên chuyên.',
    icon: 'BookOpen',
    color: '#10B981',
    order_index: 3,
    is_active: true,
    is_featured: true,
    meta_title: 'Bí Quyết Ôn Thi & Phương Pháp Giải Nhanh | Schoolify',
    meta_description: 'Tổng hợp mẹo giải nhanh Toán, Lý, Hóa, Sinh và chiến thuật phân bổ thời gian làm bài thi THPT.',
    meta_keywords: ['bí quyết ôn thi', 'giải nhanh toán 12', 'công thức oxyz', 'casio fx-880btg'],
    is_indexable: true,
    created_at: '2026-09-01T08:00:00.000Z',
    updated_at: '2026-09-28T08:00:00.000Z',
  },
  {
    id: 'cat-su-kien',
    name: 'Sự Kiện Schoolify',
    slug: 'su-kien-schoolify',
    description: 'Các cuộc thi học thuật trực tuyến, giải đấu Bảng Vàng và hoạt động ngoại khóa sôi động trên nền tảng Schoolify.',
    icon: 'Trophy',
    color: '#F59E0B',
    order_index: 4,
    is_active: true,
    is_featured: true,
    meta_title: 'Sự Kiện & Giải Đấu Học Thuật | Schoolify',
    meta_description: 'Tham gia đua top Bảng Vàng, thi thử toàn quốc và nhận học bổng Ngọc Tri Thức cùng Schoolify.',
    meta_keywords: ['sự kiện schoolify', 'đua top bảng vàng', 'thi thử thpt online'],
    is_indexable: true,
    created_at: '2026-09-01T08:00:00.000Z',
    updated_at: '2026-09-25T08:00:00.000Z',
  },
  {
    id: 'cat-huong-dan',
    name: 'Hướng Dẫn Nền Tảng',
    slug: 'huong-dan-nen-tang',
    description: 'Cẩm nang sử dụng các công cụ học tập, phòng thi ảo, máy tính Casio tích hợp và bộ gõ LaTeX trên Schoolify.',
    icon: 'Compass',
    color: '#EC4899',
    order_index: 5,
    is_active: true,
    is_featured: true,
    meta_title: 'Hướng Dẫn Sử Dụng Nền Tảng Schoolify',
    meta_description: 'Hướng dẫn chi tiết cho học sinh, giáo viên và nhà trường khai thác tối đa hệ sinh thái Schoolify.',
    meta_keywords: ['hướng dẫn schoolify', 'gõ công thức latex', 'phòng thi ảo'],
    is_indexable: true,
    created_at: '2026-09-01T08:00:00.000Z',
    updated_at: '2026-09-20T08:00:00.000Z',
  },
  {
    id: 'cat-nha-truong',
    name: 'Nhà Trường Số',
    slug: 'nha-truong-so',
    description: 'Giải pháp quản trị trường học thông minh, ngân hàng đề kiểm tra chuẩn hóa và kết nối Gia đình - Nhà trường.',
    icon: 'Building2',
    color: '#0EA5E9',
    order_index: 6,
    is_active: true,
    is_featured: true,
    meta_title: 'Nhà Trường Số & Quản Trị Giáo Dục | Schoolify',
    meta_description: 'Chia sẻ kinh nghiệm chuyển đổi số trường THPT, quản lý ma trận đề và đánh giá năng lực học sinh.',
    meta_keywords: ['nhà trường số', 'chuyển đổi số giáo dục', 'quản lý trường học'],
    is_indexable: true,
    created_at: '2026-09-01T08:00:00.000Z',
    updated_at: '2026-09-15T08:00:00.000Z',
  },
];

export const MOCK_NEWS_ARTICLES: NewsArticle[] = [
  {
    id: 'news-01',
    category_id: 'cat-thpt',
    title: 'Cập nhật cấu trúc đề thi Tốt nghiệp THPT 2026: Phân tích dạng bài trắc nghiệm Đúng/Sai',
    slug: 'cap-nhat-cau-truc-de-thi-tot-nghiep-thpt-2026-phan-tich-trac-nghiem-dung-sai',
    excerpt:
      'Bộ GD&ĐT tiếp tục hoàn thiện định dạng câu hỏi theo Chương trình GDPT 2018. Khám phá bí quyết làm phần trắc nghiệm 4 mệnh đề đúng sai và trả lời ngắn để tối ưu điểm số môn Toán và KHTN.',
    content: `## 1. Tổng quan cấu trúc đề thi Tốt nghiệp THPT theo Chương trình GDPT 2018

Kỳ thi Tốt nghiệp THPT năm 2026 tiếp tục áp dụng định dạng đề thi đánh giá năng lực theo Chương trình Giáo dục phổ thông 2018. Thay vì chỉ sử dụng 100% câu hỏi trắc nghiệm 4 lựa chọn truyền thống ($A, B, C, D$), đề thi các môn Toán, Vật Lý, Hóa Học, Sinh Học được chia thành **3 phần rõ rệt** nhằm hạn chế việc khoanh bừa và phân hóa thí sinh chính xác hơn.

- **Phần I (Trắc nghiệm nhiều lựa chọn):** Gồm 12 câu hỏi (môn Toán) hoặc 18 câu hỏi (môn KHTN), mỗi câu đúng được $0,25$ điểm.
- **Phần II (Trắc nghiệm Đúng/Sai):** Gồm 4 câu hỏi lớn, mỗi câu có 4 mệnh đề nhỏ a), b), c), d) yêu cầu thí sinh xác định từng ý là Đúng hay Sai.
- **Phần III (Trắc nghiệm trả lời ngắn):** Gồm 6 câu hỏi yêu cầu tính toán và điền kết quả số thập phân hoặc số nguyên vào phiếu trả lời.

## 2. Cơ chế tính điểm phân hóa của phần Trắc nghiệm Đúng/Sai

Điểm đặc biệt nhất trong cấu trúc mới nằm ở **quy tắc tính điểm lũy tiến không tuyến tính** của Phần II. Trong một câu hỏi gồm 4 mệnh đề a), b), c), d) với điểm tối đa là $1,0$ điểm:

### Bảng quy đổi điểm theo số ý trả lời đúng

- Trả lời đúng **1 ý** trong 1 câu hỏi: đạt $0,1$ điểm.
- Trả lời đúng **2 ý** trong 1 câu hỏi: đạt $0,25$ điểm.
- Trả lời đúng **3 ý** trong 1 câu hỏi: đạt $0,5$ điểm.
- Trả lời đúng **cả 4 ý** trong 1 câu hỏi: đạt trọn vẹn $1,0$ điểm.

Như vậy, chỉ riêng ý thứ 4 đã quyết định tới $0,5$ điểm (bằng 2 câu hỏi ở Phần I). Điều này đòi hỏi học sinh phải nắm vững bản chất từ mức độ **Nhận biết - Thông hiểu** (ý a, b) cho đến **Vận dụng - Vận dụng cao** (ý c, d).

## 3. Ví dụ minh họa phân tích mệnh đề môn Toán 12

Xét hàm số $y = f(x) = x^3 - 3x^2 + 2$ có đồ thị $(C)$. Một câu hỏi Đúng/Sai điển hình sẽ dẫn dắt học sinh qua chuỗi 4 bước tư duy liên tiếp:

### Phân tích từng mệnh đề từ cơ bản đến nâng cao

- **Mệnh đề a (Nhận biết):** Đạo hàm của hàm số đã cho là $f'(x) = 3x^2 - 6x$. (Đúng)
- **Mệnh đề b (Thông hiểu):** Hàm số đồng biến trên khoảng $(0; 2)$. Vì $f'(x) < 0$ với mọi $x \in (0; 2)$ nên hàm số nghịch biến trên $(0; 2)$. (Sai)
- **Mệnh đề c (Vận dụng):** Đường thẳng đi qua hai điểm cực trị của đồ thị $(C)$ có phương trình là $y = -2x + 2$. (Đúng)
- **Mệnh đề d (Vận dụng cao):** Có đúng 3 giá trị nguyên của tham số $m$ để phương trình $f(|x|) = m$ có 6 nghiệm thực phân biệt. (Sai)

## 4. Chiến thuật ôn luyện hiệu quả trên nền tảng Schoolify

Để chinh phục trọn vẹn $4,0$ điểm phần Đúng/Sai và $3,0$ điểm phần Trả lời ngắn, học sinh khối 12 nên áp dụng quy trình 3 bước trên phòng luyện thi của Schoolify:

1. **Luyện theo Chuyên đề & Ma trận thích ứng:** Hệ thống AI tự động nhận diện các "bẫy tư duy" (Trap Tags) mà học sinh hay mắc phải ở mệnh đề c) và d).
2. **Kiểm soát thời gian bằng đồng hồ đếm ngược:** Dành tối đa 15 phút cho Phần I, 35 phút cho Phần II và 40 phút cho Phần III.
3. **Xem lại Snapshot kết quả & Lộ trình bù đắp kiến thức:** Sau mỗi bài thi, hệ thống sẽ chỉ rõ bạn mất điểm ở mệnh đề nào và gợi ý bài tập khắc phục ngay lập tức.`,
    thumbnail_url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1000&auto=format&fit=crop&q=80',
    cover_image_url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1400&auto=format&fit=crop&q=80',
    image_alt: 'Học sinh ôn tập chuẩn bị cho kỳ thi Tốt nghiệp THPT 2026 theo cấu trúc mới',
    image_caption: 'Định dạng đề thi mới đòi hỏi học sinh hiểu sâu bản chất thay vì học mẹo khoanh đáp án.',
    attachments: [
      {
        title: 'Cấu trúc định dạng đề thi Tốt nghiệp THPT 2026 - Môn Toán.pdf',
        file_url: '/docs/cau-truc-de-thi-toan-2026.pdf',
        file_type: 'PDF',
        file_size_bytes: 1450200,
      },
      {
        title: 'Bảng quy đổi điểm phần Trắc nghiệm Đúng/Sai & Trả lời ngắn.pdf',
        file_url: '/docs/bang-quy-doi-diem-thpt-2026.pdf',
        file_type: 'PDF',
        file_size_bytes: 620400,
      },
    ],
    reading_time_minutes: 5,
    word_count: 680,
    view_count: 3420,
    like_count: 285,
    share_count: 94,
    bookmark_count: 412,
    tags: ['THPT 2026', 'Trắc nghiệm Đúng/Sai', 'GDPT 2018', 'Toán 12', 'Đề minh họa'],
    grade_levels: [12],
    subject_slugs: ['toan-hoc', 'vat-ly', 'hoa-hoc'],
    target_roles: ['STUDENT', 'TEACHER', 'PARENT'],
    meta_title: 'Cấu trúc đề thi Tốt nghiệp THPT 2026 & Mẹo làm bài Đúng/Sai',
    meta_description: 'Phân tích chi tiết quy tắc tính điểm lũy tiến phần trắc nghiệm Đúng/Sai và chiến thuật ôn thi THPT 2026 đạt 9+.',
    meta_keywords: ['đề thi tốt nghiệp thpt 2026', 'trắc nghiệm đúng sai', 'cấu trúc đề thi 2026'],
    focus_keyword: 'cấu trúc đề thi Tốt nghiệp THPT 2026',
    is_indexable: true,
    author_name: 'Ban Khảo Thí Schoolify',
    author_role: 'Hội đồng Chuyên môn & Đánh giá Năng lực',
    author_bio: 'Đội ngũ chuyên gia khảo thí và giáo viên cốt cán các trường THPT Chuyên trực tiếp xây dựng ma trận đề chuẩn hóa trên Schoolify.',
    source_name: 'Bộ Giáo dục và Đào tạo',
    status: 'PUBLISHED',
    is_featured: true,
    is_pinned: true,
    is_breaking: true,
    allow_comments: true,
    published_at: '2026-10-04T08:30:00.000Z',
    created_at: '2026-10-03T15:00:00.000Z',
    updated_at: '2026-10-04T08:30:00.000Z',
  },
  {
    id: 'news-02',
    category_id: 'cat-edtech',
    title: 'Ma trận tạo đề thích ứng: Giải pháp cá nhân hóa lộ trình học tập cho học sinh lớp 12',
    slug: 'ma-tran-tao-de-thich-ung-giai-phap-ca-nhan-hoa-lo-trinh-hoc-tap-lop-12',
    excerpt:
      'Hệ thống AI của Schoolify tự động phân tích tỷ lệ câu hỏi Nhận biết - Thông hiểu - Vận dụng và liên kết chương trước theo cơ chế Spaced Repetition.',
    content: `## 1. Bài toán "học trước quên sau" của học sinh cuối cấp

Trong quá trình ôn thi đại học, hơn 72% học sinh lớp 12 gặp tình trạng khi chuyển sang học **Chương 3 (Nguyên hàm - Tích phân)** thì bắt đầu quên các dạng toán **Chương 1 (Khảo sát hàm số)**. Việc luyện đề đại trà không phân loại theo năng lực cá nhân khiến học sinh giỏi mất thời gian làm lại câu quá dễ, trong khi học sinh trung bình lại choáng ngợp trước các câu vận dụng cao.

## 2. Cơ chế hoạt động của Ma trận tạo đề thích ứng (Adaptive Exam Matrix)

Engine tạo đề của Schoolify kết hợp giữa **Ma trận đặc tả chuẩn Bộ GD&ĐT** và thuật toán **Lặp lại ngắt quãng (Spaced Repetition)**:

### Phân bổ tỷ lệ câu hỏi liên chương thông minh

- **70% câu hỏi trọng tâm chương hiện tại:** Đảm bảo nắm chắc kiến thức vừa học trên lớp.
- **20% câu hỏi ôn tập chương liền trước:** Tự động lồng ghép các câu hỏi thuộc chủ đề học sinh từng làm sai trong 14 ngày gần nhất.
- **10% câu hỏi thử thách nâng cao:** Mở rộng tư duy liên môn và ứng dụng thực tiễn.

### Gắn nhãn nhận thức (Cognitive Tags) và Bẫy tư duy (Trap Tags)

Mỗi câu hỏi trong ngân hàng đề đều được gắn nhãn chi tiết như *Nhầm dấu đạo hàm tại điểm cực trị* hoặc *Quên điều kiện xác định của biểu thức dưới dấu căn*. Khi học sinh chọn phương án nhiễu, hệ thống lập tức ghi nhận đúng lỗ hổng kiến thức đó.

## 3. Lộ trình khắc phục lỗ hổng tức thì (Remediation Engine)

Ngay sau khi nộp bài, thay vì chỉ hiển thị điểm số đơn thuần, Schoolify tự động sinh **Bản đồ Chòm sao Tri thức (Knowledge Constellation)** và đề xuất gói 5 câu hỏi luyện bù trúng đích giúp học sinh lấp đầy lỗ hổng chỉ trong 10 phút.`,
    thumbnail_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1000&auto=format&fit=crop&q=80',
    cover_image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1400&auto=format&fit=crop&q=80',
    image_alt: 'Hệ thống AI phân tích ma trận đề thích ứng trên Schoolify',
    image_caption: 'Giao diện phân tích năng lực cá nhân hóa và đề xuất lộ trình ôn tập trên Schoolify.',
    reading_time_minutes: 4,
    word_count: 520,
    view_count: 2150,
    like_count: 198,
    share_count: 63,
    bookmark_count: 275,
    tags: ['AI Giáo Dục', 'Ma trận đề thi', 'Spaced Repetition', 'Cá nhân hóa'],
    grade_levels: [10, 11, 12],
    subject_slugs: ['toan-hoc', 'vat-ly', 'hoa-hoc', 'tieng-anh'],
    target_roles: ['STUDENT', 'TEACHER', 'SCHOOL'],
    meta_title: 'Ma trận tạo đề thích ứng AI cho học sinh lớp 12 | Schoolify',
    meta_description: 'Tìm hiểu cách AI của Schoolify kết hợp Spaced Repetition và ma trận đề chuẩn Bộ GD&ĐT để cá nhân hóa lộ trình ôn thi.',
    meta_keywords: ['ma trận đề thi ai', 'học tập thích ứng', 'spaced repetition'],
    focus_keyword: 'ma trận tạo đề thích ứng',
    is_indexable: true,
    author_name: 'Đội ngũ Kỹ Thuật AI',
    author_role: 'Phòng Nghiên cứu & Phát triển AI Giáo dục',
    author_bio: 'Nhóm kỹ sư AI và chuyên gia dữ liệu giáo dục phát triển hệ thống chấm bài tự luận và ma trận thích ứng Schoolify.',
    status: 'PUBLISHED',
    is_featured: false,
    is_pinned: true,
    is_breaking: false,
    allow_comments: true,
    published_at: '2026-10-02T09:15:00.000Z',
    created_at: '2026-10-01T14:00:00.000Z',
    updated_at: '2026-10-02T09:15:00.000Z',
  },
  {
    id: 'news-03',
    category_id: 'cat-bi-quyet',
    title: '5 phương pháp giải nhanh bài toán cực trị hình học Oxyz bằng tích có hướng',
    slug: '5-phuong-phap-giai-nhanh-bai-toan-cuc-tri-hinh-hoc-oxyz-bang-tich-co-huong',
    excerpt:
      'Tổng hợp các công thức giải nhanh và mẹo bấm máy tính Casio fx-880BTG cho bài toán tọa độ không gian lớp 12 chuẩn SGK mới.',
    content: `## 1. Vai trò của Tích có hướng trong hình học không gian Oxyz

Trong chương trình Toán 12 mới, chuyên đề **Phương pháp tọa độ trong không gian Oxyz** luôn chiếm từ 2 đến 3 câu hỏi ở cả 3 phần của đề thi. Việc thành thạo tích có hướng $\\left[\\vec{u}, \\vec{v}\\right]$ giúp học sinh rút ngắn 60% thời gian xử lý các bài toán khoảng cách, diện tích và cực trị hình học.

## 2. Công thức cốt lõi cần nhớ

Cho hai vectơ $\\vec{u} = (x_1; y_1; z_1)$ và $\\vec{v} = (x_2; y_2; z_2)$. Khi đó tích có hướng là một vectơ vuông góc với cả $\\vec{u}$ và $\\vec{v}$:

### Ứng dụng tính diện tích và thể tích nhanh

- **Diện tích tam giác $ABC$:** $S_{\\triangle ABC} = \\frac{1}{2} \\left|\\left[\\overrightarrow{AB}, \\overrightarrow{AC}\\right]\\right|$.
- **Thể tích tứ diện $ABCD$:** $V_{ABCD} = \\frac{1}{6} \\left|\\left[\\overrightarrow{AB}, \\overrightarrow{AC}\\right] \\cdot \\overrightarrow{AD}\\right|$.
- **Khoảng cách giữa hai đường thẳng chéo nhau $\\Delta_1, \\Delta_2$:** $d(\\Delta_1, \\Delta_2) = \\frac{\\left|\\left[\\vec{u}_1, \\vec{u}_2\\right] \\cdot \\overrightarrow{M_1 M_2}\\right|}{\\left|\\left[\\vec{u}_1, \\vec{u}_2\\right]\\right|}$.

## 3. Kỹ thuật kết hợp Bất đẳng thức vectơ tìm cực trị

Với các bài toán tìm điểm $M$ thuộc mặt phẳng $(P)$ sao cho biểu thức $T = |\\overrightarrow{MA} + 2\\overrightarrow{MB} - \\overrightarrow{MC}|$ đạt giá trị nhỏ nhất:

1. **Bước 1:** Gọi $I$ là điểm thỏa mãn $\\overrightarrow{IA} + 2\\overrightarrow{IB} - \\overrightarrow{IC} = \\vec{0}$, suy ra tọa độ $I = \\frac{A + 2B - C}{1 + 2 - 1}$.
2. **Bước 2:** Thu gọn $T = |2\\overrightarrow{MI}| = 2MI$.
3. **Bước 3:** $T_{\\min}$ đạt được khi $M$ là hình chiếu vuông góc của $I$ lên mặt phẳng $(P)$.

## 4. Thực hành trực tiếp trên Máy tính ảo Casio của Schoolify

Khi làm bài trên Schoolify, bạn có thể mở ngay **Widget Máy tính Casio fx-880BTG** tích hợp sẵn ở góc màn hình, chọn chế độ **Vector** để nhập nhanh 3 vectơ $VctA, VctB, VctC$ và tính tích hỗn tạp chỉ trong 15 giây.`,
    thumbnail_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1000&auto=format&fit=crop&q=80',
    cover_image_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1400&auto=format&fit=crop&q=80',
    image_alt: 'Công thức giải nhanh hình học không gian Oxyz lớp 12',
    image_caption: 'Sử dụng tích có hướng và tâm tỉ cự giúp giải quyết gọn nhẹ các bài toán cực trị Oxyz.',
    reading_time_minutes: 7,
    word_count: 740,
    view_count: 4890,
    like_count: 512,
    share_count: 180,
    bookmark_count: 690,
    tags: ['Toán 12', 'Hình học Oxyz', 'Tích có hướng', 'Casio fx-880BTG', 'Cực trị hình học'],
    grade_levels: [12],
    subject_slugs: ['toan-hoc'],
    target_roles: ['STUDENT', 'TEACHER'],
    meta_title: '5 phương pháp giải nhanh cực trị hình học Oxyz Toán 12',
    meta_description: 'Tổng hợp công thức tích có hướng, tâm tỉ cự và mẹo bấm Casio giải nhanh cực trị Oxyz lớp 12.',
    meta_keywords: ['cực trị oxyz', 'tích có hướng', 'giải nhanh toán 12', 'tâm tỉ cự oxyz'],
    focus_keyword: 'cực trị hình học Oxyz',
    is_indexable: true,
    author_name: 'Thầy Hoàng Nam (GV Toán Chuyên)',
    author_role: 'Giáo viên Toán THPT Chuyên - 12 năm kinh nghiệm luyện thi HSG',
    author_bio: 'Tác giả chuỗi chuyên đề Chinh phục 9+ Toán THPT và cố vấn học thuật bộ môn Toán tại Schoolify.',
    status: 'PUBLISHED',
    is_featured: false,
    is_pinned: false,
    is_breaking: false,
    allow_comments: true,
    published_at: '2026-09-28T10:00:00.000Z',
    created_at: '2026-09-27T16:00:00.000Z',
    updated_at: '2026-09-28T10:00:00.000Z',
  },
  {
    id: 'news-04',
    category_id: 'cat-su-kien',
    title: 'Phát động giải đấu "Đua Top Bảng Vàng Tháng 10" với tổng giải thưởng 10.000 Ngọc Tri Thức',
    slug: 'phat-dong-giai-dau-dua-top-bang-vang-thang-10-giai-thuong-10000-ngoc-tri-thuc',
    excerpt:
      'Cơ hội tranh tài giữa các cao thủ khối 10, 11, 12 toàn quốc. Top 10 học sinh xuất sắc nhất tháng sẽ nhận phần thưởng hiện vật và voucher học tập giá trị.',
    content: `## 1. Thể lệ giải đấu Đua Top Bảng Vàng Tháng 10

Nhằm khích lệ tinh thần tự học và rèn luyện phản xạ phòng thi ngay từ đầu năm học, Schoolify chính thức khởi động giải đấu học thuật trực tuyến **"Đua Top Bảng Vàng Tháng 10"** dành cho toàn bộ học sinh THPT trên toàn quốc.

### Đối tượng và hình thức tính điểm xếp hạng

- **Đối tượng tham gia:** Học sinh khối 10, 11, 12 có tài khoản trên hệ thống Schoolify.
- **Cách tích lũy điểm:** Mỗi bài thi hoàn thành đạt từ $7,0$ điểm trở lên sẽ được cộng điểm kinh nghiệm (XP) và **Ngọc Tri Thức 💎** dựa theo độ khó của đề thi.
- **Chuỗi điểm danh (Streak):** Duy trì chuỗi luyện tập liên tiếp 7 ngày được nhân hệ số $1,25$ điểm thưởng.

## 2. Cơ cấu giải thưởng hấp dẫn

Tổng quỹ thưởng lên tới **10.000 Ngọc Tri Thức** cùng nhiều vật phẩm giới hạn trong Kho Báu Đổi Thưởng:

- **01 Giải Quán Quân:** 2.500 Ngọc Tri Thức + Khung Avatar Vàng Vinh Quang + Học bổng 100% khóa luyện đề VIP.
- **02 Giải Á Quân:** 1.500 Ngọc Tri Thức + Khung Avatar Bạc Tinh Anh + Voucher khóa học 50%.
- **07 Giải Khuyến Khích:** 500 Ngọc Tri Thức + Huy hiệu Chiến Binh Tri Thức.`,
    thumbnail_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1000&auto=format&fit=crop&q=80',
    cover_image_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1400&auto=format&fit=crop&q=80',
    image_alt: 'Học sinh hào hứng tham gia giải đấu Đua Top Bảng Vàng Schoolify',
    image_caption: 'Bảng Vàng Schoolify vinh danh những học sinh kiên trì và xuất sắc nhất mỗi tháng.',
    reading_time_minutes: 3,
    word_count: 420,
    view_count: 1840,
    like_count: 340,
    share_count: 112,
    bookmark_count: 195,
    tags: ['Bảng Vàng', 'Ngọc Tri Thức', 'Sự kiện tháng 10', 'Thi thử toàn quốc'],
    grade_levels: [10, 11, 12],
    subject_slugs: ['toan-hoc', 'vat-ly', 'hoa-hoc', 'tieng-anh'],
    target_roles: ['STUDENT'],
    meta_title: 'Giải đấu Đua Top Bảng Vàng Tháng 10 - Nhận 10.000 Ngọc Tri Thức',
    meta_description: 'Tham gia tranh tài tại Bảng Vàng Schoolify tháng 10 để rinh học bổng và hàng ngàn Ngọc Tri Thức.',
    meta_keywords: ['đua top bảng vàng', 'ngọc tri thức schoolify', 'sự kiện học sinh'],
    focus_keyword: 'Đua Top Bảng Vàng',
    is_indexable: true,
    author_name: 'Cộng Đồng Học Sinh Schoolify',
    author_role: 'Ban Tổ Chức Sự Kiện Học Thuật',
    status: 'PUBLISHED',
    is_featured: false,
    is_pinned: false,
    is_breaking: false,
    allow_comments: true,
    published_at: '2026-09-25T08:00:00.000Z',
    created_at: '2026-09-24T10:00:00.000Z',
    updated_at: '2026-09-25T08:00:00.000Z',
  },
  {
    id: 'news-05',
    category_id: 'cat-huong-dan',
    title: 'Hướng dẫn sử dụng công cụ gõ công thức Toán học trực quan trên Schoolify',
    slug: 'huong-dan-su-dung-cong-cu-go-cong-thuc-toan-hoc-truc-quan-tren-schoolify',
    excerpt:
      'Trải nghiệm viết bài tự luận môn Toán, Vật Lý, Hóa Học dễ dàng với các phím tắt LaTeX thông minh và bộ công cụ xem trước theo thời gian thực.',
    content: `## 1. Tại sao cần bộ gõ công thức trực quan khi làm bài tự luận?

Đối với các kỳ thi Học sinh giỏi (HSG) hoặc phần bài tập tự luận trên lớp, việc trình bày rõ ràng các biểu thức phân số, tích phân, hệ phương trình và ma trận là yếu tố quyết định điểm trình bày. Bộ công cụ **Math Editor Toolbar** của Schoolify giúp cả học sinh chưa biết LaTeX vẫn có thể nhập công thức nhanh như viết trên giấy.

## 2. Các nhóm ký hiệu trên thanh công cụ Toán học

Khi mở khung làm bài tự luận hoặc trình tạo câu hỏi của giáo viên, thanh công cụ được chia thành các nhóm trực quan:

### Nhóm Đại số & Giải tích

- **Phân số & Căn thức:** Nhấn nút $\\frac{a}{b}$ hoặc $\\sqrt{x}$ để chèn khung công thức tự động đặt con trỏ vào tử số.
- **Tích phân & Giới hạn:** Hỗ trợ sẵn mẫu $\\int_{a}^{b} f(x)dx$ và $\\lim_{x \\to x_0}$.
- **Hệ phương trình:** Tự động tạo khối $\\begin{cases} x + y = 2 \\\\ 2x - y = 1 \\end{cases}$ chuẩn chỉnh.

### Chế độ Xem trước thời gian thực (Live Preview)

Mọi công thức nằm trong cặp dấu \`$...$\` sẽ được hiển thị trực quan ngay bên dưới khung soạn thảo để bạn kiểm tra trước khi nộp bài cho Giáo viên hoặc AI chấm điểm.`,
    thumbnail_url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1000&auto=format&fit=crop&q=80',
    cover_image_url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1400&auto=format&fit=crop&q=80',
    image_alt: 'Hướng dẫn sử dụng bộ gõ công thức Toán học LaTeX trên Schoolify',
    image_caption: 'Thanh công cụ Math Toolbar hỗ trợ chèn nhanh phân số, căn thức, hệ phương trình chỉ bằng 1 cú nhấp chuột.',
    reading_time_minutes: 4,
    word_count: 460,
    view_count: 1560,
    like_count: 145,
    share_count: 42,
    bookmark_count: 230,
    tags: ['Hướng dẫn', 'LaTeX', 'Tự luận Toán', 'Math Editor'],
    grade_levels: [10, 11, 12],
    subject_slugs: ['toan-hoc', 'vat-ly', 'hoa-hoc'],
    target_roles: ['STUDENT', 'TEACHER'],
    meta_title: 'Hướng dẫn gõ công thức Toán học LaTeX trực quan trên Schoolify',
    meta_description: 'Cẩm nang sử dụng thanh công cụ Math Editor trên Schoolify để trình bày bài thi tự luận Toán, Lý, Hóa nhanh chóng.',
    meta_keywords: ['gõ công thức toán', 'latex schoolify', 'làm bài tự luận online'],
    focus_keyword: 'công cụ gõ công thức Toán học',
    is_indexable: true,
    author_name: 'Trung Tâm Hỗ Trợ Schoolify',
    author_role: 'Đội ngũ Trải nghiệm Sản phẩm (Product UX)',
    status: 'PUBLISHED',
    is_featured: false,
    is_pinned: false,
    is_breaking: false,
    allow_comments: true,
    published_at: '2026-09-20T14:00:00.000Z',
    created_at: '2026-09-19T11:00:00.000Z',
    updated_at: '2026-09-20T14:00:00.000Z',
  },
  {
    id: 'news-06',
    category_id: 'cat-nha-truong',
    title: 'Nhà trường số hóa: Kinh nghiệm triển khai Schoolify cho hơn 1.500 học sinh tại THPT Chuyên',
    slug: 'nha-truong-so-hoa-kinh-nghiem-trien-khai-schoolify-tai-thpt-chuyen',
    excerpt:
      'Chia sẻ từ Ban Giám Hiệu về việc ứng dụng phân hệ quản lý điểm, tự động phân quyền giáo viên và liên lạc điện tử không giấy tờ với phụ huynh.',
    content: `## 1. Thách thức trong quản lý khảo thí và học tập quy mô toàn trường

Trước khi chuyển đổi số đồng bộ, việc tổ chức một đợt thi thử cấp trường cho 1.500 học sinh tiêu tốn hàng tuần lễ từ khâu trộn đề Word, in ấn, coi thi cho đến chấm phiếu và thống kê phổ điểm theo từng tổ bộ môn.

## 2. Giải pháp đồng bộ hóa từ Ngân hàng câu hỏi đến Phòng thi số

Khi triển khai hệ sinh thái Schoolify, nhà trường đã chuẩn hóa quy trình khảo thí qua 3 phân hệ liên thông:

### Chuẩn hóa ngân hàng câu hỏi bằng AI Docx Scanner

Giáo viên các tổ Toán, Lý, Hóa, Anh chỉ cần tải lên file đề Word (\`.docx\`) sẵn có (kể cả công thức MathType và hình vẽ). Hệ thống AI tự động bóc tách câu hỏi, đáp án, lời giải và phân loại vào ngân hàng đề chung của trường chỉ trong vài giây.

### Báo cáo thống kê năng lực trực quan cho Ban Giám Hiệu & Phụ Huynh

Sau mỗi kỳ kiểm tra định kỳ, Tổ trưởng chuyên môn và Ban Giám Hiệu nắm bắt ngay phổ điểm từng khối lớp, tỷ lệ học sinh đạt chuẩn đầu ra và gửi báo cáo tiến bộ tự động tới tài khoản Phụ huynh.`,
    thumbnail_url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1000&auto=format&fit=crop&q=80',
    cover_image_url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1400&auto=format&fit=crop&q=80',
    image_alt: 'Triển khai mô hình Nhà trường số Schoolify tại trường THPT',
    image_caption: 'Số hóa ngân hàng câu hỏi và khảo thí trực tuyến giúp tiết kiệm 80% thời gian chấm bài cho giáo viên.',
    reading_time_minutes: 6,
    word_count: 590,
    view_count: 1290,
    like_count: 162,
    share_count: 58,
    bookmark_count: 140,
    tags: ['Nhà trường số', 'Chuyển đổi số', 'Ngân hàng câu hỏi', 'AI Docx Scanner'],
    grade_levels: [10, 11, 12],
    subject_slugs: ['toan-hoc', 'vat-ly', 'hoa-hoc', 'tieng-anh'],
    target_roles: ['SCHOOL', 'TEACHER', 'PARENT'],
    meta_title: 'Kinh nghiệm triển khai Nhà trường số Schoolify cho 1.500 học sinh THPT',
    meta_description: 'Case study chuyển đổi số khảo thí, ngân hàng đề thi và quản lý học tập tại trường THPT cùng nền tảng Schoolify.',
    meta_keywords: ['nhà trường số', 'quản lý trường thpt', 'chuyển đổi số giáo dục'],
    focus_keyword: 'Nhà trường số hóa',
    is_indexable: true,
    author_name: 'Ban Biên Tập Giáo Dục',
    author_role: 'Chuyên trang Chuyển đổi số Trường học',
    status: 'PUBLISHED',
    is_featured: false,
    is_pinned: false,
    is_breaking: false,
    allow_comments: true,
    published_at: '2026-09-15T09:00:00.000Z',
    created_at: '2026-09-14T10:00:00.000Z',
    updated_at: '2026-09-15T09:00:00.000Z',
  },
  {
    id: 'news-07',
    category_id: 'cat-thpt',
    title: 'Tổng hợp 50 câu hỏi trắc nghiệm trả lời ngắn Vật Lý 12 chương Nhiệt học kèm giải chi tiết',
    slug: 'tong-hop-50-cau-hoi-trac-nghiem-tra-loi-ngan-vat-ly-12-chuong-nhiet-hoc',
    excerpt:
      'Bộ tài liệu chọn lọc các bài toán thực tế về Nội năng, Định luật I Nhiệt động lực học và sự chuyển thể phục vụ ôn thi THPT 2026.',
    content: `## 1. Trọng tâm kiến thức Vật Lý Nhiệt lớp 12

Chương Vật lý nhiệt là phần kiến thức mới được đưa vào chương trình Vật Lý 12 theo GDPT 2018. Các câu hỏi trả lời ngắn thường yêu cầu tính nhiệt lượng trao đổi $Q = mc\\Delta t$ và hiệu suất động cơ nhiệt.

## 2. Các lỗi sai thường gặp về đổi đơn vị

Học sinh cần đặc biệt lưu ý đổi đơn vị nhiệt dung riêng về $\\text{J/(kg.K)}$ và làm tròn chữ số thập phân theo đúng yêu cầu của đề thi.`,
    thumbnail_url: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=1000&auto=format&fit=crop&q=80',
    cover_image_url: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=1400&auto=format&fit=crop&q=80',
    image_alt: 'Tài liệu ôn tập Vật Lý 12 chương Nhiệt học',
    reading_time_minutes: 6,
    word_count: 540,
    view_count: 0,
    like_count: 0,
    share_count: 0,
    bookmark_count: 0,
    tags: ['Vật Lý 12', 'Trả lời ngắn', 'Nhiệt học', 'THPT 2026'],
    grade_levels: [12],
    subject_slugs: ['vat-ly'],
    target_roles: ['STUDENT', 'TEACHER'],
    meta_title: '50 câu trắc nghiệm trả lời ngắn Vật Lý 12 chương Nhiệt học',
    meta_description: 'Tuyển tập câu hỏi trả lời ngắn Vật Lý 12 chương Nhiệt học chuẩn cấu trúc đề thi tốt nghiệp THPT.',
    meta_keywords: ['vật lý 12 nhiệt học', 'trắc nghiệm trả lời ngắn vật lý'],
    focus_keyword: 'trắc nghiệm trả lời ngắn Vật Lý 12',
    is_indexable: true,
    author_name: 'Cô Minh Châu (Tổ Vật Lý)',
    author_role: 'Giáo viên Vật Lý THPT',
    status: 'SCHEDULED',
    is_featured: false,
    is_pinned: false,
    is_breaking: false,
    allow_comments: true,
    scheduled_at: '2026-12-01T08:00:00.000Z',
    created_at: '2026-11-15T10:00:00.000Z',
    updated_at: '2026-11-15T10:00:00.000Z',
  },
  {
    id: 'news-08',
    category_id: 'cat-bi-quyet',
    title: '[Bản nháp] Lộ trình 90 ngày bứt phá từ 6 lên 8.5+ môn Tiếng Anh kỳ thi THPT',
    slug: 'lo-trinh-90-ngay-but-pha-tu-6-len-8-5-mon-tieng-anh-thpt',
    excerpt:
      'Chiến lược học từ vựng theo Collocations, Phrasal Verbs và kỹ năng đọc hiểu điền từ đoạn văn dài theo định dạng đề mới.',
    content: `## 1. Phân tích ma trận đề Tiếng Anh mới

Đề thi Tiếng Anh tập trung mạnh vào khả năng đọc hiểu văn bản thực tế (thông báo, tờ rơi, bài báo học thuật) và sắp xếp hội thoại/đoạn văn logic.

## 2. Phân bổ thời gian 90 ngày nước rút

- **30 ngày đầu:** Củng cố ngữ pháp cốt lõi và 500 Collocations theo chủ đề SGK.
- **30 ngày giữa:** Luyện chuyên sâu dạng bài Đọc điền khuyết và Đọc hiểu suy luận.
- **30 ngày cuối:** Thực chiến 25 đề chuẩn cấu trúc tại phòng thi ảo Schoolify.`,
    thumbnail_url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1000&auto=format&fit=crop&q=80',
    cover_image_url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1400&auto=format&fit=crop&q=80',
    image_alt: 'Lộ trình ôn thi Tiếng Anh THPT 90 ngày',
    reading_time_minutes: 5,
    word_count: 480,
    view_count: 0,
    like_count: 0,
    share_count: 0,
    bookmark_count: 0,
    tags: ['Tiếng Anh 12', 'Lộ trình 90 ngày', 'Collocations'],
    grade_levels: [12],
    subject_slugs: ['tieng-anh'],
    target_roles: ['STUDENT'],
    meta_title: 'Lộ trình 90 ngày ôn thi Tiếng Anh THPT đạt 8.5+',
    meta_description: 'Kế hoạch 90 ngày nắm trọn từ vựng, Collocations và kỹ năng đọc hiểu Tiếng Anh THPT.',
    meta_keywords: ['ôn thi tiếng anh thpt', 'lộ trình 90 ngày tiếng anh'],
    focus_keyword: 'lộ trình 90 ngày môn Tiếng Anh',
    is_indexable: true,
    author_name: 'Ban Biên Tập Ngoại Ngữ',
    author_role: 'Tổ Chuyên Môn Tiếng Anh',
    status: 'DRAFT',
    is_featured: false,
    is_pinned: false,
    is_breaking: false,
    allow_comments: true,
    created_at: '2026-11-15T14:30:00.000Z',
    updated_at: '2026-11-15T14:30:00.000Z',
  },
];

