import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ExamSessionGuardProvider } from "@/components/providers/ExamSessionGuardProvider";
import { WebVisitTracker } from "@/components/providers/WebVisitTracker";
import { StudentOnboardingGuard } from "@/components/providers/StudentOnboardingGuard";
import { Toaster } from "sonner";
import { GlobalFloatingWidgets } from "@/components/providers/GlobalFloatingWidgets";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Schoolify - Nền Tảng Giáo Dục & Khảo Thí SaaS Toàn Diện",
  description: "Hệ thống quản lý trường học, đào tạo trực tuyến, khảo thí và sổ liên lạc điện tử Schoolify.",
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/logo-icon.png', type: 'image/png' },
      { url: '/logo-icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/logo-icon.png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      data-scroll-behavior="smooth"
      className={`${inter.variable} font-sans h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function() {
              try {
                var stored = localStorage.getItem('schoolify_theme');
                var isDark = stored === 'dark' || (!stored || stored === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (isDark) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.setAttribute('data-theme', 'dark');
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.setAttribute('data-theme', 'light');
                }
                // Dọn dẹp legacy demo data khỏi localStorage của client
                ['schoolify_question_bug_reports', 'schoolify_system_questions', 'schoolify_deleted_question_ids', 'schoolify_custom_matrix', 'schoolify_previous_chapter_ratio'].forEach(function(k) {
                  localStorage.removeItem(k);
                });

                // Preloader session cache check for instant subsequent loads
                if (sessionStorage.getItem('schoolify_preloader_seen') === '1') {
                  document.documentElement.classList.add('preloader-cached');
                }
              } catch (e) {}
            })();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased transition-colors duration-200 overflow-x-hidden w-full max-w-[100vw]" suppressHydrationWarning>
        <ThemeProvider>
          <ExamSessionGuardProvider>
            <WebVisitTracker />
            <StudentOnboardingGuard />
            {children}
            <GlobalFloatingWidgets />
            <Toaster richColors position="top-right" closeButton />
          </ExamSessionGuardProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
