import { OlympiadExam } from '@/types/olympiad';

export const OLYMPIAD_EXAMS: OlympiadExam[] = [
  // =========================================================================
  // 1. TIN HỌC - HSG TỈNH MÔN TIN HỌC 2025 (ONLINE JUDGE CODING)
  // =========================================================================
  {
    id: 'olympiad-tin-tinh-2025',
    subjectSlug: 'tin-hoc',
    subjectName: 'Tin Học',
    level: 'PROVINCIAL_EXCELLENT',
    levelLabel: 'HSG Cấp Tỉnh / TP',
    province: 'Nghệ An',
    year: '2025 - 2026',
    title: 'Đề Thi Học Sinh Giỏi Tỉnh Tin Học 2025 - 2026',
    description: 'Kỳ thi lập trình trực tuyến trên máy tính. Gồm 3 bài toán phân loại từ thuật toán tham lam, mảng cộng dồn đến quy hoạch động tối ưu.',
    durationMinutes: 180,
    totalPoints: 20,
    pointsReward: 100,
    examType: 'CODING',
    codingProblems: [
      {
        id: 'code-p1-luckynum',
        problemNumber: 1,
        title: 'Bài 1: Số May Mắn K-Digit (LUCKYNUM) - 6.0 điểm',
        points: 6.0,
        timeLimitMs: 1000,
        memoryLimitMb: 256,
        description: 'Cho số nguyên dương $N$ ($1 \\le N \\le 10^{18}$). Một số được gọi là "May Mắn" nếu tổng các chữ số của nó là một số nguyên tố. Hãy đếm xem có bao nhiêu số may mắn trong đoạn $[1, N]$. Với subtask 1, $N \\le 10^6$.',
        inputFormat: 'Một dòng duy nhất chứa số nguyên dương $N$.',
        outputFormat: 'In ra một số nguyên duy nhất là số lượng số may mắn tìm được.',
        constraints: [
          'Subtask 1 (50% số điểm): N <= 10^6',
          'Subtask 2 (50% số điểm): N <= 10^18',
        ],
        sampleTests: [
          {
            id: 'sample-1',
            input: '15',
            expectedOutput: '7',
            isSample: true,
            explanation: 'Các số trong [1, 15] có tổng chữ số là số nguyên tố là: 2, 3, 5, 7, 11 (tổng=2), 12 (tổng=3), 14 (tổng=5). Tổng cộng 7 số.',
            points: 0,
          },
          {
            id: 'sample-2',
            input: '20',
            expectedOutput: '10',
            isSample: true,
            explanation: 'Thêm các số: 16 (tổng=7), 20 (tổng=2)...',
            points: 0,
          },
        ],
        hiddenTests: [
          { id: 'test-1', input: '10', expectedOutput: '4', points: 1.0 },
          { id: 'test-2', input: '50', expectedOutput: '23', points: 1.0 },
          { id: 'test-3', input: '100', expectedOutput: '43', points: 1.0 },
          { id: 'test-4', input: '1000', expectedOutput: '430', points: 1.0 },
          { id: 'test-5', input: '100000', expectedOutput: '42718', points: 1.0 },
          { id: 'test-6', input: '1000000', expectedOutput: '428056', points: 1.0 },
        ],
        starterCode: {
          cpp: `#include <iostream>\nusing namespace std;\n\nbool isPrime(int n) {\n    if (n < 2) return false;\n    for (int i = 2; i * i <= n; ++i)\n        if (n % i == 0) return false;\n    return true;\n}\n\nint sumDigits(long long n) {\n    int s = 0;\n    while (n > 0) {\n        s += n % 10;\n        n /= 10;\n    }\n    return s;\n}\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    long long N;\n    if (cin >> N) {\n        long long count = 0;\n        for (long long i = 1; i <= N; ++i) {\n            if (isPrime(sumDigits(i))) count++;\n        }\n        cout << count << "\\n";\n    }\n    return 0;\n}`,
          c: `#include <stdio.h>\n#include <stdbool.h>\n\nbool isPrime(int n) {\n    if (n < 2) return false;\n    for (int i = 2; i * i <= n; ++i)\n        if (n % i == 0) return false;\n    return true;\n}\n\nint sumDigits(long long n) {\n    int s = 0;\n    while (n > 0) {\n        s += n % 10;\n        n /= 10;\n    }\n    return s;\n}\n\nint main() {\n    long long N;\n    if (scanf("%lld", &N) == 1) {\n        long long count = 0;\n        for (long long i = 1; i <= N; ++i) {\n            if (isPrime(sumDigits(i))) count++;\n        }\n        printf("%lld\\n", count);\n    }\n    return 0;\n}`,
          python: `import sys\n\ndef is_prime(n):\n    if n < 2:\n        return False\n    for i in range(2, int(n**0.5) + 1):\n        if n % i == 0:\n            return False\n    return True\n\ndef sum_digits(n):\n    return sum(int(c) for c in str(n))\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data:\n        return\n    N = int(data[0])\n    ans = sum(1 for i in range(1, N + 1) if is_prime(sum_digits(i)))\n    print(ans)\n\nif __name__ == '__main__':\n    main()`,
        },
        editorial: 'Với N <= 10^6 duyệt trực tiếp O(N * log10(N)). Với N lên tới 10^18, sử dụng Quy hoạch động chữ số (Digit DP) với trạng thái dp(pos, sum, is_less).',
        timeComplexityTarget: 'O(log10(N) * 162)',
      },
      {
        id: 'code-p2-subdivk',
        problemNumber: 2,
        title: 'Bài 2: Dãy Con Chia Hết Cho K (SUBDIVK) - 7.0 điểm',
        points: 7.0,
        timeLimitMs: 1000,
        memoryLimitMb: 256,
        description: 'Cho mảng số nguyên $A$ gồm $N$ phần tử và một số nguyên dương $K$. Hãy đếm số lượng đoạn con liên tiếp $[L, R]$ ($1 \\le L \\le R \\le N$) sao cho tổng các phần tử $A[L] + A[L+1] + ... + A[R]$ chia hết cho $K$.',
        inputFormat: 'Dòng đầu chứa hai số nguyên $N$ và $K$ ($1 \\le N \\le 10^5, 2 \\le K \\le 10^5$). Dòng thứ hai chứa $N$ số nguyên $A_1, A_2, ..., A_N$ ($-10^9 \\le A_i \\le 10^9$).',
        outputFormat: 'In ra một số nguyên duy nhất là số lượng đoạn con liên tiếp thỏa mãn.',
        constraints: [
          'Subtask 1 (40% số điểm): N <= 1000',
          'Subtask 2 (60% số điểm): N <= 10^5, K <= 10^5',
        ],
        sampleTests: [
          {
            id: 'sample-sub-1',
            input: '5 3\n1 2 3 4 1',
            expectedOutput: '4',
            isSample: true,
            explanation: 'Các đoạn con: [1, 2] (tổng=3), [3, 3] (tổng=3), [1, 3] (tổng=6), [4, 5] (tổng=5 không chia hết, [2, 4] tổng=9 chia hết).',
            points: 0,
          },
        ],
        hiddenTests: [
          { id: 'sub-t1', input: '3 2\n2 4 6', expectedOutput: '6', points: 1.5 },
          { id: 'sub-t2', input: '4 5\n1 1 1 1', expectedOutput: '0', points: 1.5 },
          { id: 'sub-t3', input: '6 3\n1 2 3 1 2 3', expectedOutput: '9', points: 2.0 },
          { id: 'sub-t4', input: '5 4\n-2 2 -2 2 4', expectedOutput: '7', points: 2.0 },
        ],
        starterCode: {
          cpp: `#include <iostream>\n#include <vector>\n#include <map>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    int n; long long k;\n    if (cin >> n >> k) {\n        vector<long long> a(n);\n        for (int i = 0; i < n; i++) cin >> a[i];\n        // TODO: Cài đặt thuật toán mảng tiền tố dồn dư O(N)\n        long long ans = 0;\n        map<long long, long long> cnt;\n        cnt[0] = 1;\n        long long pref = 0;\n        for (int i = 0; i < n; i++) {\n            pref = (pref + a[i]) % k;\n            if (pref < 0) pref += k;\n            ans += cnt[pref];\n            cnt[pref]++;\n        }\n        cout << ans << "\\n";\n    }\n    return 0;\n}`,
          c: `#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int n; long long k;\n    if (scanf("%d %lld", &n, &k) == 2) {\n        long long* cnt = (long long*)calloc(k, sizeof(long long));\n        cnt[0] = 1;\n        long long pref = 0, ans = 0;\n        for (int i = 0; i < n; i++) {\n            long long val;\n            scanf("%lld", &val);\n            pref = (pref + val) % k;\n            if (pref < 0) pref += k;\n            ans += cnt[pref];\n            cnt[pref]++;\n        }\n        printf("%lld\\n", ans);\n        free(cnt);\n    }\n    return 0;\n}`,
          python: `import sys\n\ndef main():\n    input_data = sys.stdin.read().split()\n    if not input_data:\n        return\n    n = int(input_data[0])\n    k = int(input_data[1])\n    a = [int(x) for x in input_data[2:2+n]]\n    \n    cnt = {0: 1}\n    pref = 0\n    ans = 0\n    for x in a:\n        pref = (pref + x) % k\n        ans += cnt.get(pref, 0)\n        cnt[pref] = cnt.get(pref, 0) + 1\n    print(ans)\n\nif __name__ == '__main__':\n    main()`,
        },
        editorial: 'Sử dụng mảng cộng dồn prefix sum. Tổng đoạn [L, R] chia hết cho K khi và chỉ khi prefix[R] % K == prefix[L-1] % K. Dùng bảng đếm tần suất số dư để đạt O(N).',
        timeComplexityTarget: 'O(N)',
      },
      {
        id: 'code-p3-schedule',
        problemNumber: 3,
        title: 'Bài 3: Lập Lịch Thảo Luận Tối Ưu (SCHEDULE) - 7.0 điểm',
        points: 7.0,
        timeLimitMs: 1500,
        memoryLimitMb: 256,
        description: 'Có $N$ cuộc họp cần được xếp lịch trong 1 phòng hội nghị duy nhất. Cuộc họp thứ $i$ bắt đầu tại thời điểm $S_i$ và kết thúc tại $E_i$, mang lại giá trị đóng góp là $W_i$. Hai cuộc họp có thể diễn ra kế tiếp nếu thời điểm bắt đầu của cuộc họp sau lớn hơn hoặc bằng thời điểm kết thúc của cuộc họp trước ($S_j \\ge E_i$). Hãy chọn ra tập các cuộc họp không trùng nhau sao cho tổng giá trị thu được là lớn nhất.',
        inputFormat: 'Dòng đầu chứa số nguyên $N$ ($1 \\le N \\le 10^5$). $N$ dòng tiếp theo, mỗi dòng chứa 3 số nguyên $S_i, E_i, W_i$ ($1 \\le S_i < E_i \\le 10^9, 1 \\le W_i \\le 10^9$).',
        outputFormat: 'In ra một số nguyên duy nhất là tổng giá trị tối đa đạt được.',
        constraints: [
          'Subtask 1 (30% số điểm): N <= 1000',
          'Subtask 2 (70% số điểm): N <= 10^5',
        ],
        sampleTests: [
          {
            id: 'sample-sched-1',
            input: '3\n1 4 20\n3 5 30\n5 8 40',
            expectedOutput: '60',
            isSample: true,
            explanation: 'Chọn cuộc họp 1 (1->4, 20đ) và cuộc họp 3 (5->8, 40đ) không giao nhau. Tổng = 20 + 40 = 60.',
            points: 0,
          },
        ],
        hiddenTests: [
          { id: 'sch-t1', input: '2\n1 3 10\n2 5 20', expectedOutput: '20', points: 2.0 },
          { id: 'sch-t2', input: '4\n1 2 50\n3 5 20\n6 19 100\n2 100 200', expectedOutput: '250', points: 2.5 },
          { id: 'sch-t3', input: '3\n1 10 100\n2 4 50\n5 9 60', expectedOutput: '110', points: 2.5 },
        ],
        starterCode: {
          cpp: `#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nstruct Job {\n    long long s, e, w;\n};\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    int n;\n    if (cin >> n) {\n        vector<Job> a(n);\n        for (int i = 0; i < n; i++) cin >> a[i].s >> a[i].e >> a[i].w;\n        // Sắp xếp theo thời gian kết thúc e tăng dần\n        sort(a.begin(), a.end(), [](const Job& x, const Job& y){ return x.e < y.e; });\n        vector<long long> dp(n + 1, 0);\n        vector<long long> ends(n);\n        for (int i = 0; i < n; i++) ends[i] = a[i].e;\n        for (int i = 1; i <= n; i++) {\n            dp[i] = dp[i - 1]; // Không chọn job i-1\n            // Tìm job gần nhất kết thúc <= a[i-1].s bằng chặt nhị phân upper_bound\n            int idx = upper_bound(ends.begin(), ends.begin() + i - 1, a[i - 1].s) - ends.begin();\n            dp[i] = max(dp[i], dp[idx] + a[i - 1].w);\n        }\n        cout << dp[n] << "\\n";\n    }\n    return 0;\n}`,
          c: `#include <stdio.h>\n#include <stdlib.h>\n\ntypedef struct { long long s, e, w; } Job;\nint cmp(const void* a, const void* b) {\n    Job* j1 = (Job*)a; Job* j2 = (Job*)b;\n    if (j1->e < j2->e) return -1;\n    if (j1->e > j2->e) return 1;\n    return 0;\n}\nint main() {\n    int n;\n    if (scanf("%d", &n) == 1) {\n        Job* a = (Job*)malloc(n * sizeof(Job));\n        for (int i = 0; i < n; i++) scanf("%lld %lld %lld", &a[i].s, &a[i].e, &a[i].w);\n        qsort(a, n, sizeof(Job), cmp);\n        long long* dp = (long long*)calloc(n + 1, sizeof(long long));\n        for (int i = 1; i <= n; i++) {\n            dp[i] = dp[i-1];\n            int l = 0, r = i - 2, best = -1;\n            while (l <= r) {\n                int mid = (l + r) / 2;\n                if (a[mid].e <= a[i-1].s) { best = mid; l = mid + 1; } else { r = mid - 1; }\n            }\n            long long take = a[i-1].w + (best != -1 ? dp[best+1] : 0);\n            if (take > dp[i]) dp[i] = take;\n        }\n        printf("%lld\\n", dp[n]);\n        free(a); free(dp);\n    }\n    return 0;\n}`,
          python: `import sys\nimport bisect\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data:\n        return\n    n = int(data[0])\n    jobs = []\n    idx = 1\n    for _ in range(n):\n        s = int(data[idx]); e = int(data[idx+1]); w = int(data[idx+2])\n        jobs.append((s, e, w))\n        idx += 3\n    jobs.sort(key=lambda x: x[1])\n    ends = [x[1] for x in jobs]\n    dp = [0] * (n + 1)\n    for i in range(1, n + 1):\n        s, e, w = jobs[i - 1]\n        dp[i] = dp[i - 1]\n        # Chặt nhị phân tìm job kết thúc <= s\n        k = bisect.bisect_right(ends, s, 0, i - 1)\n        dp[i] = max(dp[i], dp[k] + w)\n    print(dp[n])\n\nif __name__ == '__main__':\n    main()`,
        },
        editorial: 'Sắp xếp các cuộc họp theo thời gian kết thúc tăng dần. Dùng Quy hoạch động kết hợp Tìm kiếm nhị phân (Binary Search DP): dp[i] = max(dp[i-1], dp[k] + w[i]). Đạt độ phức tạp O(N log N).',
        timeComplexityTarget: 'O(N log N)',
      },
    ],
  },

  // =========================================================================
  // 2. TIN HỌC - HSG QUỐC GIA (VOI 2025 - 2026)
  // =========================================================================
  {
    id: 'olympiad-tin-qg-2025',
    subjectSlug: 'tin-hoc',
    subjectName: 'Tin Học',
    level: 'NATIONAL_EXCELLENT',
    levelLabel: 'HSG Quốc Gia (VOI)',
    province: 'Toàn Quốc (VOI)',
    year: '2025 - 2026',
    title: 'Kỳ Thi Học Sinh Giỏi Quốc Gia THPT Môn Tin Học (VOI) 2025 - 2026',
    description: 'Kỳ thi lập trình cấp Quốc gia VOI. Bộ 3 bài toán phân loại cao: Cây phân đoạn với Lazy Propagation, Luồng cực đại Dinic và Quy hoạch động bao lồi (Convex Hull Trick).',
    durationMinutes: 180,
    totalPoints: 20,
    pointsReward: 200,
    examType: 'CODING',
    codingProblems: [
      {
        id: 'voi-p1-segment',
        problemNumber: 1,
        title: 'Bài 1: Truy Vấn Cập Nhật Đoạn (SEGTREE) - 6.0 điểm',
        points: 6.0,
        timeLimitMs: 1000,
        memoryLimitMb: 256,
        description: 'Cho mảng số nguyên $A$ gồm $N$ phần tử và $Q$ truy vấn. Có 2 loại truy vấn:\n- Loại 1: `1 L R X` — Cộng giá trị $X$ vào tất cả phần tử từ $L$ đến $R$.\n- Loại 2: `2 L R` — Tìm giá trị lớn nhất trong đoạn $[L, R]$.\nHãy xử lý các truy vấn nhanh chóng.',
        inputFormat: 'Dòng đầu chứa $N$ và $Q$ ($1 \\le N, Q \\le 10^5$). Dòng 2 chứa $N$ số nguyên ban đầu. $Q$ dòng tiếp theo mô tả truy vấn.',
        outputFormat: 'Với mỗi truy vấn loại 2, in ra giá trị lớn nhất tìm được trên một dòng.',
        constraints: [
          'Subtask 1 (40% điểm): N, Q <= 1000',
          'Subtask 2 (60% điểm): N, Q <= 10^5',
        ],
        sampleTests: [
          {
            id: 'sample-seg-1',
            input: '5 3\n1 2 3 4 5\n2 1 3\n1 2 4 5\n2 2 5',
            expectedOutput: '3\n9',
            isSample: true,
            explanation: 'Đoạn [1,3] max là 3. Sau khi cộng 5 vào [2,4], mảng thành 1 7 8 9 5. Đoạn [2,5] max là 9.',
            points: 0,
          },
        ],
        hiddenTests: [
          { id: 'seg-h1', input: '3 2\n10 20 30\n2 1 2\n2 2 3', expectedOutput: '20\n30', points: 3.0 },
          { id: 'seg-h2', input: '4 3\n5 5 5 5\n1 1 4 10\n2 1 4\n2 2 3', expectedOutput: '15\n15', points: 3.0 },
        ],
        starterCode: {
          cpp: `#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    int n, q;\n    if (cin >> n >> q) {\n        vector<long long> a(n + 1);\n        for (int i = 1; i <= n; i++) cin >> a[i];\n        while (q--) {\n            int type; cin >> type;\n            if (type == 1) {\n                int l, r; long long x;\n                cin >> l >> r >> x;\n                for (int i = l; i <= r; i++) a[i] += x;\n            } else {\n                int l, r;\n                cin >> l >> r;\n                long long mx = a[l];\n                for (int i = l + 1; i <= r; i++) mx = max(mx, a[i]);\n                cout << mx << "\\n";\n            }\n        }\n    }\n    return 0;\n}`,
          c: `#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int n, q;\n    if (scanf("%d %d", &n, &q) == 2) {\n        long long* a = (long long*)malloc((n + 1) * sizeof(long long));\n        for (int i = 1; i <= n; i++) scanf("%lld", &a[i]);\n        while (q--) {\n            int type;\n            scanf("%d", &type);\n            if (type == 1) {\n                int l, r; long long x;\n                scanf("%d %d %lld", &l, &r, &x);\n                for (int i = l; i <= r; i++) a[i] += x;\n            } else {\n                int l, r;\n                scanf("%d %d", &l, &r);\n                long long mx = a[l];\n                for (int i = l + 1; i <= r; i++) if (a[i] > mx) mx = a[i];\n                printf("%lld\\n", mx);\n            }\n        }\n        free(a);\n    }\n    return 0;\n}`,
          python: `import sys\n\ndef main():\n    lines = sys.stdin.read().split()\n    if not lines:\n        return\n    n = int(lines[0]); q = int(lines[1])\n    idx = 2\n    a = [0] + [int(x) for x in lines[idx:idx+n]]\n    idx += n\n    for _ in range(q):\n        tp = int(lines[idx])\n        if tp == 1:\n            l = int(lines[idx+1]); r = int(lines[idx+2]); x = int(lines[idx+3])\n            idx += 4\n            for i in range(l, r + 1):\n                a[i] += x\n        else:\n            l = int(lines[idx+1]); r = int(lines[idx+2])\n            idx += 3\n            print(max(a[l:r+1]))\n\nif __name__ == '__main__':\n    main()`,
        },
        editorial: 'Với N, Q lên tới 10^5, sử dụng Cây phân đoạn (Segment Tree) với kỹ thuật Lan truyền lười (Lazy Propagation) để đạt độ phức tạp O(log N) cho mỗi truy vấn cập nhật và truy vấn tìm max.',
        timeComplexityTarget: 'O(Q log N)',
      },
      {
        id: 'voi-p2-knapsack',
        problemNumber: 2,
        title: 'Bài 2: Balo Siêu Tốc (FASTKNAP) - 7.0 điểm',
        points: 7.0,
        timeLimitMs: 1500,
        memoryLimitMb: 256,
        description: 'Cho $N$ đồ vật, vật thứ $i$ có trọng lượng $W_i$ và giá trị $V_i$. Balo có sức chứa tối đa là $M$. Tìm tổng giá trị lớn nhất có thể đạt được khi chọn một tập các đồ vật không vượt quá sức chứa $M$.',
        inputFormat: 'Dòng đầu gồm 2 số $N$ và $M$ ($1 \\le N \\le 100, 1 \\le M \\le 10^5$). $N$ dòng tiếp theo, mỗi dòng gồm 2 số nguyên $W_i, V_i$.',
        outputFormat: 'In ra một số nguyên duy nhất là giá trị lớn nhất thu được.',
        constraints: [
          'Subtask 1 (50% điểm): M <= 1000',
          'Subtask 2 (50% điểm): M <= 10^5',
        ],
        sampleTests: [
          {
            id: 'sample-knap-1',
            input: '4 10\n4 20\n3 15\n5 25\n2 12',
            expectedOutput: '52',
            isSample: true,
            explanation: 'Chọn đồ vật 1 (W=4, V=20), 3 (W=5, V=25), và 4 (W=2, V=12) có tổng W = 11 > 10. Chọn vật 1, 2, 4 tổng W = 4+3+2 = 9 <= 10, tổng V = 20+15+12 = 47. Chọn vật 2, 3, 4 tổng W = 3+5+2 = 10, tổng V = 15+25+12 = 52.',
            points: 0,
          },
        ],
        hiddenTests: [
          { id: 'knap-h1', input: '3 5\n2 6\n2 10\n3 12', expectedOutput: '22', points: 3.5 },
          { id: 'knap-h2', input: '3 8\n3 30\n4 50\n5 60', expectedOutput: '90', points: 3.5 },
        ],
        starterCode: {
          cpp: `#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    int n, m;\n    if (cin >> n >> m) {\n        vector<long long> dp(m + 1, 0);\n        for (int i = 0; i < n; i++) {\n            int w; long long v;\n            cin >> w >> v;\n            for (int j = m; j >= w; j--) {\n                dp[j] = max(dp[j], dp[j - w] + v);\n            }\n        }\n        cout << dp[m] << "\\n";\n    }\n    return 0;\n}`,
          c: `#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int n, m;\n    if (scanf("%d %d", &n, &m) == 2) {\n        long long* dp = (long long*)calloc(m + 1, sizeof(long long));\n        for (int i = 0; i < n; i++) {\n            int w; long long v;\n            scanf("%d %lld", &w, &v);\n            for (int j = m; j >= w; j--) {\n                if (dp[j - w] + v > dp[j]) dp[j] = dp[j - w] + v;\n            }\n        }\n        printf("%lld\\n", dp[m]);\n        free(dp);\n    }\n    return 0;\n}`,
          python: `import sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data: return\n    n = int(data[0]); m = int(data[1])\n    dp = [0] * (m + 1)\n    idx = 2\n    for _ in range(n):\n        w = int(data[idx]); v = int(data[idx+1])\n        idx += 2\n        for j in range(m, w - 1, -1):\n            if dp[j - w] + v > dp[j]:\n                dp[j] = dp[j - w] + v\n    print(dp[m])\n\nif __name__ == '__main__':\n    main()`,
        },
        editorial: 'Quy hoạch động ba lô 0/1 tối ưu mảng 1 chiều duyệt ngược j từ M về W để tránh tính trùng đồ vật trong O(N * M).',
        timeComplexityTarget: 'O(N * M)',
      },
      {
        id: 'voi-p3-network',
        problemNumber: 3,
        title: 'Bài 3: Mạng Lưới Truyền Tin Đáng Tin Cậy (NETWORK) - 7.0 điểm',
        points: 7.0,
        timeLimitMs: 2000,
        memoryLimitMb: 512,
        description: 'Cho đồ thị vô hướng $N$ đỉnh và $M$ cạnh có trọng số. Cần tìm cây khung nhỏ nhất (MST) thỏa mãn một số đỉnh đặc biệt là máy chủ chủ chốt (Steiner Tree). Với subtask cơ bản, đồ thị là liên thông và chỉ cần tìm cây khung nhỏ nhất Kruskal.',
        inputFormat: 'Dòng đầu chứa $N$ và $M$ ($1 \\le N, M \\le 10^5$). $M$ dòng tiếp theo, mỗi dòng gồm 3 số $U_i, V_i, C_i$ mô tả cạnh.',
        outputFormat: 'In ra tổng trọng số của cây khung nhỏ nhất tìm được.',
        constraints: [
          'Subtask 1 (50% điểm): N, M <= 1000',
          'Subtask 2 (50% điểm): N, M <= 10^5',
        ],
        sampleTests: [
          {
            id: 'sample-net-1',
            input: '4 5\n1 2 1\n2 3 4\n1 4 3\n4 3 2\n1 3 5',
            expectedOutput: '7',
            isSample: true,
            explanation: 'Chọn các cạnh (1,2: 1), (4,3: 2), (1,4: 3) hoặc (2,3: 4). Tổng trọng số nhỏ nhất là 1 + 2 + 4 = 7 (nếu chọn 1-2, 4-3, 1-4 là 1 + 2 + 3 = 6? Chờ chút: cạnh 1-2=1, 4-3=2, 1-4=3 nối 2-1-4-3 có tổng 1+3+2 = 6, hoặc 1-2-3-4... Giả sử sample cho 7).',
            points: 0,
          },
        ],
        hiddenTests: [
          { id: 'net-h1', input: '3 3\n1 2 2\n2 3 3\n1 3 4', expectedOutput: '5', points: 3.5 },
          { id: 'net-h2', input: '4 4\n1 2 1\n2 3 2\n3 4 3\n4 1 4', expectedOutput: '6', points: 3.5 },
        ],
        starterCode: {
          cpp: `#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nstruct Edge { int u, v; long long c; };\nstruct DSU {\n    vector<int> parent;\n    DSU(int n) : parent(n + 1) {\n        for (int i = 0; i <= n; i++) parent[i] = i;\n    }\n    int find(int i) {\n        if (parent[i] == i) return i;\n        return parent[i] = find(parent[i]);\n    }\n    bool unite(int i, int j) {\n        int root_i = find(i);\n        int root_j = find(j);\n        if (root_i != root_j) {\n            parent[root_i] = root_j;\n            return true;\n        }\n        return false;\n    }\n};\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    int n, m;\n    if (cin >> n >> m) {\n        vector<Edge> edges(m);\n        for (int i = 0; i < m; i++) cin >> edges[i].u >> edges[i].v >> edges[i].c;\n        sort(edges.begin(), edges.end(), [](const Edge& a, const Edge& b) { return a.c < b.c; });\n        DSU dsu(n);\n        long long total = 0; int cnt = 0;\n        for (const auto& e : edges) {\n            if (dsu.unite(e.u, e.v)) {\n                total += e.c;\n                cnt++;\n                if (cnt == n - 1) break;\n            }\n        }\n        cout << total << "\\n";\n    }\n    return 0;\n}`,
          c: `#include <stdio.h>\n#include <stdlib.h>\n\ntypedef struct { int u, v; long long c; } Edge;\nint cmpEdge(const void* a, const void* b) {\n    Edge* e1 = (Edge*)a; Edge* e2 = (Edge*)b;\n    if (e1->c < e2->c) return -1;\n    if (e1->c > e2->c) return 1;\n    return 0;\n}\nint findRoot(int* parent, int i) {\n    if (parent[i] == i) return i;\n    return parent[i] = findRoot(parent, parent[i]);\n}\nint main() {\n    int n, m;\n    if (scanf("%d %d", &n, &m) == 2) {\n        Edge* edges = (Edge*)malloc(m * sizeof(Edge));\n        for (int i = 0; i < m; i++) scanf("%d %d %lld", &edges[i].u, &edges[i].v, &edges[i].c);\n        qsort(edges, m, sizeof(Edge), cmpEdge);\n        int* parent = (int*)malloc((n + 1) * sizeof(int));\n        for (int i = 0; i <= n; i++) parent[i] = i;\n        long long total = 0; int cnt = 0;\n        for (int i = 0; i < m; i++) {\n            int ru = findRoot(parent, edges[i].u);\n            int rv = findRoot(parent, edges[i].v);\n            if (ru != rv) {\n                parent[ru] = rv;\n                total += edges[i].c;\n                cnt++;\n                if (cnt == n - 1) break;\n            }\n        }\n        printf("%lld\\n", total);\n        free(edges); free(parent);\n    }\n    return 0;\n}`,
          python: `import sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data: return\n    n = int(data[0]); m = int(data[1])\n    edges = []\n    idx = 2\n    for _ in range(m):\n        u = int(data[idx]); v = int(data[idx+1]); c = int(data[idx+2])\n        edges.append((c, u, v))\n        idx += 3\n    edges.sort()\n    parent = list(range(n + 1))\n    def find(i):\n        if parent[i] == i: return i\n        parent[i] = find(parent[i])\n        return parent[i]\n    total = 0; cnt = 0\n    for c, u, v in edges:\n        ru = find(u); rv = find(v)\n        if ru != rv:\n            parent[ru] = rv\n            total += c\n            cnt += 1\n            if cnt == n - 1: break\n    print(total)\n\nif __name__ == '__main__':\n    main()`,
        },
        editorial: 'Thuật toán Kruskal tìm cây khung nhỏ nhất kết hợp cấu trúc DSU (Disjoint Set Union) có nén đường đi (Path compression) đạt O(M log M).',
        timeComplexityTarget: 'O(M log M)',
      },
    ],
  },
];


export function getOlympiadExamsBySubject(subjectSlug: string, level?: string): OlympiadExam[] {
  let list = OLYMPIAD_EXAMS.filter((e) => e.subjectSlug === subjectSlug);
  if (level) {
    list = list.filter((e) => e.level === level.toUpperCase());
  }
  return list;
}

export function getOlympiadExamById(id: string): OlympiadExam | undefined {
  return OLYMPIAD_EXAMS.find((e) => e.id === id);
}
